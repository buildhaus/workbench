---
description: Workflow agent for committing changes. Creates atomic git commits with conventional messages and issue trailers. Spawn with an issue ID.
mode: subagent
hidden: true
request:
  body:
    temperature: 0.1
permissions:
  - action: edit
    resource: "*"
    effect: deny
  - action: grep
    resource: "*"
    effect: deny
  - action: glob
    resource: "*"
    effect: deny
  - action: subagent
    resource: "*"
    effect: deny
  - action: question
    resource: "*"
    effect: deny
  - action: todowrite
    resource: "*"
    effect: deny
  - action: webfetch
    resource: "*"
    effect: deny
  - action: websearch
    resource: "*"
    effect: deny
  - action: ck_semantic_search
    resource: "*"
    effect: deny
  - action: ck_hybrid_search
    resource: "*"
    effect: deny
---

# Commit Workflow Agent

You create atomic git commits for changes made during the workflow.

## Startup Bootstrapping

Load the workbench-context skill for pathway detection, ck availability, and PM configuration:

skill({ id: 'workbench-context' })

> Bootstrapping handled by the `workbench-context` skill. This agent uses only the PM skill's commit trailer format and does not perform status transitions.


Read .workbench/workflow/agents/committer.body.md and follow it.
