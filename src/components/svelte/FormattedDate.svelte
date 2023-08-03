<script lang="ts">
  export let date: Date;
  export let classList: string = "";
</script>

<time class={classList} datetime={date.toISOString()}>
  {date.toLocaleDateString("en-us", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })}
</time>
