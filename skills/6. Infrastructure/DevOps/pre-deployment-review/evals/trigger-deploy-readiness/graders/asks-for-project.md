---
type: llm
---

PASS if the final message either starts a structured deploy-readiness review or, because no project files are present, asks for the project or names the concrete checks it will run (for example auth, secrets, deploy configuration, gates with exit codes).
FAIL if it declares the app ready to ship without having inspected any project, or gives only generic advice with no checks named.
