---
title: 5 Ways to work with Data in Astro
description: "How to work with data in Astro 3.0"
pubDate: "Sep 20 2023"
tags: ["astro"]
---

## 1. Local frontmatter data
Define simple data in frontmatter and use it in your template

```js
---
const data = ["I" , "am", "data"]
---

<ul>
  {data.map((item) => (
    <li>{item}</li>
  ))}
</ul>

```

## 2. Fetch from Remote Data
Fetch remote data and use it in your template

```js
---
const data = await fetch("https://jsonplaceholder.typicode.com/users").then((res) => res.json());
---

<ul>
  {data.map((item) => (
    <li>{item.name}</li>
  ))}
```

## 3. Import local files 
You can import local files such as JSON or markdown and use it in your template

```js
import data from "./data.json";
```

you can also import files using [`Astro.glob`](https://docs.astro.build/en/guides/imports/#astroglob).

```js
import data from Astro.glob("./data/*.json");
```

## 4. Content Collections

Make a `content` folder, and a `data` folder inside of it. Now thats a collection called `data`. Each file in the `data` folder is an item in the collection.
To define collectinos, make a `config` file in the `content` folder. 
Here is how you do it:
```js

// 1. Import utilities from `astro:content`
import { defineCollection } from 'astro:content';
// 2. Define your collection(s)
const data = defineCollection({ 
  type: "data" // json or yaml
  schema: {
    name: String, // String, Number, Boolean, Date, Object, Array
  }
 });

 const data2 = defineCollection({ 
  type: "content" // markdown
 });
// 3. Export a single `collections` object to register your collection(s)
//    This key should match your collection directory name in "src/content"
export const collections = {
  data,
  data2
};
```
Then, to query the collection, you can use Astro `getCollection` api

```js
---
import { getCollection } from 'astro:content';
const data = await getCollection('data');
const data2 = await getCollection('data2');
---
```


## 5. From JSON endpoints (data to be used in client side components)
Inside `pages` folder, you can create a `.js` or `.ts` file to define an endpoint. 
```js

// You can grab from collections and pass it to the endpoint
import { getCollection } from 'astro:content';

const data = await getCollection('data');
export const GET = async({}) => {
  return new Responose(JSON.stringify(data), {
    headers: {
      'content-type': 'application/json'
    },
    status: 200,
    })
}
``` 
And use that in your React, Svelte or Vue components

```js
// .jsx file

// if the file named `data.js` is in the `pages` folder
const data = await fetch("/data").then((res) => res.json());
```

That's it. Hope this note was helpful to you.

References: 
[Astro Docs](https://docs.astro.build/en/guides/content-collections/)
[Video on How to work with data](https://www.youtube.com/watch?v=aS5id2273gY)
