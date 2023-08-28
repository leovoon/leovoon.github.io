---
title: "Why you should use cn() when writing Tailwind CSS" 
description: "How to resolves Tailwind class name conflicts with clsx and twMerge"
pubDate: "Aug 03 2023"
tags: ["tailwind"]
---


What is cn()? Well, cn() is a utility function that uses clsx and tailwind-merge to merge class names together. Tailwind-merge avoids class name conflicts, while clsx allows you to write conditional class names in an object style.

Make a utility function like this:

```js
import {twMerge} from 'tailwind-merge'
import {clsx, ClassValue} from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs))
}

```

With that, now you can write conditional class names like this:

```ts

return (
    <div className={cn('text-red-500', { 'text-blue-500': true })}>
        Hello World
    </div>
)

```

without worrying about class name conflicts. And how simplifies your code!

More info: [Tailwind Merge](https://github.com/dcastil/tailwind-merge), [clsx](https://github.com/lukeed/clsx)

Alternatively, do checkout [tailwind-variants](https://www.tailwind-variants.org/) that solves this problem in a different way.