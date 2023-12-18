---
title: "Setup UnoCSS with SvelteKit" 
description: "Write your SvelteKit app styles with UnoCSS"
pubDate: "Dec 18 2023"
tags: ["sveltekit", "unocss"]
---

## What is UnoCSS?
Unocss is a utility-first CSS framework that is alternative to Tailwind CSS.

## How to setup UnoCSS with SvelteKit
In this tutorial, we will be using JavaScript. If you want to use TypeScript, you can follow the same steps but with TypeScript.

Here is a playground for you to try out.
[Sveltekit + UnoCSS Playground](https://stackblitz.com/edit/sveltejs-kit-template-default-nrlgop?file=src%2Froutes%2F%2Bpage.svelte)

### Install dependencies
```bash
npm install -D unocss @unocss/svelte-scoped/vite
```

### Create a unocss.config.js file
Here we will be using the default preset. More about preset [here](https://unocss.dev/guide/presets).
```js
import { defineConfig, presetUno } from 'unocss';

export default defineConfig({
	presets: [presetUno()],
});

```

### Config the Vite plugin
In your `vite.config.js` file, add the [`svelte-scoped`](https://unocss.dev/integrations/svelte-scoped#vite-plugin)
 UnoCSS plugin. This allow UnoCSS to be used scoped styles in your SvelteKit app.
```js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import UnoCSS from '@unocss/svelte-scoped/vite';

export default defineConfig({
	plugins: [sveltekit(), UnoCSS()]
});

```

### Make change to app.html
In your `app.html` file, add `%unocss-svelte-scoped.global%`to the `<head>` tag as shown below.
```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="%sveltekit.assets%/favicon.png" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		%unocss-svelte-scoped.global%
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
```


### Inject UnoCSS into your SvelteKit app
In your hooks.server.js file, create one if you don't have one, under the `src` folder.
In below example, I use sequence so that we could chain multiple hooks together if needed.
```js
import { sequence } from '@sveltejs/kit/hooks';

export const unocssInject = async ({ event, resolve }) => {
	const response = await resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace('%unocss-svelte-scoped.global%', 'unocss_svelte_scoped_global_styles')
	});
	return response;
};

export const handle = sequence(unocssInject);

```

There you go! Now you can use UnoCSS in your SvelteKit app!

### Example
<table><thead><tr><th>Supported Syntax</th><th>Example</th></tr></thead><tbody><tr><td>Class attribute</td><td><code>&lt;div class="mb-1" /&gt;</code></td></tr><tr><td>Class directive</td><td><code>&lt;div class:mb-1={condition} /&gt;</code></td></tr><tr><td>Class directive shorthand</td><td><code>&lt;div class:logo /&gt;</code></td></tr><tr><td>Class prop</td><td><code>&lt;Button class="mb-1" /&gt;</code></td></tr></tbody></table>

Try it out.

```js
// uno.config.js
export default defineConfig({
	presets: [
		presetUno()
		// ...custom presets
	],
	shortcuts: {
		foo: 'bg-red-500 text-white'
	}
});
```


```js
// Demo.svelte
<script>
 let foo = false
</script>


<p class:foo>
    Change me
</p>
<button on:click={() => foo = !foo}>Toggle style</button>
```


### More info about preset
For more info about UnoCSS preset, check out the [UnoCSS Preset](https://unocss.dev/guide/presets)

Thanks for reading!