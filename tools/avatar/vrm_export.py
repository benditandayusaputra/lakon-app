import numpy as np

from gltf_writer import GLB, FLOAT, USHORT, UINT, UBYTE, ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER, hex_lin


def quantize_weights(W):
    W = np.asarray(W, dtype=np.float64)
    W = W / np.maximum(W.sum(1, keepdims=True), 1e-12)
    q = np.floor(W * 255).astype(np.int64)
    rem = 255 - q.sum(1)
    frac = W * 255 - q
    order = np.argsort(-frac, axis=1)
    for k in range(4):
        add = (rem > k).astype(np.int64)
        np.add.at(q, (np.arange(len(q)), order[:, k]), add)
    return q.astype(np.uint8)
from skeleton import BONES, PARENT, POS, bind_pose


def mtoon_material(name, base, shade, outline=None, outline_width=0.0, toony=0.9, shift=-0.1,
                   rim=None, rim_power=4.0, rim_lift=0.0, emissive=None, gi=0.9, double_sided=False,
                   alpha_mode='OPAQUE', render_queue=0):
    b = hex_lin(base)
    mat = {
        'name': name,
        'pbrMetallicRoughness': {'baseColorFactor': b + [1.0], 'metallicFactor': 0.0, 'roughnessFactor': 1.0},
        'alphaMode': alpha_mode,
        'doubleSided': double_sided,
        'extensions': {
            'KHR_materials_unlit': {},
            'VRMC_materials_mtoon': {
                'specVersion': '1.0',
                'transparentWithZWrite': False,
                'renderQueueOffsetNumber': render_queue,
                'shadeColorFactor': hex_lin(shade),
                'shadingShiftFactor': shift,
                'shadingToonyFactor': toony,
                'giEqualizationFactor': gi,
                'matcapFactor': [0.0, 0.0, 0.0],
                'parametricRimColorFactor': hex_lin(rim) if rim else [0.0, 0.0, 0.0],
                'parametricRimFresnelPowerFactor': rim_power,
                'parametricRimLiftFactor': rim_lift,
                'rimLightingMixFactor': 1.0,
                'outlineWidthMode': 'worldCoordinates' if outline_width > 0 else 'none',
                'outlineWidthFactor': outline_width,
                'outlineColorFactor': hex_lin(outline) if outline else [0.0, 0.0, 0.0],
                'outlineLightingMixFactor': 1.0,
                'uvAnimationScrollXSpeedFactor': 0.0,
                'uvAnimationScrollYSpeedFactor': 0.0,
                'uvAnimationRotationSpeedFactor': 0.0,
            },
        },
    }
    if emissive:
        mat['emissiveFactor'] = hex_lin(emissive)
    return mat


def _ulps(x, k):
    import math
    step = math.inf if k > 0 else -math.inf
    for _ in range(abs(k)):
        x = math.nextafter(x, step)
    return x


def _raw_local(w, Wp, span=64):
    base = w - Wp
    for k in sorted(range(-span, span + 1), key=abs):
        c = _ulps(base, k)
        if c + Wp == w:
            return c
    return None


def exact_translations(targets, span=48):
    import sys
    sys.setrecursionlimit(10000)
    children = {b: [c for c in BONES if PARENT[c] == b] for b in BONES}
    result = {}
    for i in range(3):
        memo = {}

        def candidates(b, Wp, NWp):
            if b in targets:
                t = targets[b][i]
                out = []
                for k in sorted(range(-span, span + 1), key=abs):
                    w = _ulps(t, k)
                    if (w - Wp) + NWp == t and _raw_local(w, Wp) is not None:
                        out.append((w, t))
                return out
            t = float(POS[b][i])
            out = []
            for k in sorted(range(-span, span + 1), key=abs):
                w = _ulps(t, k)
                if _raw_local(w, Wp) is not None:
                    out.append((w, (w - Wp) + NWp))
            return out

        def solve(b, Wp, NWp):
            key = (b, Wp, NWp)
            if key in memo:
                return memo[key]
            found = None
            for w, nw in candidates(b, Wp, NWp):
                sub = {}
                ok = True
                for c in children[b]:
                    r = solve(c, w, nw)
                    if r is None:
                        ok = False
                        break
                    sub.update(r)
                if ok:
                    sub[b] = (_raw_local(w, Wp), w, nw)
                    found = sub
                    break
            memo[key] = found
            return found

        root = 'hips'
        t0 = targets[root][i]
        sol = {}
        ok = True
        for c in children[root]:
            r = solve(c, t0, t0)
            if r is None:
                ok = False
                break
            sol.update(r)
        if not ok:
            raise ValueError(f'no exact skeleton for axis {i}')
        sol[root] = (t0, t0, t0)
        for b, (l, w, nw) in sol.items():
            result.setdefault(b, [0.0, 0.0, 0.0])[i] = l
    return result


def export_vrm(path, meshes, materials, expressions, meta, look_at, thumbnail_png=None, textures=(), exact_world=None):
    g = GLB()
    for k, png in enumerate(textures):
        g.add_image_png(png, f'tex{k}')
    mat_index = {}
    for m in materials:
        mat_index[m['name']] = g.add_material(m)

    bone_node = {}
    exact = exact_translations(exact_world) if exact_world else None
    for b in BONES:
        p = PARENT[b]
        if exact:
            t = exact[b]
        else:
            t = POS[b] - (POS[p] if p else np.zeros(3))
        bone_node[b] = g.add_node({'name': b, 'translation': [float(x) for x in t]}, root=(p is None))
    for b in BONES:
        kids = [bone_node[c] for c in BONES if PARENT[c] == b]
        if kids:
            g.j['nodes'][bone_node[b]]['children'] = kids

    world = bind_pose()
    ibm = np.stack([np.linalg.inv(world[b]).T.reshape(-1) for b in BONES]).astype(np.float32)
    ibm_acc = g.accessor(ibm, FLOAT, 'MAT4')
    g.j['skins'].append({'name': 'skin', 'joints': [bone_node[b] for b in BONES], 'inverseBindMatrices': ibm_acc,
                         'skeleton': bone_node['hips']})

    mesh_node = {}
    for mesh in meshes:
        tnames = mesh.get('targetNames', [])
        prims = []
        for pr in mesh['primitives']:
            V = np.asarray(pr['V'], dtype=np.float32)
            N = np.asarray(pr['N'], dtype=np.float32)
            attrs = {
                'POSITION': g.accessor(V, FLOAT, 'VEC3', ARRAY_BUFFER, minmax=True),
                'NORMAL': g.accessor(N, FLOAT, 'VEC3', ARRAY_BUFFER),
                'JOINTS_0': g.accessor(pr['J'], UBYTE, 'VEC4', ARRAY_BUFFER),
                'WEIGHTS_0': g.accessor(quantize_weights(pr['W']), UBYTE, 'VEC4', ARRAY_BUFFER, normalized=True),
            }
            if 'C' in pr:
                attrs['COLOR_0'] = g.accessor(np.asarray(pr['C'], dtype=np.float32), FLOAT, 'VEC4', ARRAY_BUFFER)
            if 'UV' in pr:
                attrs['TEXCOORD_0'] = g.accessor(np.asarray(pr['UV'], dtype=np.float32), FLOAT, 'VEC2', ARRAY_BUFFER)
            F = np.asarray(pr['F']).reshape(-1)
            itype = USHORT if len(V) < 65536 else UINT
            prim = {'attributes': attrs, 'indices': g.accessor(F, itype, 'SCALAR', ELEMENT_ARRAY_BUFFER),
                    'material': mat_index[pr['material']], 'mode': 4}
            if tnames:
                morphs = pr.get('morphs', {})
                targets = []
                for tn in tnames:
                    d = morphs.get(tn)
                    if d is None:
                        d = np.zeros_like(V)
                    targets.append({'POSITION': g.sparse_vec3(d)})
                prim['targets'] = targets
            prims.append(prim)
        mdef = {'name': mesh['name'], 'primitives': prims}
        if tnames:
            mdef['weights'] = [0.0] * len(tnames)
            mdef['extras'] = {'targetNames': tnames}
        g.j['meshes'].append(mdef)
        mesh_node[mesh['name']] = g.add_node({'name': mesh['name'], 'mesh': len(g.j['meshes']) - 1, 'skin': 0}, root=True)

    preset_names = {'happy', 'angry', 'sad', 'relaxed', 'surprised', 'aa', 'ih', 'ou', 'ee', 'oh', 'blink',
                    'blinkLeft', 'blinkRight', 'lookUp', 'lookDown', 'lookLeft', 'lookRight', 'neutral'}
    preset, custom = {}, {}
    for ex in expressions:
        binds = [{'node': mesh_node[mb[0]], 'index': int(mb[1]), 'weight': float(mb[2])} for mb in ex['binds']]
        e = {'morphTargetBinds': binds, 'isBinary': bool(ex.get('binary', False)),
             'overrideBlink': ex.get('overrideBlink', 'none'), 'overrideLookAt': ex.get('overrideLookAt', 'none'),
             'overrideMouth': ex.get('overrideMouth', 'none')}
        (preset if ex['name'] in preset_names else custom)[ex['name']] = e
    if 'neutral' not in preset:
        preset['neutral'] = {'morphTargetBinds': [], 'isBinary': False, 'overrideBlink': 'none',
                             'overrideLookAt': 'none', 'overrideMouth': 'none'}

    vrm = {
        'specVersion': '1.0',
        'meta': dict(meta),
        'humanoid': {'humanBones': {b: {'node': bone_node[b]} for b in BONES}},
        'firstPerson': {'meshAnnotations': [{'node': n, 'type': 'auto'} for n in mesh_node.values()]},
        'lookAt': look_at,
        'expressions': {'preset': preset, 'custom': custom},
    }
    if thumbnail_png is not None:
        _, img = g.add_image_png(thumbnail_png, 'thumbnail')
        vrm['meta']['thumbnailImage'] = img
    g.j['extensionsUsed'] = ['KHR_materials_unlit', 'VRMC_materials_mtoon', 'VRMC_vrm']
    g.j['extensions'] = {'VRMC_vrm': vrm}
    size = g.save(path)
    return size, mesh_node, bone_node
