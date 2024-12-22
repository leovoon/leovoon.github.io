---
title: Leading zeros in Liquid using forloop.index
description: How to format numbers with leading zeros in Liquid using
  forloop.index, prepend, and slice filters
pubDate: 2024-12-22T19:13:00.000Z
updatedDate: 2024-12-22T19:15:00.000Z
tags: []
---
The expression `{{ forloop.index | prepend: '00' | slice: -2, 2 }}` is a clever way to display two-digit numbers with leading zeros in Liquid. Let's break it down:

* forloop.index - Gives us the current iteration number (1, 2, 3, etc.)
* prepend: '00' - Adds "00" to the beginning of the number (001, 002, etc.)
* slice: -2, 2 - Takes only the last 2 digits from the right


This is particularly useful when you need to display numbered items in a consistent format, like:

* Product variations (01, 02, 03)

* Ordered lists (01, 02, 03)
