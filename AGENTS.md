# Workbench

A structured Agentic SDLC environment. Slash commands guide every issue through a defined pipeline powered by dedicated subagents:

```
/ticket → /research → /plan → /execute → /review → /commit
```

Use `/implement <issue-id>` to orchestrate all remaining steps automatically.

---

## Harness Conventions

### Skill Loading

When instructed to load a skill named `X`:

- **OpenCode 2.x**: call `skill({ id: 'X' })`. The ID is path-derived (the directory name or file stem), not the frontmatter `name`.
- **Claude Code**: read `.workbench/workflow/skills/X/SKILL.md`.

### Tool Equivalences

| OpenCode 2.x | Claude Code |
|--------------|-------------|
| `subagent` | Agent |
| `agent` | `subagent_type` |
| `sessionID` | SendMessage with the agent ID |
| `shell` | Bash |
| directory `read` | LS |
| `webfetch` | WebFetch |
| `websearch` | WebSearch |

When body files say `subagent`, use the Agent tool in Claude Code. When they say `agent`, use `subagent_type`. When they say `sessionID`, resume via SendMessage with the agent ID.

### Subagent Dispatch

Named workflow agents read their instructions from `.workbench/workflow/agents/{name}.body.md`. Always include the body file path in the spawned agent's prompt.

- A short `description` is **required** on every `subagent` call in OpenCode 2.x (there is no Claude Code equivalent).
- Include the pathway context block in every spawned agent prompt.

---

## Workbench Context

Load this context at the start of every command. Resolve pathway, ck availability, and PM tool before spawning any agent.

### Pathway Detection

Check for `.workbench/config.yaml` in the repository root using the `shell` tool (OpenCode 2.x) or Bash (Claude Code):

```bash
test -f .workbench/config.yaml
```

- **Present** (exit code 0): **Pathway 2** — configured project mode
- **Absent** (exit code 1): **Pathway 1** — workbench development mode

This is a presence-only check. Do not parse or read `config.yaml`.

Store as `pathway_mode`: `"workbench"` (Pathway 1) or `"configured"` (Pathway 2).

### ck Availability Check

1. Read `.workbench/settings.yml`. For `tools.ck_semantic_search` and `tools.ck_hybrid_search`, use the value if present; default to `true` if the file or key is absent.
2. Run `which ck` via the `shell` (OpenCode 2.x) or Bash (Claude Code) tool. If found, run `ck --status` to verify index readiness. Any failure → `ck_installed_and_ready = false` (warn and continue; never block execution).
3. Compute resolved availability:
   - `ck_semantic_search_available = tools.ck_semantic_search AND ck_installed_and_ready`
   - `ck_hybrid_search_available = tools.ck_hybrid_search AND ck_installed_and_ready`

Store as `ck_semantic_search_available` and `ck_hybrid_search_available`.

### Project Management Configuration

When the command involves PM operations (retrieving issues, updating statuses, creating documents, commit trailers):

1. Read `.workbench/settings.yml` → `project_management` field.
2. If missing, stop with: `"No project management tool configured. Add project_management: <tool> to .workbench/settings.yml"`
3. Load the PM skill: `skill({ id: '<value>' })` in OpenCode 2.x, or read `.workbench/workflow/skills/<value>/SKILL.md` in Claude Code.
4. Follow its tool mapping, status guard protocol, and label preservation protocol for all PM operations.

Store as `pm_tool` (e.g., `"github-issues"`, `"linear"`).

**Committer-lite mode**: When only the commit trailer format is needed, load the PM skill to resolve the trailer format only — do not perform status transitions or label preservation.

### Context Passing Format

After resolving pathway, ck, and PM tool, include the following block in every spawned agent's prompt:

**Pathway 2 (configured project mode):**
```
Pathway context: The workbench is in configured project mode (Pathway 2).
- Primary code scope: projects/ (target project source code)
- Documentation scope: resources/ (supporting docs and metadata)
- Workbench source: packages/ (search only if the task relates to workbench internals)
- ck_semantic_search: [available | unavailable (suppressed by config) | unavailable (ck not installed/ready)]
- ck_hybrid_search: [available | unavailable (suppressed by config) | unavailable (ck not installed/ready)]
- When ck is available, prefer ck_semantic_search and ck_hybrid_search as complements to grep/glob
```

**Pathway 1 (workbench development mode):**
```
Pathway context: The workbench is in development mode (Pathway 1).
- Primary code scope: packages/ (workbench source code)
- Documentation scope: thoughts/ (research, plans, architecture docs)
- ck_semantic_search: [available | unavailable (suppressed by config) | unavailable (ck not installed/ready)]
- ck_hybrid_search: [available | unavailable (suppressed by config) | unavailable (ck not installed/ready)]
```

Also include in every spawned agent's prompt:
```
PM tool: {pm_tool}
To load a skill, use skill({ id: '{name}' }) in OpenCode 2.x, or read .workbench/workflow/skills/{name}/SKILL.md in Claude Code.
When body files reference the subagent tool, use the Agent tool in Claude Code. Map agent → subagent_type and sessionID → SendMessage with the agent ID.
```

In OpenCode 2.x, dispatch subagents with the `subagent` tool directly. In Claude Code, use the Agent tool and map `agent` → `subagent_type` and `sessionID` → SendMessage with the agent ID.
