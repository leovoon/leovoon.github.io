<script lang="ts">
  let y: number;
  let previousY: number;
  let clientHeight: number;
  const deriveDirection = (y: number) => {
    const direction = !previousY || previousY < y ? "down" : "up";
    previousY = y;
    return direction;
  };
  $: scrollDirection = deriveDirection(y);
  $: offscreen = scrollDirection === "down" && y > clientHeight * 8;
  $: isFloat = y > 0;
</script>

<svelte:window bind:scrollY={y} />

<header
  class:motion-safe:opacity-0={offscreen}
  bind:clientHeight
  class="fixed max-w-[700px] top-10 w-[calc(100vw-theme(padding.4))] flex p-4 rounded-md z-10 {isFloat
    ? 'backdrop-blur-sm shadow-sm -mt-10 z-40 top-0 bg-white/30 dark:bg-white/10'
    : null} mx-auto -ml-2 transition-all"
>
  <slot />
</header>
