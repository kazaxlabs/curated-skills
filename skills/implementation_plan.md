# HorizontalDepthFade Mobile Refactoring Plan

## Audit Findings from Mobile Design Skills

Based on the audit of `mobile-design`, `ui-ux-pro-max`, `frontend-mobile-development-component-scaffold`, and `mobile-developer` skills, here are the critical issues with the current `HorizontalDepthFade` component:

1. **Scroll-Jacking & Pinning on Mobile (CRITICAL):**
   - *mobile-design:* "Mobile is NOT a small desktop... Muscle memory broken."
   - Forcing users to scroll vertically to move horizontally via a pinned section breaks the native mental model on mobile. Touch users expect to swipe left/right to browse carousels. The current `pin: true` locks the screen and frustrates users.
2. **Missing Touch Optimization (CRITICAL):**
   - *mobile-design:* "Touch-first... Fitts' Law." 
   - *ui-ux-pro-max:* "Hover vs Tap - Use click/tap for primary interactions."
   - The current component relies entirely on `mouseenter` and `mouseleave` to clear the blur and focus on a card. Mobile devices have no hover, leaving users with a degraded experience where they cannot focus on individual cards without unpredictable tap behaviors.
3. **Card Sizing & Layout (HIGH):**
   - *ui-ux-pro-max:* "Responsive Layout... Ensure content fits viewport width."
   - The hardcoded sizes (`itemWidth = 220`, plus 32px padding) dominate small mobile screens, leaving no visual cue ("peek") that more items exist off-screen.

## Proposed Changes

To align with the "Mobile-First · Touch-First" philosophy, we will split the component's behavior using GSAP's `gsap.matchMedia()`:

### 1. Desktop Behavior (≥ 768px)
- **Keep Current Behavior:** Maintain the pinned `ScrollTrigger` that converts vertical scroll to horizontal scrub.
- **Hover Mechanics:** Keep `mouseenter`/`mouseleave` for focusing individual cards.

### 2. Mobile Behavior (< 768px)
- **Native Horizontal Swipe:** Remove the pinned `ScrollTrigger`. Convert the container to a native horizontal scroll view (`overflow-x-auto`, `snap-x snap-mandatory`). 
- **Center-Focus (No Hover):** Since hover doesn't exist, we will use a native scroll event (or `IntersectionObserver` / GSAP `ScrollTrigger` attached to the horizontal container) to automatically calculate which card is closest to the center of the screen, and bring that card into sharp focus (0 opacity on the blur layer) while blurring the peripheral cards.
- **Responsive Dimensions:** Expose CSS variables or adapt the `itemWidth` dynamically on mobile to ensure at least 1.5 cards are visible at a time, providing a visual cue to swipe.

### 3. Implementation Details for `HorizontalDepthFade.tsx`

- **[MODIFY] `src/components/motion/HorizontalDepthFade.tsx`**
  - Wrap the GSAP animation logic in `gsap.matchMedia()`.
  - Provide a desktop media query `"(min-width: 768px)"` that initializes the pinned ScrollTrigger.
  - Provide a mobile media query `"(max-width: 767px)"` that:
    - Adds `overflow-x-auto snap-x` to the viewport.
    - Adds a scroll listener to the native horizontal container to dynamically update the `boostedIntensity` based on the item's position relative to the center of the screen (similar to `applyState`, but reading `viewport.scrollLeft`).
  - Update touch handlers to ensure tapping a blurred card smoothly brings it into focus or handles navigation.

## User Review Required

> [!WARNING]
> **UX Change:** On mobile, users will no longer scroll vertically to scrub through the gallery. Instead, they will swipe horizontally (like a standard carousel or Instagram gallery), and the card closest to the center of the screen will automatically come into focus. 
> 
> Are you comfortable with this divergence between desktop (pinned vertical scrub) and mobile (native horizontal swipe)?

## Verification Plan

### Manual Verification
- Deploy to a local dev environment.
- Use Chrome DevTools Device Mode (or a real mobile device) to verify:
  1. The section no longer pins on mobile, allowing normal vertical page scrolling.
  2. The cards can be swiped horizontally.
  3. The center card dynamically un-blurs as it enters the middle of the screen.
  4. Desktop behavior remains unchanged.
