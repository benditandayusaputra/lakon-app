from vrm_export import mtoon_material

PALETTE = {
    'skin': ('#dfa47c', '#b9765a', '#7a432e'),
    'nail': ('#efc2ac', '#d49b86', '#9c5f4a'),
    'hair': ('#35251d', '#1a110d', '#0a0605'),
    'hair_hi': ('#5f4a40', '#4d3c34', None),
    'shirt': ('#203a5c', '#132439', '#0b1626'),
    'trim': ('#6fa8dc', '#4a7fb0', '#1e3a58'),
    'pants': ('#3a404b', '#252a33', '#161a20'),
    'shoe': ('#ece7de', '#c7bfb3', '#6c655c'),
    'sole': ('#b8afa3', '#958c80', '#5c554d'),
    'sclera': ('#fbfaf6', '#e9e4dc', None),
    'iris': ('#4e2e1f', '#38200f', None),
    'iris_ring': ('#24140c', '#1a0e08', None),
    'pupil': ('#140c09', '#0d0806', None),
    'highlight': ('#ffffff', '#ffffff', None),
    'lash': ('#1f140f', '#140c09', None),
    'brow': ('#241812', '#170f0b', None),
    'crease': ('#a4644b', '#8e543d', None),
    'lowerlid': ('#a96a51', '#935a43', None),
    'mouth': ('#6d2a2e', '#5a2125', None),
    'teeth': ('#f8f4ee', '#e3ddd4', None),
    'tongue': ('#d26b6c', '#b85758', None),
    'lipline': ('#7f4436', '#6a372b', None),
    'lowerlip': ('#c88870', '#b07560', None),
    'nose': ('#b4704f', '#9a5b3f', None),
}

OUTLINE_WIDTH = {
    'skin': 0.0011,
    'nail': 0.0,
    'hair': 0.0013,
    'shirt': 0.0014,
    'trim': 0.0012,
    'pants': 0.0014,
    'shoe': 0.0012,
    'sole': 0.0012,
}

RIM = {
    'skin': ('#3a2014', 3.5, 0.0),
    'hair': ('#4a5a70', 3.0, 0.0),
    'shirt': ('#2a4466', 3.0, 0.0),
    'pants': ('#2a2f38', 3.0, 0.0),
}


def materials():
    mats = []
    for name, (base, shade, outline) in PALETTE.items():
        width = OUTLINE_WIDTH.get(name, 0.0)
        rim = RIM.get(name)
        decal = name not in OUTLINE_WIDTH
        mats.append(mtoon_material(
            name, base, shade,
            outline=outline, outline_width=width,
            toony=0.92 if not decal else 0.6,
            shift=-0.12 if not decal else -0.6,
            rim=rim[0] if rim else None,
            rim_power=rim[1] if rim else 4.0,
            rim_lift=rim[2] if rim else 0.0,
            emissive='#ffffff' if name == 'highlight' else None,
            gi=0.9,
        ))
    return mats
