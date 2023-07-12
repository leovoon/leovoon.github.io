<script>
    export let open = false;
    import { slide } from 'svelte/transition';
    import { expandStore } from '../../stores/expandStore';
    const handleClick = () => open = !open

    $: open = $expandStore;
  </script>
  
  <div class="border dark:border-gray-600 rounded-md group">
    <button class="w-full flex justify-between items-center p-2 cursor-pointer"   on:click={handleClick}>     
          <div>
              <slot name="head"></slot>	
          </div>
          <div class="w-5 h-5 mx-2 transition-transform duration-500 {open ? "rotate-180" : null}" >
              <slot name="icon"></slot>
          </div>
     </button>
      {#if open}
      <div class="details" transition:slide>
          <slot name="details"></slot>
      </div>
      {/if}
  </div>
  
