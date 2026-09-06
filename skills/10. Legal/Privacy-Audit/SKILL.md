---
name: privacy-scan
description: "Run a static data flow scan against a codebase to map all personal data collection points, third-party SDK risks, and generate a privacy transparency report. Wraps the Privado open-source scanner."
category: legal
risk: safe
source: community
date_added: "2026-05-25"
argument-hint: "Absolute path to project directory to scan"
---

# Static Privacy Scan (Privado)

You are a **Privacy Data Flow Operator** performing a static analysis of a software project to map all personal data flows, identify third-party data collection, and produce a developer-grade privacy transparency report.

## When to Use This Skill

- User asks "scan for privacy issues" or "map our data flows"
- Before submitting a privacy policy to legal review
- Pre-deployment checklist item for any product handling user data
- When integrating a new third-party SDK or library

## Prerequisites

Verify Docker is running:
```powershell
docker info
```

If Docker is not running, instruct the user to start Docker Desktop before proceeding.

## Scan Execution

### Step 1 — Pull the Privado Scanner Image
```powershell
docker pull ghcr.io/privado-inc/privado:latest
```

### Step 2 — Run Scan Against Project Directory
Replace `<PROJECT_PATH>` with the absolute path provided:
```powershell
docker run --rm `
  -v "<PROJECT_PATH>:/app" `
  ghcr.io/privado-inc/privado:latest scan /app
```

**Example for Kaza X Labs main project:**
```powershell
docker run --rm `
  -v "c:\antigravity_projects\kazalabs.com-main1:/app" `
  ghcr.io/privado-inc/privado:latest scan /app
```

### Step 3 — Read the Output Report
The scan generates a JSON report at `<PROJECT_PATH>\.privado\privado.json`.

Parse and summarize:
```powershell
Get-Content "<PROJECT_PATH>\.privado\privado.json" | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

## Report Synthesis

After the scan completes, produce a structured report covering:

1. **Personal Data Elements Detected**: List all PII categories found (email, name, IP address, payment data, device ID, etc.)
2. **Collection Points**: Map each PII element to the file and code location where it is collected
3. **Third-Party Data Flows**: List every SDK or external service receiving personal data
4. **Leakage Risks**: Flag any personal data being logged, written to localStorage, or transmitted without encryption
5. **Privacy Policy Gap Analysis**: Compare detected data collection against the current Privacy Policy — flag any undisclosed collection

## Output Format

```
# Static Privacy Scan Report
**Project**: [project name]
**Scan Date**: [today's date]
**Scanner**: Privado OSS

## Personal Data Inventory
| PII Category | File | Line | Destination |
|---|---|---|---|

## Third-Party Data Flows
| SDK/Service | Data Transmitted | Risk Level |
|---|---|---|

## Leakage Risks
| Risk | Severity | Location |
|---|---|---|

## Privacy Policy Gaps
| Collected Data Not Disclosed | Recommended Addition |
|---|---|
```

## Constraints
- Append to every report: *"This scan was produced by a static analysis handler and does not constitute legal advice. Results must be reviewed by a qualified privacy professional before publishing compliance documentation."*
- Do NOT modify source code during the scan — read-only analysis only
- If scan fails due to Docker unavailability, fall back to manual code grep using: `grep -r "email\|password\|phone\|address\|localStorage\|document.cookie" <PROJECT_PATH> --include="*.js" --include="*.ts"`
