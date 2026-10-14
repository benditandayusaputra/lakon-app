import argparse
import json
import math
import random
from collections import defaultdict
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

HAND_LANDMARKS = 21
HAND_LANDMARK_DIMS = HAND_LANDMARKS * 3
HAND_BLOCK_DIMS = HAND_LANDMARK_DIMS + 3
SIDE_OFFSET = {"Left": 0, "Right": HAND_BLOCK_DIMS}
FLAGS_OFFSET = HAND_BLOCK_DIMS * 2
FRAME_FEATURE_DIM = FLAGS_OFFSET + 2

POSE_LEFT_SHOULDER = 11
POSE_RIGHT_SHOULDER = 12
POSE_LEFT_WRIST = 15
POSE_RIGHT_WRIST = 16
HAND_WRIST_POSE_INDEX = {"Left": POSE_LEFT_WRIST, "Right": POSE_RIGHT_WRIST}

WINDOW_FRAMES = 16
SUBSAMPLED_FRAMES = 8


def frame_features(hands, pose):
    out = np.zeros(FRAME_FEATURE_DIM, dtype=np.float32)
    by_label = {}
    for hand in hands:
        label = hand["handedness"]
        if label not in by_label and len(hand["world"]) >= HAND_LANDMARKS:
            by_label[label] = hand["world"]

    width = 0.0
    center = np.zeros(3)
    if pose:
        left = pose[POSE_LEFT_SHOULDER]
        right = pose[POSE_RIGHT_SHOULDER]
        left_v = np.array([left["x"], left["y"], left["z"]])
        right_v = np.array([right["x"], right["y"], right["z"]])
        width = float(np.linalg.norm(left_v - right_v))
        center = (left_v + right_v) / 2

    for label in ("Left", "Right"):
        world = by_label.get(label)
        offset = SIDE_OFFSET[label]
        if world is None:
            continue
        points = np.array([[p["x"], p["y"], p["z"]] for p in world[:HAND_LANDMARKS]])
        wrist = points[0]
        scale = float(np.linalg.norm(points[9] - wrist)) or 1.0
        normalized = (points - wrist) / scale
        out[offset : offset + HAND_LANDMARK_DIMS] = normalized.reshape(-1)

        if pose and width > 0:
            pw = pose[HAND_WRIST_POSE_INDEX[label]]
            pw_v = np.array([pw["x"], pw["y"], pw["z"]])
            out[offset + HAND_LANDMARK_DIMS : offset + HAND_BLOCK_DIMS] = (pw_v - center) / width

        out[FLAGS_OFFSET + (0 if label == "Left" else 1)] = 1.0

    return out


def mirror_frame(frame):
    hands = []
    for hand in frame["hands"]:
        hands.append(
            {
                "handedness": "Right" if hand["handedness"] == "Left" else "Left",
                "world": [{"x": -p["x"], "y": p["y"], "z": p["z"]} for p in hand["world"]],
            }
        )
    pose = None
    if frame.get("pose"):
        pose = [{"x": -p["x"], "y": p["y"], "z": p["z"]} for p in frame["pose"]]
        for a, b in ((11, 12), (13, 14), (15, 16)):
            pose[a], pose[b] = pose[b], pose[a]
    return {"timestamp": frame["timestamp"], "hands": hands, "pose": pose}


def jitter_frame(frame, rng):
    angle = math.radians(rng.uniform(-8, 8))
    cos_a, sin_a = math.cos(angle), math.sin(angle)
    scale = rng.uniform(0.92, 1.08)
    noise = 0.004

    def transform(p):
        x = p["x"] * cos_a - p["y"] * sin_a
        y = p["x"] * sin_a + p["y"] * cos_a
        return {
            "x": x * scale + rng.gauss(0, noise),
            "y": y * scale + rng.gauss(0, noise),
            "z": p["z"] * scale + rng.gauss(0, noise),
        }

    hands = [
        {"handedness": h["handedness"], "world": [transform(p) for p in h["world"]]}
        for h in frame["hands"]
    ]
    pose = [transform(p) for p in frame["pose"]] if frame.get("pose") else None
    return {"timestamp": frame["timestamp"], "hands": hands, "pose": pose}


def sample_to_features(sample, kind):
    frames = sample["frames"]
    if kind == "static":
        return frame_features(frames[-1]["hands"], frames[-1].get("pose"))
    padded = list(frames[-WINDOW_FRAMES:])
    while len(padded) < WINDOW_FRAMES:
        padded.insert(0, padded[0])
    subsampled = padded[:: WINDOW_FRAMES // SUBSAMPLED_FRAMES][:SUBSAMPLED_FRAMES]
    return np.stack([frame_features(f["hands"], f.get("pose")) for f in subsampled])


def augment_sample(sample, rng, mirror):
    frames = sample["frames"]
    out_frames = []
    for frame in frames:
        f = mirror_frame(frame) if mirror else frame
        out_frames.append(jitter_frame(f, rng))
    return {"timestamp": sample["timestamp"], "frames": out_frames}


def load_sessions(paths):
    sessions = []
    for path in paths:
        data = json.loads(Path(path).read_text())
        sessions.extend(data["sessions"])
    return sessions


class StaticModel(nn.Module):
    def __init__(self, classes):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(FRAME_FEATURE_DIM, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, classes),
        )

    def forward(self, x):
        return self.net(x)


class DynamicModel(nn.Module):
    def __init__(self, classes):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv1d(FRAME_FEATURE_DIM, 96, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.Conv1d(96, 96, kernel_size=3, padding=2, dilation=2),
            nn.ReLU(),
        )
        self.head = nn.Linear(96, classes)

    def forward(self, x):
        h = self.conv(x.transpose(1, 2))
        return self.head(h.mean(dim=2))


def build_dataset(sessions, kind, labels, rng, augment_copies):
    features, targets, contributors = [], [], []
    for session in sessions:
        if (session["mode"] == "statis") != (kind == "static"):
            continue
        label_index = labels.index(session["label"])
        for sample in session["samples"]:
            variants = [sample]
            for i in range(augment_copies):
                variants.append(augment_sample(sample, rng, mirror=(i % 2 == 0)))
            for variant in variants:
                features.append(sample_to_features(variant, kind))
                targets.append(label_index)
                contributors.append(session["contributor"])
    return np.array(features, dtype=np.float32), np.array(targets), contributors


def evaluate(model, x, y, device):
    if len(y) == 0:
        return float("nan")
    model.eval()
    with torch.no_grad():
        logits = model(torch.from_numpy(x).to(device))
        predictions = logits.argmax(dim=1).cpu().numpy()
    return float((predictions == y).mean())


def main():
    parser = argparse.ArgumentParser(description="Train the Lakon sign classifier")
    parser.add_argument("data", nargs="+", help="JSON files exported by tools/collect")
    parser.add_argument("--kind", choices=["static", "dynamic"], default="dynamic")
    parser.add_argument("--epochs", type=int, default=60)
    parser.add_argument("--batch", type=int, default=64)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--augment", type=int, default=3, help="augmented copies per sample")
    parser.add_argument("--holdout", default="", help="held-out contributor codes, comma-separated")
    parser.add_argument("--out", default="lakon-classifier")
    parser.add_argument("--quantize", action="store_true")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    rng = random.Random(args.seed)
    torch.manual_seed(args.seed)
    np.random.seed(args.seed)

    sessions = load_sessions(args.data)
    relevant = [s for s in sessions if (s["mode"] == "statis") == (args.kind == "static")]
    if not relevant:
        raise SystemExit(f"no {args.kind} sessions in the data")

    labels = sorted({s["label"] for s in relevant})
    contributors = sorted({s["contributor"] for s in relevant})
    holdout = set(filter(None, args.holdout.split(","))) or (
        {contributors[-1]} if len(contributors) > 1 else set()
    )
    print(f"classes: {labels}")
    print(f"contributors: {contributors}, holdout: {sorted(holdout) or 'none'}")

    train_sessions = [s for s in relevant if s["contributor"] not in holdout]
    holdout_sessions = [s for s in relevant if s["contributor"] in holdout]

    x_train, y_train, _ = build_dataset(train_sessions, args.kind, labels, rng, args.augment)
    x_hold, y_hold, _ = build_dataset(holdout_sessions, args.kind, labels, rng, 0)

    indices = np.random.permutation(len(y_train))
    split = max(1, int(len(indices) * 0.9))
    train_idx, val_idx = indices[:split], indices[split:]

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = (StaticModel if args.kind == "static" else DynamicModel)(len(labels)).to(device)
    params = sum(p.numel() for p in model.parameters())
    print(f"model parameters: {params:,}")
    assert params < 500_000, "model exceeds 500k parameters"

    dataset = TensorDataset(
        torch.from_numpy(x_train[train_idx]), torch.from_numpy(y_train[train_idx])
    )
    loader = DataLoader(dataset, batch_size=args.batch, shuffle=True)
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr)
    loss_fn = nn.CrossEntropyLoss()

    for epoch in range(args.epochs):
        model.train()
        total = 0.0
        for batch_x, batch_y in loader:
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)
            optimizer.zero_grad()
            loss = loss_fn(model(batch_x), batch_y)
            loss.backward()
            optimizer.step()
            total += float(loss)
        if (epoch + 1) % 10 == 0 or epoch == args.epochs - 1:
            val_acc = evaluate(model, x_train[val_idx], y_train[val_idx], device)
            print(f"epoch {epoch + 1}: loss {total / max(len(loader), 1):.4f}, val {val_acc:.3f}")

    seen_acc = evaluate(model, x_train[val_idx], y_train[val_idx], device)
    unseen_acc = evaluate(model, x_hold, y_hold, device)
    print()
    print(f"accuracy on SEEN contributors (validation): {seen_acc:.3f}")
    print(f"accuracy on UNSEEN contributors (holdout): {unseen_acc:.3f}")
    print("the second number is the one that matters.")

    per_contributor = defaultdict(lambda: [0, 0])
    if len(y_hold):
        model.eval()
        with torch.no_grad():
            predictions = (
                model(torch.from_numpy(x_hold).to(device)).argmax(dim=1).cpu().numpy()
            )
        _, _, hold_contribs = build_dataset(holdout_sessions, args.kind, labels, rng, 0)
        for pred, truth, contributor in zip(predictions, y_hold, hold_contribs):
            per_contributor[contributor][1] += 1
            if pred == truth:
                per_contributor[contributor][0] += 1
        for contributor, (correct, count) in sorted(per_contributor.items()):
            print(f"  {contributor}: {correct}/{count} ({correct / count:.3f})")

    out_path = Path(f"{args.out}.onnx")
    model.cpu().eval()
    dummy = (
        torch.zeros(1, FRAME_FEATURE_DIM)
        if args.kind == "static"
        else torch.zeros(1, SUBSAMPLED_FRAMES, FRAME_FEATURE_DIM)
    )
    export_kwargs = dict(
        input_names=["features"],
        output_names=["logits"],
        dynamic_axes={"features": {0: "batch"}, "logits": {0: "batch"}},
        opset_version=18,
    )
    try:
        torch.onnx.export(model, dummy, str(out_path), external_data=False, **export_kwargs)
    except TypeError:
        torch.onnx.export(model, dummy, str(out_path), **export_kwargs)
    print(f"ONNX saved: {out_path} ({out_path.stat().st_size / 1024:.0f} KB)")

    if args.quantize:
        from onnxruntime.quantization import QuantType, quantize_dynamic

        quant_path = Path(f"{args.out}.int8.onnx")
        quantize_dynamic(str(out_path), str(quant_path), weight_type=QuantType.QInt8)
        print(f"int8 saved: {quant_path} ({quant_path.stat().st_size / 1024:.0f} KB)")

    manifest = {
        "kind": args.kind,
        "labels": labels,
        "inputShape": [FRAME_FEATURE_DIM]
        if args.kind == "static"
        else [SUBSAMPLED_FRAMES, FRAME_FEATURE_DIM],
        "url": out_path.name,
        "accuracySeen": None if math.isnan(seen_acc) else seen_acc,
        "accuracyUnseen": None if math.isnan(unseen_acc) else unseen_acc,
    }
    Path(f"{args.out}.json").write_text(json.dumps(manifest, indent=2))
    print(f"manifest saved: {args.out}.json")


if __name__ == "__main__":
    main()
