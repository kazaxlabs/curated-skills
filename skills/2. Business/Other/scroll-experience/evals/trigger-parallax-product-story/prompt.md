---
description: A janky parallax product-page story given inline as code. The skill should fire; the value rubric checks the skill's reduced-motion, mobile-reduction and content-first rules, judged from the reply alone (no rendering or device testing is possible in the run).
tags: [trigger, value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

We're launching a new e-bike and I want the product page to feel like those Apple product pages: as you scroll, the mountains in the background drift slowly, the bike slides in, and the specs reveal one by one. Here's my first attempt. It janks badly on my phone. How should I structure the scroll story, and what should the code look like?

```html
<section class="hero">
  <h1 class="reveal">Meet the Trailhead 2</h1>
  <a class="reveal cta" href="/preorder">Pre-order</a>
</section>
<section class="scene">
  <img class="mountains" src="mountains.webp" alt="">
  <img class="bike" src="bike.webp" alt="Trailhead 2 e-bike">
</section>
<section class="specs">
  <div class="reveal spec">90 km range</div>
  <div class="reveal spec">Mid-drive motor</div>
  <div class="reveal spec">19 kg frame</div>
</section>
```

```css
.reveal { opacity: 0; transition: opacity 0.6s; }
.scene { position: relative; height: 150vh; overflow: hidden; }
.mountains, .bike { position: absolute; }
```

```js
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  document.querySelector('.mountains').style.top = y * 0.5 + 'px';
  document.querySelector('.bike').style.left = y * 0.3 + 'px';
  document.querySelectorAll('.reveal').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.8) {
      el.style.opacity = 1;
    }
  });
});
```
