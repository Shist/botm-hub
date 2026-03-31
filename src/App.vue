<template>
  <AppModal
    :isOpened="isNewPatchModalOpened"
    title="🛠️ Встречайте новую версию 🛠️"
    closeBtnText="Понятно"
    :isClosableByClickOutside="false"
    @closeModal="closeNewPatchModal"
  >
    <template #default>
      <div class="new-patch-modal-wrapper">
        <AppImage
          :imgPath="newPatchImagePath"
          imgAlt="Новый патч"
          class="new-patch-modal-img"
        />
        <p class="new-patch-label">
          Вышла новая версия веб-приложения BOTM Hub - 3.0.0! Вы можете
          взглянуть на полный список изменений по кнопке `Последние обновления`,
          находящейся в бургер-меню. Это окно больше не будет показываться, пока
          не выйдет новый патч или пока вы не почистите кэш браузера.
        </p>
      </div>
    </template>
  </AppModal>
  <div class="global-container" :class="{ 'light-theme': isLightTheme }">
    <TheHeader :style="{ paddingRight: scrollbarWidth }" />
    <main class="main-wrapper" :style="{ paddingRight: scrollbarWidth }">
      <div class="main-wrapper__container">
        <router-view />
      </div>
    </main>
    <TheFooter :style="{ paddingRight: scrollbarWidth }" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { useThemeStore } from "@/stores/theme";
import { useScrollbarPaddingStore } from "@/stores/scrollbar-padding";
import TheHeader from "@/components/layout/TheHeader.vue";
import TheFooter from "@/components/layout/TheFooter.vue";
import newPatchImage from "@/assets/images/new-patch-modal-img.gif";

const APP_VERSION = "3.0.0";

const scrollbarPaddingStore = useScrollbarPaddingStore();

const scrollbarWidth = computed(() =>
  scrollbarPaddingStore.isPaddingNeeded
    ? scrollbarPaddingStore.scrollbarWidth
    : "0px"
);

const themeStore = useThemeStore();

const isLightTheme = computed(() => themeStore.currTheme === "light");

const isNewPatchModalOpened = ref(false);
const newPatchImagePath = ref(newPatchImage);

const closeNewPatchModal = () => {
  isNewPatchModalOpened.value = false;

  localStorage.setItem("wasPatchNotesShown", "true");

  localStorage.setItem("appVersion", APP_VERSION);
};

onMounted(() => {
  if (
    !localStorage.getItem("wasPatchNotesShown") ||
    localStorage.getItem("appVersion") !== APP_VERSION
  ) {
    nextTick(() => {
      isNewPatchModalOpened.value = true;
    });
  }
});
</script>

<style lang="scss">
.new-patch-modal-wrapper {
  max-height: 420px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.new-patch-modal-img {
  width: 95%;
  align-self: center;
}
.new-patch-label {
  @include default-text(16px, 16px, var(--color-burger-menu-text));
  margin-bottom: 5px;
  @media (max-width: $tablet-l) {
    font-size: 12px;
    line-height: 12px;
  }
}

.global-container {
  position: relative;
  min-height: 100vh;
  max-width: 1920px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background-color: var(--color-global-bg);
}
.global-container * {
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    background 0.3s ease;
}

.main-wrapper {
  flex-grow: 1;
  &__container {
    @extend %default-wrapper;
    &:has(.players-page),
    &:has(.skillset-maps-page),
    &:has(.workout-constructor-page) {
      padding: 10px;
    }
  }
}

.Toastify__toast-container .Toastify__toast {
  cursor: default;
}
.Toastify__toast-body > div {
  cursor: text;
  font-family: $font-roboto;
  text-align: center;
  word-break: break-word;
}

.scrollbar-measure {
  width: 100px;
  height: 100px;
  overflow: scroll;
  position: absolute;
  top: -9999px;
}

.skillset-maps-page {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  row-gap: 10px;
  &__headline {
    @include default-headline(28px, 28px, var(--color-text));
    @media (max-width: $phone-l) {
      font-size: 20px;
      line-height: 20px;
    }
  }
}

.vuetify-date-time-picker-wrapper {
  @media (max-width: $phone-m) {
    left: calc(50dvw - 160px) !important;
  }
}
</style>
