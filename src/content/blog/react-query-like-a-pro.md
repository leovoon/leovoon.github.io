---
title: "React Query Like a Pro: Parallel, dependent, and deferred queries"
description: "Learn how to use React Query to manage your application's data like a pro."
pubDate: "July 12 2023"
tags: ["react"]
---

React Query is a powerful library that makes fetching and caching data in React applications easy. It provides a unified API for data fetching that works with any backend, and it supports a wide range of features, such as optimistic updates, retries, and polling.

In this blog post, I'll show you how to use React Query to perform parallel, dependent, and deferred queries. I'll also cover the topics of prefetching, invalidation, and cancelling queries.

## Parallel queries

Sometimes, you need to fetch multiple pieces of data at the same time. For example, you might want to fetch a user's profile and their list of posts in parallel.

```jsx
const [appleQuery, bananaQuery] = useQueries([
  {
    queryKey: ["apple"],
    queryFn: () => fetchApple(),
  },
  {
    queryKey: ["banana"],
    queryFn: () => fetchBanana(),
  },
]);
```

## Dependent queries

Next up are dependent queries. In a dependent query, the enabled option is used to control whether or not the query is executed based on the result of another query. For example, you might have a query that fetches a user’s profile data, and another query that fetches the user’s posts. The second query (fetching the user’s posts) would be dependent on the first query (fetching the user’s profile data), and would only be executed once the first query has successfully returned data.

```jsx
const userQuery = useQuery("user", () => fetchUser());
const postsQuery = useQuery("posts", () => fetchPosts(userQuery.data.id), {
  enabled: !!userQuery.data,
});
```

## Deferred queries

A deferred query is a query that is delayed until certain conditions are met. Sometimes you might want to delay a query until the user has performed some action, such as clicking a button or scrolling to a certain point on the page. For example, you might want to delay a query until the user has scrolled to the bottom of the page.

```jsx
const [isScrollDownToBottom, setIsScrollDownToBottom] = useState(false);

const { data, isLoading } = useQuery(
  "example",
  () => fetch("/api/example").then((res) => res.json()),
  {
    enabled: isScrollDownToBottom,
  }
);
```

Hope you enjoyed this article.
