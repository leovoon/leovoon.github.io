<script lang="ts">
  import { onMount } from "svelte";
  import FormattedDate from "./FormattedDate.svelte";
  import { Motion, useViewportScroll, useTransform } from "svelte-motion";

  export let title: string;
  export let pubDate: Date;
  export let updatedDate: Date;
  export let heroImage: string;
  export let tags: string[];

  let mounted = false;
  const { scrollYProgress } = useViewportScroll();
  const initial = useTransform(scrollYProgress, (x) => (x > 1 ? 1 : x + 0.04));

  onMount(() => {
    mounted = true;
  });
</script>

<div class="w-full flex justify-between">
  <FormattedDate date={pubDate} classList="text-sm" />
  {#if updatedDate}
    <div class="text-sm italic text-stone-500">
      Last updated on <FormattedDate date={updatedDate} />
    </div>
  {/if}
</div>
<article
  class="relative prose prose-slate lg:prose-lg dark:prose-invert prose-hr:my-2"
>
  {#if mounted}
    <Motion
      let:motion
      style={{
        scaleY: initial,
        originY: 0,
      }}
    >
      <div
        use:motion
        class="w-1 h-[300px] bg-amber-500 dark:bg-amber-700 top-1/4 left-0 sm:left-4 xl:left-[20%] fixed"
      />
    </Motion>
    <div
      class="w-1 h-[300px] bg-stone-400/20 top-1/4 left-0 sm:left-4 xl:left-[20%] fixed scale-y-100"
    />
  {/if}

  <slot name="hero-image" />

  {#if tags}
    <div class="flex gap-x-2 gap-y-1.5 flex-wrap mt-2">
      {#each tags as tag}
        <div
          class="list-none border text-sm border-amber-400 dark:border-amber-500 inline px-1.5 rounded"
        >
          {tag}
        </div>
      {/each}
    </div>
  {/if}

  <slot />
  <hr />
</article>
