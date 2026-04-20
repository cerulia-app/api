import { spawn } from 'node:child_process'

const mode = process.argv.includes('--remote') ? '--remote' : '--local'
const databaseName = process.env.CERULIA_D1_DATABASE ?? 'cerulia-api'

const child = spawn(
  process.execPath,
  ['x', 'wrangler', 'd1', 'migrations', 'apply', databaseName, mode],
  {
    stdio: 'inherit',
    env: process.env,
  },
)

child.on('exit', (code) => {
  process.exit(code ?? 1)
})