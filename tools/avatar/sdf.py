import numpy as np


def length(v):
    return np.sqrt(np.einsum('...i,...i->...', v, v))


def normalize(v):
    v = np.asarray(v, dtype=np.float64)
    return v / np.linalg.norm(v)


def smin(a, b, k):
    if k <= 0:
        return np.minimum(a, b)
    h = np.maximum(k - np.abs(a - b), 0.0) / k
    return np.minimum(a, b) - h * h * k * 0.25


def smax(a, b, k):
    return -smin(-a, -b, k)


def rot_axis(axis, ang):
    axis = normalize(axis)
    x, y, z = axis
    c, s = np.cos(ang), np.sin(ang)
    C = 1 - c
    return np.array([
        [c + x * x * C, x * y * C - z * s, x * z * C + y * s],
        [y * x * C + z * s, c + y * y * C, y * z * C - x * s],
        [z * x * C - y * s, z * y * C + x * s, c + z * z * C],
    ])


def frame_from(axis, up):
    ax = normalize(axis)
    up = np.asarray(up, dtype=np.float64)
    u = up - ax * (up @ ax)
    if np.linalg.norm(u) < 1e-8:
        u = np.array([0.0, 1.0, 0.0]) - ax * ax[1]
    u = normalize(u)
    v = np.cross(ax, u)
    return np.stack([ax, u, v], 1)


class Prim:
    def __init__(self, fn, bone, blend=0.01, name=''):
        self.fn = fn
        self.bone = bone
        self.blend = blend
        self.name = name

    def d(self, p):
        return self.fn(p)


def sphere(c, r):
    c = np.asarray(c, dtype=np.float64)
    return lambda p: length(p - c) - r


def ellipsoid(c, r, R=None):
    c = np.asarray(c, dtype=np.float64)
    r = np.asarray(r, dtype=np.float64)

    def f(p):
        q = p - c
        if R is not None:
            q = q @ R
        k0 = length(q / r)
        k1 = length(q / (r * r))
        return k0 * (k0 - 1.0) / np.maximum(k1, 1e-12)

    return f


def superellipsoid(c, r, n, R=None):
    c = np.asarray(c, dtype=np.float64)
    r = np.asarray(r, dtype=np.float64)
    s = float(np.min(r))

    def f(p):
        q = p - c
        if R is not None:
            q = q @ R
        q = np.abs(q / r)
        F = np.power(np.power(q[..., 0], n) + np.power(q[..., 1], n) + np.power(q[..., 2], n), 1.0 / n)
        return (F - 1.0) * s

    return f


def round_cone(a, b, r1, r2):
    a = np.asarray(a, dtype=np.float64)
    b = np.asarray(b, dtype=np.float64)
    ba = b - a
    l2 = float(ba @ ba)
    rr = r1 - r2
    a2 = l2 - rr * rr
    il2 = 1.0 / l2

    def f(p):
        pa = p - a
        y = pa @ ba
        z = y - l2
        t = pa * l2 - y[..., None] * ba
        x2 = np.einsum('...i,...i->...', t, t)
        y2 = y * y * l2
        z2 = z * z * l2
        k = np.sign(rr) * rr * rr * x2
        d = (np.sqrt(np.maximum(x2 * a2 * il2, 0.0)) + y * rr) * il2 - r1
        c2 = np.sign(y) * a2 * y2 < k
        c1 = np.sign(z) * a2 * z2 > k
        d = np.where(c2, np.sqrt(np.maximum(x2 + y2, 0.0)) * il2 - r1, d)
        d = np.where(c1, np.sqrt(np.maximum(x2 + z2, 0.0)) * il2 - r2, d)
        return d

    return f


def oval_cone(a, b, r1, r2, up, squash):
    a = np.asarray(a, dtype=np.float64)
    b = np.asarray(b, dtype=np.float64)
    L = float(np.linalg.norm(b - a))
    F = frame_from(b - a, up)
    inner = round_cone(np.zeros(3), np.array([L, 0.0, 0.0]), r1, r2)
    sc = np.array([1.0, 1.0 / squash, 1.0])

    def f(p):
        q = (p - a) @ F
        return inner(q * sc) * min(1.0, squash)

    return f


def round_box(c, half, rad, R=None):
    c = np.asarray(c, dtype=np.float64)
    half = np.asarray(half, dtype=np.float64)

    def f(p):
        q = p - c
        if R is not None:
            q = q @ R
        q = np.abs(q) - (half - rad)
        return length(np.maximum(q, 0.0)) + np.minimum(q.max(-1), 0.0) - rad

    return f


def polygon2d(x, v):
    n = len(v)
    d = ((x - v[0]) ** 2).sum(-1)
    sgn = np.ones(len(x))
    for i in range(n):
        j = (i - 1) % n
        e = v[j] - v[i]
        w = x - v[i]
        t = np.clip((w @ e) / (e @ e), 0.0, 1.0)
        b = w - t[:, None] * e
        d = np.minimum(d, (b * b).sum(-1))
        c1 = x[:, 1] >= v[i][1]
        c2 = x[:, 1] < v[j][1]
        c3 = e[0] * w[:, 1] > e[1] * w[:, 0]
        flip = (c1 & c2 & c3) | (~c1 & ~c2 & ~c3)
        sgn = np.where(flip, -sgn, sgn)
    return sgn * np.sqrt(d)


def rounded_slab(origin, frame, outline, half_height, rad):
    origin = np.asarray(origin, dtype=np.float64)
    outline = np.asarray(outline, dtype=np.float64)

    def f(p):
        q = (p - origin) @ frame
        d2 = polygon2d(q[:, [0, 2]], outline)
        dy = np.abs(q[:, 1]) - (half_height - rad)
        return np.minimum(np.maximum(d2, dy), 0.0) + np.sqrt(np.maximum(d2, 0.0) ** 2 + np.maximum(dy, 0.0) ** 2) - rad

    return f


def torus(c, R_major, r_minor, R=None):
    c = np.asarray(c, dtype=np.float64)

    def f(p):
        q = p - c
        if R is not None:
            q = q @ R
        qx = np.sqrt(q[..., 0] ** 2 + q[..., 2] ** 2) - R_major
        return np.sqrt(qx * qx + q[..., 1] ** 2) - r_minor

    return f


def plane(n, d0):
    n = normalize(n)
    return lambda p: p @ n - d0


def transformed(fn, M, pivot):
    Minv = np.linalg.inv(M)
    pivot = np.asarray(pivot, dtype=np.float64)

    def f(p):
        return fn((p - pivot) @ Minv.T + pivot)

    return f


def gradient(fn, p, eps=2e-4):
    ex = np.array([eps, 0, 0])
    ey = np.array([0, eps, 0])
    ez = np.array([0, 0, eps])
    g = np.stack([
        fn(p + ex) - fn(p - ex),
        fn(p + ey) - fn(p - ey),
        fn(p + ez) - fn(p - ez),
    ], -1) / (2 * eps)
    return g


def project_to_surface(fn, p, iters=6):
    p = p.copy()
    for _ in range(iters):
        d = fn(p)
        g = gradient(fn, p)
        gl = np.maximum(length(g), 1e-9)
        p = p - (d / (gl * gl))[:, None] * g
    return p
