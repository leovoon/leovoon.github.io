<script setup lang="ts">
import { ref } from "vue";

const isOpen = ref(false);
defineProps({
  title: {
    type: String,
    default: "title",
  },
  animation: {
    type: String,
    require: false,
  },
});
</script>

<template>
  <div class="Accordion">
    <div
      class="flex justify-start items-center border-b px-2 py-3 dark:border-b-gray-600 cursor-pointer active:border-b-green-600 hover:text-green-600 dark:text-green-600 dark:(text-green-300)"
      :class="isOpen ? 'active' : 'beforeBorder'"
      @click="isOpen = !isOpen"
    >
      {{ title }}
    </div>
    <transition :name="animation">
      <div
        v-show="isOpen"
        class="dark:(bg-gray-600 bg-opacity-20) px-6 py-3 bg-opacity-30 bg-green-200"
      >
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.beforeBorder {
  position: relative;
}
.beforeBorder:before {
  content: "";
  position: absolute;
  bottom: -1px;
  border-bottom: inherit;
  transition: opacity 0.1s linear, transform 0.5s ease-in-out;
  content: "";
}
.beforeBorder:not(:hover)::before {
  opacity: 0;
  transform: scaleX(0);
}

.bottomToTop-enter-active {
  animation: bottomToTop 0.35s forwards;
}

@keyframes bottomToTop {
  0% {
    opacity: 0;
    transform: translateY(100%);
  }
  100% {
    transform: translateY(0);
  }
}
</style>
