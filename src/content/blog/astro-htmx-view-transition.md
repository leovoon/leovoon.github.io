---
title: "Fix Astro HTMX View Transition"
description: "How to fix Astro HTMX View Transition Issue"
pubDate: "Oct 30 2023"
updatedDate: "Nov 1 2023"
tags: ["astro", "htmx"]
heroImage: "/src/assets/images/astro-background.jpg"
---

## Astro's New Feature: Using HTMX as Partials

With Astro latest feature, you can now use HTMX as [partials](https://docs.astro.build/en/core-concepts/astro-pages/#page-partials), adding an extra layer of dynamism to your projects. However, as i dive into this exciting new addition, i've encountered a little quirk that needs to be addressed.

## Issue: Unresponsive HTMX Elements During View Transitions

When navigating from one page to another using Astro's view transitions, i noticed that the elements with HTMX directives on the newly loaded page became unresponsive. This behavior was puzzling, but i soon discovered the root cause of the issue.

## Cause: `htmx.process` Doesn't Rerun on the New Page

The issue stemmed from the fact that when Astro performed a view transition to load a new page, HTMX's htmx.process wasn't automatically reinvoked on the newly loaded page. As a result, the HTMX elements on the new page weren't fully functional.

## Solution: Reinvoking htmx.process

Fortunately, there's a straightforward fix for this problem. 

Here's the code snippet you need to add:

```js
<script>
    document.addEventListener("astro:page-load", () => {
        htmx.process(document.body);
    });
</script>
```

What this script does is listen for the [`astro:page-load`](https://docs.astro.build/en/guides/view-transitions/#astropage-load) event, which Astro triggers every time a new page is loaded. When this event is detected, the script runs [`htmx.process(document.body)`](https://htmx.org/api/#process), effectively refreshing HTMX's functionality on the new page.

That's it! Hope this helps you out.