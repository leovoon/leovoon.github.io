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
  class="fixed max-w-[700px] top-10 p-4 w-[calc(100vw-theme(padding.4))] z-10 flex rounded-md mx-auto -ml-2"
>
  <div class="bien-glass-4 z-9" />
  <slot />
</header>
