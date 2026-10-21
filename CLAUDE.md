@AGENTS.md

## Claude Code Notes

### Skill Loading

When instructed to load a skill named `X`, read `.workbench/workflow/skills/X/SKILL.md`.

### Sub-Agent Dispatch Table

| Agent name | `subagent_type` | Body file |
|------------|----------------|-----------|
| ticketer | `claude` | `.workbench/workflow/agents/ticketer.body.md` |
| researcher | `claude` | `.workbench/workflow/agents/researcher.body.md` |
| planner | `claude` | `.workbench/workflow/agents/planner.body.md` |
| executer | `claude` | `.workbench/workflow/agents/executer.body.md` |
| reviewer | `claude` | `.workbench/workflow/agents/reviewer.body.md` |
| committer | `claude` | `.workbench/workflow/agents/committer.body.md` |
| codebase-locator | `Explore` | `.workbench/workflow/agents/codebase-locator.body.md` |
| codebase-analyzer | `Explore` | `.workbench/workflow/agents/codebase-analyzer.body.md` |
| codebase-pattern-finder | `Explore` | `.workbench/workflow/agents/codebase-pattern-finder.body.md` |
| thoughts-locator | `Explore` | `.workbench/workflow/agents/thoughts-locator.body.md` |
| thoughts-analyzer | `Explore` | `.workbench/workflow/agents/thoughts-analyzer.body.md` |
| web-search-researcher | `general-purpose` | `.workbench/workflow/agents/web-search-researcher.body.md` |

### Harness Mapping

When canonical instructions say `subagent`, use the Agent tool. Map `agent` → `subagent_type`, `sessionID` → SendMessage with the agent ID, `shell` → Bash, directory `read` → LS, `websearch`/`webfetch` → WebSearch/WebFetch.
