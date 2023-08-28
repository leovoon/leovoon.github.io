---
title: "Type getServerSideProps param in Next.js pages router"
description: "How to type the context parameter in the getServerSideProps function in Next.js"
pubDate: "Aug 26 2023"
tags: ["next.js", "framework"]
---


When using Typescript with Next.js, we may want to type the param in the context in the getServerSideProps function:

```js
// pages/[slug].tsx

import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
 
  // We don't know what is inside params
  const slug = ctx.params.slug;

 
  return {
    props: {},
  };
}
```

## The fix

We can fix this by extending the `ParsedUrlQuery` interface from the querystring module and pass it as a generic to the GetServerSideProps type.

```js
// pages/[slug].tsx

import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";


interface Params extends ParsedUrlQuery {
  slug: string;
}

export const getServerSideProps: GetServerSideProps<{}, Params> = async (ctx) => {
 
  // Typescript now knows that params has a slug 
  const slug = ctx.params.slug;

 
  return {
    props: {},
  };
}

```

Hope this helps you out!