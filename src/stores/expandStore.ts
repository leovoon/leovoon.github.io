import { writable } from "svelte/store";

type ExpandStore = boolean;

export const expandStore = writable<ExpandStore>(
  localStorage.getItem("expand") === "true" ?? false
);
