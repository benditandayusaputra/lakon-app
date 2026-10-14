import { readFile, writeFile } from 'node:fs/promises'
import { registerHooks } from 'node:module'
import { extname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { format, resolveConfig } from 'prettier'

const root = join(import.meta.dirname, '..')
const webDir = join(root, 'apps', 'web')
const vrmPath = join(webDir, 'public', 'models', 'seed-san.vrm')
const target = join(webDir, 'features', 'avatar', 'seed-san-rig.ts')

const webParent = pathToFileURL(join(webDir, 'extract-rig.js')).href
const fromWeb = (...segments) => pathToFileURL(join(webDir, ...segments)).href

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && extname(specifier) === '') {
      return nextResolve(`${specifier}.ts`, context)
    }
    if (context.parentURL === import.meta.url && !specifier.startsWith('node:')) {
      return nextResolve(specifier, { ...context, parentURL: webParent })
    }
    return nextResolve(specifier, context)
  },
})

const { Texture } = await import('three')
const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js')
const { VRMLoaderPlugin } = await import('@pixiv/three-vrm')
const { rigFromVrm } = await import(fromWeb('features', 'avatar', 'vrm.ts'))
const { extractCompilerRig } = await import(fromWeb('features', 'avatar', 'compiler-rig.ts'))

const file = await readFile(vrmPath).catch(() => null)
if (!file) {
  console.error(`${vrmPath} not found, run pnpm install first`)
  process.exit(1)
}

const loader = new GLTFLoader()
loader.register((parser) => new VRMLoaderPlugin(parser))
loader.register(() => ({
  name: 'headless-texture-stub',
  loadTexture: () => Promise.resolve(new Texture()),
}))

const buffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength)
const gltf = await new Promise((resolve, reject) => loader.parse(buffer, '', resolve, reject))
const vrm = gltf.userData.vrm
if (!vrm) {
  console.error('the file parsed but carries no VRM extension')
  process.exit(1)
}

const rig = extractCompilerRig(rigFromVrm(vrm))
const source = `import type { CompilerRig } from '@lakon/sign-compiler'

export const SEED_SAN_RIG: CompilerRig = ${JSON.stringify(rig)}
`

const options = await resolveConfig(target)
await writeFile(target, await format(source, { ...options, filepath: target }))

console.log(`Compiler rig written to ${target}`)
console.log('Rerun this script whenever seed-san.vrm is replaced')
