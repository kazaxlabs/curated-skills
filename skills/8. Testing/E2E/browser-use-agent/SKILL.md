---
name: browser-use-agent
description: "Local, self-hosted browser automation agent using the open-source browser-use framework and Gemini 2.5 Flash, running on the user's authenticated Chrome Default profile."
category: browser-automation
risk: safe
source: personal
date_added: "2026-05-22"
---

# Local Browser-Use Automation Agent

This skill enables Antigravity to run secure, local, self-hosted browser automation, testing, and interaction workflows on the user's machine using `browser-use` and their authenticated Chrome session.

## Core Setup Architecture

The browser automation setup uses the following architecture to completely bypass Google's strict profile lock policies and anti-bot systems:
- **Port-hijacking CDP:** Launches Chrome in debugging mode on remote port `9222`.
- **Windows Short Paths:** Uses the `C:\Users\kazax\AppData\Local\Google\Chrome\USERDA~1` trick to bypass locks.
- **Authenticated Profile:** Hooks directly into the user's active, fully-synced Chrome profile (`--profile-directory=Default` linked to `kazaxlabs@gmail.com`).
- **Native ChatGoogle:** Leverages `browser_use.llm.ChatGoogle` natively to ensure tool calling and structured output are 100% compliant, bypassing typical Pydantic/LangChain schema errors (such as the cryptic `items` failure).

## When to Use This Setup

Use this setup whenever you need to:
- Test web applications locally under the user's authenticated session.
- Automate interactive browser-based testing.
- Inspect, click, or scrape secure pages that require full Google account authentication.
- Accomplish multi-step workflows in Chrome hands-free.

---

## Instructions for Antigravity (Step-by-Step)

Whenever the user requests browser testing or automation, follow these exact steps to execute the task:

### 1. Close Existing Chrome Processes
Chrome cannot boot with remote debugging enabled on port `9222` if it is already running. Forcefully terminate active Chrome processes first:
```powershell
Stop-Process -Name chrome -Force -ErrorAction SilentlyContinue
```

### 2. Configure the Task in the Script
The main automation script is located at:
[local_agent.py](file:///C:/Users/kazax/.gemini/antigravity-ide/scratch/local_agent.py)

Modify the `task` variable in `local_agent.py` to state exactly what you want the agent to do. For example:
```python
agent = Agent(
    task="Navigate to your target URL, click the login button, and verify the page contents.",
    llm=llm,
    browser=browser
)
```

### 3. Run and Monitor the Agent
Run the script locally in the workspace using PowerShell:
```powershell
python C:\Users\kazax\.gemini\antigravity-ide\scratch\local_agent.py
```
Monitor the execution logs at:
`C:\Users\kazax\.gemini\antigravity-ide\brain\<conversation-id>\.system_generated\tasks\` or print them directly to verify that the agent successfully accomplishes the task.

---

## Key Configurations & Guardrails

> [!IMPORTANT]
> - **Model Integration:** Always use `ChatGoogle` natively from `browser_use.llm` initialized with `model="gemini-2.5-flash"` and `api_key=os.environ.get("GEMINI_API_KEY")`. Do not use generic LangChain classes like `ChatGoogleGenerativeAI` as they fail on Pydantic schemas.
> - **API Key:** Ensure `GEMINI_API_KEY` is loaded from the `.env` file in the main repository: [C:\Users\kazax\Downloads\kazalabs.com-main\kazalabs.com-main\.env](file:///C:/Users/kazax/Downloads/kazalabs.com-main/kazalabs.com-main/.env).
> - **Profile Directory:** Always specify `--profile-directory=Default` when spawning Chrome to ensure it boots into the logged-in Google profile.
