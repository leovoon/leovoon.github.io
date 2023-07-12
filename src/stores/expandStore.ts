import { writable } from "svelte/store";

type ExpandStore = boolean;

export const expandStore = writable<ExpandStore>(
  false || localStorage.getItem("expand") === "true"
);
