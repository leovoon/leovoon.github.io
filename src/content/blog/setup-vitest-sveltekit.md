---
title: "Setup vitest with SvelteKit"
description: "Learn how to setup vitest in SvelteKit project to test your svelte component."
pubDate: "Jan 31 2024"
tags: ["sveltekit", 'vitest']
---

In this article, let's learn how to set up vitest in a SvelteKit project to run tests for our Svelte component. Let's get right in.

Assume that you already have SvelteKit set up. If not, you can follow [this tutorial](https://kit.svelte.dev/docs/creating-a-project) to set up SvelteKit.

### Install vitest and dependencies
```bash
npm install --save-dev \
  @testing-library/svelte \
  @testing-library/jest-dom \
  @sveltejs/vite-plugin-svelte \
  vitest \
  jsdom
```
### Configure Vite config file
Inside your Vite config file, 

Replace default vite config import to use vitest config.
```js
import { defineConfig } from 'vitest/config';
```
Add the `test` config as follows:

```js
	test: {
		environment: 'jsdom',
		setupFiles: ['src/vitest.setup.ts'],
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
```

For the `environment`, you can choose from various environments like jsdom, happydom, and so on. For more information, refer to the [vite documentation](https://vitest.dev/guide/environment). In this article, we will use the jsdom environment.


### Fix onMount isn't called when rendering components
There is an issue with the svelte onMount failing when running tests. There is an [open issue](https://github.com/testing-library/svelte-testing-library/issues/222) for that if you want to track it. For now, you can fix it by adding the following workaround to your vite config file. We create a vite plugin that adds the browser condition to the vite default resolve conditions.

And your `vite.config.ts` file should look like this.

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';

const add_browser_onmount: Plugin = {
	name: 'vite-plugin-onmount',
	config(config) {
		if (process.env.VITEST) {
			if (!config.resolve?.conditions) {
				if (!config.resolve) {
					config.resolve = {};
				}
				config.resolve.conditions = [];
			}
			config.resolve.conditions.unshift('browser');
		}
	}
};

export default defineConfig({
	plugins: [sveltekit(), add_browser_onmount],
	test: {
		environment: 'jsdom',
		setupFiles: ['src/vitest.setup.ts'],
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});

```


### Create vitest setup file
Create a file called vitest.setup.ts or any name you like in the src folder or any appropriate location. Add the following import.

```ts
import '@testing-library/svelte/vitest';
import '@testing-library/jest-dom/vitest';
```

That's it; you are ready to write your first test.

### Create a Svelte component to test
Create a file called `Test.svelte` in the src folder or any appropriate location. Add the following code.

```svelte
<script lang="ts">
	import { onMount } from 'svelte';

	let count = 0;

	onMount(() => {
		count++;
	});
</script>

{count}
```

### Write your first test
Create a file called `Test.svelte.test.ts` in the `src` folder or any appropriate location. Add the following import.

```ts
import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Test from './Test.svelte';

it('correctly calls onMount', () => {
	render(Test);
	expect(screen.getByText('1')).toBeInTheDocument();
});
```

### Run your test
Add the following script to your package.json file.

```json
	"scripts": {
		"test": "vitest run",
		"test:ui": "vitest --ui",
		"test:watch": "vitest"
	}
```
and run the following command in your terminal.

```bash
npm run test
```

You should see something similar to this in your terminal.

```bash
 PASS  src/Test.svelte.test.ts
  ✓ correctly calls onMount (2 ms)
```

Thanks to [paoloricciuti](https://github.com/paoloricciuti) for covering this topic on the Weekly Svelte. Here is his [video version](https://www.youtube.com/watch?v=_SraKYKkQAc&list=LL&index=4)

That's it. Hope it helps you. Happy testing 😇! 