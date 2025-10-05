<template>
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    class="app-spinner"
  >
    <path
      d="M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z"
      class="app-spinner__path"
    />
  </svg>
</template>

<style lang="scss" scoped>
.app-spinner {
  transform-origin: center;
  animation: app-spinner-rotate 0.75s infinite linear;
  width: 20px;
  height: 20px;
  &__path {
    fill: var(--color-app-spinner);
  }

  @media (max-width: $tablet-l) {
    width: 16px;
    height: 16px;
  }

  @media (max-width: $phone-l) {
    width: 12px;
    height: 12px;
  }
}

@keyframes app-spinner-rotate {
  100% {
    transform: rotate(360deg);
  }
}
</style>
