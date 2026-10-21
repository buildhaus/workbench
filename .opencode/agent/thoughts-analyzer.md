---
description: The research equivalent of codebase-analyzer. Use this agent when wanting to deep dive on a research topic. Not commonly needed otherwise.
mode: subagent
hidden: true
request:
  body:
    temperature: 0.1
permissions:
  - action: edit
    resource: "*"
    effect: deny
  - action: shell
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
---

Read .workbench/workflow/agents/thoughts-analyzer.body.md and follow it.
