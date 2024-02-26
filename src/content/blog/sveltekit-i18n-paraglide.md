---
title: "How to setup i18n in SvelteKit using Paraglide"
description: "Multi language in Sveltekit using paraglide-js adapter"
pubDate: "February 23 2024"
tags: ["sveltekit", "i18n", "inlang", "paraglide"]
---

## Internationalize Your SvelteKit App with Paraglide

Internationalizing (i18n) your apps lets you reach a wider audience. Paraglide and its SvelteKit Adapter make it easy to add multilingual support to your SvelteKit project.

### Prerequisites

An existing SvelteKit project. If you need to start one, refer to SvelteKit's getting [started guide](https://kit.svelte.dev/docs/introduction)

Basic knowledge of Paraglide. Set up Paraglide using their documentation if needed: 

### Steps

#### Install the Vite plugin:


```bash
npm i -D @inlang/paraglide-js-adapter-sveltekit
```
Then add it to your `vite.config.js` file:

```js
import { paraglide } from "@inlang/paraglide-js-adapter-sveltekit/vite"

export default defineConfig({
    plugins: [
        paraglide({
            project: "./project.inlang",
            outdir: "./src/paraglide",
        }),
        sveltekit(),
    ],
})
```

#### Add import alias (optional)
Add alias in `svelte.config.js`
```js
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		alias: {
			$paraglide: './src/paraglide',
			$lib: './src/lib'
		}
	}
};
```

#### Initialize the Adapter:

Create a file `(e.g., src/lib/i18n.js)` and add the following:

```js
import { createI18n } from "@inlang/paraglide-js-adapter-sveltekit"
import * as runtime from "$paraglide/runtime.js"

export const i18n = createI18n(runtime);
```

#### Add the ParaglideJS component:

Modify your root layout file `(src/routes/+layout.svelte)`:

```js
<script>
    import { ParaglideJS } from '@inlang/paraglide-js-adapter-sveltekit'
    import { i18n } from '$lib/i18n.js'
</script>

<ParaglideJS {i18n}>
    <slot />
</ParaglideJS>
```

#### Add the reroute hook:

In your src/hooks.js file:

```js
import { i18n } from '$lib/i18n.js'
export const reroute = i18n.reroute()
```

#### Create languages settings
Add a `project.inlang` folder in your root.
Create a `settings.json` file to this new directory `project.inlang/settings.json`.
In module, add the rules and plugins you want to use. Read more about what inlang's recommended [rules and plugins](https://inlang.com/g/00162hsd/guide-nilsjacobsen-whatArePlugins) are.

Here's an example of `setting.json`:
```json
{
	"$schema": "https://inlang.com/schema/project-settings",
	"sourceLanguageTag": "en",
	"languageTags": ["en", "zh"],
	"modules": [
		"https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-empty-pattern@latest/dist/index.js",
		"https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-missing-translation@latest/dist/index.js",
		"https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-without-source@latest/dist/index.js",
		"https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-valid-js-identifier@latest/dist/index.js",
		"https://cdn.jsdelivr.net/npm/@inlang/plugin-message-format@latest/dist/index.js",
		"https://cdn.jsdelivr.net/npm/@inlang/plugin-m-function-matcher@latest/dist/index.js"
	],
	"plugin.inlang.messageFormat": {
		"pathPattern": "./messages/{languageTag}.json"
	}
}

```
In the above example, we specify the messages path pattern and the language tags. Create a `messages` folder in the root and add the language files. For example, `messages/en.json` and `messages/zh.json`.

```json
// messages/en.json
{
    "$schema": "https://inlang.com/schema/inlang-message-format",
    "heading": "Hello world",
}
```


#### Update build script
Update the build script in your `package.json` to include the `paraglide` command:

```json
"scripts": {
		"build": "paraglide-js compile --project ./project.inlang && vite build",
		"postinstall": "paraglide-js compile --project ./project.inlang"
	},
```
And run a fresh install to compile the project.

That's it! Your SvelteKit app now has i18n routing.

Clone locally and test it out:
[Stackblitz - example](https://stackblitz.com/~/github.com/LorisSigrist/paraglide-sveltekit-example)

### How to use?
Make sure [`inlang – i18n supercharged`](https://marketplace.visualstudio.com/items?itemName=inlang.vs-code-extension) VSCode extension is installed.

Make sure the paraglide settings in the `paraglide.inlang/settings.json` are configured.

Invoke the function in the template. Hover over it to use the extension to update the content.

```js
<script>
	import * as m from "$paraglide/messages"
</script>

<svelte:head>
	<title>{m.home()}</title>
</svelte:head>

<section>
	<h1>
		{m.heading()}
	</h1>
</section>
```

### Advanced Setup & Considerations

Visit the official [Paraglide Adapter documentation](https://inlang.com/m/dxnzrydw/library-inlang-paraglideJsAdapterSvelteKit#1-add-the-vite-plugin) for in-depth explanations of SEO setup, excluding routes, translated paths, language switchers, and more. 

### Updating adapter
Take note for upcoming update. Follow the [changelog](https://github.com/opral/monorepo/tree/5aeebe6fb22d4fed4bc6b4d4ba6ad7a98693b6d9/inlang/source-code/paraglide/paraglide-js-adapter-sveltekit
) here:
