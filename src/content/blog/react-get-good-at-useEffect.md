---
title: "Avoid these mistakes when using React useEffect"
description: "Get good at useEffect"
pubDate: "June 04 2023"
heroImage: "/placeholder-hero.jpg"
tags: ["react"]
---

React's useEffect hook is a powerful tool that allows developers to manage side effects and perform actions in functional components. It provides a way to incorporate lifecycle methods into React function components. However, it's essential to understand its behavior and potential pitfalls to avoid common mistakes. In this blog post, I will share my finding about some key aspects of useEffect and share practical tips to enhance your understanding and usage.

## How useEffect Works
The useEffect hook runs after every render cycle. This means that whenever the component re-renders, the useEffect function is executed. It's important to note that the useEffect function runs after the render is complete, so any updates to the DOM will already be visible to the user.

```js
useEffect(() => {
  //Runs on every render
});
```
    
```js
useEffect(() => {
      // This runs only on the first render
}, []);
```

```js
useEffect(() => {
  // This runs only when the `name` prop changes
}, [name]);
```



## Rerenders and Non-Primitives Dependencies
By default, useEffect runs on every render. However, if you pass an array of dependencies as the second argument, useEffect will only run when those dependencies change. The problem arises when non-primitives, such as arrays or objects, are used as dependencies. Since they are reference types, their reference changes on every render, causing the useEffect to run again.

```js
import React, { useState, useEffect, useMemo } from 'react';

function MyComponent() {
  const [name, setName] = useState('John');
  const [age, setAge] = useState(30);

  const user = useMemo(() => ({ name, age }), [name, age]); // This will prevent unnecessary rerenders

  useEffect(() => {
    // This effect runs whenever the `user` object changes
    console.log('User updated:', user);
  }, [user]);

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="number"
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />
    </div>
  );
}

export default MyComponent;

```

To solve this issue, you can use the useMemo hook to memoize the non-primitive value. Memoization ensures that the value is only recomputed when its dependencies change. By memoizing the non-primitive dependency, you can prevent unnecessary rerenders in useEffect.

## Cleanup Function
When using useEffect, it's crucial to be aware of the cleanup function. This function allows you to clean up any resources or subscriptions created during the effect's execution. The cleanup function always runs first before the actual effect runs, even on unmounting the component.

Consider the example of an interval inside useEffect. If you set up an interval to perform an action repeatedly, you need to clear that interval to avoid memory leaks.

```js
const [seconds, setSeconds] = useState(0);

useEffect(() => {
  const intervalId = setInterval(() => {
    setSeconds(seconds => seconds + 1);
  }, 1000);
}, []); // Not clearing the interval
```

 You can achieve this by returning a cleanup function from the useEffect. The cleanup function will be executed before the next effect runs or when the component unmounts, ensuring that no intervals or subscriptions are left running.

## Fetching Data and Memory Leak Prevention

When using useEffect for fetching data from an API, it's important to handle the cleanup properly to prevent memory leaks. If the component unmounts before the fetch request completes, the callback function might still fire, leading to potential issues.

```js
useEffect(() => {
  const abortController = new AbortController();
  const signal = abortController.signal;

  const fetchData = async () => {
    const response = await fetch(url, { signal }); // pass the signal to the fetch call
    const data = await response.json();
    setPost(data);
  };

  fetchData();

  return function cleanup() {
    abortController.abort(); // cancel pending fetch request on component unmount
  };
}, []);

```

To tackle this problem, you can utilize an abort controller or cancel token (in axios). These mechanisms allow you to cancel the fetch request if the component unmounts before it completes. For instance, in Axios, you can create an abort controller and use its signal as a cancel token in the request configuration. When the component unmounts, you can call the abort controller's abort method to cancel the request and prevent any potential memory leaks.

## Conclusion

React's useEffect hook is a powerful tool for managing side effects and incorporating lifecycle methods into functional components. By understanding how useEffect works, avoiding unnecessary rerenders, managing cleanup functions, and addressing memory leak issues during data fetching, you can leverage this hook effectively in your React applications. 

Hope you find this blog post useful.