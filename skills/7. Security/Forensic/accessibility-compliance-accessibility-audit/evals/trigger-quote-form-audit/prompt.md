---
description: An accessibility compliance audit of an inline HTML page. The skill should fire. The skill expects automated scans (axe) and manual assistive-technology checks, which the run cannot perform, so the value rubric grades the audit method in the reply (scope, WCAG criterion mapping with severity, and a named re-test plan) rather than scan output.
tags: [trigger, value]
runs: 3
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

We're bidding on a municipal contract and the city wants proof that our website is accessible. Our quote request page is below. Audit it and tell us what has to change.

```html
<!DOCTYPE html>
<html>
<head>
  <title>Page</title>
  <style>
    *:focus { outline: none; }
    .hint { color: #999999; }
    .btn { background: #F5A623; color: #FFFFFF; padding: 12px 24px; cursor: pointer; }
    .required { border: 1px solid red; }
  </style>
</head>
<body>
  <div class="nav">
    <div onclick="go('/')">Home</div>
    <div onclick="go('/services')">Services</div>
    <div onclick="go('/fr/')">FR</div>
  </div>
  <img src="crew-at-work.jpg">
  <h3>Request a free estimate</h3>
  <form id="quote">
    <input class="required" type="text" placeholder="Full name">
    <input class="required" type="email" placeholder="Email">
    <select>
      <option>Choose a service</option>
      <option>Roofing</option>
      <option>Insulation</option>
    </select>
    <p class="hint">Fields outlined in red are required.</p>
    <div class="btn" onclick="submitQuote()">Send request</div>
  </form>
  <div id="toast" style="display:none">Thanks, we'll be in touch within 2 business days.</div>
  <script>
    function submitQuote() {
      // posts the form, then:
      document.getElementById('toast').style.display = 'block';
    }
  </script>
</body>
</html>
```
