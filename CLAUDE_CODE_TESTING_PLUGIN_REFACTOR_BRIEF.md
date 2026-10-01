# React Testing Agent Plugin — Claude Code Refactoring & Architecture Brief

## Purpose

This document is intended to be fed directly to a local Claude Code session that contains the existing React testing Skills/plugin.

The goal is **not** to blindly rewrite the existing implementation.

Instead:

1. Inspect the existing Skills, agents, hooks, commands, configuration, and supporting files.
2. Identify what is already implemented well.
3. Map existing behavior against the architecture and requirements in this document.
4. Preserve working behavior.
5. Refactor only where there is a concrete improvement.
6. Identify missing capabilities and propose/implement them where appropriate.
7. Keep the solution compatible with Claude Code plugin/marketplace distribution.
8. Prefer incremental changes over a large rewrite.

---

# 1. Product Context

The plugin is intended for teams with many React applications using a micro-frontend architecture.

Current environment:

- 20+ React applications / MFEs.
- Existing custom Claude Code Skills have already been created.
- The Skills can:
  - explore a codebase;
  - analyze architecture;
  - design tests;
  - generate unit tests;
  - generate smoke tests;
  - generate integration tests;
  - generate E2E tests;
  - run tests;
  - analyze failures;
  - generate reports.
- E2E functionality:
  - discovers possible end-to-end user flows;
  - reasons about application behavior;
  - generates Playwright tests;
  - executes Playwright;
  - diagnoses failures.
- The whole system is intended to be shipped as a reusable Claude Code plugin through a marketplace.
- Team members should be able to install the plugin and invoke the Skills against their own local codebases.

The plugin should work across heterogeneous React applications rather than assuming every MFE has exactly the same framework/test setup.

---

# 2. Core Product Goal

The desired product experience is:

> Give the plugin a React/MFE codebase and have it discover the architecture, understand existing testing conventions, identify meaningful behavioral coverage, generate appropriate unit/integration/E2E tests, validate them, diagnose failures, and produce an evidence-backed report — while protecting application code and keeping execution bounded, reproducible, and cost-aware.

The plugin should optimize for **useful behavioral coverage and test quality**, not simply test count or line coverage.

---

# 3. Important Architectural Principle

Do NOT assume that one model should perform the entire workflow.

Also do NOT assume that every task should be delegated to a subagent.

The desired architecture is:

```text
User
  |
  v
Main Claude Code session / orchestrator
  |
  v
Testing planner
  |
  +-------------------+--------------------+
  |                   |                    |
  v                   v                    v
Discovery          Reasoning            Execution
  |                   |                    |
cheap/fast        balanced/strong       deterministic
  |                   |                    |
  +-------------------+--------------------+
                      |
                      v
                 Test reviewer
                      |
                      v
                 Repair loop
                      |
                      v
                  Final report
```

The main session should decide whether delegation is actually worthwhile.

Delegation is NOT automatically a cost optimization.

---

# 4. Model and Effort Routing

## 4.1 Desired principle

Use the least expensive model/effort combination that is likely to produce a sufficiently reliable result.

Conceptually:

```text
simple/mechanical
    -> cheap model + low effort

moderate reasoning
    -> balanced model + medium effort

complex/ambiguous/architectural
    -> strong model + high effort
```

But this should not be hard-coded solely by test type.

Do NOT use simplistic rules such as:

```text
unit = cheap
integration = medium
E2E = expensive
```

Instead classify the actual task.

---

## 4.2 Task complexity factors

A task can be evaluated using factors such as:

- reasoning complexity;
- ambiguity;
- codebase scope;
- number of files;
- number of MFEs involved;
- number of APIs involved;
- number of dependency boundaries;
- cross-MFE communication;
- authentication/session state;
- routing complexity;
- state-management complexity;
- architectural impact;
- expected failure cost;
- amount of existing context already available;
- whether the task has a well-defined output;
- whether delegation would require transferring large context.

Conceptual score:

```text
complexity =
    reasoning * 0.30
  + ambiguity * 0.25
  + codebaseScope * 0.20
  + architecturalImpact * 0.15
  + failureCost * 0.10
```

This weighting is a starting point, not a hard requirement.

Prefer empirical tuning after observing real plugin runs.

---

## 4.3 Example routing matrix

| Task | Model profile | Effort |
|---|---|---|
| Find test files | cheap | low |
| Inspect package.json | cheap | low |
| Identify Vitest/Jest | cheap | low |
| Identify Playwright config | cheap | low |
| Find routes | cheap | low |
| Find API clients | cheap | low |
| Identify existing test patterns | cheap/balanced | low/medium |
| Understand component behavior | balanced | medium |
| Design unit-test strategy | balanced | medium |
| Design integration strategy | balanced | medium |
| Discover meaningful E2E journeys | strong | high |
| Reason across multiple MFEs | strong | high |
| Resolve ambiguous business behavior | strong | high |
| Generate straightforward test boilerplate | cheap | low |
| Debug simple locator issue | cheap/balanced | low |
| Diagnose recurring Playwright failures | balanced/strong | medium/high |
| Diagnose architectural failure | strong | high |
| Generate final report | cheap/balanced | low |

Do not hard-code provider-specific model IDs throughout the plugin if this can be avoided.

Prefer capability profiles such as:

```yaml
profiles:
  cheap:
    preferred_model: haiku
    effort: low

  balanced:
    preferred_model: sonnet
    effort: medium

  reasoning:
    preferred_model: opus
    effort: high
```

Treat model IDs as configurable because model availability and lifecycle can change.

---

# 5. Critical Cost Insight

Subagents can cost MORE than a single powerful model.

Do not assume:

```text
many cheap subagents < one expensive model
```

This is not guaranteed.

Each subagent can introduce:

- its own input context;
- system/instruction tokens;
- tool calls;
- output tokens;
- context transfer back to the parent;
- orchestration overhead.

Therefore:

> Delegate only when the expected reduction in expensive reasoning/context consumption exceeds the orchestration cost.

---

# 6. Delegation Policy

Good candidates for subagents:

- independent exploration;
- mechanical discovery;
- scanning separate MFEs;
- finding existing tests;
- extracting routes;
- extracting API endpoints;
- producing compact structured artifacts;
- isolated debugging tasks.

Poor candidates:

- tiny tasks;
- tasks where the main session already has all required context;
- tasks requiring large context transfer;
- tasks whose output will simply be copied back;
- reasoning that is tightly coupled to the parent conversation.

The main session should be capable of saying:

```text
This is too small to delegate.
```

---

# 7. Outcome-Based Escalation

The system should not only route based on predicted complexity.

It should also escalate based on results.

Example:

```text
cheap attempt
    |
    v
validate
    |
  success
    -> finish

  failure
    |
    v
balanced attempt
    |
    v
validate
    |
  success
    -> finish

  failure
    |
    v
strong reasoning attempt
    |
    v
validate
    |
    v
stop/report
```

Example:

```text
Playwright locator failure
    -> cheap debugger

Repeated failure
    -> balanced debugger

Failure suggests architecture ambiguity
    -> strong reasoning agent
```

Never allow endless self-repair.

---

# 8. Hard Budgets / Stop Conditions

Every autonomous workflow should have explicit limits.

Consider limits for:

- maximum model turns;
- maximum subagents;
- maximum parallel subagents;
- maximum Playwright retries;
- maximum test repair attempts;
- maximum files modified;
- maximum generated tests;
- maximum execution time;
- maximum dependency changes.

Example policy:

```text
3 failed repair attempts
    -> stop and report

>100 generated tests
    -> ask/review before continuing

>5 MFEs involved
    -> architecture-aware planning

Repeated identical failure
    -> stop retrying

Application code modification requested implicitly
    -> do not perform it
```

An agent that knows when to stop is more valuable than one that keeps trying indefinitely.

---

# 9. Safety Boundary: Production Code

This is a critical requirement.

Default rule:

> Test automation may create/modify test code and test configuration, but must NOT modify production/application code unless the user explicitly asks for that.

Bad behavior:

```text
test fails
  -> agent changes React component
  -> test passes
```

Desired behavior:

```text
test fails
  |
  +--> test defect -> fix test
  |
  +--> infrastructure defect -> fix test infrastructure if permitted
  |
  +--> application behavior mismatch
          -> report suspected application defect
          -> do not modify application code
```

Reports should clearly distinguish:

- test defect;
- environment/infrastructure issue;
- flaky behavior;
- suspected application defect;
- unresolved/ambiguous failure.

---

# 10. Permission and Autonomy Modes

Consider providing explicit modes:

```text
/test analyze
    read-only analysis

/test generate
    generate test changes

/test fix
    repair tests/infrastructure

/test e2e
    discover and generate Playwright tests

/test full
    complete bounded workflow
```

Prefer the safest useful default.

High-impact operations should have human checkpoints where practical.

Especially:

- modifying package.json;
- adding dependencies;
- changing Playwright configuration;
- changing CI;
- modifying test infrastructure;
- modifying application code;
- deleting files;
- large-scale test rewrites.

---

# 11. Test Philosophy Configuration

Do not hard-code every team's testing preferences into Skills.

Support project/team configuration.

Possible file:

```text
.claude/testing.md
```

or:

```text
testing-config.yaml
```

Example:

```yaml
framework:
  unit: vitest
  component: testing-library
  e2e: playwright

principles:
  prefer_user_behavior: true
  avoid_implementation_details: true
  prefer_msws: true
  snapshots: false

selectors:
  priority:
    - role
    - label
    - text
    - testid

production_code_modification:
  allowed: false

coverage:
  target: 80
```

The plugin should first discover existing project conventions and then respect explicit configuration.

---

# 12. MFE Capability Profiles

Do not assume all 20+ MFEs are identical.

The plugin should discover or maintain an MFE profile such as:

```json
{
  "name": "checkout-mfe",
  "framework": "react",
  "testRunner": "vitest",
  "e2e": "playwright",
  "state": "redux",
  "api": "rest",
  "auth": "shared-shell",
  "routing": "react-router",
  "communication": "postMessage",
  "dependencies": [
    "shell",
    "user-mfe"
  ]
}
```

Useful attributes:

- React version;
- build system;
- package manager;
- test runner;
- Testing Library;
- Playwright;
- state management;
- router;
- API layer;
- auth mechanism;
- feature flags;
- shared libraries;
- MFE dependencies;
- shell dependencies;
- cross-MFE communication;
- test fixtures;
- mocking approach.

---

# 13. Persistent Test Intelligence

Repeatedly rediscovering the same architecture is wasteful.

Consider maintaining:

```text
.claude/test-intelligence/
    architecture.json
    test-map.json
    flows.json
    conventions.json
    run-history.json
```

Potential information:

```text
MFE
  -> routes
  -> components
  -> APIs
  -> dependencies
  -> existing tests
  -> fixtures
  -> user flows
  -> conventions
```

Future runs should:

```text
load previous knowledge
    |
    v
detect changes
    |
    v
verify affected areas
```

rather than always performing a full repository exploration.

This can reduce both latency and token consumption.

---

# 14. Incremental / Diff-Based Analysis

Default behavior should ideally be incremental.

Instead of:

```text
every run
  -> scan entire repo
```

prefer:

```text
git diff
+
changed files
+
dependency graph
+
cached architecture
    |
    v
affected test surface
```

Example:

```text
Changed:
  checkout/PaymentForm.tsx

Dependencies:
  PaymentForm
    -> PaymentService
       -> checkout API

Potentially affected:
  12 unit tests
  4 integration tests
  2 E2E flows
```

Full repository analysis should remain available for initial onboarding or explicit requests.

---

# 15. E2E Flow Discovery Must Distinguish Evidence from Inference

The agent should not silently turn guesses into requirements.

Classify discovered flows as:

```text
DOCUMENTED
OBSERVED
INFERRED
```

Example:

```text
E2E Flow: Checkout

Evidence:
  route exists
  submit API exists
  success page exists
  existing test partially covers flow

Confidence: HIGH
```

Versus:

```text
E2E Flow: Upgrade subscription

Evidence:
  upgrade button exists
  subscription API exists

Assumption:
  navigation sequence inferred from component relationships

Confidence: MEDIUM
```

Reports should expose assumptions and confidence.

---

# 16. Test Quality > Test Count

Avoid optimizing for:

```text
more tests
higher line coverage
```

Optimize for meaningful behavioral coverage.

Distinguish:

- line coverage;
- branch coverage;
- behavior coverage;
- user-flow coverage;
- API-boundary coverage;
- cross-MFE coverage;
- error-state coverage.

Example report:

```text
Coverage

Lines:              83%
Branches:            71%

Behavioral:
  Critical flows:    14/16
  API boundaries:     9/11
  Error states:       7/12
  Cross-MFE flows:    5/7
```

Do not generate tests solely to inflate coverage.

---

# 17. Test Quality Reviewer

The workflow should not stop at:

```text
generate -> done
```

Prefer:

```text
generate
   |
   v
run
   |
   v
review
   |
   v
repair
   |
   v
run again
   |
   v
final review
```

Reviewer should detect:

- redundant tests;
- weak assertions;
- implementation-detail testing;
- excessive mocking;
- tests that only verify mocks;
- brittle selectors;
- duplicated fixtures;
- hidden test coupling;
- meaningless snapshots;
- tests that pass without exercising real behavior.

The reviewer can often use a cheaper model than the primary reasoning agent.

---

# 18. Deterministic Test Generation

LLMs are probabilistic. Test suites must be deterministic.

Establish conventions for:

- selectors;
- test data;
- fixtures;
- mocking;
- network interception;
- retries;
- timeouts;
- cleanup;
- isolation;
- timezone;
- dates;
- randomness;
- browser state.

For Playwright, prefer stable user-facing selectors.

Example preference:

```typescript
page.getByRole('button', { name: 'Submit' })
```

over brittle selectors such as:

```typescript
page.locator('.btn-primary:nth-child(3)')
```

Existing project conventions should take precedence when appropriate.

---

# 19. Flaky Test Handling

Do not classify:

```text
FAIL
RETRY
PASS
```

as simply "fixed."

Instead:

```text
FAIL
  |
  v
retry
  |
  v
PASS
  |
  v
classify:
  deterministic
  flaky
  environment
  product
  test defect
```

Reports should expose:

```text
Passed: 184
Failed: 3
Flaky: 2
Skipped: 1
```

Retries should not hide instability.

---

# 20. CI Mode vs Local Mode

Consider separate behavior.

## Local

- interactive;
- can ask questions;
- can propose changes;
- can repair;
- human approval possible.

## CI

- deterministic;
- bounded;
- no production-code modification;
- machine-readable output;
- strict timeout;
- strict retry limits;
- no infinite repair;
- predictable exit status.

Potential command:

```text
/test --ci
```

Potential JSON output:

```json
{
  "status": "failed",
  "unit": {},
  "integration": {},
  "e2e": {},
  "flaky": [],
  "coverage": {}
}
```

---

# 21. Cost Observability

Because the plugin will be distributed to a team, users will eventually ask why a run was expensive.

Produce a useful run summary.

Example:

```text
Test Intelligence Run
---------------------

Repository: checkout
MFEs analyzed: 4

Tasks:
  Exploration       12
  Analysis           5
  Generation        18
  Debugging          4

Models:
  Cheap             21 calls
  Balanced           8 calls
  Reasoning          2 calls

Tests:
  Generated          73
  Passed             68
  Failed              3
  Flaky               2

Execution:
  Unit              42s
  Integration        1m 13s
  E2E                3m 51s

Usage:
  Input tokens: ...
  Output tokens: ...

Estimated usage: ...
```

If exact monetary cost cannot be reliably obtained, do not invent it. Report token usage/model usage instead.

---

# 22. Cost-Aware Delegation

The router should consider:

```text
task complexity
+
context size
+
delegation overhead
+
expected success probability
+
expected retry probability
```

Do NOT delegate merely because a task is "simple."

The system should be able to conclude:

```text
Task is too small to delegate.
Perform inline.
```

Likewise, a cheap model should not be used for a task where its expected failure rate would cause multiple retries and ultimately cost more.

---

# 23. Golden Regression Corpus

Before marketplace/team rollout, create a representative corpus of real MFEs.

For each:

```text
MFE A
  expected unit coverage
  expected integration coverage
  expected E2E flows

MFE B
  ...
```

Use the corpus to evaluate plugin versions.

The plugin itself should be tested as an agentic product.

Regression signals:

- generated test quality;
- incorrect assumptions;
- missing critical flows;
- excessive test count;
- flaky tests;
- unnecessary production-code changes;
- excessive token usage;
- runtime;
- repair loops;
- report quality.

Every meaningful Skill/prompt/agent change should ideally run against the corpus.

---

# 24. Plugin Versioning

Record which plugin version generated or materially modified test artifacts.

Example metadata:

```json
{
  "generatedBy": {
    "plugin": "company-react-testing",
    "version": "1.7.0"
  }
}
```

Prefer a central manifest if adding comments to every test is undesirable.

Consider:

```text
stable
beta
```

release channels before broad rollout.

Treat changes to Skills, agents, hooks, permissions, or generated-test strategy as potentially behavior-changing.

---

# 25. Marketplace Plugin Structure

A conceptual structure:

```text
react-testing-plugin/
|
├── plugin.json
|
├── skills/
|   ├── generate-tests/
|   |   └── SKILL.md
|   ├── analyze-codebase/
|   |   └── SKILL.md
|   ├── discover-e2e-flows/
|   |   └── SKILL.md
|   ├── generate-playwright/
|   |   └── SKILL.md
|   └── test-report/
|       └── SKILL.md
|
├── agents/
|   ├── test-explorer.md
|   ├── test-generator.md
|   ├── test-strategy.md
|   ├── architecture-analyst.md
|   ├── e2e-discovery.md
|   ├── playwright-debugger.md
|   └── test-reviewer.md
|
├── hooks/
|   └── ...
|
├── config/
|   └── ...
|
└── docs/
    └── ...
```

Use the exact plugin manifest/layout required by the current Claude Code plugin documentation rather than assuming this conceptual tree is a literal schema.

---

# 26. Main Session vs Subagents

Important distinction:

## Main session

Use for:

- overall orchestration;
- understanding user intent;
- decisions requiring accumulated context;
- high-level reasoning;
- final synthesis.

## Subagents

Use for:

- isolated exploration;
- mechanical discovery;
- independent MFE analysis;
- focused debugging;
- compact structured outputs.

Do not attempt to continuously mutate the user's main Claude Code model/effort setting as the core routing mechanism.

The plugin should not depend on the user manually switching models during the workflow.

Instead, use specialized subagents/configurable execution profiles where Claude Code supports them.

---

# 27. Avoid Overengineering the Router in v1

Do not spend excessive effort building a perfect complexity classifier before collecting real data.

A sensible first version:

```text
cheap
balanced
reasoning
```

with simple deterministic routing.

After real runs, measure:

```text
task type
success rate
tokens
latency
retries
delegation overhead
```

Then improve routing based on observed data.

The router should become evidence-driven.

---

# 28. Suggested Initial Agent Roles

Potential roles:

### test-explorer
Responsibilities:
- discover test framework;
- locate tests;
- inspect package scripts;
- discover components/routes/APIs;
- produce compact structured findings.

Prefer cheap/low-effort execution.

### test-strategy
Responsibilities:
- design unit/integration strategy;
- identify boundaries;
- determine meaningful cases.

Balanced/medium effort.

### architecture-analyst
Responsibilities:
- understand MFE boundaries;
- analyze cross-MFE dependencies;
- resolve architectural ambiguity.

Strong/high effort.

### e2e-discovery
Responsibilities:
- identify user journeys;
- distinguish observed vs inferred flows;
- map journeys across MFEs.

Strong/high effort when complexity warrants it.

### test-generator
Responsibilities:
- create tests according to discovered conventions;
- avoid production-code modifications.

Cheap/balanced depending on complexity.

### playwright-debugger
Responsibilities:
- classify failures;
- repair selectors/waits/fixtures where appropriate;
- escalate if failure suggests deeper architectural ambiguity.

Balanced by default, strong on escalation.

### test-reviewer
Responsibilities:
- review generated tests;
- detect weak or redundant tests;
- check maintainability and behavioral value.

Cheap/balanced depending on review scope.

---

# 29. Suggested Workflow

```text
1. Load project configuration
2. Load cached test intelligence if available
3. Inspect git status/diff when relevant
4. Detect test framework and project conventions
5. Build/update MFE capability profile
6. Build task plan
7. Classify tasks
8. Decide inline vs delegated execution
9. Select model/effort profile
10. Perform discovery
11. Design test strategy
12. Generate tests
13. Review generated tests
14. Execute tests
15. Classify failures
16. Attempt bounded repair
17. Re-run
18. Detect flaky behavior
19. Calculate behavioral/test coverage
20. Produce final report
21. Persist useful test intelligence
22. Report changes and unresolved issues
```

---

# 30. Final Report Should Be Evidence-Based

A good report should include:

```text
Scope
------
MFEs analyzed
Files analyzed
Test types considered

Existing State
--------------
Existing frameworks
Existing test counts
Existing conventions

Generated
---------
Unit tests
Smoke tests
Integration tests
E2E tests

Execution
---------
Passed
Failed
Flaky
Skipped

Coverage
--------
Line
Branch
Behavior
User flow
API boundary
Cross-MFE

Assumptions
-----------
Observed
Inferred
Unknown

Failures
--------
Test defect
Environment
Application behavior
Unresolved

Changes
-------
Files created
Files modified
Dependencies changed

Safety
------
Production files modified: NO

Usage
-----
Model profiles
Approximate token usage if available
Execution time

Recommendations
---------------
Remaining coverage gaps
Potential application issues
Potential flaky tests
```

---

# 31. Refactoring Instructions for the Local Claude Code Agent

When this document is supplied to Claude Code, the first action should NOT be to rewrite anything.

Follow this sequence:

## Phase 1 — Inventory

Inspect:

- all existing Skills;
- Skill frontmatter;
- agent definitions;
- hooks;
- commands;
- plugin manifest;
- marketplace configuration;
- supporting scripts;
- test utilities;
- configuration;
- documentation.

Create an inventory.

## Phase 2 — Capability Mapping

For every existing capability, classify:

```text
IMPLEMENTED
PARTIALLY IMPLEMENTED
MISSING
REDUNDANT
RISKY
UNKNOWN
```

Map it against sections of this document.

## Phase 3 — Architecture Assessment

Identify:

- current orchestration model;
- current model selection;
- current effort configuration;
- subagent usage;
- permission boundaries;
- production-code protection;
- retry behavior;
- test repair loops;
- test-quality review;
- persistent knowledge;
- incremental analysis;
- cost observability;
- CI support;
- plugin upgrade strategy.

## Phase 4 — Preserve Existing Strengths

Before changing anything:

- identify Skills that already work well;
- preserve their behavior;
- avoid unnecessary prompt rewrites;
- avoid changing interfaces unless there is a clear benefit.

## Phase 5 — Refactoring Plan

Produce:

```text
Current architecture
        |
        v
Gap analysis
        |
        v
Prioritized changes
        |
        v
Implementation plan
```

Prioritize:

### P0
- safety;
- production-code protection;
- bounded loops;
- permissions;
- correctness/regression coverage.

### P1
- architecture/context efficiency;
- incremental analysis;
- MFE profiles;
- test-quality review;
- persistent test intelligence.

### P2
- model routing;
- effort routing;
- cost observability;
- advanced delegation.

### P3
- advanced optimization and automation.

## Phase 6 — Implement Incrementally

After the plan:

1. implement P0;
2. validate;
3. implement P1;
4. validate;
5. implement P2;
6. validate;
7. only then consider P3.

Do not perform a giant rewrite unless the existing architecture is fundamentally incompatible.

---

# 32. Questions the Local Claude Code Agent Should Answer

Before modifying the plugin, explicitly answer:

1. How are Skills currently orchestrated?
2. Which Skills are independent?
3. Which Skills duplicate work?
4. Which Skills are overly broad?
5. Are there existing subagents?
6. Can tasks be isolated into subagents?
7. Is model selection currently controllable?
8. Is effort currently controllable?
9. What happens when a generated test fails?
10. How many repair attempts are allowed?
11. Can the agent modify production code?
12. Can it install dependencies?
13. Can it change package scripts?
14. Can it modify CI?
15. Are permissions explicit?
16. Is there a read-only analysis mode?
17. Is analysis incremental?
18. Is architecture cached?
19. Are MFE relationships persisted?
20. Are existing testing conventions detected?
21. Are inferred E2E flows labeled as inferred?
22. Is flaky behavior detected?
23. Is generated-test quality reviewed?
24. Is test count being confused with test quality?
25. Is cost/token usage observable?
26. Are plugin versions tracked?
27. Is there a golden regression corpus?
28. Can the workflow run deterministically in CI?
29. What happens if a model is unavailable?
30. What happens if a subagent fails?
31. What happens if context becomes too large?
32. Can the plugin stop safely?

---

# 33. Important Design Principle

The final system should behave like:

```text
                TEST INTELLIGENCE SYSTEM

        ┌─────────────────────────────────┐
        │        Main Orchestrator        │
        └────────────────┬────────────────┘
                         │
             ┌───────────▼───────────┐
             │   Task Classification │
             └───────────┬───────────┘
                         │
             ┌───────────▼───────────┐
             │ Delegation Decision   │
             └───────────┬───────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
           Inline              Subagent
              │                     │
              └──────────┬──────────┘
                         │
                         ▼
                    Execute Task
                         │
                         ▼
                      Validate
                         │
                  ┌──────┴──────┐
                  │             │
                PASS           FAIL
                  │             │
                next        classify
                                │
                       ┌────────┴────────┐
                       │                 │
                     simple           complex
                       │                 │
                    cheaper           escalate
                       │                 │
                       └────────┬────────┘
                                │
                                ▼
                              STOP
                                │
                                ▼
                           Final Report
```

The system should optimize for:

1. correctness;
2. developer trust;
3. safety;
4. maintainability;
5. useful behavioral coverage;
6. deterministic execution;
7. bounded autonomy;
8. context efficiency;
9. cost efficiency.

Not merely:

```text
lowest possible model cost
```

---

# 34. Definition of Done for the Plugin

Before broad team rollout, aim for:

- [ ] Existing Skills inventoried
- [ ] Existing behavior mapped
- [ ] Production-code modification prevented by default
- [ ] Permissions reviewed
- [ ] Autonomous loops bounded
- [ ] Test generation deterministic enough for CI
- [ ] Existing project conventions detected
- [ ] MFE architecture understood
- [ ] Incremental analysis supported
- [ ] Persistent test intelligence considered
- [ ] E2E inference labeled
- [ ] Test quality review implemented
- [ ] Flaky tests surfaced
- [ ] Cost/token usage observable
- [ ] Model routing is configurable
- [ ] Effort routing is configurable
- [ ] Delegation is conditional, not automatic
- [ ] Failure escalation exists
- [ ] CI mode defined
- [ ] Plugin versioning defined
- [ ] Golden regression corpus exists
- [ ] Representative 20+ MFE scenarios tested
- [ ] Marketplace installation tested from a clean environment
- [ ] Documentation exists for developers
- [ ] Rollback/disable strategy exists

---

# 35. Instruction to Claude Code

After reading this document:

**Do not immediately modify files.**

First:

1. inspect the current plugin;
2. inspect every Skill and agent;
3. inspect hooks and configuration;
4. produce an architecture inventory;
5. map the existing implementation to this document;
6. identify gaps and risks;
7. identify things that are already handled correctly;
8. identify unnecessary complexity;
9. propose a prioritized refactoring plan.

Only after that should implementation begin.

The objective is to evolve the existing testing system into a reliable, safe, cost-aware, marketplace-distributable **React/MFE Test Intelligence Plugin**, not to replace working functionality for the sake of architectural purity.
