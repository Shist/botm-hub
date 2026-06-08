<template>
  <div class="club-profile-page">
    <v-skeleton-loader type="image, article, table" :loading="isLoading">
      <div v-if="isValidClub && clubData" class="club-profile-page__content">
        <h2
          class="club-profile-page__headline"
          :style="{ color: `var(--color-club-${normalizedClubId})` }"
        >
          {{ clubTitle }}
        </h2>
        <div class="club-profile-page__header-section">
          <div class="club-profile-page__join-wrapper">
            <h3 class="club-profile-page__sub-headline">Статус</h3>
            <div class="club-profile-page__status-info">
              <template v-if="isActiveMember">
                <v-tooltip
                  :text="`Дата вступления: ${formattedJoinedDate}`"
                  location="bottom"
                >
                  <template #activator="{ props }">
                    <span v-bind="props" class="club-profile-page__status-text">
                      Ты состоишь в клубе вот уже:<br />
                      <b>{{ membershipDuration }}</b>
                    </span>
                  </template>
                </v-tooltip>
              </template>
              <span
                v-else
                class="club-profile-page__status-text club-profile-page__status-text_out"
              >
                Ты ещё не в клубе
              </span>
            </div>
            <v-tooltip
              :disabled="!joinBtnTooltipText"
              :text="joinBtnTooltipText"
              location="bottom"
            >
              <template #activator="{ props }">
                <div
                  v-bind="props"
                  class="w-100 club-profile-page__join-btn-wrapper"
                >
                  <v-btn
                    :disabled="isJoinBtnDisabled"
                    :loading="isUpdatingMembership"
                    height="50"
                    class="club-profile-page__join-btn"
                    :class="{
                      'club-profile-page__join-btn_exit': isActiveMember,
                    }"
                    @click="onMembershipBtnClick"
                  >
                    {{ isActiveMember ? "Покинуть клуб" : "Вступить в клуб" }}
                  </v-btn>
                </div>
              </template>
            </v-tooltip>
          </div>
          <v-divider
            vertical
            class="club-profile-page__divider-desktop border-opacity-100"
          />
          <v-divider
            class="club-profile-page__divider-mobile club-profile-page__divider-mobile_bottom border-opacity-100"
          />
          <div class="club-profile-page__skillsets-section">
            <h3 class="club-profile-page__sub-headline">Специализация Клуба</h3>
            <div class="club-profile-page__skillsets-wrapper">
              <v-tooltip
                v-for="skillset in clubSkillsets"
                :key="skillset.category"
                :text="`Профильные моды: ${formatModsList(skillset.allowedMods)}`"
                location="top"
              >
                <template #activator="{ props }">
                  <div v-bind="props" class="club-profile-page__skillset-item">
                    <CategoryBadge :category="skillset.category" />
                  </div>
                </template>
              </v-tooltip>
            </div>
          </div>
          <v-divider
            vertical
            class="club-profile-page__divider-desktop border-opacity-100"
          />
          <v-divider
            class="club-profile-page__divider-mobile club-profile-page__divider-mobile_top border-opacity-100"
          />
          <div class="club-profile-page__leader-wrapper">
            <h3 class="club-profile-page__sub-headline">Лидер клуба</h3>
            <div class="club-profile-page__leader-card-and-bubble">
              <div class="club-profile-page__leader-side">
                <div class="club-profile-page__leader-card-wrapper">
                  <UserCard v-if="clubLeader" :user="clubLeader" />
                  <div v-else class="club-profile-page__no-leader-wrapper">
                    <span class="club-profile-page__no-leader">
                      Лидер пока не назначен
                    </span>
                  </div>
                </div>
              </div>
              <div class="club-profile-page__speech-bubble">
                <p class="club-profile-page__leader-message">
                  {{
                    clubData.leaderMessage || "(Лидер пока ничего не написал)"
                  }}
                </p>
              </div>
              <v-btn
                v-if="isLeaderOfThisClub"
                height="40"
                class="club-profile-page__edit-msg-btn"
                @click="isEditMessageModalOpened = true"
              >
                Изменить послание
              </v-btn>
            </div>
          </div>
        </div>
        <v-divider class="club-profile-page__divider border-opacity-100" />
        <div class="club-profile-page__table-section">
          <div class="club-profile-page__table-header">
            <h3 class="club-profile-page__sub-headline">
              Участники клуба
              <span class="club-profile-page__count">
                ({{ tableItems.length }})
              </span>
            </h3>
            <v-text-field
              v-model="searchQuery"
              variant="solo"
              prepend-inner-icon="mdi-magnify"
              label="Поиск по нику"
              placeholder="Введи ник игрока..."
              clearable
              hide-details
              density="compact"
              class="club-profile-page__search"
            />
          </div>
          <v-data-table-virtual
            :headers="tableHeaders"
            :items="tableItems"
            :search="searchQuery"
            :mobile-breakpoint="769"
            :custom-filter="
              (_, query, item) =>
                item?.raw.searchString.includes(query.toLowerCase())
            "
            item-value="rawMember.uid"
            class="club-profile-page__table"
            hover
            :sort-by="[{ key: 'points', order: 'desc' }]"
          >
            <template #[`item.userNick`]="{ item }">
              <div class="club-profile-page__table-user-wrapper">
                <UserCard :user="item.fullUser" />
              </div>
            </template>
            <template #[`item.joinedTimestamp`]="{ item }">
              <span>{{ formatDateTimeForTable(item.rawMember.joinedAt) }}</span>
            </template>
            <template #[`item.points`]="{ item }">
              <span class="club-profile-page__points">
                {{ item.points.toFixed(2) }}
              </span>
            </template>
            <template #[`item.totalScores`]="{ item }">
              <span>{{ item.totalScores }}</span>
            </template>
            <template #[`item.avgScore`]="{ item }">
              <span class="club-profile-page__score">
                {{
                  item.avgScore > 0
                    ? item.avgScore.toLocaleString("ru-RU")
                    : "0"
                }}
              </span>
            </template>
            <template #[`item.avgAcc`]="{ item }">
              <span>{{ item.avgAcc.toFixed(2) }}%</span>
            </template>
            <template #[`item.avgCombo`]="{ item }">
              <span>{{ item.avgCombo }}x</span>
            </template>
            <template #no-data>
              <div class="club-profile-page__no-data">
                Нет данных об участниках
              </div>
            </template>
          </v-data-table-virtual>
        </div>
        <v-divider class="club-profile-page__divider border-opacity-100" />
        <div class="club-profile-page__scores-section">
          <h3 class="club-profile-page__sub-headline">
            Профильные Скоры Участников Клуба
            <span class="club-profile-page__count">
              ({{ clubScoresList.length }})
            </span>
          </h3>
          <ScoresTable
            :scoresList="clubScoresList"
            :isLoading="isLoading || isMapsLoading"
          />
        </div>
        <v-divider class="club-profile-page__divider border-opacity-100" />
        <div class="club-profile-page__maps-section">
          <h3 class="club-profile-page__sub-headline">
            Профильные Мапы Клуба
            <span class="club-profile-page__count">
              ({{ clubMaps.length }})
            </span>
          </h3>
          <SkillsetsMapsTable
            :mapsList="clubMaps"
            :isLoading="isMapsLoading"
            isFixedHeight
          />
        </div>
      </div>
      <div v-else-if="!isValidClub" class="club-profile-page__not-found">
        <h2 class="club-profile-page__not-found-headline">
          Такого клуба не существует
        </h2>
        <span class="club-profile-page__not-found-text">
          ID клуба: {{ displayClubId }}
        </span>
        <router-link to="/" class="club-profile-page__link-to-main">
          Назад на главную страницу
        </router-link>
      </div>
    </v-skeleton-loader>
    <LeaveClubModal
      v-if="isValidClub"
      :isOpened="isLeaveModalOpened"
      :clubId="normalizedClubId"
      @closeModal="isLeaveModalOpened = false"
      @closeModalAfterLeaving="isLeaveModalOpened = false"
    />
    <EditLeaderMsgModal
      v-if="isValidClub && clubData"
      :isOpened="isEditMessageModalOpened"
      :clubId="normalizedClubId"
      :currentMessage="clubData.leaderMessage"
      @closeModal="isEditMessageModalOpened = false"
      @closeModalAfterSaving="isEditMessageModalOpened = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useClubsStore } from "@/stores/clubs";
import { useAuthStore } from "@/stores/auth";
import { useUsersStore } from "@/stores/users";
import { useOsumapsStore } from "@/stores/osumaps";
import { useScoresStore } from "@/stores/scores";
import { isBotmClub, BotmClub } from "@/types/clubs";
import UserCard from "@/components/users/UserCard.vue";
import SkillsetsMapsTable from "@/components/osumaps/SkillsetsMapsTable.vue";
import ScoresTable from "@/components/scores/ScoresTable.vue";
import LeaveClubModal from "@/components/clubs/LeaveClubModal.vue";
import EditLeaderMsgModal from "@/components/clubs/EditLeaderMsgModal.vue";
import useToast from "@/composables/useToast";
import { getMembershipDurationLabel, formatModsList } from "@/utils";
import CategoryBadge from "@/components/osumaps/CategoryBadge.vue";
import { CLUB_SETTINGS } from "@/constants";

const route = useRoute();

const clubsStore = useClubsStore();
const authStore = useAuthStore();
const usersStore = useUsersStore();
const osumapsStore = useOsumapsStore();
const scoresStore = useScoresStore();

const { setErrorToast, setSuccessToast } = useToast();

const isLoading = ref(false);
const isUpdatingMembership = ref(false);
const isMapsLoading = ref(false);

const isLeaveModalOpened = ref(false);
const isEditMessageModalOpened = ref(false);

const displayClubId = computed(() => String(route.params.clubId));
const normalizedClubId = computed(
  () => displayClubId.value.toLowerCase() as BotmClub
);

const isValidClub = computed(() => isBotmClub(normalizedClubId.value));

const clubTitle = computed(() => {
  if (!isValidClub.value) return "";
  const name = `${normalizedClubId.value[0]?.toUpperCase()}${normalizedClubId.value.slice(1)}`;
  return `${name} Клуб`;
});

const clubData = computed(() => {
  if (!isValidClub.value) return null;
  return clubsStore.clubs[normalizedClubId.value] ?? null;
});

const clubLeader = computed(() => {
  if (!clubData.value?.leaderUid) return null;
  return (
    usersStore.users.find((u) => u.uid === clubData.value!.leaderUid) ?? null
  );
});

const currentUserUid = computed(() => authStore.user?.uid);

const currentUserMembershipRecord = computed(() => {
  if (!clubData.value || !currentUserUid.value) return null;
  return clubData.value.members[currentUserUid.value] ?? null;
});

const isActiveMember = computed(() => !!currentUserMembershipRecord.value);
const isLeaderOfThisClub = computed(
  () => clubLeader.value?.uid === currentUserUid.value
);
const isJoinBtnDisabled = computed(() => {
  return !currentUserUid.value || isLeaderOfThisClub.value;
});
const joinBtnTooltipText = computed(() => {
  if (!currentUserUid.value)
    return "Для вступления в клуб необходимо войти в аккаунт!";
  if (isLeaderOfThisClub.value) return "Лидер не может покинуть свой клуб!";
  return "";
});

const membershipDuration = computed(() => {
  if (!isActiveMember.value || !currentUserMembershipRecord.value) return "";
  return getMembershipDurationLabel(currentUserMembershipRecord.value.joinedAt);
});

const formattedJoinedDate = computed(() => {
  const date = currentUserMembershipRecord.value?.joinedAt;
  if (!date) return "";
  const dateStr = date.toLocaleDateString("ru-RU");
  const timeStr = date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateStr}, ${timeStr}`;
});

const clubSkillsets = computed(() => {
  if (!isValidClub.value) return [];
  return CLUB_SETTINGS[normalizedClubId.value].skillsets;
});

const clubMaps = computed(() => {
  if (!isValidClub.value) return [];
  const allowedSkillsets = clubSkillsets.value.map((s) => s.category);
  return osumapsStore.getMapsOfGivenCategories(allowedSkillsets);
});

const clubScoresList = computed(() => {
  if (!clubData.value) return [];
  const memberUids = Object.keys(clubData.value.members);
  if (!memberUids.length) return [];
  const allMemberScores = scoresStore.getFlatScoresTableData(memberUids);
  return allMemberScores.filter((score) => {
    return clubSkillsets.value.some((clubRule) => {
      const hasCategory = score.mapCategories.includes(clubRule.category);
      const isModAllowed = clubRule.allowedMods.includes(score.mods);
      return hasCategory && isModAllowed;
    });
  });
});

const searchQuery = ref("");

const tableHeaders = [
  { title: "Игрок", key: "userNick", minWidth: "300px" },
  {
    title: "Дата вступления",
    key: "joinedTimestamp",
    minWidth: "165px",
  },
  {
    title: "Очки",
    key: "points",
    align: "center" as const,
    minWidth: "120px",
  },
  {
    title: "Скоров",
    key: "totalScores",
    align: "center" as const,
    minWidth: "102px",
  },
  {
    title: "Средний Скор",
    key: "avgScore",
    align: "center" as const,
    minWidth: "146px",
  },
  {
    title: "Средняя Акка",
    key: "avgAcc",
    align: "center" as const,
    minWidth: "145px",
  },
  {
    title: "Среднее Комбо",
    key: "avgCombo",
    align: "center" as const,
    minWidth: "156px",
  },
];

const tableItems = computed(() => {
  if (!clubData.value?.members) return [];

  const items = [];

  for (const member of Object.values(clubData.value.members)) {
    const fullUser = usersStore.users.find((u) => u.uid === member.uid);
    if (!fullUser) continue;

    const userClubScores = clubScoresList.value.filter(
      (s) => s.uid === member.uid
    );

    let points = 0;
    const totalScores = userClubScores.length;
    let avgScore = 0;
    let avgAcc = 0;
    let avgCombo = 0;

    if (totalScores > 0) {
      const sumPoints = userClubScores.reduce((acc, s) => acc + s.points, 0);
      const sumScore = userClubScores.reduce((acc, s) => acc + s.score, 0);
      const sumAcc = userClubScores.reduce((acc, s) => acc + s.accuracy, 0);
      const sumCombo = userClubScores.reduce((acc, s) => acc + s.combo, 0);

      points = sumPoints;
      avgScore = Math.round(sumScore / totalScores);
      avgAcc = Number((sumAcc / totalScores).toFixed(2));
      avgCombo = Math.round(sumCombo / totalScores);
    }

    items.push({
      rawMember: member,
      fullUser: fullUser,
      userNick: fullUser.nick,
      searchString: fullUser.nick.toLowerCase(),
      joinedTimestamp: member.joinedAt ? member.joinedAt.getTime() : 0,
      totalScores,
      points,
      avgScore,
      avgAcc,
      avgCombo,
    });
  }

  return items;
});

const formatDateTimeForTable = (date: Date | null) => {
  if (!date) return "—";
  const dateStr = date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateStr} ${timeStr}`;
};

const onMembershipBtnClick = async () => {
  if (!currentUserUid.value || !isValidClub.value) return;

  if (isActiveMember.value) {
    isLeaveModalOpened.value = true;
  } else {
    try {
      isUpdatingMembership.value = true;
      await clubsStore.joinClub(normalizedClubId.value, currentUserUid.value);
      setSuccessToast("👋👋👋 Добро пожаловать в клуб!!! 👋👋👋");
    } catch (error) {
      const msg = error instanceof Error ? error?.message : error;
      setErrorToast(`Ошибка: ${msg}`);
    } finally {
      isUpdatingMembership.value = false;
    }
  }
};

onMounted(async () => {
  if (!isValidClub.value) return;

  try {
    isLoading.value = true;
    isMapsLoading.value = true;

    await Promise.all([
      usersStore.getAllUsersAndLoadClubs(),
      osumapsStore.loadAllMaps(),
      scoresStore.loadAllScores(),
    ]);
  } catch (error) {
    const msg = error instanceof Error ? error?.message : error;
    setErrorToast(
      `Не удалось загрузить данные юзеров, клубов, карт или скоров: ${msg}`
    );
  } finally {
    isLoading.value = false;
    isMapsLoading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.club-profile-page {
  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 30px;
    width: 100%;
  }
  &__headline {
    @include default-headline(44px, 44px, var(--color-text));
    text-align: center;
    text-transform: uppercase;
    @media (max-width: $tablet-l) {
      font-size: 32px;
      line-height: 32px;
    }
    @media (max-width: $phone-l) {
      font-size: 24px;
      line-height: 24px;
    }
  }
  &__sub-headline {
    @include default-headline(28px, 28px, var(--color-text));
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }
  &__count {
    @include default-text(24px, 24px, var(--color-text));
  }
  &__divider {
    width: 100%;
  }
  &__header-section {
    display: flex;
    width: 100%;
    gap: 30px;
    justify-content: center;
    @media (max-width: $laptop-l) {
      flex-direction: column;
      align-items: center;
    }
  }
  &__divider-desktop {
    @media (max-width: $laptop-l) {
      display: none;
    }
  }
  &__divider-mobile {
    display: none;
    @media (max-width: $laptop-l) {
      display: block;
      width: 100%;
      max-width: 500px;
      margin: 0 auto;
    }
    &_top {
      order: 2;
    }
    &_bottom {
      order: 4;
    }
  }
  &__join-wrapper {
    flex: 0 0 320px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    background-color: var(--color-tabs-bg);
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    @media (max-width: $laptop-l) {
      width: 100%;
      max-width: 500px;
      flex: none;
      order: 5;
    }
  }
  &__skillsets-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    @media (max-width: $laptop-l) {
      order: 1;
    }
  }
  &__skillsets-wrapper {
    display: grid;
    grid-template-columns: repeat(6, auto);
    gap: 15px;
    justify-content: center;
    @media (max-width: $pc-s) {
      grid-template-columns: repeat(3, auto);
    }
    @media (max-width: $laptop-l) {
      grid-template-columns: repeat(6, auto);
    }
  }
  &__skillset-item {
    cursor: help;
  }
  &__leader-wrapper {
    flex: 0 0 320px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    min-width: 0;
    @media (max-width: $laptop-l) {
      width: 100%;
      max-width: 500px;
      flex: none;
      order: 3;
    }
  }
  &__leader-card-and-bubble {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: 20px;
  }
  &__leader-side {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    max-width: 320px;
  }
  &__leader-card-wrapper {
    background-color: var(--color-tabs-bg);
    padding: 10px;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
  &__edit-msg-btn {
    @include default-btn(100%, var(--color-btn-text), var(--color-btn-bg), 0);
    max-width: 320px;
    font-size: 14px;
    font-weight: bold;
  }
  &__no-leader-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    border: 2px dashed var(--color-text);
    opacity: 0.5;
    border-radius: 8px;
  }
  &__no-leader {
    @include default-text(18px, 18px, var(--color-text));
    font-style: italic;
  }
  &__speech-bubble {
    position: relative;
    background: var(--color-text-area-bg);
    border-radius: 16px;
    padding: 20px;
    width: 100%;
    max-width: 320px;
    min-height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    &::after {
      content: "";
      position: absolute;
      top: -15px;
      left: 50%;
      transform: translateX(-50%);
      border-width: 0 15px 20px 15px;
      border-style: solid;
      border-color: transparent transparent var(--color-text-area-bg)
        transparent;
    }
  }
  &__leader-message {
    @include default-text(18px, 24px, var(--color-text));
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-y: auto;
    max-height: 200px;
    padding-right: 5px;
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: var(--color-scrollbar-thumb);
      border-radius: 4px;
    }
  }
  &__status-info {
    text-align: center;
    min-height: 60px;
    display: flex;
    align-items: center;
  }
  &__status-text {
    @include default-text(18px, 24px, var(--color-text));
    b {
      display: block;
      margin-top: 5px;
      color: var(--color-link-active);
      font-size: 20px;
    }
    &_out {
      opacity: 0.7;
    }
  }
  &__join-btn-wrapper {
    margin-top: auto;
  }
  &__join-btn {
    @include default-btn(
      100%,
      var(--color-text-white),
      var(--color-club-join),
      0
    );
    font-size: 18px;
    &_exit,
    &_exit:disabled {
      background-color: var(--color-club-exit);
    }
  }
  &__table-section {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  &__table-header {
    padding-inline: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    @media (max-width: $tablet-m) {
      flex-direction: column;
      align-items: stretch;
    }
  }
  &__search {
    max-width: 400px;
    @media (max-width: $tablet-m) {
      max-width: 100%;
    }
  }
  &__table {
    border: 4px solid var(--color-vuetify-table-borders);
    border-radius: 4px;
    height: 600px;
    & :deep(th) {
      vertical-align: middle;
      font-weight: bold;
    }
    & :deep(td) {
      vertical-align: middle;
    }
  }
  &__table-user-wrapper {
    padding: 8px 0;
  }
  &__status-chip {
    font-weight: bold;
    letter-spacing: 0.5px;
  }
  &__points {
    color: var(--color-points);
    font-weight: bold;
  }
  &__score {
    font-weight: bold;
  }
  &__no-data {
    padding: 40px;
    text-align: center;
    @include default-text(18px, 18px, var(--color-text));
    opacity: 0.7;
  }
  &__scores-section {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  &__maps-section {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  &__not-found {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    row-gap: 20px;
  }
  &__not-found-headline {
    @include default-headline(44px, 44px, var(--color-text));
    @media (max-width: $tablet-l) {
      font-size: 36px;
      line-height: 36px;
    }
    @media (max-width: $phone-l) {
      font-size: 28px;
      line-height: 28px;
    }
  }
  &__not-found-text {
    @include default-text(36px, 36px, var(--color-text));
    @media (max-width: $tablet-l) {
      font-size: 20px;
      line-height: 20px;
    }
    @media (max-width: $phone-l) {
      font-size: 16px;
      line-height: 16px;
    }
  }
  &__link-to-main {
    @include default-text(36px, 36px, var(--color-text));
    transition: 0.3s;
    &:hover {
      scale: 1.05;
      translate: 10px;
      color: var(--color-link-active);
    }
    @media (max-width: $tablet-l) {
      font-size: 28px;
      line-height: 28px;
    }
    @media (max-width: $phone-l) {
      font-size: 24px;
      line-height: 24px;
    }
  }
}
</style>
