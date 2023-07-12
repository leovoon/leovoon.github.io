<template>
  <div class="space-y-8 p-4">
    <div class="text-lg relative w-full">
      <label
        class="text-xs absolute inset-1 pointer-events-none left-2 text-blue-600 dark:text-blue-300"
        >Enter your preferred amount</label
      >
      <input
        v-model.lazy="amountShow"
        v-money="config"
        type="text"
        inputmode="numeric"
        maxlength="20"
        class="border-b bg-gray-100 w-full px-3 pt-6 pb-2 dark:(text-light-700 bg-dark-50)"
        @input="sendAmount(amountShow)"
      />
    </div>
    <span class="w-full text-gray-500 text-xs" v-if="!inputOnly"
      >Min reload amount is RM 10</span
    >
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { VMoney3 as vMoney } from "v-money3";

import { ref } from "vue";

const amountShow = ref("");
const config = ref({
  decimal: ".",
  thousands: ",",
  prefix: "RM ",
  precision: 2,
  masked: false,
  disableNegative: true,
});

defineProps({
  inputOnly: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["getAmount"]);
const sendAmount = (amt: string) => {
  emit("getAmount", amt);
};
</script>

<style scoped>
*,
*:hover,
*:focus {
  @apply outline-transparent;
}
</style>
