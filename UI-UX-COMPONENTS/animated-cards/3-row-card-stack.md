Product Requirements Document: Split-Layout Depth-Fade Hero

see mp4 reference to understand the visual effect "C:\Users\kazax\OneDrive\Videos\Screen Recordings\Screen Recording 2026-08-22 111219.mp4"

1. Component Architecture & Layout

Desktop Layout (Split-Screen): A full-width container split into two columns.

Left Column (Static): Dedicated to the primary typography, sub-copy, and dual call-to-action buttons.

Right Column (Interactive): Houses three vertically stacked, horizontal carousels.

Mobile Layout (Redesign): On viewports < 768px, the layout stacks vertically. The text content appears first, followed by the three carousels converted into standard, touch-swipeable horizontal lists without the depth-fade distortion.

Card Structure: Cards utilize adaptive aspect ratios to fit their respective image content naturally.

Spacing: A standard gap is maintained between all cards (no negative margin overlapping).

Background: The overarching hero section relies on a solid background color to ensure the blurred edges of the depth effect render cleanly.

2. Visual Design & Depth-Fade Logic (Desktop)

Local Center Focus: The focal point is the center axis of the right column. The card intersecting this axis receives transform: scale(1), opacity: 1, and filter: blur(0px).

Depth Effect: Cards flanking the center item scale down sequentially, drop in opacity, and apply a CSS blur (filter: blur(8px)) to simulate depth.

3. Interaction & Behavior Model

Infinite Looping: The horizontal carousels never hit a physical boundary. As a user scrolls, the content loops infinitely in a seamless rotation on both desktop and mobile.

Desktop Hover State (Unblurring): Hovering over any card within the right column removes the blur() filter and restores 100% opacity, signaling it is interactive while keeping its scaled-down structural size.

Desktop Scroll Jacking (1:1 Ratio):

Hovering over a row intercepts the vertical mouse wheel event (e.preventDefault()).

The vertical scroll delta is mapped at a strict 1:1 ratio to the horizontal axis (translateX) of that row, providing immediate, raw responsive movement.

Desktop Non-Interactive Default: Scrolling over the left column or outside the right column allows standard vertical browser scrolling.

Mobile Auto-Play: The three mobile carousels will automatically pan in a continuous infinite loop (recommended to alternate directions: row 1 left, row 2 right, row 3 left). The auto-play pauses immediately if the user touches or swipes a carousel.

Click Payload (Close-up & CTA): Clicking a focused or hovered card (or tapping on mobile) opens a close-up view of the image paired directly with a Call-to-Action, routing the user to the associated service page.

4. Technical Implementation Guidelines

Infinite Loop Rendering: Requires cloning the DOM nodes or utilizing a virtualized rendering loop at the beginning and end of the card arrays to create the illusion of a continuous track without layout thrashing.

Position Tracking (Desktop): Utilize IntersectionObserver or bounded scroll event listeners calculated specifically against the right column's bounding box to determine the active center card.

Performance: All visual transitions (transform, opacity, filter) and continuous scrolling animations must utilize GPU-accelerated CSS properties to maintain a strict 60fps, especially during the 1:1 scroll-jacking.

