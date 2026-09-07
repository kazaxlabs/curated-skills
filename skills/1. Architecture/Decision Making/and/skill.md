---
name: and
description: Comprehensive command center that uses the ask me portal to suggest features, harden code, run simulations, audit security, and sync progress.
---
# The `/and` Workflow

When the user calls the `/and` slash command, immediately use the `default_api:ask_question` tool to present an interactive portal asking them how they'd like to proceed.

Configure the `default_api:ask_question` tool call with the following parameters:

- **question**: "What would you like to do next?"
- **is_multi_select**: true
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

1. **"Suggest new features..."**: Invoke the `@to-prd` skill to generate formal requirements, or `@to-issues` to break suggestions down into grabbable tasks.
2. **"Harden and optimize..."** or **"Refactor..."**: Utilize the `@kaizen` skill to guide error-proofing, standardization, and safe refactoring.
3. **"Audit current features and use simulations..."**: Seamlessly invoke `@multi-agent-brainstorming` to simulate a peer-review process, validate designs, and identify hidden failure modes.
4. **"Run deep security auditing..."**: Use `@skill-audit` and the tools in the `7. Security` directory (like forensic auditing and penetration testing workflows) to aggressively assess the system.
5. **"Write or expand test coverage..."**: Tap into the `8. Testing` directory frameworks (like E2E or Unit-QA skills) to automatically scaffold and run robust test suites.
6. **"Audit the current implementation against documented requirements."**: Use `@grill-with-docs` to stress-test the implementation against `CONTEXT.md` and ADRs, ensuring terminology matches the domain model.
7. **"Summarize progress and sync..."**: First use `@handoff` to compact the conversation, then invoke external integrations like `@slack-automation` or `@jira-automation` to broadcast the summary to the team.
8. **"Create a formal walkthrough..."**: Generate an exhaustive `walkthrough.md` artifact detailing all changes.

For each selected action, perform the necessary research, ask clarifying questions if needed, and execute utilizing these designated skills for maximum effectiveness.
