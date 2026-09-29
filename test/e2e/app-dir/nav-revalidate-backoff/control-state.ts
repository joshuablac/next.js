import fs from 'node:fs'
import path from 'node:path'

// Shared state for this fixture, backed by files rather than a plain
// module-level object: the page's cached data function and the /control
// route it's read/written through may end up in separate bundles, and a
// file on disk is unambiguously shared across that boundary within the one
// `next start` process the test drives. Not meant to work across multiple
// instances/deployments. Renders and onRequestError calls are append-only
// logs (one line per event) so concurrent writers can't clobber each
// other's updates; only the fail flag is a plain overwrite, and only the
// test ever writes it.
const dir = process.cwd()
const FAIL_FILE = path.join(dir, 'nav-revalidate-backoff-fail.txt')
const RENDERS_FILE = path.join(dir, 'nav-revalidate-backoff-renders.log')
const ERRORS_FILE = path.join(dir, 'nav-revalidate-backoff-errors.log')

function readLines(file: string): string[] {
  try {
    return fs
      .readFileSync(file, 'utf8')
      .split('\n')
      .filter((line) => line.length > 0)
  } catch {
    return []
  }
}

export function isFailing(): boolean {
  try {
    return fs.readFileSync(FAIL_FILE, 'utf8') === '1'
  } catch {
    return false
  }
}

export function setFailing(fail: boolean): void {
  fs.writeFileSync(FAIL_FILE, fail ? '1' : '0')
}

export function recordRender(): void {
  fs.appendFileSync(RENDERS_FILE, `${Date.now()}\n`)
}

export function getRenderCount(): number {
  return readLines(RENDERS_FILE).length
}

export function recordRequestError(entry: {
  path: string
  revalidateReason: unknown
}): void {
  fs.appendFileSync(ERRORS_FILE, `${JSON.stringify(entry)}\n`)
}

export function getRequestErrors(): Array<{
  path: string
  revalidateReason: unknown
}> {
  return readLines(ERRORS_FILE).map((line) => JSON.parse(line))
}

export function reset(): void {
  for (const file of [FAIL_FILE, RENDERS_FILE, ERRORS_FILE]) {
    try {
      fs.rmSync(file)
    } catch {
      // Already gone.
    }
  }
}
