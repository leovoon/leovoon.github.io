<template>
  <div
    class="bg-red-700 relative flex justify-center items-center mt-2 max-w-[260px] w-[250px] max-h-[300px] h-[40vh]"
    style="perspective: 1000px"
  >
    <div ref="target" class="w-full absolute top-0 origin-top h-[30%] bg-red-600 rounded-b-full -z-10" />
    <div class="w-full h-full relative overflow-hidden">
      <div
        class="bg-red-400 w-full absolute top-0 h-[20%] rounded-b-3xl -translate-y-1/2"
        :class="!opened && 'hidden'"
      ></div>
      <div ref="sparkle" class="w-full flex justify-center relative z-20">
        <span class="text-4xl"> 🥯 </span>
      </div>
    </div>
    <div class="grid place-items-center absolute z-10 -top-10 w-full h-full">
      <button
        class="w-[4rem] h-[4rem] rounded-full cursor-pointer ring-yellow-200 ring-3 transform scale-100 focus:outline-none bg-orange-400 hover:bg-orange-300 hover:scale-105 transition-colors"
        @click="toggle"
      >
        {{ opened ? "Close" : "Open" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMotion } from "@vueuse/motion";
import { ref, onMounted } from "vue";

const target = ref<HTMLElement>();
const sparkle = ref<HTMLElement>();
const opened = ref(false);

const motionInstance = useMotion(target, {
  initial: {
    rotateX: 0,
  },
  enter: {
    rotateX: 180,
  },
});

const motionInstance2 = useMotion(sparkle, {
  initial: {
    opacity: 0,
    y: 0,
    scale: 1,
  },
  enter: {
    opacity: 1,
    scale: 1.5,
    y: 10,
    transition: {
      delay: 300,
    },
  },
});

const openRedPacket = () => {
  motionInstance.apply("enter");
  motionInstance2.apply("enter");
};

const closeRedPacket = () => {
  motionInstance.apply("initial");
  motionInstance2.apply("initial");
};

// close packet on initial mount
onMounted(() => closeRedPacket());

const toggle = () => {
  opened.value = !opened.value;
  opened.value ? openRedPacket() : closeRedPacket();
};
</script>
