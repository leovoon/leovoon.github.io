---
title: "JavaScript: Why Promises kinda sucks"
description: "3 reasons why javascript promises are kinda sucks"
pubDate: "Sep 04 2023"
tags: ["javascript", "typescript", "theoretically"]
---

In JavaScript, Promises are a powerful tool for handling asynchronous operations. However, they also have some pain points that can make them challenging to work with. Let's explore these pain points with some code examples.

## Immediate Execution

One issue with Promises is that they execute immediately upon creation and cannot be stopped or paused once started. This can cause difficulties in scenarios where you want to control the execution timing of your asynchronous operations.

Consider the following example where we have an asynchronous function that returns a Promise:

```js
const fetchData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("Data"); 
    }, 2000);
  });
};

const myPromise = fetchData(); // this starts executing immediately
```

In the above code, `fetchData()` is called immediately when `myPromise` is created. If you want to delay the execution of `fetchData()`, you would need to delay the creation of the Promise itself, which can be cumbersome.

### What if we want to delay the execution of `fetchData()`?
You can define a function that returns a Promise, and only call this function when you want the Promise to start executing:

```js
const fetchData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("Data"); 
    }, 2000);
  });
};

// fetchData() is not called immediately, so the Promise does not start executing here
let myPromise;

// Later in your code when you want to start fetching data
myPromise = fetchData(); // Now the Promise starts executing

```


## Can't Reuse the Same Async Operation Once It's Done
Another limitation of Promises is that they can't be reused once resolved or rejected. This means if you want to perform the same asynchronous operation again, you need to create a new Promise.

In the following example, we fetch data using a Promise. If we want to fetch the data again, we need to create a new Promise:

```js
const fetchData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("Data"); 
    }, 2000);
  });
};

fetchData()
  .then(data => console.log(data)) // logs: "Data"
  .then(() => fetchData()) // needs to create a new Promise to fetch data again
  .then(data => console.log(data)); // logs: "Data"


```
In the above code, we have to call `fetchData()` again to create a new Promise to fetch the data again.

### What if we want to reuse the same Promise?
While it's true that a Promise can't be reused once it settles (either fulfills or rejects), you can create a function that returns a new Promise each time it's called. This effectively allows you to "reuse" the same async operation.



## Error Handling: Do It Yourself
Error handling in Promises can be tricky. Errors need to be handled for each Promise in the chain. If an error is not caught in a Promise, it will propagate to the end of the Promise chain and, if unhandled, will result in an unhandled rejection error.

Consider this example:

```js
const myPromise = new Promise((resolve, reject) => {
  // Some code that might throw an error
  throw new Error('Oh no!');
});

myPromise.catch((error) => {
  // Handle the error
  console.error(error);
});

```

In the above code, we have a Promise that throws an error. We catch this error using the `.catch()` method. If the `.catch()` method was not present, the error would be unhandled and throw an unhandled rejection error.


### What is the better way to handle errors?
The async/await syntax can be used to handle errors in a synchronous-like manner using `try/catch` blocks.

```js
async function fetchDataAndLog() {
  try {
    const data = await fetchData();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

fetchDataAndLog();
```
In this code, `fetchDataAndLog()` is an asynchronous function that fetches data and logs it. If an error occurs during the fetching of data, it is caught in the catch block and logged to the console.

