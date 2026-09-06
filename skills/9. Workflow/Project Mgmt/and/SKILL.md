---
name: and
description: Comprehensive command center that uses the ask me portal to suggest features, harden code, run simulations, audit security, and sync progress.
---
# The `/and` Workflow

When the user calls the `/and` slash command, immediately use the `AskUserQuestion` tool to present an interactive portal asking them how they'd like to proceed.

Configure the `AskUserQuestion` tool call with the following parameters:

- **question**: "What would you like to do next?"
- **multiSelect**: true
- **options**:
  - "Suggest new features to add to the project."
  - "Harden and optimize the features that are already implemented."
  - "Audit current features and use simulations to find flaws."
  - "Run deep security auditing and penetration testing."
  - "Refactor existing code to improve maintainability."
  - "Write or expand test coverage for recent changes."
  - "Audit the current implementation against documented requirements."
  - "Summarize progress and sync to external platforms (Slack/Jira)."
  - "Create a formal walkthrough document for recent changes."

**Execution:**
Wait for the user's response from the modal. Once the response is received, execute the selected actions (or any custom write-in response) iteratively by heavily leveraging the specialized skills available in the workspace.

When executing the selected actions, follow these guidelines:

1. **"Suggest new features..."**: Invoke the `product-manager` or `brainstorming` skill to generate ideas, then the `product-inventor` skill to flesh them into formal requirements, or `github-issue-creator` to break suggestions into grabbable tasks.
2. **"Harden and optimize..."** or **"Refactor..."**: Utilize the `kaizen` skill to guide error-proofing, standardization, and safe refactoring. Follow up with `clean-code` and `code-simplifier`.
3. **"Audit current features and use simulations..."**: Invoke `multi-agent-brainstorming` to simulate a peer-review process, validate designs, and identify hidden failure modes.
4. **"Run deep security auditing..."**: Use the `security-auditor`, `security-audit`, and tools in the `7. Security` category (forensic auditing, penetration testing workflows) to aggressively assess the system.
5. **"Write or expand test coverage..."**: Tap into `e2e-testing`, `tdd-workflow`, and `unit-testing-test-generate` skills to automatically scaffold and run robust test suites.
6. **"Audit the current implementation against documented requirements."**: Use `spec-to-code-compliance` to stress-test the implementation against documented requirements and ADRs, ensuring the code matches the domain model.
7. **"Summarize progress and sync..."**: Use `context-management-context-save` to compact the conversation summary, then invoke `slack-automation` or `jira-automation` to broadcast to the team.
8. **"Create a formal walkthrough..."**: Generate an exhaustive `walkthrough.md` artifact detailing all recent changes, decisions, and architecture notes.

For each selected action, perform the necessary research, ask clarifying questions if needed, and execute utilizing these designated skills for maximum effectiveness.
