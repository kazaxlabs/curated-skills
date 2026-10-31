---
type: llm
---

The user wrote in Québécois French with several anglicisms (draft, canceller, events, bookés, weekend, checker, emails) and asked for a message to send to clients in Montréal. The reply should be in natural, professional Québec French and should gently correct the user's own anglicisms.

PASS if all of these hold:
- The reply is written in French.
- It gives a ready-to-send client message in natural, professional Québec French.
- It explicitly and kindly points out at least two anglicisms from the user's own message and gives the preferred Québec equivalent for each (for example draft to brouillon, canceller to annuler, events to événements, bookés to réservés, weekend to fin de semaine, checker to vérifier, emails to courriels).
- If the message mentions the weekend or email, it uses Québec terms ("fin de semaine", "courriel") rather than France-French ones ("week-end", "mail", "e-mail").

FAIL if any of these hold:
- The reply is in English.
- It fixes the wording silently in the message without pointing out any of the user's own anglicisms.
- The proposed message uses "week-end", "mail" or "e-mail".
- The corrections take over the reply as a long grammar lesson, or the tone toward the user is condescending.

Rubric history: v1 (2026-10-31).
