import json
import os
import sys
import time

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import parts as P
import style
from face import EXPRESSIONS, build_face
from mesher import mesh_from_sdf
from sdf import normalize
from skeleton import POS, arm_rotation, to_bind
from skinning import BONE_INDEX, rigid_weights, weights_from_prims
from vrm_export import export_vrm

CACHE = os.path.join(HERE, '.cache')
OUTPUT = os.path.normpath(os.path.join(HERE, '..', '..', 'apps', 'web', 'public', 'models', 'silakon.vrm'))

META = {
    'name': 'Silakon',
    'version': '1.0',
    'authors': ['Tim Lakon'],
    'copyrightInformation': '© 2026 Tim Lakon',
    'contactInformation': '',
    'references': [],
    'licenseUrl': 'https://vrm.dev/licenses/1.0/',
    'avatarPermission': 'onlyAuthor',
    'allowExcessivelyViolentUsage': False,
    'allowExcessivelySexualUsage': False,
    'commercialUsage': 'personalNonProfit',
    'allowPoliticalOrReligiousUsage': False,
    'allowAntisocialOrHateUsage': False,
    'creditNotation': 'required',
    'allowRedistribution': False,
    'modification': 'prohibited',
}

LOOK_AT = {
    'type': 'expression',
    'offsetFromHeadBone': [0.0, 0.082, 0.095],
    'rangeMapHorizontalInner': {'inputMaxValue': 30.0, 'outputScale': 1.0},
    'rangeMapHorizontalOuter': {'inputMaxValue': 30.0, 'outputScale': 1.0},
    'rangeMapVerticalDown': {'inputMaxValue': 25.0, 'outputScale': 1.0},
    'rangeMapVerticalUp': {'inputMaxValue': 25.0, 'outputScale': 1.0},
}

BODY_PARTS = [
    ('shirt', 'shirt'), ('trim', 'trim'), ('pants', 'pants'), ('shoes_upper', 'shoe'), ('shoes_sole', 'sole'),
    ('hand_left', 'skin'), ('hand_right', 'skin'), ('nails_left', 'nail'), ('nails_right', 'nail'),
]


def save(name, V, F, N, J, W):
    np.savez_compressed(os.path.join(CACHE, name + '.npz'), V=V, F=F, N=N, J=J, W=W)


def load(name):
    d = np.load(os.path.join(CACHE, name + '.npz'))
    return {k: d[k] for k in d.files}


def mesh_part(part):
    V, F, N = mesh_from_sdf(part.fn, part.lo, part.hi, part.h, part.edge, coarse=part.coarse, label=part.name)
    J, W = weights_from_prims(V, part.prims)
    return V, F, N, J, W


def build_simple(part, bind_side=None):
    V, F, N, J, W = mesh_part(part)
    if bind_side:
        V = to_bind(V, bind_side)
        N = N @ arm_rotation(bind_side).T
    save(part.name, V, F, N, J, W)


def build_hand(side):
    part = P.hand_part(side)
    V, F, N, J, W = mesh_part(part)
    wrist = POS[f'{side}Hand']
    along = (V - wrist) @ normalize(wrist - POS[f'{side}LowerArm'])
    t = np.clip((along + 0.022) / 0.016, 0.0, 1.0)
    keep = t * t * (3 - 2 * t)
    hand_bone = BONE_INDEX[f'{side}Hand']
    lower_bone = BONE_INDEX[f'{side}LowerArm']
    dense = {}
    for k in range(4):
        for b in np.unique(J[:, k]):
            dense.setdefault(int(b), np.zeros(len(V)))
            dense[int(b)] += np.where(J[:, k] == b, W[:, k], 0.0)
    moved = dense.get(hand_bone, np.zeros(len(V))) * (1 - keep)
    dense[hand_bone] = dense.get(hand_bone, np.zeros(len(V))) - moved
    dense[lower_bone] = dense.get(lower_bone, np.zeros(len(V))) + moved
    bones = np.array(sorted(dense))
    mat = np.stack([dense[b] for b in bones], 1)
    order = np.argsort(-mat, axis=1)[:, :4]
    top = np.take_along_axis(mat, order, 1)
    top[top < 1e-4] = 0
    top /= np.maximum(top.sum(1, keepdims=True), 1e-12)
    J2 = bones[order].astype(np.uint16)
    J2[top == 0] = 0
    save(part.name, to_bind(V, side), F, N @ arm_rotation(side).T, J2, top.astype(np.float32))


def collar_tube(shirt_fn, n=120, ring=14, radius=0.0400, tube=0.0034):
    axis = np.array([0.0, 0.0, -0.0205])
    pts = []
    for t in np.linspace(0, 2 * np.pi, n, endpoint=False):
        x, z = radius * np.sin(t), axis[2] + radius * np.cos(t)
        ys = np.arange(1.335, 1.150, -0.0005)
        d = shirt_fn(np.stack([np.full_like(ys, x), ys, np.full_like(ys, z)], 1))
        k = np.nonzero(d < 0)[0][0]
        a, b = ys[k - 1], ys[k]
        for _ in range(30):
            m = 0.5 * (a + b)
            a, b = (m, b) if shirt_fn(np.array([[x, m, z]]))[0] > 0 else (a, m)
        pts.append([x, 0.5 * (a + b), z])
    C = np.array(pts)
    for _ in range(4):
        C[:, 1] = 0.25 * np.roll(C[:, 1], 1) + 0.5 * C[:, 1] + 0.25 * np.roll(C[:, 1], -1)
    T = np.roll(C, -1, 0) - np.roll(C, 1, 0)
    T /= np.linalg.norm(T, axis=1, keepdims=True)
    radial = C - axis
    radial[:, 1] = 0
    radial /= np.linalg.norm(radial, axis=1, keepdims=True)
    up = np.cross(T, radial)
    up *= np.sign(up[:, 1:2])
    center = C + radial * 0.0006 + up * 0.0012
    a = np.linspace(0, 2 * np.pi, ring, endpoint=False)
    cos_a = np.cos(a)[None, :, None]
    sin_a = np.sin(a)[None, :, None]
    V = (center[:, None, :] + tube * (cos_a * radial[:, None, :] + sin_a * up[:, None, :] * 1.15)).reshape(-1, 3)
    N = (cos_a * radial[:, None, :] + sin_a * up[:, None, :]).reshape(-1, 3)
    N /= np.linalg.norm(N, axis=1, keepdims=True)
    F = []
    for i in range(n):
        for j in range(ring):
            p0 = i * ring + j
            p1 = i * ring + (j + 1) % ring
            p2 = ((i + 1) % n) * ring + (j + 1) % ring
            p3 = ((i + 1) % n) * ring + j
            F += [[p0, p1, p2], [p0, p2, p3]]
    F = np.array(F)
    tn = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
    if (tn * N[F].mean(1)).sum(1).mean() < 0:
        F = F[:, [0, 2, 1]]
    return V, F, N


def build_hair():
    build_simple(P.hair_part())
    V, F, N = P.hair_highlight()
    save('hair_hi', V, F, N, *rigid_weights(len(V), 'head'))


def build_ears():
    part = P.ear_part()
    V, F, N = mesh_from_sdf(part.fn, part.lo, part.hi, part.h, part.edge, coarse=part.coarse, label=part.name)
    M = np.array([-1.0, 1.0, 1.0])
    V2 = np.concatenate([V, V * M])
    N2 = np.concatenate([N, N * M])
    F2 = np.concatenate([F, F[:, [0, 2, 1]] + len(V)])
    save('ears', V2, F2, N2, *rigid_weights(len(V2), 'head'))


def build_shirt():
    part = P.shirt_part()
    save('shirt', *mesh_part(part))
    V, F, N = collar_tube(part.fn)
    save('trim', V, F, N, *rigid_weights(len(V), 'upperChest'))


def build_shoes():
    V, F, N, J, W = mesh_part(P.shoes_part())
    sole = V[F].mean(1)[:, 1] < 0.0215
    for name, mask in (('shoes_upper', ~sole), ('shoes_sole', sole)):
        Fm = F[mask]
        used = np.unique(Fm)
        remap = -np.ones(len(V), dtype=np.int64)
        remap[used] = np.arange(len(used))
        save(name, V[used], remap[Fm], N[used], J[used], W[used])


BUILDERS = {
    'hand_left': (lambda: build_hand('left'), ['hand_left']),
    'hand_right': (lambda: build_hand('right'), ['hand_right']),
    'nails_left': (lambda: build_simple(P.nail_part('left'), 'left'), ['nails_left']),
    'nails_right': (lambda: build_simple(P.nail_part('right'), 'right'), ['nails_right']),
    'head': (lambda: build_simple(P.head_part()), ['head']),
    'hair': (build_hair, ['hair', 'hair_hi']),
    'ears': (build_ears, ['ears']),
    'shirt': (build_shirt, ['shirt', 'trim']),
    'pants': (lambda: build_simple(P.pants_part()), ['pants']),
    'shoes': (build_shoes, ['shoes_upper', 'shoes_sole']),
}


def prim(name, material):
    d = load(name)
    return {'V': d['V'], 'N': d['N'], 'J': d['J'], 'W': d['W'], 'F': d['F'], 'material': material}


def head_mesh():
    head = prim('head', 'skin')
    face_parts, skin_morphs = build_face(head['V'])
    head['morphs'] = skin_morphs
    prims = [head, prim('ears', 'skin')]
    for mat, d in face_parts.items():
        J, W = rigid_weights(len(d['V']), 'head')
        prims.append({'V': d['V'], 'N': d['N'], 'J': J, 'W': W, 'F': d['F'], 'material': mat, 'morphs': d['morphs']})
    expressions = []
    for i, name in enumerate(EXPRESSIONS):
        ex = {'name': name, 'binds': [('Head', i, 1.0)]}
        if name == 'happy':
            ex['overrideBlink'] = 'block'
            ex['overrideLookAt'] = 'block'
        if name in ('relaxed', 'mataSipit'):
            ex['overrideBlink'] = 'blend'
        expressions.append(ex)
    return {'name': 'Head', 'primitives': prims, 'targetNames': EXPRESSIONS}, expressions


def assemble(out_path):
    head, expressions = head_mesh()
    meshes = [
        {'name': 'Body', 'primitives': [prim(name, mat) for name, mat in BODY_PARTS]},
        head,
        {'name': 'Hair', 'primitives': [prim('hair', 'hair'), prim('hair_hi', 'hair_hi')]},
    ]
    exact = json.load(open(os.path.join(HERE, 'kerangka.json')))
    size, _, _ = export_vrm(out_path, meshes, style.materials(), expressions, META, LOOK_AT, exact_world=exact)
    return size


if __name__ == '__main__':
    os.makedirs(CACHE, exist_ok=True)
    want = sys.argv[1:]
    for name, (fn, outputs) in BUILDERS.items():
        cached = all(os.path.exists(os.path.join(CACHE, o + '.npz')) for o in outputs)
        if name in want or 'semua' in want or not cached:
            t = time.time()
            fn()
            print(f'{name}: {time.time() - t:.1f} dtk')
    size = assemble(OUTPUT)
    print(f'{OUTPUT}: {size / 1e6:.2f} MB')
