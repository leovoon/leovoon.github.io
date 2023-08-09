<script>
  import { onMount } from "svelte";

  onMount(() => {
    let theme = (() => {
      if (
        typeof localStorage !== "undefined" &&
        localStorage.getItem("theme")
      ) {
        return localStorage.getItem("theme");
      }
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
      return "light";
    })();

    if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }

    if (theme?.length) {
      window.localStorage.setItem("theme", theme);
    }
    // listen to ESC key to toggle between light and dark mode
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        handleToggleClick();
      }
    });
  });

  function handleToggleClick() {
    console.log("cliek");
    const element = document.documentElement;
    element.classList.toggle("dark");
    const isDark = element.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }
</script>

<button
  id="themeToggle"
  aria-label="Toggle Dark or Light"
  on:click={handleToggleClick}
>
  <div class="w-6 h-6 ml-4 grid place-items-center relative overflow-hidden">
    <slot />
  </div>
</button>
