<template>
  <div class="personal-account-page">
    <h2 class="personal-account-page__headline">Личный кабинет</h2>
    <div class="personal-account-page__avatar-inputs-wrapper">
      <v-tooltip
        :disabled="currentOsuId !== null"
        text="Для подгрузки аватара требуется osu! ID"
        location="top"
      >
        <template #activator="{ props }">
          <AppImage
            v-bind="props"
            :imgPath="avatarSrc"
            imgAlt="Аватар"
            class="personal-account-page__avatar"
          />
        </template>
      </v-tooltip>
      <v-form
        v-model="isFormValid"
        class="personal-account-page__inputs-wrapper"
      >
        <v-number-input
          v-model="chosenOsuId"
          :min="1"
          :max="1000000000"
          variant="solo"
          control-variant="hidden"
          prepend-inner-icon="mdi-identifier"
          label="osu! ID"
          placeholder="Введи свой osu! ID ('https://osu.ppy.sh/users/<ID>')"
          clearable
          hide-details
        />
        <v-text-field
          v-model="chosenNick"
          :counter="15"
          :rules="[rules.min(3), rules.max(15)]"
          autocomplete="username"
          variant="solo"
          prepend-inner-icon="mdi-account"
          label="osu! Ник"
          placeholder="Введи свой osu! ник"
          persistent-counter
          clearable
        />
        <v-select
          v-model="chosenDigit"
          :items="digitOptions"
          variant="solo"
          prepend-inner-icon="mdi-star-half-full"
          label="Digit-категория"
          placeholder="Выбери Digit-категорию"
          clearable
          hide-details
        />
        <SkillsetsSelect v-model="chosenCategories" />
      </v-form>
    </div>
    <v-btn
      :disabled="!isFormValid || !isSomeInfoChanged"
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
import { useUsersStore } from "@/stores/users";
import SkillsetsSelect from "@/components/osumaps/SkillsetsSelect.vue";
import useToast from "@/composables/useToast";
import useFormValidation from "@/composables/useFormValidation";
import ehCollabImage from "@/assets/images/eh-collab.png";
import { DigitCategory } from "@/types/users";
import { OsuMapCategory } from "@/types/osumaps";

const authStore = useAuthStore();
const usersStore = useUsersStore();

const { setErrorToast, setSuccessToast } = useToast();
const { isFormValid, rules } = useFormValidation();

const chosenOsuId = ref<number | null>(null);
const chosenNick = ref<string | null>(null);
const chosenDigit = ref<DigitCategory | null>(null);
const chosenCategories = ref<OsuMapCategory[]>([]);
const isUpdating = ref(false);
const ehCollabImagePath = ref(ehCollabImage);

const digitOptions = computed(() =>
  Object.values(DigitCategory).map((digitValue) => ({
    value: digitValue,
    title: digitValue,
  }))
);
const currentOsuId = computed(() => {
  return authStore.userAdditionalInfo?.osuId ?? null;
});
const currentNick = computed(() => {
  return authStore.userAdditionalInfo?.nick ?? null;
});
const currentDigit = computed(() => {
  return authStore.userAdditionalInfo?.digitCategory ?? null;
});
const currentSkillsets = computed(() => {
  return authStore.userAdditionalInfo?.skillsets ?? [];
});
const isSomeInfoChanged = computed(() => {
  const osuIdFromStore =
    currentOsuId.value === null ? null : +currentOsuId.value;
  return (
    chosenOsuId.value !== osuIdFromStore ||
    chosenNick.value !== currentNick.value ||
    chosenDigit.value !== currentDigit.value ||
    JSON.stringify(chosenCategories.value) !==
      JSON.stringify(currentSkillsets.value)
  );
});
const avatarSrc = computed(() => `https://a.ppy.sh/${currentOsuId.value}?.png`);

watch(currentOsuId, (valueFromStore) => {
  chosenOsuId.value = valueFromStore === null ? null : +valueFromStore;
});
watch(currentNick, (valueFromStore) => {
  chosenNick.value = valueFromStore;
});
watch(currentDigit, (valueFromStore) => {
  chosenDigit.value = valueFromStore;
});
watch(currentSkillsets, (valueFromStore) => {
  chosenCategories.value = valueFromStore;
});

onMounted(() => {
  chosenOsuId.value = currentOsuId.value === null ? null : +currentOsuId.value;
  chosenNick.value = currentNick.value;
  chosenDigit.value = currentDigit.value;
  chosenCategories.value = currentSkillsets.value;
});

const onUpdate = async () => {
  try {
    isUpdating.value = true;

    await authStore.updateUserAdditionalInfo({
      osuId: chosenOsuId.value === null ? null : `${chosenOsuId.value}`,
      nick: chosenNick.value ?? "",
      digitCategory: chosenDigit.value,
      skillsets: JSON.stringify(chosenCategories.value),
    });
    await usersStore.loadAllUsers();
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
  &__avatar-inputs-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    @media (max-width: $tablet-l) {
      flex-direction: column;
    }
  }
  &__avatar {
    max-width: 276px;
    width: 100%;
  }
  &__inputs-wrapper {
    flex-grow: 1;
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
