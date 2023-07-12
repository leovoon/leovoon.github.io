<script >
  import { onMount } from 'svelte';
    import {  expandStore } from '../stores/expandStore';

    onMount(() => {
        const local = localStorage.getItem('expand');
        if(local !== null) {
            const storedValue = JSON.parse(local);
            expandStore.set(storedValue);

        }
    })

    $: localStorage.setItem('expand', JSON.stringify($expandStore));
</script>

<button on:click={() => expandStore.set(!$expandStore)}>
    {#if $expandStore}
     <slot name="collapsed"></slot>
    {:else}
        <slot name="expanded"></slot>
    {/if}    
</button>
