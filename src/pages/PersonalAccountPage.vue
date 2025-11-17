<template>
  <div class="personal-account-page">
    <h2 class="personal-account-page__headline">Личный кабинет</h2>
    <div class="personal-account-page__inputs-wrapper">
      <v-text-field
        v-model="chosenNick"
        variant="solo"
        prepend-inner-icon="mdi-account"
        label="osu! Ник"
        placeholder="Введи свой osu! ник"
        clearable
        hide-details
      />
      <SkillsetsSelect v-model="chosenCategories" />
    </div>
    <v-btn
      :disabled="!isSomeInfoChanged"
      :loading="isUpdating"
      height="50"
      class="personal-account-page__confirm-btn"
      @click="onUpdate"
    >
      Обновить информацию
    </v-btn>
    <h3 class="personal-account-page__small-headline">
      Здесь пока мало что есть, поэтому я разместил здесь коллаб с eh-ами
    </h3>
    <AppImage :imgPath="ehCollabImagePath" imgAlt="Коллаб белых котов eh-ов" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import SkillsetsSelect from "@/components/SkillsetsSelect.vue";
import useToast from "@/composables/useToast";
import ehCollabImage from "@/assets/images/eh-collab.png";
import { OsuMapCategory } from "@/types";
import { CATEGORIES_SORT_PRIORITIES } from "@/constants";

const authStore = useAuthStore();

const { setErrorToast, setSuccessToast } = useToast();

const chosenNick = ref("");
const chosenCategories = ref<OsuMapCategory[]>([]);
const isUpdating = ref(false);
const ehCollabImagePath = ref(ehCollabImage);

const currentNick = computed(() => {
  if (
    authStore.user?.additionalInfo === "loading" ||
    authStore.user?.additionalInfo === "loadingError"
  ) {
    return "";
  } else {
    return authStore.user?.additionalInfo.nick ?? "";
  }
});
const currentSkillsets = computed(() => {
  if (
    authStore.user?.additionalInfo === "loading" ||
    authStore.user?.additionalInfo === "loadingError"
  ) {
    return [];
  } else {
    return authStore.user?.additionalInfo.skillsets ?? [];
  }
});
const isSomeInfoChanged = computed(() => {
  return (
    chosenNick.value !== currentNick.value ||
    JSON.stringify(chosenCategories.value) !==
      JSON.stringify(currentSkillsets.value)
  );
});

watch(currentNick, (valueFromStore) => {
  chosenNick.value = valueFromStore;
});
watch(currentSkillsets, (valueFromStore) => {
  chosenCategories.value = valueFromStore;
});

onMounted(() => {
  chosenNick.value = currentNick.value;
  chosenCategories.value = currentSkillsets.value;
});

const onUpdate = async () => {
  try {
    isUpdating.value = true;

    const sortedCategories = [...chosenCategories.value].sort(
      (a, b) => CATEGORIES_SORT_PRIORITIES[a] - CATEGORIES_SORT_PRIORITIES[b]
    );

    await authStore.updateUserAdditionalInfo({
      nick: chosenNick.value,
      skillsets: JSON.stringify(sortedCategories),
    });
    setSuccessToast("🥳🥳🥳 Информация успешно обновлена!!! 🥳🥳🥳");
  } catch (error) {
    const msg = error instanceof Error ? error?.message : error;
    setErrorToast(`Не удалось обновить информацию: ${msg}`);
  } finally {
    isUpdating.value = false;
  }
};
</script>

<style lang="scss" scoped>
.personal-account-page {
  display: flex;
  flex-direction: column;
  row-gap: 20px;
  &__headline {
    @include default-headline(36px, 36px, var(--color-text));
    @media (max-width: $tablet-l) {
      font-size: 28px;
      line-height: 28px;
    }
    @media (max-width: $phone-l) {
      font-size: 20px;
      line-height: 20px;
    }
  }
  &__inputs-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  &__confirm-btn {
    @include default-btn(100%, var(--color-btn-text), var(--color-btn-bg), 0);
  }
  &__small-headline {
    @include default-headline(28px, 28px, var(--color-text));
    @media (max-width: $tablet-l) {
      font-size: 22px;
      line-height: 22px;
    }
    @media (max-width: $phone-l) {
      font-size: 16px;
      line-height: 16px;
    }
  }
}
</style>
