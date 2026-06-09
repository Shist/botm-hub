<template>
  <div class="personal-account-page">
    <v-skeleton-loader type="image, article, table" :loading="isPageLoading">
      <div class="personal-account-page__header-wrapper">
        <h2 class="personal-account-page__headline">Личный Кабинет</h2>
        <v-btn
          v-if="currentNick"
          :to="`/players/${encodeURIComponent(currentNick)}`"
          variant="outlined"
          color="var(--color-text)"
          prepend-icon="mdi-account-eye"
          class="personal-account-page__public-link-btn"
        >
          Публичный профиль
        </v-btn>
      </div>
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
            :rules="[
              rules.min(3),
              rules.max(15),
              rules.notOnlySpaces,
              rules.noEdgeSpaces,
              rules.noMultipleSpaces,
              rules.noMultipleUnderscores,
            ]"
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
          <v-textarea
            v-model="chosenDescription"
            :counter="300"
            :rules="[rules.max(300)]"
            variant="solo"
            prepend-inner-icon="mdi-text-box-outline"
            label="О себе"
            placeholder="Здесь ты можешь написать пару слов о себе..."
            persistent-counter
            clearable
            auto-grow
            rows="3"
            max-rows="3"
          />
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
      <v-divider class="border-opacity-100" />
      <h2 class="personal-account-page__scores-headline">
        Мои Скоры
        <span class="personal-account-page__count">
          ({{ myScoresList.length }})
        </span>
      </h2>
      <div class="personal-account-page__scores-actions">
        <v-tooltip
          :disabled="currentOsuId !== null"
          text="Для загрузки скоров через MP линк сперва необходимо указать osu! ID"
          location="top"
        >
          <template #activator="{ props }">
            <div v-bind="props" class="personal-account-page__tooltip-wrapper">
              <v-btn
                :disabled="currentOsuId === null"
                height="50"
                prepend-icon="mdi-link-variant"
                class="personal-account-page__action-btn personal-account-page__action-btn_mp"
                @click="isMpModalOpened = true"
              >
                Загрузить по MP линку
              </v-btn>
            </div>
          </template>
        </v-tooltip>
        <v-btn
          height="50"
          prepend-icon="mdi-file-document"
          class="personal-account-page__action-btn personal-account-page__action-btn_osr"
          @click="isOsrModalOpened = true"
        >
          Загрузить .osr файл(ы)
        </v-btn>
      </div>
      <ScoresTable
        :scoresList="myScoresList"
        :isLoading="isPageLoading"
        :hiddenColumns="['user']"
      />
      <v-divider class="border-opacity-100" />
      <h3 class="personal-account-page__small-headline">
        Здесь уже много, что есть, но я всё равно оставил здесь коллаб с eh-ами
      </h3>
      <AppImage
        :imgPath="ehCollabImagePath"
        imgAlt="Коллаб белых котов eh-ов"
      />
    </v-skeleton-loader>
    <MpLinkModal
      :isOpened="isMpModalOpened"
      @closeModal="isMpModalOpened = false"
    />
    <OsrModal
      :isOpened="isOsrModalOpened"
      @closeModal="isOsrModalOpened = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useUsersStore } from "@/stores/users";
import { useOsumapsStore } from "@/stores/osumaps";
import { useScoresStore } from "@/stores/scores";
import SkillsetsSelect from "@/components/osumaps/SkillsetsSelect.vue";
import MpLinkModal from "@/components/scores/MpLinkModal.vue";
import OsrModal from "@/components/scores/OsrModal.vue";
import ScoresTable from "@/components/scores/ScoresTable.vue";
import useToast from "@/composables/useToast";
import useFormValidation from "@/composables/useFormValidation";
import ehCollabImage from "@/assets/images/eh-collab.png";
import { DigitCategory } from "@/types/users";
import { OsuMapCategory } from "@/types/osumaps";

const authStore = useAuthStore();
const usersStore = useUsersStore();
const osumapsStore = useOsumapsStore();
const scoresStore = useScoresStore();

const { setErrorToast, setSuccessToast } = useToast();
const { isFormValid, rules } = useFormValidation();

const chosenOsuId = ref<number | null>(null);
const chosenNick = ref<string | null>(null);
const chosenDigit = ref<DigitCategory | null>(null);
const chosenCategories = ref<OsuMapCategory[]>([]);
const chosenDescription = ref<string | null>(null);
const isUpdating = ref(false);
const ehCollabImagePath = ref(ehCollabImage);
const isMpModalOpened = ref(false);
const isOsrModalOpened = ref(false);
const isDependenciesLoading = ref(false);

const isPageLoading = computed(
  () =>
    authStore.user?.additionalInfo === "loading" || isDependenciesLoading.value
);

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
const currentDescription = computed(() => {
  return authStore.userAdditionalInfo?.profileDescription ?? "";
});
const currentUserUid = computed(() => authStore.user?.uid);

const isSomeInfoChanged = computed(() => {
  const osuIdFromStore =
    currentOsuId.value === null ? null : +currentOsuId.value;
  return (
    chosenOsuId.value !== osuIdFromStore ||
    chosenNick.value !== currentNick.value ||
    chosenDigit.value !== currentDigit.value ||
    chosenDescription.value !== currentDescription.value ||
    JSON.stringify(chosenCategories.value) !==
      JSON.stringify(currentSkillsets.value)
  );
});
const avatarSrc = computed(() => `https://a.ppy.sh/${currentOsuId.value}?.png`);

const myScoresList = computed(() => {
  if (!currentUserUid.value) return [];
  return scoresStore.getFlatScoresTableData([currentUserUid.value]);
});

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
watch(currentDescription, (valueFromStore) => {
  chosenDescription.value = valueFromStore;
});

onMounted(async () => {
  chosenOsuId.value = currentOsuId.value === null ? null : +currentOsuId.value;
  chosenNick.value = currentNick.value;
  chosenDigit.value = currentDigit.value;
  chosenCategories.value = currentSkillsets.value;
  chosenDescription.value = currentDescription.value;

  try {
    isDependenciesLoading.value = true;
    await Promise.all([
      usersStore.getAllUsersAndLoadClubs(),
      osumapsStore.loadAllMaps(),
      scoresStore.loadAllScores(),
    ]);
  } catch (error) {
    const msg = error instanceof Error ? error?.message : error;
    setErrorToast(
      `Не удалось загрузить данные юзеров, клубов, карт и скоров: ${msg}`
    );
  } finally {
    isDependenciesLoading.value = false;
  }
});

const onUpdate = async () => {
  try {
    isUpdating.value = true;

    await authStore.updateUserAdditionalInfo({
      osuId: chosenOsuId.value === null ? null : `${chosenOsuId.value}`,
      nick: chosenNick.value?.trim() ?? "",
      digitCategory: chosenDigit.value,
      skillsets: JSON.stringify(chosenCategories.value),
      profileDescription: chosenDescription.value?.trim() || null,
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
  &__header-wrapper {
    padding: 10px 20px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    @media (max-width: $tablet-l) {
      padding: 0;
      flex-direction: column;
      gap: 15px;
    }
  }
  &__public-link-btn {
    @media (max-width: $tablet-l) {
      width: 100%;
    }
  }
  &__headline {
    @include default-headline(36px, 36px, var(--color-text));
    text-align: center;
    @media (max-width: $tablet-l) {
      font-size: 28px;
      line-height: 28px;
    }
    @media (max-width: $phone-l) {
      font-size: 20px;
      line-height: 20px;
    }
  }
  &__scores-headline {
    @include default-headline(36px, 36px, var(--color-text));
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    text-align: center;
    @media (max-width: $tablet-l) {
      font-size: 28px;
      line-height: 28px;
    }
    @media (max-width: $phone-l) {
      font-size: 20px;
      line-height: 20px;
    }
  }
  &__count {
    @include default-text(32px, 32px, var(--color-text));
    @media (max-width: $tablet-l) {
      font-size: 24px;
      line-height: 24px;
    }
    @media (max-width: $phone-l) {
      font-size: 18px;
      line-height: 18px;
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
    max-width: 408px;
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
    text-align: center;
    @media (max-width: $tablet-l) {
      font-size: 22px;
      line-height: 22px;
    }
    @media (max-width: $phone-l) {
      font-size: 16px;
      line-height: 16px;
    }
  }
  &__scores-actions {
    display: flex;
    row-gap: 15px;
    column-gap: 20px;
    @media (max-width: $tablet-l) {
      flex-direction: column;
    }
  }
  &__tooltip-wrapper {
    display: flex;
    flex: 1;
    @media (max-width: $tablet-l) {
      flex: auto;
    }
  }
  &__action-btn {
    flex: 1;
    width: 100%;
    &_mp {
      @include default-btn(
        auto,
        var(--color-text-white),
        var(--color-btn-mp),
        0
      );
    }
    &_osr {
      @include default-btn(
        auto,
        var(--color-text-white),
        var(--color-btn-osr),
        0
      );
    }
    @media (max-width: $tablet-l) {
      flex: auto;
    }
  }
}
</style>
