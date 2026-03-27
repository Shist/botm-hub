<template>
  <v-expansion-panel :value="tournament.id" class="tournament-card">
    <template #title>
      <div class="tournament-card__panel-header-wrapper">
        <div class="tournament-card__titles-wrapper">
          <h3 class="tournament-card__tournament-name">
            {{ tournament.title }}
          </h3>
          <h4 class="tournament-card__format">
            Ранги: {{ tournament.rankRange }}
          </h4>
        </div>
        <div class="tournament-card__status-wrapper">
          <span
            v-if="remainingTimeLabel"
            class="tournament-card__left-days-label"
          >
            {{ remainingTimeLabel }}
          </span>
          <TournamentStatusBadge :status="currentStatus" />
        </div>
      </div>
    </template>
    <template #text>
      <v-divider class="border-opacity-100" />
      <div class="tournament-card__info-wrapper">
        <div class="tournament-card__tournament-info-wrapper">
          <div class="tournament-card__tournament-details-wrapper">
            <span>Дата начала:</span>
            <span>{{ startDateLabel }}</span>
            <span>Дата конца:</span>
            <span>{{ endDateLabel }}</span>
            <span>Описание:</span>
            <p class="tournament-card__tournament-description">
              {{ tournament.description }}
            </p>
            <span>Формат сетки:</span>
            <span>
              {{
                `${tournament.isDoubleElimination ? "Double" : "Single"} Elimination`
              }}
            </span>
            <span>Формат:</span>
            <span>{{ tournament.format }}</span>
            <span>Размер команды:</span>
            <span>{{ tournament.teamSize }}</span>
            <span>Ссылки:</span>
            <div class="tournament-card__tournament-links-wrapper">
              <v-tooltip
                v-if="tournament.forumPostLink"
                text="Форум Пост"
                location="top"
              >
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    :href="tournament.forumPostLink"
                    target="_blank"
                    icon="mdi-forum"
                    size="small"
                    rounded="lg"
                    class="tournament-card__link-btn tournament-card__link-btn_forum"
                  />
                </template>
              </v-tooltip>
              <v-tooltip
                v-if="tournament.mainSheetLink"
                text="Мейн Шит"
                location="top"
              >
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    :href="tournament.mainSheetLink"
                    target="_blank"
                    icon="mdi-google-spreadsheet"
                    size="small"
                    rounded="lg"
                    class="tournament-card__link-btn tournament-card__link-btn_sheet"
                  />
                </template>
              </v-tooltip>
              <v-tooltip
                v-if="tournament.challongeLink"
                text="Сетка"
                location="top"
              >
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    :href="tournament.challongeLink"
                    target="_blank"
                    icon="mdi-tournament"
                    size="small"
                    rounded="lg"
                    class="tournament-card__link-btn tournament-card__link-btn_challonge"
                  />
                </template>
              </v-tooltip>
              <v-tooltip
                v-if="tournament.twitchFirstLink"
                text="Twitch (мейн канал)"
                location="top"
              >
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    :href="tournament.twitchFirstLink"
                    target="_blank"
                    icon="mdi-twitch"
                    size="small"
                    rounded="lg"
                    class="tournament-card__link-btn tournament-card__link-btn_twitch-1"
                  />
                </template>
              </v-tooltip>
              <v-tooltip
                v-if="tournament.twitchSecondLink"
                text="Twitch (доп. канал)"
                location="top"
              >
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    :href="tournament.twitchSecondLink"
                    target="_blank"
                    icon="mdi-twitch"
                    size="small"
                    rounded="lg"
                    class="tournament-card__link-btn tournament-card__link-btn_twitch-2"
                  />
                </template>
              </v-tooltip>
              <span v-if="!hasAnyLink" class="tournament-card__no-links-label">
                (Нет ссылок)
              </span>
            </div>
          </div>
          <div class="tournament-card__btns-wrapper">
            <v-btn
              v-if="isUserRedactor && isTournamentEditable"
              v-bind="props"
              height="50"
              class="tournament-card__btn tournament-card__btn_negative"
              @click="$emit('onDeleteTournament', tournament.id)"
            >
              Удалить запись о турнире
            </v-btn>
            <v-btn
              v-if="isUserRedactor && isTournamentEditable"
              height="50"
              class="tournament-card__btn"
              @click="$emit('onEditTournament', tournament)"
            >
              Изменить запись о турнире
            </v-btn>
            <v-btn
              v-if="isUserRedactor && isArchiveTournamentBtnVisible"
              height="50"
              class="tournament-card__btn tournament-card__btn_archive"
              @click="$emit('onArchiveTournament', tournament.id)"
            >
              Заархивировать запись о турнире
            </v-btn>
          </div>
        </div>
        <v-divider
          class="tournament-card__horizontal-divider border-opacity-100"
        />
        <v-divider
          vertical
          class="tournament-card__vertical-divider border-opacity-100"
        />
        <div class="tournament-card__players-info-wrapper">
          <h4 class="tournament-card__players-title">Наши Игроки</h4>
          <v-expansion-panels
            v-if="sortedRosters.length"
            v-model="expandedRosterPanel"
          >
            <TournamentRosterCard
              v-for="roster in sortedRosters"
              :key="roster.id"
              :roster="roster"
            />
          </v-expansion-panels>
          <span v-else class="tournament-card__no-links-label mt-2">
            Игроки пока не заявлены
          </span>
        </div>
      </div>
    </template>
  </v-expansion-panel>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useDate } from "vuetify";
import TournamentStatusBadge from "@/components/TournamentStatusBadge.vue";
import TournamentRosterCard from "@/components/TournamentRosterCard.vue";
import { useAuthStore } from "@/stores/auth";
import { TournamentStatus, type IAllTournamentsListItem } from "@/types";
import { fromSecondsToDurationLabel } from "@/utils";
import { STAGES_SORT_PRIORITIES } from "@/constants";

const props = defineProps<{
  tournament: IAllTournamentsListItem;
  currDate: Date;
}>();

defineEmits<{
  onEditTournament: [tournament: IAllTournamentsListItem];
  onDeleteTournament: [tournamentId: string];
  onArchiveTournament: [tournamentId: string];
}>();

defineExpose({
  tournamentId: props.tournament.id,
});

const vuetifyDate = useDate();
const authStore = useAuthStore();

const expandedRosterPanel = ref<string | null>(
  props.tournament.rostersInfo.length === 1
    ? (props.tournament.rostersInfo[0]?.id ?? null)
    : null
);

const isUserRedactor = computed(() => {
  return authStore.userAdditionalInfo?.isRedactor ?? false;
});
const timeDiffSeconds = computed(() => {
  return (
    vuetifyDate.getDiff(props.tournament.datesInfo.endDate, props.currDate) /
    1000
  );
});
const currentStatus = computed(() => {
  if (props.tournament.isArchived) {
    return TournamentStatus.archived;
  } else if (props.currDate < props.tournament.datesInfo.startDate) {
    return TournamentStatus.announced;
  } else if (timeDiffSeconds.value > 0) {
    return TournamentStatus.active;
  } else {
    return TournamentStatus.completed;
  }
});
const startDateLabel = computed(() => {
  const dateLabel = vuetifyDate.format(
    props.tournament.datesInfo.startDate,
    "fullDateWithWeekday"
  );
  const timeLabel = vuetifyDate.format(
    props.tournament.datesInfo.startDate,
    "fullTime24h"
  );
  return `${dateLabel}, ${timeLabel}`;
});
const endDateLabel = computed(() => {
  const dateLabel = vuetifyDate.format(
    props.tournament.datesInfo.endDate,
    "fullDateWithWeekday"
  );
  const timeLabel = vuetifyDate.format(
    props.tournament.datesInfo.endDate,
    "fullTime24h"
  );
  return `${dateLabel}, ${timeLabel}`;
});
const hasAnyLink = computed(() => {
  return !!(
    props.tournament.forumPostLink ||
    props.tournament.mainSheetLink ||
    props.tournament.challongeLink ||
    props.tournament.twitchFirstLink ||
    props.tournament.twitchSecondLink
  );
});
const remainingTimeLabel = computed(() => {
  if (currentStatus.value === TournamentStatus.announced) {
    const diff =
      vuetifyDate.getDiff(
        props.tournament.datesInfo.startDate,
        props.currDate
      ) / 1000;
    return fromSecondsToDurationLabel(diff);
  } else if (currentStatus.value === TournamentStatus.active) {
    const diff =
      vuetifyDate.getDiff(props.tournament.datesInfo.endDate, props.currDate) /
      1000;
    return fromSecondsToDurationLabel(diff);
  }
  return null;
});
const isTournamentEditable = computed(() => {
  return currentStatus.value !== TournamentStatus.archived;
});
const isArchiveTournamentBtnVisible = computed(() => {
  return currentStatus.value === TournamentStatus.completed;
});
const sortedRosters = computed(() => {
  return [...props.tournament.rostersInfo].sort((a, b) => {
    const weightA = STAGES_SORT_PRIORITIES[a.achievedStage ?? "Not Specified"];
    const weightB = STAGES_SORT_PRIORITIES[b.achievedStage ?? "Not Specified"];
    if (weightA !== weightB) {
      return weightA - weightB;
    }
    return a.teamName.localeCompare(b.teamName);
  });
});
</script>

<style lang="scss" scoped>
.tournament-card {
  border-radius: 10px;
  &__panel-header-wrapper {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    @media (max-width: $phone-l) {
      flex-direction: column;
      align-items: flex-start;
    }
  }
  &__titles-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  &__tournament-name {
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
  &__format {
    @include default-text(24px, 24px, var(--color-text));
    @media (max-width: $tablet-l) {
      font-size: 20px;
      line-height: 20px;
    }
    @media (max-width: $phone-l) {
      font-size: 16px;
      line-height: 16px;
    }
  }
  &__status-wrapper {
    margin-right: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }
  &__left-days-label {
    text-align: right;
    @include default-text(24px, 24px, var(--color-text));
    @media (max-width: $tablet-l) {
      margin-right: 10px;
      font-size: 20px;
      line-height: 20px;
    }
    @media (max-width: $phone-l) {
      text-align: left;
      margin-right: 5px;
      font-size: 16px;
      line-height: 16px;
    }
  }
  &__info-wrapper {
    padding: 10px;
    display: flex;
    gap: 10px;
    @media (max-width: $laptop-m) {
      padding: 5px;
      flex-direction: column;
    }
  }
  &__tournament-info-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 10px;
  }
  &__horizontal-divider {
    display: none;
    @media (max-width: $laptop-m) {
      display: block;
    }
  }
  &__vertical-divider {
    display: block;
    @media (max-width: $laptop-m) {
      display: none;
    }
  }
  &__tournament-details-wrapper {
    display: grid;
    grid-template-columns: 170px auto;
    gap: 10px;
    :nth-child(odd) {
      justify-self: end;
      text-align: end;
    }
    @include default-text(20px, 20px, var(--color-text));
    @media (max-width: $laptop-m) {
      grid-template-columns: 115px auto;
      font-size: 16px;
      line-height: 16px;
    }
    @media (max-width: $phone-l) {
      grid-template-columns: 100px auto;
      font-size: 14px;
      line-height: 14px;
    }
    @media (max-width: $phone-m) {
      grid-template-columns: repeat(1, 1fr);
      justify-items: center;
      :nth-child(odd) {
        justify-self: center;
        text-align: center;
      }
      :nth-child(even) {
        text-align: center;
      }
    }
  }
  &__tournament-description {
    padding: 5px;
    height: 150px;
    overflow-y: auto;
    overflow-x: hidden;
    word-break: break-word;
    background-color: var(--color-text-area-bg);
  }
  &__tournament-links-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    @media (max-width: $phone-l) {
      gap: 5px;
    }
  }
  &__link-btn {
    border: 2px solid;
    transition: all 0.4s ease;
    &_forum {
      color: var(--color-tournament-forum-post);
      border-color: var(--color-tournament-forum-post);
      &:hover {
        filter: brightness(var(--tournament-link-hover-brightness));
      }
    }
    &_sheet {
      color: var(--color-tournament-main-sheet);
      border-color: var(--color-tournament-main-sheet);
      &:hover {
        filter: brightness(var(--tournament-link-hover-brightness));
      }
    }
    &_challonge {
      color: var(--color-tournament-challonge);
      border-color: var(--color-tournament-challonge);
      &:hover {
        filter: brightness(var(--tournament-link-hover-brightness));
      }
    }
    &_twitch-1 {
      color: var(--color-tournament-twitch-1);
      border-color: var(--color-tournament-twitch-1);
      &:hover {
        filter: brightness(var(--tournament-link-hover-brightness));
      }
    }
    &_twitch-2 {
      color: var(--color-tournament-twitch-2);
      border-color: var(--color-tournament-twitch-2);
      &:hover {
        filter: brightness(var(--tournament-link-hover-brightness));
      }
    }
  }
  &__no-links-label {
    opacity: 0.7;
    font-style: italic;
    font-size: 14px;
    color: var(--color-text);
  }
  &__btns-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  &__btn {
    @include default-btn(100%, var(--color-btn-text), var(--color-btn-bg), 0);
    @media (max-width: $phone-l) {
      font-size: 12px;
      line-height: 12px;
    }
    @media (max-width: $phone-m) {
      font-size: 10px;
      line-height: 10px;
    }
    &_negative {
      background-color: var(--color-tournament-deletion);
      &:disabled {
        background-color: var(--color-tournament-deletion);
      }
    }
    &_archive {
      background-color: var(--color-tournament-archived);
      &:disabled {
        background-color: var(--color-tournament-archived);
      }
    }
  }
  &__players-info-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  &__players-title {
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
}
</style>
