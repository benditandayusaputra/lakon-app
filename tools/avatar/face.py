import copy
import numpy as np

from parts import head_shapes, head_fn_from
from sdf import gradient, length

HEAD = head_fn_from(head_shapes())

LAYER = {
    'lowerlip': 0.00018, 'nose': 0.00025, 'sclera': 0.00030, 'brow': 0.00030, 'mouth': 0.00030,
    'lowerlid': 0.00038, 'crease': 0.00040,
    'iris_ring': 0.00050, 'iris': 0.00045, 'teeth': 0.00048, 'pupil': 0.00065, 'tongue': 0.00062,
    'highlight': 0.00085, 'lipline': 0.00075, 'lash': 0.00100,
}

EYE_C = np.array([0.0478, 1.4140])
BROW_IN = np.array([0.0198, 1.4440])
BROW_OUT = np.array([0.0738, 1.4475])
MOUTH_C = np.array([0.0, 1.3445])


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def project(xy):
    xy = np.asarray(xy, dtype=np.float64)
    n = len(xy)
    z = np.full(n, 0.17)
    p = np.stack([xy[:, 0], xy[:, 1], z], 1)
    prev = z.copy()
    for _ in range(160):
        d = HEAD(p)
        done = d < 2e-5
        step = np.where(done, 0.0, np.maximum(d * 0.6, 2e-5))
        prev = np.where(done, prev, p[:, 2])
        p[:, 2] -= step
        if done.all():
            break
    lo = p[:, 2].copy()
    hi = prev.copy()
    for _ in range(30):
        mid = 0.5 * (lo + hi)
        q = np.stack([xy[:, 0], xy[:, 1], mid], 1)
        inside = HEAD(q) < 0
        lo = np.where(inside, mid, lo)
        hi = np.where(inside, hi, mid)
    p = np.stack([xy[:, 0], xy[:, 1], 0.5 * (lo + hi)], 1)
    g = gradient(HEAD, p)
    nrm = g / np.maximum(length(g), 1e-12)[:, None]
    return p, nrm


def skin_field(p, w):
    x, y, z = p[:, 0], p[:, 1], p[:, 2]
    d = np.zeros_like(p)
    jaw = w.get('jaw', 0.0)
    if jaw:
        f = smoothstep(1.3475, 1.3335, y) * np.exp(-(x / 0.050) ** 2) * smoothstep(-0.03, 0.05, z) * smoothstep(1.262, 1.300, y)
        d[:, 1] -= 0.0058 * jaw * f
        d[:, 2] -= 0.0012 * jaw * f
    puff = w.get('puff', 0.0)
    if puff:
        for sx in (1.0, -1.0):
            f = np.exp(-(((x - sx * 0.049) / 0.024) ** 2 + ((y - 1.357) / 0.021) ** 2)) * smoothstep(0.0, 0.05, z)
            d[:, 0] += sx * 0.0030 * puff * f
            d[:, 2] += 0.0042 * puff * f
    pucker = w.get('pucker', 0.0)
    if pucker:
        f = np.exp(-((x / 0.026) ** 2 + ((y - 1.3445) / 0.015) ** 2)) * smoothstep(0.04, 0.09, z)
        d[:, 0] -= 0.22 * x * pucker * f
        d[:, 2] += 0.0042 * pucker * f
    smile = w.get('smile', 0.0)
    if smile:
        for sx in (1.0, -1.0):
            f = np.exp(-(((x - sx * 0.047) / 0.022) ** 2 + ((y - 1.363) / 0.018) ** 2)) * smoothstep(0.0, 0.05, z)
            d[:, 1] += 0.0018 * smile * f
            d[:, 2] += 0.0010 * smile * f
    return d


def grid_faces(nu, nv):
    f = []
    for i in range(nu - 1):
        for j in range(nv - 1):
            a = i * nv + j
            b = (i + 1) * nv + j
            f.append([a, b, b + 1])
            f.append([a, b + 1, a + 1])
    return np.array(f, dtype=np.int64)


def disk_faces(nr, ns):
    f = []
    for r in range(nr - 1):
        for s in range(ns):
            a = r * ns + s
            b = r * ns + (s + 1) % ns
            c = (r + 1) * ns + (s + 1) % ns
            d = (r + 1) * ns + s
            f.append([a, b, c])
            f.append([a, c, d])
    return np.array(f, dtype=np.int64)


U_EYE = np.concatenate([np.linspace(-1, -0.8, 5)[:-1], np.linspace(-0.8, 0.8, 25)[:-1], np.linspace(0.8, 1, 5)])
U_EYE = np.sign(U_EYE) * np.abs(U_EYE) ** 0.9


EYE_NEUTRAL = dict(W=0.0184, ht=0.0123, hb=0.0089, pt=0.45, pb=0.95, y_in=-0.0012, y_out=0.0016, open=1.0,
                   arc=-0.0024, arc_lift=0.0, drop_in=0.0, drop_out=0.0, raise_b=0.0, top_add=0.0,
                   gaze=(0.0, 0.0), iris_r=0.0107)
BROW_NEUTRAL = dict(dy=0.0, raise_in=0.0, raise_out=0.0, shift_in=0.0, arch=0.0016, t_in=0.0060, t_out=0.0028)
MOUTH_NEUTRAL = dict(hw=0.0150, c=0.0017, top=0.0, bot=0.0, pa=0.8, pb=0.7, teeth_up=0.0, teeth_lo=0.0,
                     tongue=0.0, tongue_out=0.0, line=0.00085, lip=0.0016, dy=0.0)


def eye_curves(e, u):
    L = e['y_in'] + (e['y_out'] - e['y_in']) * (u + 1) / 2
    k = np.clip(1 - u * u, 0, 1)
    top = L + e['ht'] * k ** e['pt'] + e['top_add'] * k ** 0.6
    top -= e['drop_in'] * np.exp(-((u + 0.55) / 0.55) ** 2) * k ** 0.35
    top -= e['drop_out'] * np.exp(-((u - 0.55) / 0.55) ** 2) * k ** 0.35
    bot = L - e['hb'] * k ** e['pb'] + e['raise_b'] * k ** e['pb']
    closed = L + e['arc'] * k ** 0.8 + e['arc_lift'] * k ** 0.5
    o = e['open']
    top = closed + o * (top - closed)
    bot = closed + o * (bot - closed)
    bot = np.minimum(bot, top)
    return top, bot


def eye_geometry(e, side):
    c = np.array([side * EYE_C[0], EYE_C[1]])
    sx = side
    W = e['W']
    out = {}
    u = U_EYE
    top, bot = eye_curves(e, u)
    nv = 7
    v = np.linspace(0, 1, nv)
    X = c[0] + sx * W * np.repeat(u, nv)
    Y = c[1] + (bot[:, None] + v[None, :] * (top - bot)[:, None]).reshape(-1)
    out['sclera'] = (np.stack([X, Y], 1), grid_faces(len(u), nv))

    def clamp(pts):
        uu = np.clip((pts[:, 0] - c[0]) / (sx * W), -0.985, 0.985)
        t, b = eye_curves(e, uu)
        yy = np.clip(pts[:, 1] - c[1], b, t) + c[1]
        return np.stack([c[0] + sx * W * uu, yy], 1)

    def disk(center, r0, r1, nr=6, ns=36):
        rr = np.linspace(r0, r1, nr)
        ang = np.linspace(0, 2 * np.pi, ns, endpoint=False)
        pts = np.stack([center[0] + rr[:, None] * np.cos(ang)[None], center[1] + rr[:, None] * np.sin(ang)[None]], -1).reshape(-1, 2)
        return pts, disk_faces(nr, ns)

    gaze = np.array(e['gaze'])
    ic = c + np.array([0.0, 0.0020]) + gaze
    ir = e['iris_r']
    pts, f = disk(ic, 0.0, ir * 0.88, nr=7)
    out['iris'] = (clamp(pts), f)
    pts, f = disk(ic, ir * 0.86, ir, nr=3)
    out['iris_ring'] = (clamp(pts), f)
    pts, f = disk(ic + np.array([0.0, 0.0002]), 0.0, 0.0049, nr=5)
    out['pupil'] = (clamp(pts), f)
    h1, f1 = disk(ic + np.array([0.0036, 0.0036]), 0.0, 0.0022, nr=4, ns=24)
    h2, f2 = disk(ic + np.array([-0.0033, -0.0036]), 0.0, 0.0010, nr=3, ns=18)
    out['highlight'] = (np.concatenate([clamp(h1), clamp(h2)]), np.concatenate([f1, f2 + len(h1)]))
    ul = np.linspace(-1.0, 1.05, 40)
    uc = np.clip(ul, -1, 1)
    t_top, _ = eye_curves(e, uc)
    ext = np.maximum(ul - 1.0, 0.0)
    center_y = c[1] + t_top + ext * W * 0.30
    th = 0.00100 + 0.00060 * (ul + 1) / 2.05
    th *= np.clip((1.05 - ul) / 0.12, 0, 1) ** 0.6
    th *= np.clip((ul + 1.0) / 0.15, 0.30, 1)
    lx = c[0] + sx * W * ul
    inner = center_y - 0.00035
    outer = center_y + th
    pts = np.concatenate([np.stack([lx, inner], 1), np.stack([lx, outer], 1)])
    n = len(ul)
    f = []
    for i in range(n - 1):
        f.append([i, i + 1, n + i + 1])
        f.append([i, n + i + 1, n + i])
    out['lash'] = (pts, np.array(f))
    out['crease'] = _strip(c[0] + sx * W * np.linspace(-0.55, 0.92, 30), *_crease(e, c))
    ub = np.linspace(-0.35, 0.96, 30)
    _, b_c = eye_curves(e, ub)
    yb = c[1] + b_c
    thb = 0.00040 * np.clip((ub + 0.35) / 0.35, 0, 1) ** 0.8 * np.clip((0.96 - ub) / 0.12, 0, 1) ** 0.6 + 0.00004
    out['lowerlid'] = _strip(c[0] + sx * W * ub, yb - thb, yb + 0.00010)
    return out


def _crease(e, c):
    uc = np.linspace(-0.55, 0.92, 30)
    t_c, _ = eye_curves(e, uc)
    gap = 0.0029 + 0.0007 * (uc + 0.55) / 1.47
    cy = c[1] + t_c + gap
    th = 0.00048 * np.clip((uc + 0.55) / 0.25, 0, 1) ** 0.7 * np.clip((0.92 - uc) / 0.30, 0, 1) ** 0.7 + 0.00005
    th = th * max(e['open'], 0.0) ** 0.5 + 0.00002
    return cy - th * 0.5, cy + th * 0.5


def _strip(xs, lo, hi):
    n = len(xs)
    pts = np.concatenate([np.stack([xs, lo], 1), np.stack([xs, hi], 1)])
    f = []
    for i in range(n - 1):
        f.append([i, i + 1, n + i + 1])
        f.append([i, n + i + 1, n + i])
    return pts, np.array(f)


def brow_geometry(b, side):
    u = np.linspace(0, 1, 26)
    bi = np.array([side * (BROW_IN[0] - b['shift_in']), BROW_IN[1] + b['dy'] + b['raise_in']])
    bo = np.array([side * BROW_OUT[0], BROW_OUT[1] + b['dy'] + b['raise_out']])
    cx = bi[0] + (bo[0] - bi[0]) * u
    cy = bi[1] + (bo[1] - bi[1]) * u + b['arch'] * np.sin(np.pi * np.clip(u, 0, 1) ** 1.4) ** 0.8
    th = b['t_in'] + (b['t_out'] - b['t_in']) * u
    th = th * np.clip(u / 0.06, 0.70, 1) ** 0.5 * np.clip((1 - u) / 0.18, 0.0, 1) ** 0.5
    th = np.maximum(th, 0.0003)
    dx = np.gradient(cx)
    dy = np.gradient(cy)
    nl = np.sqrt(dx * dx + dy * dy)
    nx, ny = -dy / nl, dx / nl
    ny_sign = np.sign(ny)
    nx, ny = nx * ny_sign, ny * ny_sign
    a = np.stack([cx - nx * th * 0.5, cy - ny * th * 0.5], 1)
    c = np.stack([cx + nx * th * 0.5, cy + ny * th * 0.5], 1)
    n = len(u)
    f = []
    for i in range(n - 1):
        f.append([i, i + 1, n + i + 1])
        f.append([i, n + i + 1, n + i])
    return np.concatenate([a, c]), np.array(f)


U_M = np.sign(np.linspace(-1, 1, 33)) * np.abs(np.linspace(-1, 1, 33)) ** 0.85


def mouth_curves(m, u):
    k = np.clip(1 - u * u, 0, 1)
    base = MOUTH_C[1] + m['dy'] + m['c'] * u * u
    up = base + m['top'] * k ** m['pa']
    lo = base - m['bot'] * k ** m['pb']
    return up, lo


def mouth_geometry(m):
    out = {}
    u = U_M
    up, lo = mouth_curves(m, u)
    hw = m['hw']
    X = MOUTH_C[0] + hw * u
    nv = 7
    v = np.linspace(0, 1, nv)
    Y = (lo[:, None] + v[None, :] * (up - lo)[:, None]).reshape(-1)
    out['mouth'] = (np.stack([np.repeat(X, nv), Y], 1), grid_faces(len(u), nv))

    def clampm(pts, allow_below=False):
        uu = np.clip((pts[:, 0] - MOUTH_C[0]) / hw, -0.98, 0.98)
        a, b = mouth_curves(m, uu)
        yy = np.clip(pts[:, 1], b, a) if not allow_below else np.minimum(pts[:, 1], a)
        return np.stack([MOUTH_C[0] + hw * uu, yy], 1)

    w = np.linspace(0, 1, 4)
    ty = (up[:, None] - w[None, :] * m['teeth_up']).reshape(-1)
    tpts = np.stack([np.repeat(X, 4), ty], 1)
    ly = (lo[:, None] + w[None, :] * m['teeth_lo']).reshape(-1)
    lpts = np.stack([np.repeat(X, 4), ly], 1)
    tp = np.concatenate([clampm(tpts), clampm(lpts)])
    tf = np.concatenate([grid_faces(len(u), 4), grid_faces(len(u), 4) + len(tpts)])
    out['teeth'] = (tp, tf)
    ang = np.linspace(0, 2 * np.pi, 32, endpoint=False)
    rr = np.linspace(0, 1, 4)
    tc = np.array([MOUTH_C[0], lo[len(u) // 2] + 0.0028 - m['tongue_out'] * 0.0062])
    rx = hw * 0.62 * (1 - 0.35 * m['tongue_out'])
    ry = 0.0042 + 0.0022 * m['tongue_out']
    tpts = np.stack([tc[0] + rr[:, None] * rx * np.cos(ang)[None], tc[1] + rr[:, None] * ry * np.sin(ang)[None]], -1).reshape(-1, 2)
    if m['tongue_out'] > 0:
        tpts2 = clampm(tpts, allow_below=True)
    else:
        tpts2 = clampm(tpts)
    if m['tongue'] <= 0 and m['tongue_out'] <= 0:
        tpts2 = np.repeat(np.array([[MOUTH_C[0], lo[len(u) // 2]]]), len(tpts), 0)
    out['tongue'] = (tpts2, disk_faces(4, 32))
    t = m['line'] * (0.70 + 0.30 * np.sqrt(np.clip(1 - u * u, 0, 1)))
    ul = np.stack([X, up], 1)
    uo = np.stack([X, up + t], 1)
    ll = np.stack([X, lo - t], 1)
    li = np.stack([X, lo], 1)
    n = len(u)
    pts = np.concatenate([ul, uo, li, ll])
    f = []
    for i in range(n - 1):
        f.append([i, i + 1, n + i + 1])
        f.append([i, n + i + 1, n + i])
        a = 2 * n + i
        f.append([a + n, a + n + 1, a + 1])
        f.append([a + n, a + 1, a])
    out['lipline'] = (pts, np.array(f))
    ul2 = np.linspace(-0.78, 0.78, 25)
    upl, lol = mouth_curves(m, ul2)
    k = np.clip(1 - (ul2 / 0.78) ** 2, 0, 1)
    xl = MOUTH_C[0] + hw * ul2
    top_l = lol - m['line'] * 0.9
    bot_l = top_l - m['lip'] * k ** 0.8
    pts = np.concatenate([np.stack([xl, bot_l], 1), np.stack([xl, top_l], 1)])
    n = len(ul2)
    f = []
    for i in range(n - 1):
        f.append([i, i + 1, n + i + 1])
        f.append([i, n + i + 1, n + i])
    out['lowerlip'] = (pts, np.array(f))
    return out


def nose_geometry():
    u = np.linspace(-1.0, 1.0, 21)
    hw = 0.0068
    cx = hw * u
    cy = 1.3674 - 0.0012 * (1 - u * u) + 0.0010 * u ** 4
    th = 0.00125 * np.clip(1 - u * u, 0, 1) ** 0.45 + 0.00012
    pts = np.concatenate([np.stack([cx, cy - th * 0.5], 1), np.stack([cx, cy + th * 0.5], 1)])
    n = len(u)
    f = []
    for i in range(n - 1):
        f.append([i, i + 1, n + i + 1])
        f.append([i, n + i + 1, n + i])
    return pts, np.array(f)


def state(name):
    eL = copy.deepcopy(EYE_NEUTRAL)
    eR = copy.deepcopy(EYE_NEUTRAL)
    bL = copy.deepcopy(BROW_NEUTRAL)
    bR = copy.deepcopy(BROW_NEUTRAL)
    m = copy.deepcopy(MOUTH_NEUTRAL)
    skin = {}

    def eyes(**kw):
        for e in (eL, eR):
            e.update(kw)

    def brows(**kw):
        for b in (bL, bR):
            b.update(kw)

    if name == 'blink':
        eyes(open=0.0)
    elif name == 'blinkLeft':
        eL.update(open=0.0)
    elif name == 'blinkRight':
        eR.update(open=0.0)
    elif name == 'happy':
        eyes(open=0.0, arc=0.0054, y_in=-0.0006, y_out=-0.0006)
        brows(dy=0.0030, arch=0.0040)
        m.update(hw=0.0188, c=0.0046, top=0.0010, pa=1.8, bot=0.0098, pb=0.62, teeth_up=0.0024, tongue=1.0)
        skin.update(smile=1.0, jaw=0.35)
    elif name == 'angry':
        eyes(drop_in=0.0040, raise_b=0.0016, open=0.95)
        brows(raise_in=-0.0050, shift_in=0.0042, raise_out=0.0014, arch=0.0010)
        m.update(hw=0.0128, c=-0.0030, bot=0.0016, pb=1.0)
    elif name == 'sad':
        eyes(drop_out=0.0032, open=0.92)
        brows(raise_in=0.0058, raise_out=-0.0022, arch=0.0016)
        m.update(hw=0.0126, c=-0.0040)
    elif name == 'relaxed':
        eyes(open=0.58, arc=-0.0010)
        brows(dy=0.0010)
        m.update(hw=0.0166, c=0.0044)
        skin.update(smile=0.6)
    elif name == 'surprised':
        eyes(ht=0.0148, hb=0.0116)
        brows(dy=0.0078, arch=0.0046)
        m.update(hw=0.0086, c=0.0, top=0.0058, bot=0.0106, pa=0.5, pb=0.5, tongue=1.0, teeth_up=0.0012)
        skin.update(jaw=0.75)
    elif name == 'aa':
        m.update(hw=0.0150, c=0.0008, top=0.0040, bot=0.0118, pa=0.9, pb=0.7, teeth_up=0.0024, tongue=1.0)
        skin.update(jaw=1.0)
    elif name == 'ih':
        m.update(hw=0.0182, c=0.0024, top=0.0022, bot=0.0046, pa=1.2, pb=1.0, teeth_up=0.0022, teeth_lo=0.0016)
        skin.update(jaw=0.2, smile=0.3)
    elif name == 'ou':
        m.update(hw=0.0068, c=0.0, top=0.0034, bot=0.0050, pa=0.5, pb=0.5, tongue=1.0)
        skin.update(pucker=1.0, jaw=0.25)
    elif name == 'ee':
        m.update(hw=0.0172, c=0.0016, top=0.0030, bot=0.0068, pa=1.1, pb=0.9, teeth_up=0.0024, tongue=1.0)
        skin.update(jaw=0.45)
    elif name == 'oh':
        m.update(hw=0.0104, c=0.0, top=0.0052, bot=0.0090, pa=0.5, pb=0.5, tongue=1.0, teeth_up=0.0010)
        skin.update(pucker=0.45, jaw=0.65)
    elif name == 'lookLeft':
        eyes(gaze=(0.0078, 0.0))
    elif name == 'lookRight':
        eyes(gaze=(-0.0078, 0.0))
    elif name == 'lookUp':
        eyes(gaze=(0.0, 0.0048), top_add=0.0011)
    elif name == 'lookDown':
        eyes(gaze=(0.0, -0.0052), top_add=-0.0034)
    elif name == 'alisNaik':
        brows(dy=0.0066, arch=0.0044)
        eyes(top_add=0.0012)
    elif name == 'alisKerut':
        brows(raise_in=-0.0056, shift_in=0.0048, raise_out=0.0002, arch=0.0008, t_in=0.0068)
        eyes(drop_in=0.0020)
    elif name == 'alisSedih':
        brows(raise_in=0.0060, raise_out=-0.0020, arch=0.0016)
    elif name == 'mataSipit':
        eyes(open=0.50, raise_b=0.0028, arc=-0.0008)
    elif name == 'mataLebar':
        eyes(ht=0.0146, hb=0.0114)
    elif name == 'pipiGembung':
        m.update(hw=0.0104, c=0.0)
        skin.update(puff=1.0)
    elif name == 'bibirRapat':
        m.update(hw=0.0128, c=-0.0004, line=0.00115, lip=0.0)
    elif name == 'bibirMaju':
        m.update(hw=0.0064, c=0.0, top=0.0012, bot=0.0016, pa=0.5, pb=0.5)
        skin.update(pucker=1.0)
    elif name == 'meringis':
        m.update(hw=0.0192, c=-0.0012, top=0.0026, bot=0.0036, pa=1.6, pb=1.6, teeth_up=0.0026, teeth_lo=0.0036)
        brows(raise_in=-0.0024, shift_in=0.0022)
        eyes(open=0.80, raise_b=0.0016)
    elif name == 'senyum':
        m.update(hw=0.0168, c=0.0050)
        skin.update(smile=0.6)
    elif name == 'lidahKeluar':
        m.update(hw=0.0112, c=0.0, top=0.0020, bot=0.0040, pa=0.6, pb=0.6, tongue_out=1.0)
        skin.update(jaw=0.25)
    elif name != 'neutral':
        raise ValueError(name)
    return eL, eR, bL, bR, m, skin


PRESETS = ['happy', 'angry', 'sad', 'relaxed', 'surprised', 'aa', 'ih', 'ou', 'ee', 'oh', 'blink', 'blinkLeft',
           'blinkRight', 'lookUp', 'lookDown', 'lookLeft', 'lookRight']
CUSTOM = ['alisNaik', 'alisKerut', 'alisSedih', 'mataSipit', 'mataLebar', 'pipiGembung', 'bibirRapat', 'bibirMaju',
          'meringis', 'senyum', 'lidahKeluar']
EXPRESSIONS = PRESETS + CUSTOM


def decal_layout(name):
    eL, eR, bL, bR, m, skin = state(name)
    parts = {}

    def add(mat, pts, f):
        if mat in parts:
            P0, F0 = parts[mat]
            parts[mat] = (np.concatenate([P0, pts]), np.concatenate([F0, f + len(P0)]))
        else:
            parts[mat] = (pts, f)

    for e, side in ((eL, 1.0), (eR, -1.0)):
        for mat, (pts, f) in eye_geometry(e, side).items():
            add(mat, pts, f)
    for b, side in ((bL, 1.0), (bR, -1.0)):
        pts, f = brow_geometry(b, side)
        add('brow', pts, f)
    for mat, (pts, f) in mouth_geometry(m).items():
        add(mat, pts, f)
    pts, f = nose_geometry()
    add('nose', pts, f)
    return parts, skin


def build_face(head_V):
    names = ['neutral'] + EXPRESSIONS
    layouts = {n: decal_layout(n) for n in names}
    base_parts, _ = layouts['neutral']
    result = {}
    for mat, (pts, f) in base_parts.items():
        p3, nrm = project(pts)
        pos = p3 + nrm * LAYER[mat]
        best = np.zeros(len(f))
        for n in names:
            q = layouts[n][0][mat][0]
            a = (q[f[:, 1], 0] - q[f[:, 0], 0]) * (q[f[:, 2], 1] - q[f[:, 0], 1]) - (q[f[:, 2], 0] - q[f[:, 0], 0]) * (q[f[:, 1], 1] - q[f[:, 0], 1])
            best = np.where(np.abs(a) > np.abs(best), a, best)
        flip = best < 0
        f = f.copy()
        f[flip] = f[flip][:, [0, 2, 1]]
        morphs = {}
        for n in EXPRESSIONS:
            parts_n, skin_w = layouts[n]
            pts_n = parts_n[mat][0]
            q3, qn = project(pts_n)
            qpos = q3 + qn * LAYER[mat]
            if skin_w:
                qpos = qpos + skin_field(q3, skin_w)
            delta = qpos - pos
            if np.abs(delta).max() > 1e-7:
                morphs[n] = delta
        result[mat] = dict(V=pos, N=nrm, F=f, morphs=morphs)
    skin_morphs = {}
    for n in EXPRESSIONS:
        _, skin_w = layouts[n]
        if skin_w:
            dd = skin_field(head_V, skin_w)
            if np.abs(dd).max() > 1e-7:
                skin_morphs[n] = dd
    return result, skin_morphs
