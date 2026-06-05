<template>
  <div
    v-if="!metaStore.isLoaded"
    class="app-splash-screen"
    :class="{ 'light-theme': isLightTheme }"
  >
    <div class="app-splash-screen__skeleton"></div>
  </div>
  <div
    v-else-if="metaStore.metaConfig?.isMaintenance"
    class="maintenance-screen"
    :class="{ 'light-theme': isLightTheme }"
  >
    <div class="maintenance-screen__content">
      <AppImage
        :imgPath="newPatchImagePath"
        imgAlt="Технические работы"
        class="maintenance-screen__img"
      />
      <h1 class="maintenance-screen__headline">
        🛠️ Ведутся технические работы 🛠️
      </h1>
      <p class="maintenance-screen__text">
        В данный момент база данных BOTM Hub обновляется. Все функции временно
        заблокированы, чтобы записанные во время обновления новые данные не
        потерялись. Пожалуйста, подождите немного. Веб-приложение скоро снова
        будет доступно...
      </p>
    </div>
  </div>
  <template v-else>
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
            Вышла новая версия веб-приложения BOTM Hub -
            {{ metaStore.metaConfig?.appVersion }}! Вы можете взглянуть на
            полный список изменений по кнопке `Последние обновления`,
            находящейся в бургер-меню. Это окно больше не будет показываться,
            пока не выйдет новый патч или пока вы не почистите кэш браузера.
          </p>
        </div>
      </template>
    </AppModal>
    <div class="global-container" :class="{ 'light-theme': isLightTheme }">
      <TheHeader :style="{ paddingRight: scrollbarWidth }" />
      <main class="main-wrapper" :style="{ paddingRight: scrollbarWidth }">
        <div class="main-wrapper__container">
          <TheBreadcrumbs class="main-wrapper__breadcrumbs" />
          <router-view />
        </div>
      </main>
      <TheFooter :style="{ paddingRight: scrollbarWidth }" />
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { useThemeStore } from "@/stores/theme";
import { useMetaStore } from "@/stores/meta";
import { useOsumapsStore } from "@/stores/osumaps";
import { useScrollbarPaddingStore } from "@/stores/scrollbar-padding";
import TheHeader from "@/components/layout/TheHeader.vue";
import TheFooter from "@/components/layout/TheFooter.vue";
import TheBreadcrumbs from "@/components/layout/TheBreadcrumbs.vue";
import newPatchImage from "@/assets/images/new-patch-modal-img.gif";

const metaStore = useMetaStore();
const mapsStore = useOsumapsStore();
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
  if (metaStore.metaConfig?.appVersion) {
    localStorage.setItem("appVersion", metaStore.metaConfig.appVersion);
  }
};

onMounted(async () => {
  await metaStore.loadMeta();

  if (metaStore.metaConfig?.isMaintenance) return;

  mapsStore.loadAllMaps();

  const currentVersion = metaStore.metaConfig?.appVersion;
  if (!currentVersion) return;

  if (
    !localStorage.getItem("wasPatchNotesShown") ||
    localStorage.getItem("appVersion") !== currentVersion
  ) {
    await nextTick();
    isNewPatchModalOpened.value = true;
  }
});
</script>

<style lang="scss">
.app-splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100dvh;
  background-color: var(--color-global-bg);
  z-index: 9999;
  display: flex;
  justify-content: center;
  &__skeleton {
    @include sample(1920px, 100%, 0);
  }
}

.maintenance-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100dvh;
  background-color: var(--color-global-bg);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 800px;
    padding: 20px;
    gap: 20px;
  }
  &__img {
    max-width: 800px;
  }
  &__headline {
    @include default-headline(36px, 36px, var(--color-text));
    @media (max-width: $phone-l) {
      font-size: 28px;
      line-height: 28px;
    }
  }
  &__text {
    @include default-text(22px, 22px, var(--color-text-gray));
    @media (max-width: $phone-l) {
      font-size: 16px;
      line-height: 16px;
    }
  }
}

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
  min-height: 100dvh;
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
  }
  &__breadcrumbs {
    margin-bottom: 10px;
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
    width: 100%;
    text-align: center;
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
