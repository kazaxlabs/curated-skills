---
type: llm
---

The user pasted whitepaper section 3 (3.1 deposits, 3.2 withdrawals with a 0.5% fee, 3.3 owner-only fee changes capped at 1%) and a numbered Solidity contract, and asked whether the code does exactly what the paper says. Known divergences: line 29 divides by 1000, so a fee of 50 is 5% instead of 0.5%; setFee (lines 34-36) has no 1% cap; emergencyWithdrawAll (lines 38-40) is not described anywhere in the paper.

PASS if all of these hold:
- It finds both the fee math divergence (5% charged versus 0.5% specified) and the missing 1% cap on setFee.
- It gives a per-requirement mapping covering 3.1, 3.2 and 3.3 in which each requirement has the spec text (quoted or cited by section), the code line number(s), an explicit match classification (such as full match, partial match, mismatch, missing in code, code weaker than spec), and a numeric confidence score.
- It explicitly classifies emergencyWithdrawAll as behaviour the paper does not document (an undocumented code path), not only as a generic security risk.
- Each divergence gets a severity level (critical, high, medium or low) and a remediation.

FAIL if any of these hold:
- It misses the 5%-versus-0.5% fee divergence or the missing 1% cap.
- There is no per-requirement mapping, or the mappings carry no confidence score.
- emergencyWithdrawAll is not mentioned, or is not identified as absent from the paper.
- It asserts behaviour that is in neither the paper nor the code (for example an assumed timelock, multisig or prior audit).

Rubric history: v1 (2026-10-31).
