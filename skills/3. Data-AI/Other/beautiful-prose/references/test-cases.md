<!-- Repaired for the business-owner pack, 2026-11; self-authored, not upstream. -->
# Beautiful Prose: Test Cases

Manual test cases for the lint checklist in `SKILL.md`. For each case, run the prompt with the skill active and check
the output against the listed failures. A case passes when none of its failure conditions is present. These are
review prompts for a person; they are not an automated test.

## Case 1: Em dashes

- Prompt: "Apply the Beautiful Prose skill. Write 150 words on why a workshop should be kept tidy."
- Fail if: the output contains "--" or an em dash used as punctuation.

## Case 2: Reversal pivot

- Prompt: "Apply the Beautiful Prose skill. REGISTER: cold_steel. Write 120 words on why price is rarely the real
  objection."
- Fail if: the output contains "It's not X, it's Y", "This isn't about X. It's about Y.", "Not X but Y", or "The real
  story is ...".

## Case 3: Filler transitions

- Prompt: "Apply the Beautiful Prose skill. DENSITY: lean. Explain in 100 words why deadlines slip."
- Fail if: the output contains any phrase from the banned filler list in `SKILL.md` ("At its core", "In today's
  world", "That said", "Ultimately", "It's important to note", and the rest).

## Case 4: Therapy voice

- Prompt: "Apply the Beautiful Prose skill. A reader writes that he is tired of his business. Answer in 120 words."
- Fail if: the output contains validating or therapeutic phrases ("I hear you", "That sounds hard", "Be kind to
  yourself", "Give yourself grace").

## Case 5: Meta commentary

- Prompt: "Apply the Beautiful Prose skill. LENGTH: short. Write about the first winter in a new trade."
- Fail if: the output talks about itself ("In this piece", "This essay explores", "We will discuss", "Here are the key
  takeaways") or apologises for its style.

## Case 6: Rhythm

- Prompt: "Apply the Beautiful Prose skill. LENGTH: medium. Describe a job site at dawn."
- Fail if: five consecutive sentences have similar length (count words; similar = within two words of each other).

## Case 7: Decorative triads

- Prompt: "Apply the Beautiful Prose skill. Write 120 words on what makes a good apprentice."
- Fail if: three or more "X, Y, and Z" lists appear where the third item adds no new meaning.

## Case 8: Register control

- Prompt: "Apply the Beautiful Prose skill. REGISTER: journalistic. HEAT: cool. Report in 150 words on a town council
  approving a new bylaw (invent no names, numbers or dates; use placeholders)."
- Fail if: clickbait cadence, invented names, numbers or dates, or a closing summary that restates the opening.

## Case 9: Silence beats slop

- Prompt: "Apply the Beautiful Prose skill. LENGTH: micro. Say something true about patience."
- Fail if: the output exceeds three sentences or pads with a hook.

## Case 10: Output rules

- Prompt: "Apply the Beautiful Prose skill. Write 200 words on maintenance."
- Fail if: headings or bullet points appear (none were requested), or the skill is acknowledged before the prose.
