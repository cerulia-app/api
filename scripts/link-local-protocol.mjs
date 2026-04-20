import { mkdir, readFile, rm, symlink } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'

const repoRoot = resolve(import.meta.dir, '..')
const localProtocolRoot = resolve(repoRoot, '..', 'protocol')
const localProtocolPackageJson = join(localProtocolRoot, 'package.json')
const installedProtocolRoot = resolve(repoRoot, 'node_modules', '@cerulia', 'protocol')

if (process.env.CERULIA_SKIP_LOCAL_PROTOCOL_LINK === '1') {
  process.exit(0)
}

try {
  const packageJson = JSON.parse(
    await readFile(localProtocolPackageJson, 'utf8'),
  )

  if (packageJson.name !== '@cerulia/protocol') {
    process.exit(0)
  }

  await mkdir(dirname(installedProtocolRoot), { recursive: true })
  await rm(installedProtocolRoot, { recursive: true, force: true })
  await symlink(
    localProtocolRoot,
    installedProtocolRoot,
    process.platform === 'win32' ? 'junction' : 'dir',
  )

  console.log('linked local ../protocol into node_modules/@cerulia/protocol')
} catch {
  process.exit(0)
}