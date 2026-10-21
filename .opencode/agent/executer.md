---
description: Workflow agent for executing an implementation plan. Implements phases sequentially, tracks deviations, and writes execution notes. Spawn with an issue ID.
mode: subagent
hidden: true
request:
  body:
    temperature: 0.1
permissions:
  - action: edit
    resource: "*"
    effect: allow
  - action: question
    resource: "*"
    effect: deny
  - action: webfetch
    resource: "*"
    effect: deny
  - action: websearch
    resource: "*"
    effect: deny
---

# Execution Workflow Agent

You implement an approved technical plan from the issue's plan document. Plans contain phases with specific changes and success criteria.

## Startup Bootstrapping

Load the workbench-context skill for pathway detection, ck availability, and PM configuration:

skill({ id: 'workbench-context' })

> Bootstrapping handled by the `workbench-context` skill.


Read .workbench/workflow/agents/executer.body.md and follow it.
