import numpy as np

from skeleton import BONES

BONE_INDEX = {b: i for i, b in enumerate(BONES)}


def weights_from_prims(P, prims, max_influences=4, sharp=1.0):
    D = np.stack([pr.d(P) for pr in prims], 1)
    dmin = D.min(1, keepdims=True)
    bw = np.array([pr.blend for pr in prims])[None, :] * sharp
    t = np.clip(1.0 - (D - dmin) / bw, 0.0, 1.0)
    w = t * t * (3.0 - 2.0 * t)
    bones = sorted({pr.bone for pr in prims})
    col = {b: k for k, b in enumerate(bones)}
    acc = np.zeros((len(P), len(bones)))
    for i, pr in enumerate(prims):
        acc[:, col[pr.bone]] += w[:, i]
    order = np.argsort(-acc, axis=1)[:, :max_influences]
    top = np.take_along_axis(acc, order, 1)
    top[top < 1e-4] = 0.0
    s = top.sum(1, keepdims=True)
    top = top / np.maximum(s, 1e-12)
    joints = np.vectorize(lambda k: BONE_INDEX[bones[k]])(order)
    joints[top == 0] = 0
    pad = max_influences - joints.shape[1]
    if pad > 0:
        joints = np.concatenate([joints, np.zeros((len(P), pad), dtype=joints.dtype)], 1)
        top = np.concatenate([top, np.zeros((len(P), pad))], 1)
    return joints.astype(np.uint16), top.astype(np.float32)


def rigid_weights(n, bone):
    j = np.zeros((n, 4), dtype=np.uint16)
    j[:, 0] = BONE_INDEX[bone]
    w = np.zeros((n, 4), dtype=np.float32)
    w[:, 0] = 1.0
    return j, w
