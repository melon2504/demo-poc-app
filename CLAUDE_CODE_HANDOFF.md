# Claude Code Handoff Prompt

I am giving you `CLAUDE_CODE_TESTING_PLUGIN_REFACTOR_BRIEF.md`.

This is a design/refactoring brief for an existing Claude Code plugin containing Skills/agents/hooks for automated testing of React applications in a micro-frontend architecture.

IMPORTANT:
- Do NOT rewrite the existing system blindly.
- First inspect the repository and understand what already exists.
- Preserve working behavior.
- Identify what is already implemented versus missing.
- Pay particular attention to safety, permissions, production-code modification, autonomous repair loops, incremental analysis, persistent test intelligence, model/effort routing, subagent economics, E2E flow inference, flaky tests, CI behavior, plugin versioning, and regression testing.
- Treat model routing as an optimization, not the primary product goal.
- Do not assume subagents are automatically cheaper.
- Do not make the plugin dependent on users manually switching the main Claude Code session model.
- Prefer capability profiles and bounded delegation.
- Before editing anything, produce:
  1. Current architecture inventory
  2. Existing capability matrix
  3. Gap/risk analysis
  4. Prioritized P0/P1/P2/P3 plan
  5. Proposed changes with rationale
- Then implement incrementally and validate after each major stage.

Read the full brief before taking action.
