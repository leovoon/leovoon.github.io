import { writable } from "svelte/store";

type ExpandStore = boolean;

const isLocalStorageAvailable = typeof localStorage !== "undefined";

const storedValue = isLocalStorageAvailable
  ? localStorage.getItem("expand") === "true"
  : false;
const defaultValue = storedValue ?? false;

export const expandStore = writable<ExpandStore>(defaultValue);

expandStore.subscribe((value) => {
  if (isLocalStorageAvailable) {
    localStorage.setItem("expand", String(value));
  }
});
