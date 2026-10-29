import { describe, expect, test } from "bun:test"
import { join } from "node:path"
import { load } from "js-yaml"
import { PM_BACKENDS, serializeSettings } from "../utils/config.ts"

const REPO_ROOT = join(import.meta.dir, "../../../..")
const TEMPLATE_SETTINGS = join(REPO_ROOT, ".workbench/settings.yml")
const SETTINGS_SCHEMA = join(REPO_ROOT, ".workbench/schemas/settings.json")

interface SettingsDocument {
  project_management: string
  [key: string]: unknown
}

interface SettingsSchema {
  properties: {
    project_management: { enum: string[] }
    [key: string]: unknown
  }
}

function toDocument(yaml: string): SettingsDocument {
  return load(yaml) as SettingsDocument
}

async function readTemplate(): Promise<{ yaml: string; document: SettingsDocument }> {
  const yaml = await Bun.file(TEMPLATE_SETTINGS).text()
  return { yaml, document: toDocument(yaml) }
}

async function readSchema(): Promise<SettingsSchema> {
  return JSON.parse(await Bun.file(SETTINGS_SCHEMA).text()) as SettingsSchema
}

const EXISTING_SETTINGS = `project_management: linear
orchestrator:
  strategy:
    name: minimum-changes-expandability
  escalation:
    escalate_on_blocking: true
    max_auto_answers_per_step: 2
sync:
  paths:
  - .opencode
  - .claude
  - README.md
ticketer:
  allow_decomposition: true
future_tooling:
  enabled: false
`

describe("serializeSettings", () => {
  test("creates a document containing only the backend when none exists", () => {
    expect(toDocument(serializeSettings(null, "linear"))).toEqual({ project_management: "linear" })
  })

  test("treats empty input as an empty document", () => {
    expect(toDocument(serializeSettings("", "github-issues"))).toEqual({
      project_management: "github-issues",
    })
  })

  test("treats whitespace-only input as an empty document", () => {
    expect(toDocument(serializeSettings("  \n", "github-issues"))).toEqual({
      project_management: "github-issues",
    })
  })

  test("replaces project_management while preserving every other key", () => {
    const original = toDocument(EXISTING_SETTINGS)
    const updated = toDocument(serializeSettings(EXISTING_SETTINGS, "github-issues"))

    expect(updated.project_management).toBe("github-issues")
    expect(updated.orchestrator).toEqual(original.orchestrator)
    expect(updated.sync).toEqual(original.sync)
    expect(updated.ticketer).toEqual(original.ticketer)
    expect(updated.future_tooling).toEqual(original.future_tooling)
  })

  test("preserves sync.paths order", () => {
    const original = toDocument(EXISTING_SETTINGS)
    const updated = toDocument(serializeSettings(EXISTING_SETTINGS, "linear"))

    expect((updated.sync as { paths: string[] }).paths).toEqual(
      (original.sync as { paths: string[] }).paths
    )
  })

  test("preserves top-level key order", () => {
    const original = toDocument(EXISTING_SETTINGS)
    const updated = toDocument(serializeSettings(EXISTING_SETTINGS, "linear"))

    expect(Object.keys(updated)).toEqual(Object.keys(original))
  })

  test("overwrites a stale hand-edited backend value", () => {
    const stale = EXISTING_SETTINGS.replace("project_management: linear", "project_management: jira")

    expect(toDocument(serializeSettings(stale, "linear")).project_management).toBe("linear")
  })

  test("throws on corrupt YAML", () => {
    expect(() => serializeSettings("orchestrator: [unclosed", "linear")).toThrow()
  })

  test("throws on a non-mapping document", () => {
    expect(() => serializeSettings("- linear", "linear")).toThrow("expected a YAML mapping")
  })
})

describe("settings template fixture", () => {
  test("rewrites the shipped template without touching other keys or their order", async () => {
    const { yaml, document: original } = await readTemplate()
    const updated = toDocument(serializeSettings(yaml, "linear"))

    expect(updated.project_management).toBe("linear")
    expect(updated.orchestrator).toEqual(original.orchestrator)
    expect(updated.sync).toEqual(original.sync)
    expect(Object.keys(updated)).toEqual(Object.keys(original))
  })
})

describe("settings schema contract", () => {
  test("PM_BACKENDS matches the schema enum (order is not semantic)", async () => {
    const schema = await readSchema()

    expect([...PM_BACKENDS].sort()).toEqual([...schema.properties.project_management.enum].sort())
  })

  test("the serialized backend is a valid schema enum value", async () => {
    const schema = await readSchema()
    const settings = toDocument(serializeSettings(null, "github-issues"))

    expect(schema.properties.project_management.enum).toContain(settings.project_management)
  })

  test("every emitted top-level key exists in the schema properties", async () => {
    const schema = await readSchema()
    const { yaml } = await readTemplate()
    const emittedKeys = Object.keys(toDocument(serializeSettings(yaml, "linear")))

    expect(emittedKeys.filter((key) => !(key in schema.properties))).toEqual([])
  })
})
