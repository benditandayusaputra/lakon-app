import numpy as np

from sdf import (Prim, sphere, ellipsoid, superellipsoid, round_cone, oval_cone, round_box, rounded_slab,
                 smin, smax, transformed, frame_from, normalize)
from skeleton import POS, arm_rotation

FINGER_KEYS = [('Index', 'index'), ('Middle', 'middle'), ('Ring', 'ring'), ('Little', 'pinky')]

FINGER_RADII = {
    'Index': (0.0081, 0.0075, 0.0069, 0.0063),
    'Middle': (0.0084, 0.0078, 0.0071, 0.0065),
    'Ring': (0.0080, 0.0073, 0.0067, 0.0061),
    'Little': (0.0069, 0.0063, 0.0058, 0.0053),
}
THUMB_RADII = (0.0118, 0.0098, 0.0092, 0.0086, 0.0077)


class Part:
    def __init__(self, name, prims, fn, lo, hi, h, edge, material, coarse=None):
        self.name = name
        self.prims = prims
        self.fn = fn
        self.lo = np.asarray(lo, dtype=np.float64)
        self.hi = np.asarray(hi, dtype=np.float64)
        self.h = h
        self.edge = edge
        self.material = material
        self.coarse = coarse


def _side_sign(side):
    return 1.0 if side == 'left' else -1.0


def hand_geometry(side):
    P = lambda name: POS[f'{side}{name}']
    W = P('Hand')
    fwd = normalize(P('MiddleProximal') - W)
    up = np.array([0.0, 1.0, 0.0])
    thumb_side = normalize(np.cross(up, fwd)) * (-1 if side == 'left' else 1)
    if (P('IndexProximal') - P('LittleProximal')) @ thumb_side < 0:
        thumb_side = -thumb_side
    return W, fwd, up, thumb_side


def finger_chain(side, fin):
    P = lambda name: POS[f'{side}{name}']
    if fin == 'Thumb':
        j = [P('ThumbMetacarpal'), P('ThumbProximal'), P('ThumbDistal')]
    else:
        j = [P(f'{fin}Proximal'), P(f'{fin}Intermediate'), P(f'{fin}Distal')]
    tip = j[2] + 0.8 * (j[2] - j[1])
    return j, tip


def hand_prims(side):
    W, fwd, up, ts = hand_geometry(side)
    L = lambda a, b, c: W + fwd * a + up * b + ts * c
    R_hand = np.stack([fwd, up, ts], 1)
    hb = f'{side}Hand'
    prims = {}
    outline = [(0.010, -0.0168), (0.0645, -0.0318), (0.0745, 0.0228), (0.012, 0.0218)]
    prims['palm'] = Prim(rounded_slab(W + up * -0.0005, R_hand, outline, 0.0112, 0.0095), hb, 0.012)
    prims['knuckles'] = Prim(round_cone(POS[f'{side}IndexProximal'] + up * 0.0012 - fwd * 0.004,
                                        POS[f'{side}LittleProximal'] + up * 0.0004 - fwd * 0.004, 0.0098, 0.0080), hb, 0.008)
    prims['hypothenar'] = Prim(ellipsoid(L(0.036, -0.0058, -0.0215), [0.029, 0.0088, 0.0125], R_hand), hb, 0.012)
    fa = normalize(W - POS[f'{side}LowerArm'])
    prims['wrist'] = Prim(oval_cone(W - fa * 0.014, L(0.016, 0.0, 0.003), 0.0226, 0.0238, up, 0.74), hb, 0.012)
    prims['forearm'] = Prim(oval_cone(W - fa * 0.050, W - fa * 0.012, 0.0220, 0.0224, up, 0.78), f'{side}LowerArm', 0.012)
    cmc, mcp_t = POS[f'{side}ThumbMetacarpal'], POS[f'{side}ThumbProximal']
    tdir = normalize(mcp_t - cmc)
    th_c = (cmc * 0.55 + mcp_t * 0.45) - up * 0.0045 - ts * 0.004 - fwd * 0.002
    prims['thenar'] = Prim(ellipsoid(th_c, [0.021, 0.0105, 0.0135], frame_from(tdir, up)), f'{side}ThumbMetacarpal', 0.014)
    fingers = {}
    for fin, _ in FINGER_KEYS:
        (j1, j2, j3), tip = finger_chain(side, fin)
        r0, r1, r2, r3 = FINGER_RADII[fin]
        d3 = normalize(tip - j3)
        tip_end = tip - d3 * (r3 - 0.0016)
        segs = [
            Prim(round_cone(j1 - normalize(j2 - j1) * 0.002, j2, r0, r1), f'{side}{fin}Proximal', 0.0055),
            Prim(round_cone(j2, j3, r1, r2), f'{side}{fin}Intermediate', 0.0045),
            Prim(round_cone(j3, tip_end, r2, r3), f'{side}{fin}Distal', 0.0040),
        ]
        fingers[fin] = segs
    (t1, t2, t3), ttip = finger_chain(side, 'Thumb')
    a0, a1, a2, a3, a4 = THUMB_RADII
    d3 = normalize(ttip - t3)
    ttip_end = ttip - d3 * (a4 - 0.0016)
    fingers['Thumb'] = [
        Prim(round_cone(t1, t2, a0, a1), f'{side}ThumbMetacarpal', 0.007),
        Prim(round_cone(t2, t3, a2, a3), f'{side}ThumbProximal', 0.005),
        Prim(round_cone(t3, ttip_end, a3, a4), f'{side}ThumbDistal', 0.0045),
    ]
    return prims, fingers


def hand_part(side):
    prims, fingers = hand_prims(side)

    def chain(segs):
        def f(p):
            v = segs[0].d(p)
            for sg in segs[1:]:
                v = smin(v, sg.d(p), 0.0025)
            return v
        return f

    chains = {k: chain(v) for k, v in fingers.items()}

    def fn(p):
        palm = prims['palm'].d(p)
        palm = smin(palm, prims['knuckles'].d(p), 0.010)
        palm = smin(palm, prims['hypothenar'].d(p), 0.010)
        palm = smin(palm, prims['wrist'].d(p), 0.016)
        palm = smin(palm, prims['forearm'].d(p), 0.010)
        palm = smin(palm, prims['thenar'].d(p), 0.012)
        f4 = np.minimum.reduce([chains[k](p) for k in ['Index', 'Middle', 'Ring', 'Little']])
        hand = smin(palm, f4, 0.0075)
        hand = smin(hand, chains['Thumb'](p), 0.0105)
        return hand

    all_prims = list(prims.values()) + [sg for segs in fingers.values() for sg in segs]
    W = POS[f'{side}Hand']
    s = _side_sign(side)
    xs = [W[0] - s * 0.100, W[0] + s * 0.180]
    lo = [min(xs), W[1] - 0.035, W[2] - 0.050]
    hi = [max(xs), W[1] + 0.035, W[2] + 0.105]
    return Part(f'hand_{side}', all_prims, fn, lo, hi, 0.00055, 0.0026, 'skin', coarse=0.0025)


def nail_part(side):
    W, fwd, up, ts = hand_geometry(side)
    prims = []
    for fin, _ in FINGER_KEYS:
        (j1, j2, j3), tip = finger_chain(side, fin)
        r = FINGER_RADII[fin]
        d = normalize(tip - j3)
        Ld = np.linalg.norm(tip - j3)
        n = normalize(up - d * (up @ d))
        c = j3 + d * (0.62 * Ld) + n * (r[2] * 0.93 - 0.0009)
        R = np.stack([d, n, np.cross(d, n)], 1)
        prims.append(Prim(ellipsoid(c, [0.47 * Ld, 0.0016, r[2] * 0.78], R), f'{side}{fin}Distal', 0.003))
    (t1, t2, t3), ttip = finger_chain(side, 'Thumb')
    d = normalize(ttip - t3)
    Ld = np.linalg.norm(ttip - t3)
    away = normalize(np.cross(up, d))
    if away @ ts < 0:
        away = -away
    n = normalize(up * 0.80 + away * 0.6)
    n = normalize(n - d * (n @ d))
    c = t3 + d * (0.60 * Ld) + n * (THUMB_RADII[3] * 0.93 - 0.0009)
    R = np.stack([d, n, np.cross(d, n)], 1)
    prims.append(Prim(ellipsoid(c, [0.46 * Ld, 0.0017, THUMB_RADII[3] * 0.80], R), f'{side}ThumbDistal', 0.003))

    def fn(p):
        return np.minimum.reduce([pr.d(p) for pr in prims])

    s = _side_sign(side)
    xs = [W[0] - s * 0.01, W[0] + s * 0.175]
    lo = [min(xs), W[1] - 0.03, W[2] - 0.05]
    hi = [max(xs), W[1] + 0.03, W[2] + 0.105]
    return Part(f'nails_{side}', prims, fn, lo, hi, 0.0004, 0.0012, 'nail', coarse=0.002)


HEAD_C = np.array([0.0, 1.433, -0.011])
HAIR_ZC = -0.011


def head_shapes():
    s = {}
    s['main'] = superellipsoid(HEAD_C, [0.0905, 0.117, 0.106], 2.55)
    s['face'] = ellipsoid([0.0, 1.374, 0.012], [0.0765, 0.074, 0.088])
    s['jaw'] = ellipsoid([0.0, 1.337, 0.024], [0.0645, 0.041, 0.065])
    s['gonion'] = ellipsoid([0.0, 1.343, -0.019], [0.0655, 0.023, 0.034])
    s['chin'] = superellipsoid([0.0, 1.3105, 0.0615], [0.0225, 0.0135, 0.0245], 2.4)
    s['nose'] = ellipsoid([0.0, 1.3772, 0.1012], [0.0102, 0.0110, 0.0116])
    s['bridge'] = round_cone([0.0, 1.4170, 0.0930], [0.0, 1.3840, 0.1072], 0.0047, 0.0068)
    s['alaL'] = sphere([0.0088, 1.3720, 0.0988], 0.0060)
    s['alaR'] = sphere([-0.0088, 1.3720, 0.0988], 0.0060)
    s['neck'] = round_cone([0.0, 1.185, -0.017], [0.0, 1.338, -0.026], 0.0355, 0.0362)
    return s


EAR_C = np.array([0.0928, 1.4085, -0.0205])
EAR_A, EAR_B = 0.0285, 0.0172


def ear_frame():
    a = np.radians(19.0)
    tilt = np.radians(11.0)
    n = np.array([np.cos(a), 0.0, np.sin(a)])
    return frame_from(n, [0.0, np.cos(tilt), -np.sin(tilt)])


def _chain(points, radii):
    segs = [round_cone(points[i], points[i + 1], radii[i], radii[i + 1]) for i in range(len(points) - 1)]

    def f(p):
        d = segs[0](p)
        for g in segs[1:]:
            d = smin(d, g(p), 0.0015)
        return d
    return f


def ear_fn():
    R = ear_frame()
    C = EAR_C
    A, B = EAR_A, EAR_B

    def L(v):
        return C + R @ np.asarray(v, dtype=np.float64)

    al = np.radians(np.linspace(-40.0, 155.0, 16))
    q1 = A * 0.9 * np.cos(al)
    bw = B * (1.0 + 0.18 * np.clip(q1 / A, -1.0, 1.0))
    q2 = -bw * 0.9 * np.sin(al)
    helix_pts = [L([0.0016, a, b]) for a, b in zip(q1, q2)]
    helix_r = 0.0024 + 0.0005 * np.sin(np.linspace(0.0, np.pi, len(al)))
    helix = _chain(helix_pts, helix_r)
    anti = _chain([L([0.0010, 0.0175, 0.0060]), L([0.0010, 0.0105, -0.0035]), L([0.0010, 0.0010, -0.0075]),
                   L([0.0010, -0.0100, -0.0055])], [0.0016, 0.0018, 0.0019, 0.0017])
    bowl = ellipsoid(L([0.0040, 0.0010, -0.0005]), [0.0030, 0.0215, 0.0125], R)
    concha = ellipsoid(L([0.0038, -0.0050, 0.0055]), [0.0034, 0.0085, 0.0062], R)
    tragus = sphere(L([0.0018, -0.0062, 0.0148]), 0.0030)
    lobe = ellipsoid(L([-0.0002, -0.0205, 0.0012]), [0.0042, 0.0105, 0.0098], R)

    def fn(p):
        q = (p - C) @ R
        w = B * (1.0 + 0.18 * np.clip(q[:, 1] / A, -1.0, 1.0))
        e = np.sqrt((q[:, 1] / A) ** 2 + (q[:, 2] / w) ** 2)
        d2 = (e - 0.90) * np.minimum(A, w)
        dz = np.abs(q[:, 0]) - 0.0010
        d = np.minimum(np.maximum(d2, dz), 0.0) + np.sqrt(np.maximum(d2, 0.0) ** 2 + np.maximum(dz, 0.0) ** 2) - 0.0016
        d = smin(d, lobe(p), 0.004)
        d = smax(d, -bowl(p), 0.0025)
        d = smin(d, helix(p), 0.0018)
        d = smin(d, anti(p), 0.0016)
        d = smax(d, -concha(p), 0.0020)
        d = smin(d, tragus(p), 0.0015)
        return d

    return fn


def ear_part():
    prims = [Prim(sphere(EAR_C, 0.05), 'head', 1.0)]
    return Part('ears', prims, ear_fn(), [0.068, 1.362, -0.058], [0.118, 1.455, 0.012], 0.00045, 0.0016, 'skin', coarse=0.002)


def _jaw_taper(p):
    y = p[:, 1]
    t = np.clip((1.415 - y) / (1.415 - 1.305), 0.0, 1.0)
    t = t * t * (3 - 2 * t)
    k = 1.0 - 0.085 * t
    q = p.copy()
    q[:, 0] = q[:, 0] / k
    return q, k


def head_fn_from(s):
    def fn(p):
        q, k = _jaw_taper(p)
        d = smin(s['main'](q) * k, s['face'](q) * k, 0.035)
        d = smin(d, s['jaw'](q) * k, 0.030)
        d = smin(d, s['gonion'](q) * k, 0.026)
        d = smin(d, s['chin'](p), 0.024)
        nose = smin(s['nose'](p), s['bridge'](p), 0.009)
        nose = smin(nose, smin(s['alaL'](p), s['alaR'](p), 0.004), 0.0055)
        d = smin(d, nose, 0.0105)
        d = smin(d, s['neck'](p), 0.032)
        return d
    return fn


def scalp_fn():
    s = head_shapes()

    def fn(p):
        q, k = _jaw_taper(p)
        return smin(s['main'](q) * k, s['face'](q) * k, 0.035)
    return fn


def head_part():
    s = head_shapes()
    fn = head_fn_from(s)
    prims = [
        Prim(round_cone([0.0, 1.150, -0.017], [0.0, 1.245, -0.019], 0.034, 0.034), 'upperChest', 0.030),
        Prim(round_cone([0.0, 1.262, -0.019], [0.0, 1.300, -0.020], 0.034, 0.034), 'neck', 0.030),
        Prim(superellipsoid(HEAD_C + np.array([0, 0.012, 0]), [0.0905, 0.105, 0.106], 2.55), 'head', 0.030),
        Prim(s['face'], 'head', 0.03),
        Prim(s['chin'], 'head', 0.03),
    ]
    return Part('head', prims, fn, [-0.12, 1.12, -0.13], [0.12, 1.56, 0.13], 0.0011, 0.0046, 'skin', coarse=0.004)


HAIRLINE = np.array([
    [0.000, 1.5040], [0.350, 1.5030], [0.620, 1.4990], [0.880, 1.4800], [1.080, 1.4630], [1.240, 1.4540],
    [1.320, 1.4300], [1.400, 1.4180], [1.455, 1.4300], [1.500, 1.4480], [1.620, 1.4535], [1.820, 1.4535],
    [1.980, 1.4440], [2.180, 1.4130], [2.420, 1.3850], [2.800, 1.3740], [np.pi, 1.3720],
])

NAPE_TIPS = [(2.62, 0.010, 0.17), (2.95, 0.013, 0.17)]
LOCK_O = np.array([0.0, 1.42, -0.015])
LOCKS = [
    [(22, 74, 0.011, 0.012), (8, 60, 0.010, 0.013), (-4, 46, 0.0075, 0.012), (-12, 36, 0.005, 0.009), (-17, 30, 0.0030, 0.0030)],
    [(18, 82, 0.012, 0.012), (0, 68, 0.011, 0.013), (-16, 53, 0.0085, 0.012), (-28, 41, 0.006, 0.009), (-35, 33, 0.0032, 0.0030)],
    [(10, 88, 0.012, 0.012), (-14, 74, 0.011, 0.013), (-32, 58, 0.0085, 0.012), (-46, 45, 0.006, 0.009), (-54, 36, 0.0032, 0.0030)],
    [(-14, 84, 0.011, 0.012), (-40, 70, 0.010, 0.012), (-58, 56, 0.008, 0.011), (-70, 45, 0.0055, 0.008), (-76, 37, 0.0030, 0.0028)],
    [(28, 66, 0.010, 0.011), (21, 56, 0.009, 0.011), (14, 46, 0.007, 0.010), (9, 38, 0.0045, 0.007), (6, 33, 0.0028, 0.0028)],
    [(25, 70, 0.011, 0.011), (14, 58, 0.0095, 0.012), (4, 46, 0.007, 0.010), (-3, 38, 0.0045, 0.007), (-6, 33.5, 0.0028, 0.0028)],
    [(32, 76, 0.010, 0.011), (44, 64, 0.009, 0.011), (54, 52, 0.007, 0.010), (61, 43, 0.0045, 0.007), (65, 38, 0.0028, 0.0028)],
    [(35, 66, 0.009, 0.010), (38, 56, 0.008, 0.010), (38, 48, 0.0055, 0.007), (36, 42, 0.0035, 0.0036)],
    [(30, 86, 0.012, 0.012), (-20, 84, 0.013, 0.013), (-60, 76, 0.011, 0.012), (-85, 64, 0.008, 0.010), (-98, 54, 0.005, 0.006)],
    [(40, 80, 0.011, 0.011), (80, 76, 0.011, 0.012), (110, 68, 0.009, 0.010), (128, 58, 0.006, 0.007)],
    [(160, 84, 0.011, 0.012), (175, 70, 0.010, 0.012), (180, 56, 0.008, 0.010), (182, 44, 0.005, 0.007)],
]


def _smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def _tips(theta, tips, mirror):
    out = np.zeros_like(theta)
    a = np.abs(theta) if mirror else theta
    for c, depth, hw in tips:
        u = (a - c) / hw
        out = out + depth * np.clip(1.0 - np.abs(u), 0.0, 1.0) ** 1.25
    return out


def _scalp_point(scalp, theta, elev):
    th, el = np.radians(theta), np.radians(elev)
    d = np.array([np.cos(el) * np.sin(th), np.sin(el), np.cos(el) * np.cos(th)])
    lo, hi = 0.0, 0.25
    for _ in range(60):
        m = 0.5 * (lo + hi)
        if scalp((LOCK_O + d * m)[None])[0] < 0:
            lo = m
        else:
            hi = m
    p = LOCK_O + d * 0.5 * (lo + hi)
    from sdf import gradient
    g = gradient(scalp, p[None])[0]
    return p, g / np.linalg.norm(g)


def _catmull(P, n=4):
    P = np.asarray(P, dtype=np.float64)
    ext = np.concatenate([2 * P[:1] - P[1:2], P, 2 * P[-1:] - P[-2:-1]])
    out = []
    for i in range(1, len(ext) - 2):
        p0, p1, p2, p3 = ext[i - 1], ext[i], ext[i + 1], ext[i + 2]
        for t in np.linspace(0, 1, n, endpoint=False):
            t2, t3 = t * t, t * t * t
            out.append(0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    out.append(P[-1])
    return np.array(out)


def lock_fn(scalp, ctrl, squash=0.55):
    pts, rad = [], []
    for th, el, off, r in ctrl:
        p, n = _scalp_point(scalp, th, el)
        pts.append(np.concatenate([p + n * off, n]))
        rad.append(r)
    pts = np.array(pts)
    k = 4
    curve = _catmull(pts, k)
    C = curve[:, :3]
    N = curve[:, 3:]
    R = np.interp(np.linspace(0, len(rad) - 1, len(C)), np.arange(len(rad)), rad)
    segs = [oval_cone(C[i], C[i + 1], R[i], R[i + 1], N[i] + N[i + 1], squash) for i in range(len(C) - 1)]
    center = C.mean(0)
    reach = np.max(np.linalg.norm(C - center, axis=1)) + R.max() + 0.01

    def f(p):
        out = np.full(len(p), 1.0)
        near = np.linalg.norm(p - center, axis=1) < reach
        q = p[near]
        if len(q):
            d = segs[0](q)
            for g in segs[1:]:
                d = smin(d, g(q), 0.0025)
            out[near] = d
        far = ~near
        out[far] = np.linalg.norm(p[far] - center, axis=1) - reach + 0.01
        return out

    return f


def hair_fn():
    from scipy.interpolate import PchipInterpolator
    scalp = scalp_fn()
    line = PchipInterpolator(HAIRLINE[:, 0], HAIRLINE[:, 1])
    locks = [lock_fn(scalp, c) for c in LOCKS]

    def fn(p):
        x, y, z = p[:, 0], p[:, 1], p[:, 2]
        theta = np.arctan2(x, z - HAIR_ZC)
        ct = np.cos(theta)
        back = _smoothstep(-0.55, -0.90, ct)
        na = _tips(theta, NAPE_TIPS, True) * back
        yh = line(np.abs(theta)) - na
        above = y - yh
        t_side = 0.0022 + 0.0032 * _smoothstep(0.0, 0.040, above) + 0.0006 * back
        top_w = _smoothstep(1.470, 1.530, y)
        t_top = 0.0110 + 0.0040 * np.exp(-(x / 0.05) ** 2) * _smoothstep(1.505, 1.545, y)
        T = t_side + (t_top - t_side) * top_w
        tipw = np.clip(na / 0.006, 0.0, 1.0)
        T = T * (1.0 - tipw * (1.0 - (0.35 + 0.65 * _smoothstep(0.0, 0.020, above))))
        d0 = scalp(p)
        shell = smax(d0 - T, -(d0 + 0.0035), 0.0015)
        d = smax(shell, (yh - y) * 0.9, 0.0028)
        for lk in locks:
            d = smin(d, lk(p), 0.0035)
        return d

    return fn


def hair_part():
    fn = hair_fn()
    prims = [Prim(sphere([0, 1.43, 0], 0.2), 'head', 1.0)]
    return Part('hair', prims, fn, [-0.13, 1.30, -0.15], [0.13, 1.60, 0.13], 0.0008, 0.0034, 'hair', coarse=0.004)


def _hair_surface(H, dirs):
    n = len(dirs)
    t = np.full(n, 0.20)
    prev = t.copy()
    found = np.zeros(n, dtype=bool)
    for _ in range(400):
        p = LOCK_O + dirs * t[:, None]
        inside = H(p) < 0
        found |= inside
        prev = np.where(~found, t, prev)
        t = np.where(found, t, t - 0.0005)
        if found.all():
            break
    lo, hi = t.copy(), prev.copy()
    for _ in range(40):
        m = 0.5 * (lo + hi)
        inside = H(LOCK_O + dirs * m[:, None]) < 0
        lo = np.where(inside, m, lo)
        hi = np.where(inside, hi, m)
    return LOCK_O + dirs * (0.5 * (lo + hi))[:, None]


def hair_highlight():
    from sdf import gradient
    H = hair_fn()
    nu, nv = 72, 3
    u = np.linspace(-1.0, 1.0, nu)
    th = -8.0 + 56.0 * u
    taper = np.clip((1.0 - np.abs(u)) / 0.25, 0.0, 1.0) ** 0.7
    saw = np.abs(((th + 90.0) / 9.5) % 2.0 - 1.0)
    top = 50.2 - 3.5 * u * u + 0.9 * taper
    bot = top - (0.8 + 2.4 * saw) * taper - 0.15
    v = np.linspace(0.0, 1.0, nv)
    el = bot[:, None] + v[None, :] * (top - bot)[:, None]
    TH = np.radians(np.repeat(th, nv))
    EL = np.radians(el.reshape(-1))
    dirs = np.stack([np.cos(EL) * np.sin(TH), np.sin(EL), np.cos(EL) * np.cos(TH)], 1)
    P = _hair_surface(H, dirs)
    g = gradient(H, P)
    N = g / np.linalg.norm(g, axis=1, keepdims=True)
    V = P + N * 0.0005
    faces = []
    for i in range(nu - 1):
        for j in range(nv - 1):
            a = i * nv + j
            b = (i + 1) * nv + j
            faces += [[a, b, b + 1], [a, b + 1, a + 1]]
    F = np.array(faces)
    fn_ = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
    if (fn_ * N[F].mean(1)).sum(1).mean() < 0:
        F = F[:, [0, 2, 1]]
    return V, F, N


def _sleeve_prims(side):
    R = arm_rotation(side)
    pivot = POS[f'{side}UpperArm']
    S = POS[f'{side}UpperArm']
    E = POS[f'{side}LowerArm']
    Hd = POS[f'{side}Hand']
    d = normalize(Hd - E)
    sx = _side_sign(side)
    up_c = round_cone(S + np.array([-sx * 0.004, 0.002, 0.0]), E, 0.0395, 0.0322)
    elbow = sphere(E, 0.0312)
    fore = round_cone(E, Hd - d * 0.012, 0.0306, 0.0268)
    cuff = round_cone(Hd - d * 0.032, Hd - d * 0.0085, 0.0268, 0.0284)
    T = lambda f: transformed(f, R, pivot)
    return {
        'upper': Prim(T(up_c), f'{side}UpperArm', 0.030),
        'elbow': Prim(T(elbow), f'{side}LowerArm', 0.018),
        'fore': Prim(T(fore), f'{side}LowerArm', 0.020),
        'cuff': Prim(T(cuff), f'{side}LowerArm', 0.020),
    }


def shirt_shapes():
    s = {}
    s['pelvis'] = Prim(ellipsoid([0.0, 0.866, -0.016], [0.124, 0.100, 0.090]), 'hips', 0.06)
    s['waist'] = Prim(ellipsoid([0.0, 0.962, -0.012], [0.104, 0.110, 0.080]), 'spine', 0.06)
    s['ribs'] = Prim(ellipsoid([0.0, 1.078, -0.010], [0.115, 0.128, 0.088]), 'chest', 0.06)
    s['bustL'] = Prim(ellipsoid([0.045, 1.090, 0.034], [0.047, 0.045, 0.056]), 'chest', 0.04)
    s['bustR'] = Prim(ellipsoid([-0.045, 1.090, 0.034], [0.047, 0.045, 0.056]), 'chest', 0.04)
    s['upper'] = Prim(ellipsoid([0.0, 1.168, -0.016], [0.122, 0.077, 0.080]), 'upperChest', 0.05)
    for side in ['left', 'right']:
        sx = _side_sign(side)
        s[f'trap_{side}'] = Prim(round_cone([sx * 0.042, 1.238, -0.024], [sx * 0.117, 1.236, -0.016], 0.029, 0.034), 'upperChest', 0.03)
        s[f'cap_{side}'] = Prim(sphere([sx * 0.132, 1.232, -0.013], 0.0420), f'{side}Shoulder', 0.035)
        for k, v in _sleeve_prims(side).items():
            s[f'{k}_{side}'] = v
    return s


def shirt_part():
    s = shirt_shapes()

    def arm(p, side):
        a = smin(s[f'upper_{side}'].d(p), s[f'elbow_{side}'].d(p), 0.012)
        a = smin(a, s[f'fore_{side}'].d(p), 0.012)
        a = smin(a, s[f'cuff_{side}'].d(p), 0.010)
        return a

    def fn(p):
        y = p[:, 1]
        d = smin(s['pelvis'].d(p), s['waist'].d(p), 0.06)
        d = smin(d, s['ribs'].d(p), 0.06)
        d = smin(d, smin(s['bustL'].d(p), s['bustR'].d(p), 0.02), 0.03)
        d = smin(d, s['upper'].d(p), 0.05)
        for side in ['left', 'right']:
            d = smin(d, s[f'trap_{side}'].d(p), 0.04)
            d = smin(d, s[f'cap_{side}'].d(p), 0.035)
            d = smin(d, arm(p, side), 0.022)
        d = smax(d, 0.795 - y, 0.010)
        return d

    return Part('shirt', list(s.values()), fn, [-0.62, 0.70, -0.16], [0.62, 1.34, 0.16], 0.0021, 0.0090, 'shirt', coarse=0.008)



def pants_part():
    s = {}
    s['pelvis'] = Prim(ellipsoid([0.0, 0.840, -0.018], [0.128, 0.098, 0.094]), 'hips', 0.06)
    for side in ['left', 'right']:
        sx = _side_sign(side)
        U = POS[f'{side}UpperLeg']
        K = POS[f'{side}LowerLeg']
        F = POS[f'{side}Foot']
        s[f'thigh_{side}'] = Prim(round_cone(U + np.array([sx * -0.002, -0.006, -0.008]), K, 0.065, 0.047), f'{side}UpperLeg', 0.05)
        s[f'knee_{side}'] = Prim(sphere(K + np.array([0, 0, 0.002]), 0.0465), f'{side}LowerLeg', 0.030)
        s[f'shin_{side}'] = Prim(round_cone(K, np.array([F[0], 0.108, -0.006]), 0.0455, 0.0395), f'{side}LowerLeg', 0.04)

    def fn(p):
        y = p[:, 1]
        d = s['pelvis'].d(p)
        for side in ['left', 'right']:
            leg = smin(s[f'thigh_{side}'].d(p), s[f'knee_{side}'].d(p), 0.03)
            leg = smin(leg, s[f'shin_{side}'].d(p), 0.03)
            d = smin(d, leg, 0.045)
        d = smax(d, y - 0.935, 0.01)
        d = smax(d, 0.075 - y, 0.006)
        return d

    return Part('pants', list(s.values()), fn, [-0.25, 0.04, -0.15], [0.25, 0.97, 0.13], 0.0026, 0.0120, 'pants', coarse=0.008)


def shoe_prims():
    s = {}
    for side in ['left', 'right']:
        x = POS[f'{side}Foot'][0]
        s[f'heel_{side}'] = Prim(ellipsoid([x, 0.048, -0.040], [0.041, 0.046, 0.050]), f'{side}Foot', 0.04)
        s[f'vamp_{side}'] = Prim(round_box([x, 0.040, 0.058], [0.0435, 0.039, 0.088], 0.034), f'{side}Foot', 0.04)
        s[f'toe_{side}'] = Prim(ellipsoid([x, 0.036, 0.132], [0.0445, 0.035, 0.050]), f'{side}Toes', 0.03)
        s[f'collar_{side}'] = Prim(round_cone([x, 0.060, -0.022], [x, 0.112, -0.012], 0.041, 0.039), f'{side}Foot', 0.04)
        s[f'sole_{side}'] = Prim(round_box([x, 0.0115, 0.046], [0.0475, 0.0115, 0.1175], 0.0095), f'{side}Foot', 0.04)
    return s


def shoes_part():
    s = shoe_prims()

    def fn(p):
        ds = []
        for side in ['left', 'right']:
            d = smin(s[f'heel_{side}'].d(p), s[f'vamp_{side}'].d(p), 0.03)
            d = smin(d, s[f'toe_{side}'].d(p), 0.03)
            d = smin(d, s[f'collar_{side}'].d(p), 0.02)
            d = smin(d, s[f'sole_{side}'].d(p), 0.006)
            ds.append(d)
        d = np.minimum(ds[0], ds[1])
        return smax(d, -p[:, 1] - 0.0005, 0.002)

    return Part('shoes', list(s.values()), fn, [-0.16, -0.01, -0.12], [0.16, 0.16, 0.21], 0.0018, 0.0085, 'shoe', coarse=0.006)
