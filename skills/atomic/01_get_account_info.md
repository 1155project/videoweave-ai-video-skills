---
name: "get_account_info"
description: Fetch the user's VideoWeave account info including credit balance, subscription plan, and profile.
type: atomic
category: account
requires: []
outputs: [user_email, tenant_id, credit_balance, plan_name, storage_used_mb]
mcp_tool: get_account_info
---

# Skill: Get Account Info

## Purpose
Retrieve the current user's account details: who they are, what plan they're on, how
many credits they have remaining, and current storage usage. Use this before starting
a session of edit operations to confirm there are sufficient credits.

## When to Use
- User asks "how many credits do I have?"
- User asks "what plan am I on?"
- Before a series of expensive edit operations to check credit availability
- User asks "show me my account details"

## Prerequisites
Active MCP session. No other skills needed first.

## Inputs
None.

## MCP Tool Call
```json
{
  "tool": "get_account_info",
  "params": {}
}
```

## Expected Response
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "tenant_id": "uuid",
  "plan_name": "Professional",
  "credits_remaining": 142,
  "credits_used_this_period": 58,
  "credits_total": 200,
  "storage_used_mb": 1240,
  "storage_limit_mb": 10240
}
```

## Output for Chaining
- `credit_balance` → check before running edit operations
- `tenant_id` → used internally by other tools (handled automatically)

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 401 Unauthorized | Session expired | Session will be silently refreshed; retry once |
| 500 | Server error | Report to user, try again |

## Example
User: "How many credits do I have left?"
→ Call `get_account_info`
→ "You have 142 credits remaining out of 200 for this billing period. Edit operations
   typically cost 21–30 credits each, so you can run approximately 4–6 more operations."
