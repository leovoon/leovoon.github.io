<template>
  <div
    class="relative min-w-[250px] min-h-[250px] w-min group"
    @click="handleMobileTouch()"
  >
    <div
      class="absolute inset-0 w-full h-full object-cover bg-no-repeat"
      :style="{ backgroundImage: `url(${imgSrcAfter})` }"
    ></div>
    <!-- fake effect -->
    <div
      class="absolute inset-0 w-full h-full object-cover bg-no-repeat foreground-img filter grayscale-80"
      :style="{ backgroundImage: `url(${imgSrcBefore})` }"
    ></div>
    <input
      ref="sliderThumb"
      v-model="rangeValue"
      type="range"
      min="0"
      max="100"
      class="slider appearance-none bg-transparent group-hover:opacity-75 opacity-0 absolute inset-0 h-full w-full transition ease-in-out"
      @touchstart="handleMobileTouch()"
      @touchend="handleMobileLeave()"
      @blur="handleMobileLeave()"
    />
    <span
      v-show="labelled"
      class="absolute inset-0 p-1 text-black text-white w-min h-min text-xs bg-opacity-40 bg-light-600"
      >Before</span
    >
    <span
      v-show="labelled"
      class="absolute right-0 p-1 text-black text-white w-min h-min text-xs bg-opacity-40 bg-light-600;"
      >After</span
    >

    <div
      v-show="centerThumb"
      ref="sliderCenterThumb"
      class="center-thumb inline-block absolute transform origin-center -translate-x-1/2 -translate-y-1/2 inset-1/2 w-8 h-8 pointer-events-none transition ease opacity-0 group-hover:opacity-100"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";

defineProps({
  imgSrcBefore: {
    type: String,
    default: "https://api.lorem.space/image/movie?w=250&h=250",
  },
  imgSrcAfter: {
    type: String,
    default: "https://api.lorem.space/image/movie?w=250&h=250",
  },
  thumbHeight: {
    type: String,
    default: "150px",
    validator: (value: string) => /^\d+px$/.test(value),
  },
  thumbWidth: {
    type: String,
    default: "1px",
    validator: (value: string) => /^\d+px$/.test(value),
  },
  thumbColor: {
    type: String,
    default: "#fffff",
    validator: (value: string) => /^#[0-9a-f]{6}$/.test(value),
  },
  labelled: {
    type: Boolean,
    default: false,
    required: false,
  },
  centerThumb: {
    type: Boolean,
    default: false,
    required: false,
  },
});

// more props, endless possibilities

const rangeValue = ref<string>("50");
const sliderThumb = ref<HTMLElement | null>(null);
const sliderCenterThumb = ref<HTMLElement | null>(null);
const foregroundWidth = computed(() => {
  const range = rangeValue.value;
  return `${range}%`;
});

// mobile touch support instead of hover
const handleMobileTouch = () => {
  if (sliderThumb.value) {
    sliderThumb.value.classList.remove("opacity-0");
    sliderThumb.value.classList.add("opacity-75");
  }
};
const handleMobileLeave = () => {
  if (sliderThumb.value) {
    sliderThumb.value.classList.add("opacity-0");
    sliderThumb.value.classList.remove("opacity-75");
  }
};
</script>

<style scoped>
.foreground-img {
  width: v-bind(foregroundWidth);
}

.slider::-moz-range-thumb {
  @apply appearance-none cursor-pointer;
  height: v-bind(thumbHeight);
  width: v-bind(thumbWidth);
}

.slider::-webkit-slider-thumb {
  @apply appearance-none cursor-pointer;
  height: v-bind(thumbHeight);
  width: v-bind(thumbWidth);
  background-color: v-bind(thumbColor);
}

.center-thumb {
  left: v-bind(foregroundWidth);
}
</style>
