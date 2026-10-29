import { dump, load } from "js-yaml"
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs"
import type { Repo } from "../screens/repoSelect.ts"

export interface WorkbenchConfig {
  source: {
    repository: string   // e.g., "buildhaus/workbench"
    branch: string       // e.g., "main"
  }
  github: { org: string }
  codes: Array<Record<string, { url: string; branch: string }>>
  resources: Array<Record<string, { url: string; branch: string }>>
}

export function readConfig(): WorkbenchConfig {
  const raw = readFileSync(".workbench/config.yaml", "utf-8")
  return load(raw) as WorkbenchConfig
}

export function writeSourceConfig(repository: string, branch: string): void {
  mkdirSync(".workbench", { recursive: true })
  let existing: Partial<WorkbenchConfig> = {}
  if (existsSync(".workbench/config.yaml")) {
    existing = load(readFileSync(".workbench/config.yaml", "utf-8")) as Partial<WorkbenchConfig>
  }
  const config = { ...existing, source: { repository, branch } }
  writeFileSync(".workbench/config.yaml", dump(config))
}

export function writeConfig(
  org: string,
  codeRepos: Repo[],
  resourceRepos: Repo[],
  branches: Map<string, string>
): void {
  // Preserve source info if config already exists
  let existingSource: WorkbenchConfig["source"] | undefined
  if (existsSync(".workbench/config.yaml")) {
    const existing = load(readFileSync(".workbench/config.yaml", "utf-8")) as Partial<WorkbenchConfig>
    existingSource = existing.source
  }

  const config: WorkbenchConfig = {
    source: existingSource ?? { repository: "", branch: "" },
    github: { org },
    codes: codeRepos.map((r) => ({
      [r.name]: { url: r.url, branch: branches.get(r.name) ?? r.defaultBranch },
    })),
    resources: resourceRepos.map((r) => ({
      [r.name]: { url: r.url, branch: branches.get(r.name) ?? r.defaultBranch },
    })),
  }

  mkdirSync(".workbench", { recursive: true })
  writeFileSync(".workbench/config.yaml", dump(config))
}

export const PM_BACKENDS = ["github-issues", "linear"] as const

export type ProjectManagement = (typeof PM_BACKENDS)[number]

export const DEFAULT_PM: ProjectManagement = "github-issues"

export function isProjectManagement(value: string): value is ProjectManagement {
  return (PM_BACKENDS as readonly string[]).includes(value)
}

/** Merge a backend selection into an existing settings document, preserving every other key and its order. */
export function serializeSettings(existingYaml: string | null, pm: ProjectManagement): string {
  return dump({ ...parseSettings(existingYaml), project_management: pm })
}

export function writeSettings(pm: ProjectManagement): void {
  const path = ".workbench/settings.yml"
  const existing = existsSync(path) ? readFileSync(path, "utf-8") : null
  writeFileSync(path, serializeSettings(existing, pm))
}

function parseSettings(existingYaml: string | null): Record<string, unknown> {
  if (!existingYaml || existingYaml.trim() === "") {
    return {}
  }
  const parsed = load(existingYaml)
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Invalid .workbench/settings.yml: expected a YAML mapping")
  }
  return parsed as Record<string, unknown>
}
