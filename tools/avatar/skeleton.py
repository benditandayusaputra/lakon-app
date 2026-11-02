import json
import os
import numpy as np

from sdf import rot_axis

HERE = os.path.dirname(os.path.abspath(__file__))

FINGERS = ['Thumb', 'Index', 'Middle', 'Ring', 'Little']
FINGER_SEGS = {
    'Thumb': ['Metacarpal', 'Proximal', 'Distal'],
    'Index': ['Proximal', 'Intermediate', 'Distal'],
    'Middle': ['Proximal', 'Intermediate', 'Distal'],
    'Ring': ['Proximal', 'Intermediate', 'Distal'],
    'Little': ['Proximal', 'Intermediate', 'Distal'],
}


def build_hierarchy():
    parent = {
        'hips': None,
        'spine': 'hips',
        'chest': 'spine',
        'upperChest': 'chest',
        'neck': 'upperChest',
        'head': 'neck',
    }
    for side in ['left', 'right']:
        parent[f'{side}Shoulder'] = 'upperChest'
        parent[f'{side}UpperArm'] = f'{side}Shoulder'
        parent[f'{side}LowerArm'] = f'{side}UpperArm'
        parent[f'{side}Hand'] = f'{side}LowerArm'
        for fin in FINGERS:
            prev = f'{side}Hand'
            for seg in FINGER_SEGS[fin]:
                name = f'{side}{fin}{seg}'
                parent[name] = prev
                prev = name
        parent[f'{side}UpperLeg'] = 'hips'
        parent[f'{side}LowerLeg'] = f'{side}UpperLeg'
        parent[f'{side}Foot'] = f'{side}LowerLeg'
        parent[f'{side}Toes'] = f'{side}Foot'
    return parent


PARENT = build_hierarchy()


def order_bones():
    out = []
    def visit(b):
        out.append(b)
        for c in [k for k, v in PARENT.items() if v == b]:
            visit(c)
    visit('hips')
    return out


BONES = order_bones()


def load_positions():
    ref = json.load(open(os.path.join(HERE, 'kerangka.json')))
    pos = {k: np.array(v, dtype=np.float64) for k, v in ref.items()}
    pos['upperChest'] = np.array([0.0, 1.165, -0.0125])
    missing = [b for b in BONES if b not in pos]
    if missing:
        raise ValueError(f'missing bone positions: {missing}')
    return pos


POS = load_positions()

A_POSE_DEG = 40.0


def is_arm_chain(bone, side):
    b = bone
    while b is not None:
        if b == f'{side}UpperArm':
            return True
        b = PARENT[b]
    return False


def arm_rotation(side, deg=A_POSE_DEG):
    ang = np.radians(-deg if side == 'left' else deg)
    return rot_axis([0, 0, 1], ang)


def bind_pose(deg=A_POSE_DEG):
    world = {}
    for b in BONES:
        M = np.eye(4)
        M[:3, 3] = POS[b]
        for side in ['left', 'right']:
            if is_arm_chain(b, side):
                R = arm_rotation(side, deg)
                pivot = POS[f'{side}UpperArm']
                M[:3, :3] = R
                M[:3, 3] = R @ (POS[b] - pivot) + pivot
        world[b] = M
    return world


def to_bind(points, side, deg=A_POSE_DEG):
    R = arm_rotation(side, deg)
    pivot = POS[f'{side}UpperArm']
    return (points - pivot) @ R.T + pivot


def mirror_x(p):
    q = np.array(p, dtype=np.float64).copy()
    q[..., 0] *= -1
    return q
