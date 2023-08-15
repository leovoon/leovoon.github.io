---
title: "Quick comparison of Next, Nuxt and SvelteKit"
description: "Which framework should you use?"
pubDate: "Aug 15 2023"
heroImage: "/placeholder-hero.jpg"
tags: ["framework"]
---

Here is a quick note on the differences between Next.js, Nuxt.js and SvelteKit.
 I will be updating this post as I learn more about these frameworks. The notes may be simplified for brevity, so please refer to the [official docs](#references) for more information.

**Pages Routing**

![Next JS](https://img.shields.io/badge/Next-black?logo=next.js&logoColor=white&style=flat-square)


```js
pages/index.js → /
pages/blog/index.js → /blog
```

![Nuxtjs](https://img.shields.io/badge/Nuxt-002E3B?logo=nuxtdotjs&logoColor=#00DC82&style=flat-square)


```js
pages/about.vue  → /about
pages/posts/[id].vue  → /2
```

![Svelte Badge](https://img.shields.io/badge/Sveltekit-FF3E00?logo=svelte&logoColor=fff&style=flat-square)


```js
src/routes/+page.svelte → /
src/routes/blog/[slug]/+page.svelte → /blog/slug
```

___


**Layouts**

![Next JS](https://img.shields.io/badge/Next-black?logo=next.js&logoColor=white&style=flat-square)


```
Layout component with {children}
```

![Nuxtjs](https://img.shields.io/badge/Nuxt-002E3B?logo=nuxtdotjs&logoColor=#00DC82&style=flat-square)

```
~/layouts/default.vue with <slot/>
```

![Svelte Badge](https://img.shields.io/badge/Sveltekit-FF3E00?logo=svelte&logoColor=fff&style=flat-square)


```
+layout.svelte with <slot/>
```

___

**Linking**

![Next JS](https://img.shields.io/badge/Next-black?logo=next.js&logoColor=white&style=flat-square)

```
<Link href="/">Home</Link>
```

![Nuxtjs](https://img.shields.io/badge/Nuxt-002E3B?logo=nuxtdotjs&logoColor=#00DC82&style=flat-square)

```
<NuxtLink to="/about">About</NuxtLink>
```

![Svelte Badge](https://img.shields.io/badge/Sveltekit-FF3E00?logo=svelte&logoColor=fff&style=flat-square)

```
<a href="/">Home</a>
```

---

**API route**

![Next JS](https://img.shields.io/badge/Next-black?logo=next.js&logoColor=white&style=flat-square)


```js
// pages/api/hello.js

export default function handler(req, res) {
  res.json({ result: "hello world" });
}
```

![Nuxtjs](https://img.shields.io/badge/Nuxt-002E3B?logo=nuxtdotjs&logoColor=#00DC82&style=flat-square)


```js
// ~/server/api/hello.js

export default defineEventHandler(() => "Hello World!");
```

![Svelte Badge](https://img.shields.io/badge/Sveltekit-FF3E00?logo=svelte&logoColor=fff&style=flat-square)


```js
// src/routes/api/+server.js

export function GET() {
  return { result: "Hello World" };
}
```
___

**Middleware**

![Next JS](https://img.shields.io/badge/Next-black?logo=next.js&logoColor=white&style=flat-square)


Defined in middleware.js in the root directory

```js
export function middleware(request: NextRequest) {
  return NextResponse.redirect(new URL("/home", request.url));
}
```

![Nuxtjs](https://img.shields.io/badge/Nuxt-002E3B?logo=nuxtdotjs&logoColor=#00DC82&style=flat-square)


Defined in ~/middleware directory as `defineNuxtRouteMiddleware` or `definePageMeta({ middleware: [] })` in page component
```js
export default defineNuxtRouteMiddleware((to, from) => {
  // do something
})
```

![Svelte Badge](https://img.shields.io/badge/Sveltekit-FF3E00?logo=svelte&logoColor=fff&style=flat-square)


`hook.server.js` or `hook.client.js` (runs on client) in the root directory, `handle` function runs everytime server receives a request

```js
export function handle({ request, resolve }) {
  const response = await resolve(event);
  return response;
}
```

---

**Rendering**

_SSR_

![Next JS](https://img.shields.io/badge/Next-black?logo=next.js&logoColor=white&style=flat-square)


export an async `getServerSideProps` in a page, returns props to the page component

![Nuxtjs](https://img.shields.io/badge/Nuxt-002E3B?logo=nuxtdotjs&logoColor=#00DC82&style=flat-square)


server first, runs both on server and client

![Svelte Badge](https://img.shields.io/badge/Sveltekit-FF3E00?logo=svelte&logoColor=fff&style=flat-square)


server first, +page.js runs on client, +page.server.js runs on server only

_SSG_

![Next JS](https://img.shields.io/badge/Next-black?logo=next.js&logoColor=white&style=flat-square)


export an async `getStaticProps` in a page, returns props to the page component

![Nuxtjs](https://img.shields.io/badge/Nuxt-002E3B?logo=nuxtdotjs&logoColor=#00DC82&style=flat-square)


```js
export default defineNuxtConfig({
  "/": { prerender: true },
  // or
  ssr: false,
});
```

![Svelte Badge](https://img.shields.io/badge/Sveltekit-FF3E00?logo=svelte&logoColor=fff&style=flat-square)


Use `@sveltejs/adapter-static`, and in root +layout.js, add `export const prerender = true;`

___

**SEO and Meta**

![Next JS](https://img.shields.io/badge/Next-black?logo=next.js&logoColor=white&style=flat-square)


Modify `<head>` Metadata API (App router)
```js
export const metadata: Metadata = {
  title: "Next.js",
};
```

![Nuxtjs](https://img.shields.io/badge/Nuxt-002E3B?logo=nuxtdotjs&logoColor=#00DC82&style=flat-square)


Configure in `app.head` in `nuuxt.config.js`, or the `useHead`, `useSeoMeta`, `useServerSeoMeta` composable function and [nuxt components](https://nuxt.com/docs/getting-started/seo-meta#components).

![Svelte Badge](https://img.shields.io/badge/Sveltekit-FF3E00?logo=svelte&logoColor=fff&style=flat-square)


Return SEO-related data from page `load` functions, then use it (as `$page.data`) in a `<svelte:head>` in your root layout.



<h2 id="references">References</h2>

For more information, check out the official docs:
[Sveltekit](https://kit.svelte.dev/docs/introduction)
[Next](https://nextjs.org/docs)
[Nuxt](https://nuxt.com/docs/getting-started/routing)


To be continued.
