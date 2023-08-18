<script>
  function handleToggleClick() {
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
