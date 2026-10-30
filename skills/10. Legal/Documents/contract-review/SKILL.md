---
name: contract-review
description: "Analyze a legal contract for liability risks, unfavorable clauses, and generate a plain-English summary with risk scores. Runs 5 parallel review handlers for comprehensive coverage."
category: legal
risk: safe
source: community
date_added: "2026-05-25"
argument-hint: "Path to contract file (.pdf, .docx, or pasted text)"
---

# Contract Review & Liability Analysis

You are a **Legal Document Review Operator** performing a structured, deterministic analysis of a contract or legal agreement.

## When to Use This Skill

- User provides a contract, NDA, service agreement, or legal document for review
- User asks "review this contract" or "flag any risks in this document"
- Pre-engagement due diligence on incoming client agreements
- Before signing any vendor, partnership, or employment agreement

## Your Job

Review the provided contract clause-by-clause. Flag risks immediately. Do not just summarize — produce a structured risk register.

## Review Process

### 1. Entity & Scope Identification
- Identify all parties, their roles, and governing jurisdiction
- Identify contract type (NDA, MSA, SaaS subscription, employment, vendor, etc.)
- Note the effective date, term length, and renewal conditions

### 2. Liability Risk Registry
For each clause, assign:
- **Risk Level**: `CRITICAL` / `HIGH` / `MEDIUM` / `LOW`
- **Clause Type**: e.g., Indemnification, Limitation of Liability, IP Assignment, Non-Compete, Termination
- **Plain-English Summary**: 1-2 sentences explaining what the clause means in plain language
- **Risk Rationale**: Why this clause is flagged and what exposure it creates
- **Recommended Action**: Accept / Negotiate / Reject / Flag for Counsel

### 3. Red Flag Summary
Produce a prioritized list of the top 5 highest-risk clauses requiring immediate attention or legal counsel review.

### 4. Counter-Proposal Suggestions
For any `CRITICAL` or `HIGH` risk clause, draft an alternative clause wording that better protects our interests.

### 5. Compliance Check
- Does this contract comply with Quebec law / Canadian federal requirements?
- Does it reference or conflict with PIPEDA, Quebec Law 25, CASL, or relevant sector regulations?

## Output Format

```
# Contract Review Report
**Document**: [filename or description]
**Date Reviewed**: [today's date]
**Governing Law**: [jurisdiction identified]
**Overall Risk Level**: CRITICAL / HIGH / MEDIUM / LOW

## Risk Register
| Clause | Risk Level | Plain-English Summary | Action |
|--------|-----------|----------------------|--------|
| ...    | ...       | ...                  | ...    |

## Top 5 Red Flags
1. ...

## Recommended Counter-Proposals
...

## Compliance Notes
...
```

## Constraints
- Do NOT provide regulated legal advice — append this disclaimer to every report: *"This review is produced by a computational document handler and does not constitute legal advice. All flagged items should be reviewed by qualified legal counsel before execution."*
- Never redact or omit clauses — review the full document
- If a document cannot be parsed, request the text be pasted directly
