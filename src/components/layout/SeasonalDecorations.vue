<template>
  <div class="seasonal-decorations" v-if="currentEvent">
    <template v-if="currentEvent === 'april_fools'">
      <div
        class="seasonal-decorations__clown seasonal-decorations__clown_bottom-left"
        :style="{ left: `${clown1X}%` }"
        @animationiteration="updateClown(1)"
      >
        <img src="@/assets/images/eh-clown.png" alt="Clown Cat" />
      </div>
      <div
        class="seasonal-decorations__clown seasonal-decorations__clown_bottom-right"
        :style="{ right: `${clown2X}%` }"
        @animationiteration="updateClown(2)"
      >
        <img src="@/assets/images/eh-clown.png" alt="Clown Cat" />
      </div>
      <div
        class="seasonal-decorations__clown seasonal-decorations__clown_top"
        :style="{ left: `${clown3X}%` }"
        @animationiteration="updateClown(3)"
      >
        <img src="@/assets/images/eh-clown.png" alt="Clown Cat" />
      </div>
    </template>
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
    <template v-if="currentEvent === 'new_year'">
      <div class="seasonal-decorations__newyear-overlay"></div>
      <div
        class="seasonal-decorations__branch seasonal-decorations__branch_left"
      >
        <img src="@/assets/images/pine-branch.png" alt="Pine Branch" />
      </div>
      <div
        class="seasonal-decorations__branch seasonal-decorations__branch_right"
      >
        <img src="@/assets/images/pine-branch.png" alt="Pine Branch" />
      </div>
      <div
        class="seasonal-decorations__snow seasonal-decorations__snow_layer-1"
      ></div>
      <div
        class="seasonal-decorations__snow seasonal-decorations__snow_layer-2"
      ></div>
      <div
        class="seasonal-decorations__snow seasonal-decorations__snow_layer-3"
      ></div>
    </template>

    <!-- TODO (other events...) -->
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import { type ISeasonalEvent } from "@/types/seasons";

const currentEvent = ref<ISeasonalEvent>(null);

const clown1X = ref(10);
const clown2X = ref(15);
const clown3X = ref(50);

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

const updateClown = (id: number) => {
  if (id === 1) clown1X.value = Math.floor(Math.random() * 40);
  if (id === 2) clown2X.value = Math.floor(Math.random() * 40);
  if (id === 3) clown3X.value = Math.floor(Math.random() * 80);
};
onMounted(() => {
  currentEvent.value = determineEvent();

  if (currentEvent.value === "april_fools") {
    document.body.classList.add("theme-april-fools");
    updateClown(1);
    updateClown(2);
    updateClown(3);
  }
});

onUnmounted(() => {
  document.body.classList.remove("theme-april-fools");
});
</script>

<style lang="scss">
body.theme-april-fools,
body.theme-april-fools * {
  cursor:
    url("@/assets/images/eh-clown-cursor.png") 16 16,
    crosshair !important;
}
</style>

<style lang="scss" scoped>
@use "sass:math";
@use "sass:string";

@function random-snow($n, $opacity) {
  $value: "#{math.random(3000)}px #{math.random(3000)}px rgba(255, 255, 255, #{$opacity})";
  @for $i from 2 through $n {
    $value: "#{$value}, #{math.random(3000)}px #{math.random(3000)}px rgba(255, 255, 255, #{$opacity})";
  }
  @return string.unquote($value);
}

.seasonal-decorations {
  position: fixed;
  inset: 0;
  z-index: 100;
  pointer-events: none;
  overflow: hidden;
  &__clown {
    position: absolute;
    width: 120px;
    height: auto;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5));
    img {
      width: 100%;
      height: auto;
      display: block;
    }
    &_bottom-left {
      bottom: -160px;
      animation: clown-peek-bottom 7s cubic-bezier(0.25, 1, 0.5, 1) infinite;
    }
    &_bottom-right {
      bottom: -160px;
      animation: clown-peek-bottom 12s cubic-bezier(0.25, 1, 0.5, 1) infinite 3s;
    }
    &_top {
      top: -160px;
      animation: clown-peek-top 15s cubic-bezier(0.25, 1, 0.5, 1) infinite 7s;
    }
    @media (max-width: 768px) {
      width: 90px;
    }
  }
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
  &__newyear-overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle,
      transparent 60%,
      rgba(173, 216, 230, 0.05) 100%
    );
    .light-theme & {
      background: radial-gradient(
        circle,
        transparent 60%,
        rgba(173, 216, 230, 0.2) 100%
      );
    }
  }
  &__snow {
    position: absolute;
    top: -3000px;
    left: -100px;
    border-radius: 50%;
    pointer-events: none;
    &::after {
      content: "";
      position: absolute;
      top: 3000px;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      box-shadow: inherit;
    }
    &_layer-1 {
      width: 2.5px;
      height: 2.5px;
      box-shadow: random-snow(250, 0.9);
      animation: snow-fall-1 25s linear infinite;
    }
    &_layer-2 {
      width: 1.5px;
      height: 1.5px;
      box-shadow: random-snow(400, 0.6);
      animation: snow-fall-2 35s linear infinite;
    }
    &_layer-3 {
      width: 1px;
      height: 1px;
      box-shadow: random-snow(600, 0.3);
      animation: snow-fall-3 50s linear infinite;
    }
  }
  &__branch {
    position: absolute;
    bottom: -30px;
    width: 320px;
    height: auto;
    filter: drop-shadow(0 -4px 6px rgba(0, 0, 0, 0.4));
    img {
      width: 100%;
      height: auto;
      display: block;
    }
    &_left {
      left: -50px;
    }
    &_right {
      right: -50px;
      transform: scaleX(-1);
    }
    @media (max-width: 768px) {
      width: 150px;
      bottom: -15px;
      &_left {
        left: -25px;
      }
      &_right {
        right: -25px;
      }
    }
  }
}

@keyframes clown-peek-bottom {
  0%,
  85%,
  100% {
    bottom: -160px;
  }
  10%,
  75% {
    bottom: -5px;
  }
}
@keyframes clown-peek-top {
  0%,
  85%,
  100% {
    top: -160px;
    transform: rotate(180deg);
  }
  10%,
  75% {
    top: -5px;
    transform: rotate(180deg);
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
@keyframes snow-fall-1 {
  0% {
    transform: translateY(0) translateX(0);
  }
  100% {
    transform: translateY(3000px) translateX(100px);
  }
}
@keyframes snow-fall-2 {
  0% {
    transform: translateY(0) translateX(0);
  }
  100% {
    transform: translateY(3000px) translateX(-50px);
  }
}
@keyframes snow-fall-3 {
  0% {
    transform: translateY(0) translateX(0);
  }
  100% {
    transform: translateY(3000px) translateX(30px);
  }
}
</style>
