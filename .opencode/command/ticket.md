---
description: Creates a structured ticket for an issue. Provide an issue ID as the argument.
---

# Create Ticket

Thin wrapper that spawns the ticketer agent.

## Instructions

1. Parse the issue ID from `$ARGUMENTS`.
2. Spawn the ticketer agent via the `subagent` tool:
   - `agent`: `"ticketer"`
   - `description`: `"Run the ticket workflow for issue {issue_id}."`
   - `prompt`: `"Execute the ticket workflow for issue {issue_id}."`
3. When the agent returns:
   - If the output contains questions for the user, relay them exactly as presented.
   - Collect the user's response.
   - Resume the agent via the `subagent` tool with `sessionID` and the user's response.
   - Repeat until the agent signals completion.
4. Report the agent's final outcome to the user.

**user_request**

$ARGUMENTS
