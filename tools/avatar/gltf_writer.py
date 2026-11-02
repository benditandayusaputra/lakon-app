import json
import struct
import numpy as np

FLOAT = 5126
USHORT = 5123
UINT = 5125
UBYTE = 5121
ARRAY_BUFFER = 34962
ELEMENT_ARRAY_BUFFER = 34963


def srgb_to_linear(c):
    c = np.asarray(c, dtype=np.float64)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def hex_lin(h):
    h = h.lstrip('#')
    rgb = np.array([int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4)])
    return [float(x) for x in srgb_to_linear(rgb)]


class GLB:
    def __init__(self):
        self.j = {
            'asset': {'version': '2.0', 'generator': 'lakon-avatar-generator'},
            'scene': 0,
            'scenes': [{'nodes': []}],
            'nodes': [],
            'meshes': [],
            'materials': [],
            'skins': [],
            'accessors': [],
            'bufferViews': [],
            'buffers': [{'byteLength': 0}],
        }
        self.bin = bytearray()

    def _view(self, data, target=None):
        while len(self.bin) % 4:
            self.bin.append(0)
        off = len(self.bin)
        self.bin.extend(data)
        view = {'buffer': 0, 'byteOffset': off, 'byteLength': len(data)}
        if target:
            view['target'] = target
        self.j['bufferViews'].append(view)
        return len(self.j['bufferViews']) - 1

    def accessor(self, arr, ctype, atype, target=None, minmax=False, normalized=False):
        arr = np.ascontiguousarray(arr)
        dt = {FLOAT: np.float32, USHORT: np.uint16, UINT: np.uint32, UBYTE: np.uint8}[ctype]
        arr = arr.astype(dt)
        view = self._view(arr.tobytes(), target)
        count = arr.shape[0]
        acc = {'bufferView': view, 'componentType': ctype, 'count': int(count), 'type': atype}
        if normalized:
            acc['normalized'] = True
        if minmax:
            a2 = arr.reshape(count, -1)
            acc['min'] = [float(x) for x in a2.min(0)]
            acc['max'] = [float(x) for x in a2.max(0)]
        self.j['accessors'].append(acc)
        return len(self.j['accessors']) - 1

    def sparse_vec3(self, deltas, eps=1e-7):
        deltas = np.asarray(deltas, dtype=np.float32)
        n = deltas.shape[0]
        idx = np.nonzero(np.abs(deltas).max(1) > eps)[0]
        acc = {'componentType': FLOAT, 'count': int(n), 'type': 'VEC3'}
        if len(idx) == 0:
            idx = np.array([0])
        vals = deltas[idx]
        ictype = USHORT if n < 65536 else UINT
        iview = self._view(idx.astype(np.uint16 if ictype == USHORT else np.uint32).tobytes())
        vview = self._view(np.ascontiguousarray(vals).tobytes())
        acc['sparse'] = {'count': int(len(idx)), 'indices': {'bufferView': iview, 'componentType': ictype}, 'values': {'bufferView': vview}}
        full = np.zeros((n, 3), dtype=np.float32)
        full[idx] = vals
        acc['min'] = [float(x) for x in full.min(0)]
        acc['max'] = [float(x) for x in full.max(0)]
        self.j['accessors'].append(acc)
        return len(self.j['accessors']) - 1

    def add_material(self, mat):
        self.j['materials'].append(mat)
        return len(self.j['materials']) - 1

    def add_node(self, node, root=False):
        self.j['nodes'].append(node)
        i = len(self.j['nodes']) - 1
        if root:
            self.j['scenes'][0]['nodes'].append(i)
        return i

    def add_image_png(self, data, name):
        view = self._view(data)
        self.j.setdefault('images', []).append({'name': name, 'mimeType': 'image/png', 'bufferView': view})
        self.j.setdefault('samplers', [{'magFilter': 9729, 'minFilter': 9987, 'wrapS': 33071, 'wrapT': 33071}])
        self.j.setdefault('textures', []).append({'sampler': 0, 'source': len(self.j['images']) - 1})
        return len(self.j['textures']) - 1, len(self.j['images']) - 1

    def save(self, path):
        while len(self.bin) % 4:
            self.bin.append(0)
        self.j['buffers'][0]['byteLength'] = len(self.bin)
        for key in ['skins', 'materials', 'meshes']:
            if not self.j[key]:
                del self.j[key]
        js = json.dumps(self.j, separators=(',', ':')).encode('utf-8')
        while len(js) % 4:
            js += b' '
        total = 12 + 8 + len(js) + 8 + len(self.bin)
        with open(path, 'wb') as fh:
            fh.write(struct.pack('<III', 0x46546C67, 2, total))
            fh.write(struct.pack('<II', len(js), 0x4E4F534A))
            fh.write(js)
            fh.write(struct.pack('<II', len(self.bin), 0x004E4942))
            fh.write(self.bin)
        return total
