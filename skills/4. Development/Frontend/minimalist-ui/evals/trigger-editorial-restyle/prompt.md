---
description: A generic SaaS hero component to restyle into a calm, warm-monochrome editorial look. The skill should fire; the value rubric checks the skill's banned defaults (Inter, Lucide, emoji, cliché and placeholder copy, gradients, heavy shadows) and its border and text-colour rules, judged from the returned code (no rendering in the run).
tags: [trigger, value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

This is the hero and feature row for our crew-scheduling app for landscaping and snow-removal companies. Redo it so it feels like a calm, document-style workspace product, in the spirit of Notion or Linear: warm off-white, monochrome, crisp and flat, nothing loud. Send back the full updated component.

```jsx
import { Zap, Shield, Clock } from 'lucide-react';

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-600 to-purple-600 py-16 font-['Inter']">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h1 className="text-5xl font-bold text-white">🚀 Elevate your crew scheduling, seamlessly</h1>
        <p className="mt-4 text-lg text-blue-100">Unleash next-gen dispatching for your whole team.</p>
        <button className="mt-8 rounded-full bg-white px-8 py-3 text-blue-600 shadow-xl">Get started</button>
      </div>
      <div className="mt-16 grid grid-cols-3 gap-6 max-w-6xl mx-auto px-6">
        {[
          { icon: Zap, title: 'Fast booking', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing.' },
          { icon: Shield, title: 'Secure', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing.' },
          { icon: Clock, title: 'Real-time', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing.' },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-2xl bg-white p-6 shadow-lg text-black">
            <Icon className="h-6 w-6 text-blue-600" />
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="mt-2 text-gray-600">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```
