<template>
  <div class="seasonal-decorations" v-if="currentEvent">
    <template v-if="currentEvent === 'halloween'">
      <div class="seasonal-decorations__halloween-overlay"></div>
      <div
        class="seasonal-decorations__pumpkin seasonal-decorations__pumpkin_left"
      >
        <img src="@/assets/images/pumpkin.png" alt="Halloween Pumpkin" />
      </div>
      <div
        class="seasonal-decorations__pumpkin seasonal-decorations__pumpkin_right"
      >
        <img src="@/assets/images/pumpkin.png" alt="Halloween Pumpkin" />
      </div>
    </template>

    <!-- TODO (other events...) -->
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { type ISeasonalEvent } from "@/types/seasons";

const currentEvent = ref<ISeasonalEvent>(null);

const determineEvent = (): ISeasonalEvent => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  if (month === 2 && day >= 13 && day <= 15) {
    return "valentines";
  }
  if (month === 4 && day === 1) {
    return "april_fools";
  }
  if (month === 9 && day === 16) {
    return "osu_bday";
  }
  if ((month === 10 && day >= 30) || (month === 11 && day <= 1)) {
    return "halloween";
  }
  if ((month === 12 && day >= 25) || (month === 1 && day <= 7)) {
    return "new_year";
  }
  return null;
};

onMounted(() => {
  currentEvent.value = determineEvent();
});
</script>

<style lang="scss" scoped>
.seasonal-decorations {
  position: fixed;
  inset: 0;
  z-index: 100;
  pointer-events: none;
  overflow: hidden;
  &__halloween-overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle,
      transparent 70%,
      rgba(20, 5, 5, 0.4) 100%
    );
    opacity: 0.8;
  }
  &__pumpkin {
    position: absolute;
    bottom: -15px;
    width: 130px;
    height: auto;
    filter: drop-shadow(0 0 15px rgba(255, 140, 0, 0.6));
    animation: halloween-breathe 4s ease-in-out infinite alternate;
    img {
      width: 100%;
      height: auto;
      display: block;
    }
    &_left {
      left: 20px;
      transform: rotate(-10deg);
      transform-origin: bottom center;
    }
    &_right {
      right: 20px;
      transform: rotate(10deg);
      transform-origin: bottom center;
      animation-delay: 1.5s;
    }
    @media (max-width: 768px) {
      width: 75px;
      bottom: -10px;
      &_left {
        left: 10px;
      }
      &_right {
        right: 10px;
      }
    }
  }
}
@keyframes halloween-breathe {
  0% {
    filter: drop-shadow(0 0 8px rgba(255, 120, 0, 0.4));
  }
  100% {
    filter: drop-shadow(0 0 25px rgba(255, 140, 0, 0.8));
  }
}
</style>
