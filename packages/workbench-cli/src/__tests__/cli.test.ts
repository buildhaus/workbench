import { describe, expect, test } from "bun:test"
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const INDEX_TS = join(import.meta.dir, "..", "index.ts")
const SPAWN_TIMEOUT_MS = 20_000

interface CliRun {
  stdout: string
  stderr: string
  exitCode: number
}

async function runCli(cwd: string, args: string[]): Promise<CliRun> {
  const proc = Bun.spawn([process.execPath, INDEX_TS, ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  })
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])
  return { stdout, stderr, exitCode }
}

async function inTempDir(run: (cwd: string) => Promise<void>): Promise<void> {
  const cwd = mkdtempSync(join(tmpdir(), "workbench-cli-"))
  try {
    await run(cwd)
  } finally {
    rmSync(cwd, { recursive: true, force: true })
  }
}

describe("invalid --pm value", () => {
  test(
    "exits non-zero, lists allowed values and writes nothing",
    async () => {
      await inTempDir(async (cwd) => {
        const result = await runCli(cwd, [
          "--init",
          "--no-tui",
          "--name",
          "probe",
          "--pm",
          "jira",
        ])

        expect(result.exitCode).toBe(1)
        expect(result.stderr).toContain("github-issues")
        expect(result.stderr).toContain("linear")
        expect(readdirSync(cwd)).toEqual([])
      })
    },
    SPAWN_TIMEOUT_MS
  )
})

describe("standalone setup guard", () => {
  test(
    "refuses to run when .workbench/config.yaml already exists",
    async () => {
      await inTempDir(async (cwd) => {
        mkdirSync(join(cwd, ".workbench"))
        writeFileSync(join(cwd, ".workbench/config.yaml"), "source:\n  repository: x\n  branch: main\n")

        const result = await runCli(cwd, [
          "--org",
          "probe",
          "--code-repository",
          "https://example.invalid/x",
        ])

        expect(result.exitCode).toBe(1)
        expect(result.stderr).toContain(".workbench/ already exists")
        expect(readdirSync(cwd)).toEqual([".workbench"])
      })
    },
    SPAWN_TIMEOUT_MS
  )
})
