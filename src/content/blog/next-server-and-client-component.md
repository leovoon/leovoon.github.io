---
title: "Next.js React Server Component and Client Component"
description: "Confused about Next.js React Server Component and Client Component? Here is a quick note on the differences between them."
pubDate: "Aug 17 2023"
tags: ["next.js", "framework"]
---

Here's a brief explanation to clarify the distinction between Next.js React Server Components and Client Components.

## Client Component Within a Server Component
Everything within the "app" directory is considered a server component, unless specifically designated as a client component.

## Server Component Within a Client Component
Can we incorporate a server component within a client component? Yes, it's possible, but it requires utilizing the children pattern. When we import a server component into a client component marked as "use client," that server component will be rendered as a client component.

### Children Pattern
When working with a client component, we initialize a "children" prop. Subsequently, we include the server component as a child within the client component.

```js
// client-component.jsx
export default function ClientComponent({ children }) {
    return (
        <div>
            <h1>Client Component</h1>
            {children}
        </div>
    );
}
```

and in the parent component, we import the server component within the client component.

```js
// home.jsx
import ClientComponent from '@components/client-component';
import ServerComponent from '@components/server-component';

export default function Home() {
    return (
        <main>
            <ClientComponent>
                <ServerComponent />
            </ClientComponent>
        </main>
    );
}
```

## Context Provider Example
Wrapping a context provider around a server component doesn't inherently convert the component into a client component. The components within it will remain server components unless explicitly marked as 'use client'.