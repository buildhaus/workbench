---
description: Discovers relevant documents in thoughts/ directory (We use this for all sorts of metadata storage!). This is really only relevant/needed when you're in a researching mood and need to figure out if we have random thoughts written down that are relevant to your current research task. Based on the name, I imagine you can guess this is the `thoughts` equivalent of `codebase-locator`
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

## Harness Tools

Load a skill with `skill({ id: '<name>' })`. Run commands with `shell`. Discover files with `grep`, `glob`, and directory `read`. Fetch pages with `webfetch` and search the web with `websearch`. Spawn subagents with `subagent` (a short `description` is required) and resume them with their `sessionID`. This agent's permissions may restrict a subset of these.

Read .workbench/workflow/agents/thoughts-locator.body.md and follow it.
