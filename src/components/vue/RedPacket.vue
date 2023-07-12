<template>
  <div class="packet mt-2 max-w-[260px] w-250px max-h-[300px] h-[40vh]">
    <div ref="target" class="opener z-0" />
    <div class="hole-wrap">
      <div class="hole"></div>
      <div ref="sparkle" class="w-full flex justify-center">
        <span class="text-4xl"> ✨ </span>
      </div>
    </div>
    <div class="grid place-items-center absolute z-10 inset-0 w-full h-full">
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

<style scoped>
.packet {
  background: red;
  position: relative;
  perspective: 1000px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.packet .opener {
  z-index: 2;
  height: 30%;
  background: pink;
  width: 100%;
  border-radius: 0 0 50% 50%;
  position: absolute;
  top: 0;
  transform-style: preserve-3d;
  transform-origin: top;
}

.packet .hole-wrap {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
.packet .hole-wrap .hole {
  height: 20%;
  background: rgb(231, 20, 20);
  width: 100%;
  border-radius: 0 0 50% 50%;
  position: absolute;
  transform: translateY(-50%);
  top: 0;
}
</style>
