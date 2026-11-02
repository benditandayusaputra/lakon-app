import time
import numpy as np
from skimage.measure import marching_cubes
import pymeshlab

from sdf import gradient, project_to_surface, length


def eval_grid(fn, lo, hi, h, max_points=2_500_000):
    lo = np.asarray(lo, dtype=np.float64)
    hi = np.asarray(hi, dtype=np.float64)
    n = np.ceil((hi - lo) / h).astype(int) + 1
    xs = lo[0] + np.arange(n[0]) * h
    ys = lo[1] + np.arange(n[1]) * h
    zs = lo[2] + np.arange(n[2]) * h
    vol = np.empty((n[0], n[1], n[2]), dtype=np.float32)
    slab = max(1, max_points // (n[1] * n[2]))
    Y, Z = np.meshgrid(ys, zs, indexing='ij')
    for i0 in range(0, n[0], slab):
        xi = xs[i0:i0 + slab]
        P = np.empty((len(xi), n[1], n[2], 3))
        P[..., 0] = xi[:, None, None]
        P[..., 1] = Y[None]
        P[..., 2] = Z[None]
        vol[i0:i0 + slab] = fn(P.reshape(-1, 3)).reshape(len(xi), n[1], n[2])
    return vol, lo


def eval_grid_band(fn, lo, hi, h, ratio=4, band=2.5):
    from scipy.ndimage import zoom
    lo = np.asarray(lo, dtype=np.float64)
    hi = np.asarray(hi, dtype=np.float64)
    hc = h * ratio
    nc = np.ceil((hi - lo) / hc).astype(int) + 1
    volc, _ = eval_grid(fn, lo, lo + (nc - 1) * hc + 1e-9, hc)
    volc = volc[:nc[0], :nc[1], :nc[2]]
    nf = (nc - 1) * ratio + 1
    vol = zoom(volc, [(nf[i] - 1) / (nc[i] - 1) for i in range(3)], order=1, grid_mode=False)
    vol = vol[:nf[0], :nf[1], :nf[2]].astype(np.float32)
    idx = np.nonzero(np.abs(vol) < band * hc)
    P = np.stack([lo[0] + idx[0] * h, lo[1] + idx[1] * h, lo[2] + idx[2] * h], -1)
    out = np.empty(len(P), dtype=np.float32)
    step = 2_000_000
    for i in range(0, len(P), step):
        out[i:i + step] = fn(P[i:i + step])
    vol[idx] = out
    return vol, lo


def coarse_bbox(fn, lo, hi, h, pad):
    vol, lo = eval_grid(fn, lo, hi, h)
    inside = np.argwhere(vol < h)
    if len(inside) == 0:
        raise ValueError('empty shape')
    a = lo + inside.min(0) * h - pad
    b = lo + inside.max(0) * h + pad
    return a, b


def mesh_from_sdf(fn, lo, hi, h, edge, coarse=None, smooth_iters=0, label=''):
    t0 = time.time()
    if coarse:
        lo, hi = coarse_bbox(fn, lo, hi, coarse, pad=coarse * 2 + h * 2)
    vol, lo = eval_grid_band(fn, lo, hi, h)
    if not (vol[0].min() > 0 and vol[-1].min() > 0 and vol[:, 0].min() > 0 and vol[:, -1].min() > 0 and vol[:, :, 0].min() > 0 and vol[:, :, -1].min() > 0):
        raise ValueError(f'{label}: shape touches the grid boundary')
    verts, faces, _, _ = marching_cubes(vol, level=0.0, spacing=(h, h, h))
    verts = verts + lo
    t1 = time.time()
    ms = pymeshlab.MeshSet()
    ms.add_mesh(pymeshlab.Mesh(verts.astype(np.float64), faces.astype(np.int32)))
    ms.meshing_remove_duplicate_vertices()
    ms.meshing_remove_unreferenced_vertices()
    ms.meshing_isotropic_explicit_remeshing(iterations=6, targetlen=pymeshlab.PureValue(edge), featuredeg=60)
    if smooth_iters:
        ms.apply_coord_taubin_smoothing(stepsmoothnum=smooth_iters)
    m = ms.current_mesh()
    v = m.vertex_matrix().copy()
    f = m.face_matrix().copy()
    v = project_to_surface(fn, v, iters=4)
    g = gradient(fn, v)
    nrm = g / np.maximum(length(g), 1e-12)[:, None]
    fn_ = np.cross(v[f[:, 1]] - v[f[:, 0]], v[f[:, 2]] - v[f[:, 0]])
    cen_n = nrm[f].mean(1)
    flip = (fn_ * cen_n).sum(1) < 0
    if flip.mean() > 0.5:
        f = f[:, [0, 2, 1]]
    print(f'  [{label}] grid {vol.shape} mc {len(verts)}v -> {len(v)}v {len(f)}f  ({t1 - t0:.1f}s + {time.time() - t1:.1f}s)')
    return v, f, nrm
