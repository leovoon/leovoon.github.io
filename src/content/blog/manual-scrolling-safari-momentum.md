---
title: iOS Safari Momentum Scrolling Issues
description: Learn how to solve the problem of setting scrollTop during momentum scrolling in iOS Safari with a simple JavaScript workaround
pubDate: 2025-5-28T19:35:00.000Z
tags:
  - javascript
  - safari
  - ios
  - mobile
---

# Handling iOS Safari Momentum Scrolling Issues

If you've ever developed a web application with custom scrolling behavior, you might have encountered a frustrating issue specific to iOS Safari: **you cannot manually set `scrollTop` while momentum (inertial) scrolling is ongoing**.

## The Problem

On iOS Safari, when a user performs a swipe gesture that initiates momentum scrolling, any JavaScript attempts to set `scrollTop` or `scrollLeft` values are effectively ignored until the momentum scrolling naturally completes. This creates problems for:

- Scroll-based animations
- Custom scroll behaviors
- Scroll position synchronization between elements
- Scroll-triggered events that manipulate scroll position

The root cause is that iOS Safari's momentum scrolling happens at the OS level, outside of JavaScript's control. The browser's JavaScript sandbox cannot interrupt or override the native momentum scrolling behavior.

## A Simple Workaround

Fortunately, there's an elegant workaround that forces iOS Safari to stop momentum scrolling immediately, allowing your JavaScript to take control of the scroll position:

```javascript
const workaroundIosMomentumScroll = (element, doWhateverYouWant) => { 
  element.style.overflow = 'hidden';  // Disable scrolling (stop momentum) 
  doWhateverYouWant();                // Run your logic here 
  element.style.overflow = 'auto';    // Re-enable scrolling 

  setTimeout(() => { 
    // Optional: code to run after scroll is stable 
  }, 0); 
}; 
```