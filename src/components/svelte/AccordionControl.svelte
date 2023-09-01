<script>
  import { onMount } from "svelte";
  import { expandStore } from "../../stores/expandStore";

  let clicked = false;
  // onMount(() => {
  //   const local = localStorage.getItem("expand");
  //   if (local !== null) {
  //     const storedValue = JSON.parse(local);
  //     expandStore.set(storedValue);
  //   }
  // });

  // $: localStorage.setItem("expand", JSON.stringify($expandStore));
</script>

<button
  on:click={() => {
    expandStore.set(!$expandStore);
    clicked = true;
  }}
>
  <div class="relative group">
    {#if $expandStore}
      <slot name="collapsed" />
    {:else}
      <slot name="expanded" />
    {/if}
    {#if !clicked}
      <slot name="indicator" />
    {/if}
  </div>
</button>
