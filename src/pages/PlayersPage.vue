<template>
  <div class="players-page">
    <h2 class="players-page__headline">Наши Игроки</h2>
    <div class="players-page__tabs-wrapper">
      <v-tabs v-model="currTab" show-arrows grow>
        <v-tab value="all" class="players-page__tab-title">Все</v-tab>
        <v-tab value="4-digit" class="players-page__tab-title">
          4 Дигиты
        </v-tab>
        <v-tab value="5-digit" class="players-page__tab-title">
          5 Дигиты
        </v-tab>
        <v-tab value="6-digit" class="players-page__tab-title">6 Дигиты</v-tab>
      </v-tabs>
      <v-divider class="border-opacity-100" />
      <v-tabs-window v-model="currTab">
        <v-tabs-window-item
          value="all"
          class="players-page__tab-window-wrapper"
        >
          <div class="skillsets-cards-grid">
            <v-tooltip
              v-for="(usersList, mapCategoryKey) in allUsersCategoriesMap"
              :key="mapCategoryKey"
              :text="getLeftAmountLabel(usersList.length)"
              location="top"
            >
              <template #activator="{ props }">
                <div
                  v-bind="props"
                  class="skillsets-cards-grid__skillset-wrapper"
                  :class="`skillsets-cards-grid__skillset-wrapper_${mapCategoryKey}`"
                >
                  <h3 class="skillsets-cards-grid__skillset-title">
                    {{ MAPS_CATEGORIES[mapCategoryKey] }}
                  </h3>
                  <v-divider
                    class="skillsets-cards-grid__divier border-opacity-50"
                  />
                  <div class="skillsets-cards-grid__players-list">
                    <template v-if="isLoading">
                      <v-skeleton-loader
                        v-for="i in 3"
                        :key="i"
                        type="list-item-avatar"
                        :loading="isLoading"
                        :color="CATEGORIES_COLORS[mapCategoryKey]"
                      />
                    </template>
                    <span
                      v-else-if="!isLoading && !usersList.length"
                      class="skillsets-cards-grid__players-list-item-label"
                    >
                      В поисках талантов...
                    </span>
                    <template v-else>
                      <UserCard
                        v-for="user in usersList"
                        :key="user.uid"
                        :osuId="user.osuId"
                        :nick="user.nick"
                      />
                    </template>
                  </div>
                </div>
              </template>
            </v-tooltip>
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item
          v-for="digitValue in DigitCategory"
          :key="digitValue"
          :value="digitValue"
          class="players-page__tab-window-wrapper"
        >
          <div class="skillsets-cards-grid">
            <v-tooltip
              v-for="(usersList, mapCategoryKey) in digitsCategoriesMap[
                digitValue
              ]"
              :key="mapCategoryKey"
              :text="getLeftAmountLabel(usersList.length)"
              location="top"
            >
              <template #activator="{ props }">
                <div
                  v-bind="props"
                  class="skillsets-cards-grid__skillset-wrapper"
                  :class="`skillsets-cards-grid__skillset-wrapper_${mapCategoryKey}`"
                >
                  <h3 class="skillsets-cards-grid__skillset-title">
                    {{ MAPS_CATEGORIES[mapCategoryKey] }}
                  </h3>
                  <v-divider
                    class="skillsets-cards-grid__divier border-opacity-50"
                  />
                  <div class="skillsets-cards-grid__players-list">
                    <template v-if="isLoading">
                      <v-skeleton-loader
                        v-for="i in 3"
                        :key="i"
                        type="list-item-avatar"
                        :loading="isLoading"
                        :color="CATEGORIES_COLORS[mapCategoryKey]"
                      />
                    </template>
                    <span
                      v-else-if="!isLoading && !usersList.length"
                      class="skillsets-cards-grid__players-list-item-label"
                    >
                      В поисках талантов...
                    </span>
                    <template v-else>
                      <UserCard
                        v-for="user in usersList"
                        :key="user.uid"
                        :osuId="user.osuId"
                        :nick="user.nick"
                      />
                    </template>
                  </div>
                </div>
              </template>
            </v-tooltip>
          </div>
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useUsersStore } from "@/stores/users";
import UserCard from "@/components/UserCard.vue";
import useToast from "@/composables/useToast";
import { DigitCategory, OsuMapCategory, type IAllUsersListItem } from "@/types";
import { MAPS_CATEGORIES, CATEGORIES_COLORS } from "@/constants";
import { getLeftAmountLabel } from "@/utils";

const usersStore = useUsersStore();

const { setErrorToast } = useToast();

const currTab = ref("all");
const isLoading = ref(false);

const allUsersCategoriesMap = computed(
  () =>
    Object.fromEntries(
      Object.keys(MAPS_CATEGORIES).map((mapCategoryKey) => [
        mapCategoryKey as OsuMapCategory,
        usersStore.users.filter((user) =>
          user.skillsets.includes(mapCategoryKey)
        ),
      ])
    ) as Record<OsuMapCategory, IAllUsersListItem[]>
);
const digitsCategoriesMap = computed(
  () =>
    Object.fromEntries(
      Object.values(DigitCategory).map((digitCategory) => [
        digitCategory,
        Object.fromEntries(
          Object.keys(MAPS_CATEGORIES).map((mapCategoryKey) => [
            mapCategoryKey,
            usersStore
              .getUsersByDigitCategory(digitCategory)
              .filter((user) => user.skillsets.includes(mapCategoryKey)),
          ])
        ),
      ])
    ) as Record<DigitCategory, Record<OsuMapCategory, IAllUsersListItem[]>>
);

onMounted(async () => {
  try {
    isLoading.value = true;
    await usersStore.getAllUsers();
  } catch (error) {
    const msg = error instanceof Error ? error?.message : error;
    setErrorToast(`Не удалось загрузить список игроков: ${msg}`);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.players-page {
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
  &__tabs-wrapper {
    color: var(--color-text);
    background-color: var(--color-tabs-bg);
  }
  &__tab-title {
    @include default-headline(24px, 24px, var(--color-text));
    @media (max-width: $tablet-l) {
      font-size: 20px;
      line-height: 20px;
    }
    @media (max-width: $phone-l) {
      font-size: 16px;
      line-height: 16px;
    }
  }
  &__tab-window-wrapper {
    padding: 10px;
  }
}

.skillsets-cards-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 10px;
  @media (max-width: $pc-l) {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(7, 1fr);
  }
  @media (max-width: $tablet-s) {
    grid-template-columns: repeat(1, 1fr);
    grid-template-rows: repeat(21, 1fr);
  }
  &__skillset-wrapper {
    padding: 10px;
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    border-radius: 5px;
    &_nm1 {
      background-color: var(--color-btn-bg-nm1);
    }
    &_nm2 {
      background-color: var(--color-btn-bg-nm2);
    }
    &_nm3 {
      background-color: var(--color-btn-bg-nm3);
    }
    &_nm4 {
      background-color: var(--color-btn-bg-nm4);
    }
    &_nm5 {
      background-color: var(--color-btn-bg-nm5);
    }
    &_nm6 {
      background-color: var(--color-btn-bg-nm6);
    }
    &_nm7 {
      background-color: var(--color-btn-bg-nm7);
    }
    &_hd1 {
      background-color: var(--color-btn-bg-hd1);
    }
    &_hd2 {
      background-color: var(--color-btn-bg-hd2);
    }
    &_hd3 {
      background-color: var(--color-btn-bg-hd3);
    }
    &_hr1 {
      background-color: var(--color-btn-bg-hr1);
    }
    &_hr2 {
      background-color: var(--color-btn-bg-hr2);
    }
    &_hr3 {
      background-color: var(--color-btn-bg-hr3);
    }
    &_dt1 {
      background-color: var(--color-btn-bg-dt1);
    }
    &_dt2 {
      background-color: var(--color-btn-bg-dt2);
    }
    &_dt3 {
      background-color: var(--color-btn-bg-dt3);
    }
    &_dt4 {
      background-color: var(--color-btn-bg-dt4);
    }
    &_fm1 {
      background-color: var(--color-btn-bg-fm1);
    }
    &_fm2 {
      background-color: var(--color-btn-bg-fm2);
    }
    &_fm3 {
      background-color: var(--color-btn-bg-fm3);
    }
    &_tb {
      background-color: var(--color-btn-bg-tb);
    }
  }
  &__skillset-title {
    @include default-headline(22px, 22px, var(--color-text-white));
    text-align: center;
  }
  &__divier {
    color: var(--color-text-white);
  }
  &__players-list {
    display: flex;
    flex-direction: column;
    row-gap: 5px;
  }
  &__players-list-item-label {
    @include default-text(20px, 20px, var(--color-text-white));
  }
}
</style>
