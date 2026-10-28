---
name: workbench-context
description: Provides pathway detection instructions for workbench commands. Load this skill to determine whether the workbench is in development mode (Pathway 1) or configured project mode (Pathway 2).
---

# Workbench Context Skill

This skill provides instructions for detecting the workbench's operational mode. Load this skill at the start of every command to determine pathway context.

## Pathway Detection

Check for `.workbench/config.yaml` in the repository root:

```
test -f .workbench/config.yaml
```

- **Present** (exit code 0): Pathway 2 (configured project mode)
- **Absent** (exit code 1): Pathway 1 (workbench development mode)

This is a presence-only check. Do not parse or read `config.yaml`.

## Variable Storage

After completing pathway detection, store the following named variables for downstream use:

- `pathway_mode` — either `"workbench"` (Pathway 1) or `"configured"` (Pathway 2)

When the command involves project management operations, store these additional variables after PM configuration:

- `pm_tool` — the resolved project management tool name (e.g., `"github-issues"`, `"linear"`)
- `repo_owner_repo` — the resolved repository in `owner/repo` format for PM tool operations

## Project Management Configuration

When the command involves project management operations (retrieving issues, updating statuses, creating documents, commit trailers), configure the PM tool:

1. Read `.workbench/settings.yml` to determine the configured project management tool
2. If the file is missing or the `project_management` field is absent, stop with error:
   > "No project management tool configured. Add `project_management: <tool>` to `.workbench/settings.yml`"
3. The field value is the name of the PM skill to load
4. Load the corresponding PM skill by name. The loading mechanism is harness-specific and defined in the harness's own agent definitions.
5. The PM skill provides tool mappings, protocols, and workflow patterns for all PM operations:
   - Follow the status guard protocol from the loaded PM skill.
   - Follow the label preservation protocol from the loaded PM skill.
   - Use the PM skill's tool mapping table for all issue and document operations.

#### PM Loading Variants

Two modes are available after loading the PM skill:

**Full operations (default)**:
- Use the PM skill's tool mapping table for all issue, document, and label operations
- Follow the status guard protocol before any status transition
- Follow the label preservation protocol when updating issue status
- Use the PM skill's commit trailer format

**Committer-lite**:
- Use only the PM skill's commit trailer format
- Do not perform status transitions, status guard checks, or label preservation
- The PM skill is loaded to resolve the trailer format only

If the command does not involve project management operations, skip this step.

## Context Passing Format

After detecting pathway, include the appropriate context block in every spawned agent's prompt.

### Pathway 2 (configured project mode)

```
Pathway context: The workbench is in configured project mode (Pathway 2).
- Primary code scope: projects/ (target project source code)
- Documentation scope: resources/ (supporting docs and metadata)
- Workbench source: packages/ (the workbench CLI itself — search only if the task relates to workbench internals)
```

### Pathway 1 (workbench development mode)

```
Pathway context: The workbench is in development mode (Pathway 1).
- Primary code scope: packages/ (workbench source code)
- Documentation scope: thoughts/ (research, plans, architecture docs)
```
