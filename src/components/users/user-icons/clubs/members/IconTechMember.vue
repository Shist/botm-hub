<template>
  <v-tooltip text="Член Tech Клуба" location="top">
    <template #activator="{ props }">
      <svg
        v-bind="props"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path
          d="M21.85 16.96H21.85L12.85 2.47C12.65 2.16 12.33 2 12 2S11.35 2.16 11.15 2.47L2.15 16.96H2.15C1.84 17.45 2 18.18 2.64 18.43L11.64 21.93C11.75 22 11.88 22 12 22S12.25 22 12.36 21.93L21.36 18.43C22 18.18 22.16 17.45 21.85 16.96M11 6.5V13.32L5.42 15.5L11 6.5M12 19.93L5.76 17.5L12 15.07L18.24 17.5L12 19.93M13 13.32V6.5L18.58 15.5L13 13.32Z"
          fill="var(--color-club-tech)"
        />
        <path
          d="M6 17c-2 0-6 1-6 3v2h12v-2c0-2-4-3-6-3zm0-1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
          fill="currentColor"
          stroke="var(--color-global-bg)"
          stroke-width="1.5"
        />
      </svg>
    </template>
  </v-tooltip>
</template>
