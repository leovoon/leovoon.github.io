<template>
  <section class="max-w-5xl p-6 mx-auto md:p-10 h-100vh grid content-center">
    <h1 class="text-3xl">Scroll me down 👇</h1>
  </section>
  <section>
    <div class="h-245vh text-3xl text-center">
      <h4 ref="sidebarRef" class="h-[80vh] grid content-center">
        trigger sidebar highlight
      </h4>
      <h4 ref="mainRef" class="h-[80vh] grid content-center">
        trigger main highlight
      </h4>
      <h4 ref="adsRef" class="h-[80vh] grid content-center">
        trigger ads highlight
      </h4>
    </div>
    <div class="sticky bottom-0">
      <div
        class="relative mx-2 bg-gray-700 shadow-md rounded max-h-[75vh] h-[300px] overflow-hidden select-none"
      >
        <div class="flex items-center justify-center px-1 pt-1 pb-0">
          <div
            class="relative flex items-center w-2/3 px-2 py-1 text-gray-100 bg-gray-600 rounded-md md:py-1 md:px-3"
          >
            <span>example.com</span
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              class="absolute w-4 h-4 right-1 md:h-5 md:w-5"
              fill="none"
              viewBox="0 0 7 7"
            >
              <path
                fill="#fff"
                fill-opacity="0.8"
                d="M5.088 4.004l-.125.126.125.125.126-.125-.126-.126zm-1.073-.822l.948.948.251-.252-.948-.948-.251.252zm1.2.948l.947-.948-.251-.252-.948.948.251.252z"
              ></path>
              <path
                stroke="#fff"
                stroke-linecap="round"
                stroke-opacity="0.8"
                stroke-width="0.355"
                d="M4.26 4.966a1.659 1.659 0 11.829-1.436"
              ></path>
            </svg>
          </div>
          <div class="absolute flex gap-1 p-2 left-1">
            <div class="w-2 h-2 bg-gray-400 rounded-full md:h-3 md:w-3"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full md:h-3 md:w-3"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full md:h-3 md:w-3"></div>
          </div>
        </div>
        <div class="px-2 pt-1 pb-2">
          <div
            class="relative bg-white text-gray-600 p-2 h-[25vh] flex rounded md:rounded-lg overflow-hidden undefined"
          >
            <div
              class="h-full p-2 border transition-colors ease-in-out"
              :class="sidebarVisible && 'bg-blue-300 outline-dotted-blue-500'"
            >
              Sidebar
            </div>
            <div
              class="h-full mx-2 w-full p-2 border transition-colors ease-in-out"
              :class="mainVisible && 'bg-red-300 outline-dotted-red-500'"
            >
              Main
            </div>
            <div
              class="h-2/3 p-2 border transition-colors ease-in-out"
              :class="adsVisible && 'bg-yellow-300 outline-dotted-yellow-500'"
            >
              Ads
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="h-50vh mt-20 grid content-center">
    <h1>Other section...</h1>
  </section>
</template>

<script setup lang="ts">
import { useIntersectionObserver } from "@vueuse/core";
import { ref } from "vue";

const sidebarRef = ref(null);
const mainRef = ref(null);
const adsRef = ref(null);
const sidebarVisible = ref(false);
const mainVisible = ref(false);
const adsVisible = ref(false);

useIntersectionObserver(
  sidebarRef,
  ([{ isIntersecting }]) => {
    sidebarVisible.value = isIntersecting;
  },
  { threshold: 0.6 }
);

useIntersectionObserver(
  mainRef,
  ([{ isIntersecting }]) => {
    mainVisible.value = isIntersecting;
  },
  { threshold: 0.6 }
);

useIntersectionObserver(
  adsRef,
  ([{ isIntersecting }]) => {
    adsVisible.value = isIntersecting;
  },
  { threshold: 0.6 }
);
</script>
