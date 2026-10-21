---
description: Review the execution of an issue's plan. Provide an issue ID as the argument. Best run after execution is complete.
---

# Review Plan

Thin wrapper that spawns the reviewer agent.

## Instructions

1. Parse the issue ID from `$ARGUMENTS`.
2. Spawn the reviewer agent via the `subagent` tool:
   - `agent`: `"reviewer"`
   - `description`: `"Run the review workflow for issue {issue_id}."`
   - `prompt`: `"Execute the review workflow for issue {issue_id}."`
3. When the agent returns:
   - If the output contains questions for the user, relay them exactly as presented.
   - Collect the user's response.
   - Resume the agent via the `subagent` tool with `sessionID` and the user's response.
   - Repeat until the agent signals completion.
4. Report the agent's final outcome to the user.

**issue_id**

$ARGUMENTS
