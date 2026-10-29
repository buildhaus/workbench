import { describe, expect, test } from "bun:test"
import { parseCliArgs } from "../args.ts"
import { isProjectManagement } from "../utils/config.ts"

describe("parseCliArgs", () => {
  test("defaults the project management backend to github-issues", () => {
    expect(parseCliArgs([]).pm).toBe("github-issues")
  })

  test("accepts an explicit linear backend", () => {
    expect(parseCliArgs(["--pm", "linear"]).pm).toBe("linear")
  })
})

describe("isProjectManagement", () => {
  test("rejects a backend outside the enum", () => {
    expect(isProjectManagement("jira")).toBe(false)
  })
})
