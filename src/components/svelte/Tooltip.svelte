<script>
  import { tooltip } from "@svelte-plugins/tooltips";
  export let content;
</script>

<span
  use:tooltip={{
    theme: "custom-tooltip",
    animation: "fade",
    align: "center",
    content: content,
  }}
>
  <slot />
</span>

<style>
  :global(.tooltip.custom-tooltip) {
    --tooltip-background-color: theme("backgroundColor.amber.600");
    --tooltip-font-size: theme("fontSize.xs");
    --tooltip-font-weight: theme("fontWeight.normal");
    --tooltip-box-shadow: theme("boxShadow.md");
    --tooltip-line-height: theme("lineHeight.tight");
    --tooltip-padding: theme("padding.[2]");
  }
</style>
