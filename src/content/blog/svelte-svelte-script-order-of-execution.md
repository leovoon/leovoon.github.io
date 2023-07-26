---
title: "Understanding the Order of Execution of Svelte"
description: "Which Svelte script block runs first?"
pubDate: "July 24 2023"
heroImage: "/placeholder-hero.jpg"
tags: ["svelte"]
---

I learned something new about Svelte today.  Here's the order of execution in Svelte:

1. `<script>`: This is executed first, before any other code. Any JavaScript code inside the `<script>` tag gets executed as it is encountered. This includes function declarations, variable initializations, and direct function calls.

2. `$:`: Reactive statements run after other script code and before the component markup is rendered, whenever the values that they depend on have changed. They are not executed immediately but instead they wait until all other script code has finished running.

3. `use:action`: Actions are functions that are run when an element is added to the DOM. They are executed when a specific element (where the action is applied) is created and added to the DOM. This can happen before any lifecycle hooks if the element is part of the initial markup, or it can happen later if the element is added conditionally or as part of a list.


4. `onMount`: The onMount function is a lifecycle hook that is executed after the component has been rendered and added to the DOM. This is usually the last part of the initial component setup. The callback in onMount will only be called once the component is first rendered.

Here's a simplified example to illustrate this order:

```svelte
<script>
  import { onMount } from 'svelte'
  
  console.log('1. <script>')
  
  $: console.log('2. $: reactive statement')
  
  function myAction(node) {
    console.log('3. use:action')
  }
  
  let myElement
  let myElement2
  
  onMount(() => {
    console.log('4. onMount')
  })
</script>

<div use:myAction bind:this={myElement}>Hello!</div>
<div bind:this={myElement2}>Hello again!</div>

```

Output:
```javascript
"1. <script>"
"2. $: reactive statement"
"3. use:action"
"4. onMount"
```

Reference: [Week in Svelte](https://www.youtube.com/watch?v=AG4_3kon3zU)

Hope this helps someone else out there.  Cheers! 🍻