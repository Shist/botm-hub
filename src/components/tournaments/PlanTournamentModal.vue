<template>
  <AppModal
    :isOpened="isOpened"
    :title="modalTitle"
    :isClosableByClickOutside="false"
    @closeModal="onCloseModal"
  >
    <template #default>
      <v-form
        v-model="isFormValid"
        class="plan-tournament-modal__modal-content-wrapper"
      >
        <v-text-field
          v-model="tournamentTitle"
          :counter="70"
          :rules="[rules.min(3), rules.max(70), rules.wordsNotMoreThan(20)]"
          variant="solo"
          prepend-inner-icon="mdi-format-title"
          label="Название турнира"
          placeholder="e.g. [STD] 6 Digit World Cup 2025 MJ"
          persistent-counter
          clearable
        />
        <v-text-field
          v-model="rankRange"
          :counter="20"
          :rules="[rules.min(3), rules.max(20)]"
          variant="solo"
          prepend-inner-icon="mdi-format-list-numbered"
          label="Ранговый диапазон"
          placeholder="e.g. 100k - 999k"
          persistent-counter
          clearable
        />
        <div class="plan-tournament-modal__grid-2-cols">
          <v-select
            v-model="tournamentFormat"
            :items="TOURNAMENT_FORMATS"
            variant="solo"
            prepend-inner-icon="mdi-account-group"
            label="Формат матчей"
            hide-details
          />
          <v-select
            v-model="teamSize"
            :items="TOURNAMENT_TEAM_SIZES"
            variant="solo"
            prepend-inner-icon="mdi-account-multiple-plus"
            label="Размер команды"
            hide-details
          />
        </div>
        <v-tooltip
          text="Формат сетки (каждая команда может проиграть 1 раз или 2 раза?)"
          location="top"
        >
          <template #activator="{ props }">
            <div v-bind="props" class="plan-tournament-modal__switch">
              <v-switch
                v-model="isDoubleElimination"
                color="var(--color-vuetify-switch)"
                prepend-icon="mdi-tournament"
                :label="bracketFormatLabel"
                hide-details
              />
            </div>
          </template>
        </v-tooltip>
        <v-divider class="my-2 border-opacity-100" />
        <v-tooltip
          text="Обычно, начало - 1-ое лобби квал, а конец - старт последнего матча + 2 часа"
          location="top"
        >
          <template #activator="{ props }">
            <div v-bind="props" class="plan-tournament-modal__dates-wrapper">
              <div class="plan-tournament-modal__grid-date-time">
                <v-menu
                  v-model="isStartDateMenuOpened"
                  :close-on-content-click="false"
                  content-class="vuetify-date-time-picker-wrapper"
                >
                  <template #activator="{ props }">
                    <v-text-field
                      v-bind="props"
                      :model-value="startDateLabel"
                      variant="solo"
                      prepend-inner-icon="mdi-calendar-arrow-right"
                      label="Дата начала турнира"
                      placeholder="Укажи дату начала турнира"
                      readonly
                      hide-details
                    />
                  </template>
                  <v-date-picker
                    v-model="startDate"
                    :max="maxStartDate"
                    min-width="320"
                    width="320"
                    color="var(--color-date-picker-header)"
                    title="Укажи дату начала турнира"
                    show-adjacent-months
                    divided
                  >
                    <template #actions>
                      <div
                        class="plan-tournament-modal__date-time-btns-wrapper"
                      >
                        <v-btn
                          height="50"
                          class="plan-tournament-modal__btn plan-tournament-modal__btn_cancel"
                          @click="onStartDateClear"
                        >
                          Очистить
                        </v-btn>
                        <v-btn
                          height="50"
                          class="plan-tournament-modal__btn"
                          @click="isStartDateMenuOpened = false"
                        >
                          Подтвердить
                        </v-btn>
                      </div>
                    </template>
                  </v-date-picker>
                </v-menu>
                <v-menu
                  v-model="isStartTimeMenuOpened"
                  :close-on-content-click="false"
                  content-class="vuetify-date-time-picker-wrapper"
                >
                  <template #activator="{ props }">
                    <v-text-field
                      v-bind="props"
                      :model-value="startTime"
                      variant="solo"
                      prepend-inner-icon="mdi-clock-start"
                      label="Время начала турнира"
                      placeholder="Укажи время начала турнира"
                      readonly
                      hide-details
                    />
                  </template>
                  <v-time-picker
                    v-model="startTime"
                    :max="maxStartTime"
                    format="24hr"
                    min-width="320"
                    width="320"
                    color="var(--color-time-picker-header)"
                    title="Укажи время начала турнира"
                    divided
                  >
                    <template #actions>
                      <div
                        class="plan-tournament-modal__date-time-btns-wrapper"
                      >
                        <v-btn
                          height="50"
                          class="plan-tournament-modal__btn plan-tournament-modal__btn_cancel"
                          @click="onStartTimeClear"
                        >
                          Очистить
                        </v-btn>
                        <v-btn
                          height="50"
                          class="plan-tournament-modal__btn"
                          @click="isStartTimeMenuOpened = false"
                        >
                          Подтвердить
                        </v-btn>
                      </div>
                    </template>
                  </v-time-picker>
                </v-menu>
              </div>
              <div class="plan-tournament-modal__grid-date-time">
                <v-menu
                  v-model="isEndDateMenuOpened"
                  :close-on-content-click="false"
                  content-class="vuetify-date-time-picker-wrapper"
                >
                  <template #activator="{ props }">
                    <v-text-field
                      v-bind="props"
                      :model-value="endDateLabel"
                      variant="solo"
                      prepend-inner-icon="mdi-calendar-check"
                      label="Дата конца турнира"
                      placeholder="Укажи дату конца турнира"
                      readonly
                      hide-details
                    />
                  </template>
                  <v-date-picker
                    v-model="endDate"
                    :min="minEndDate"
                    min-width="320"
                    width="320"
                    color="var(--color-date-picker-header)"
                    title="Укажи дату конца турнира"
                    show-adjacent-months
                    divided
                  >
                    <template #actions>
                      <div
                        class="plan-tournament-modal__date-time-btns-wrapper"
                      >
                        <v-btn
                          height="50"
                          class="plan-tournament-modal__btn plan-tournament-modal__btn_cancel"
                          @click="onEndDateClear"
                        >
                          Очистить
                        </v-btn>
                        <v-btn
                          height="50"
                          class="plan-tournament-modal__btn"
                          @click="isEndDateMenuOpened = false"
                        >
                          Подтвердить
                        </v-btn>
                      </div>
                    </template>
                  </v-date-picker>
                </v-menu>
                <v-menu
                  v-model="isEndTimeMenuOpened"
                  :close-on-content-click="false"
                  content-class="vuetify-date-time-picker-wrapper"
                >
                  <template #activator="{ props }">
                    <v-text-field
                      v-bind="props"
                      :model-value="endTime"
                      variant="solo"
                      prepend-inner-icon="mdi-clock-end"
                      label="Время конца турнира"
                      placeholder="Укажи время конца турнира"
                      readonly
                      hide-details
                    />
                  </template>
                  <v-time-picker
                    v-model="endTime"
                    :min="minEndTime"
                    format="24hr"
                    min-width="320"
                    width="320"
                    color="var(--color-time-picker-header)"
                    title="Укажи время конца турнира"
                    divided
                  >
                    <template #actions>
                      <div
                        class="plan-tournament-modal__date-time-btns-wrapper"
                      >
                        <v-btn
                          height="50"
                          class="plan-tournament-modal__btn plan-tournament-modal__btn_cancel"
                          @click="onEndTimeClear"
                        >
                          Очистить
                        </v-btn>
                        <v-btn
                          height="50"
                          class="plan-tournament-modal__btn"
                          @click="isEndTimeMenuOpened = false"
                        >
                          Подтвердить
                        </v-btn>
                      </div>
                    </template>
                  </v-time-picker>
                </v-menu>
              </div>
            </div>
          </template>
        </v-tooltip>
        <v-divider class="my-2 border-opacity-100" />
        <v-textarea
          v-model="tournamentDescription"
          :counter="1000"
          :rules="[rules.min(3), rules.max(1000)]"
          variant="solo"
          prepend-inner-icon="mdi-text"
          label="Описание турнира"
          placeholder="Расскажи вкратце про специфику турнира"
          persistent-counter
          clearable
          auto-grow
          rows="3"
        />
        <v-expansion-panels class="plan-tournament-modal__links-panels-wrapper">
          <v-expansion-panel title="Ссылки (Опционально)">
            <template #text>
              <div class="plan-tournament-modal__links-wrapper">
                <v-text-field
                  v-model="forumPostLink"
                  :counter="150"
                  :rules="[rules.optionalMin(15), rules.max(150)]"
                  label="Forum Post URL"
                  variant="outlined"
                  prepend-inner-icon="mdi-forum"
                  placeholder="e.g. https://osu.ppy.sh/community/forums/topics/727"
                  density="compact"
                  persistent-counter
                  clearable
                />
                <v-text-field
                  v-model="mainSheetLink"
                  :counter="200"
                  :rules="[rules.optionalMin(15), rules.max(200)]"
                  label="Main Sheet URL"
                  variant="outlined"
                  prepend-inner-icon="mdi-google-spreadsheet"
                  placeholder="e.g. https://docs.google.com/spreadsheets/d/a7b2c7"
                  density="compact"
                  persistent-counter
                  clearable
                />
                <v-text-field
                  v-model="challongeLink"
                  :counter="150"
                  :rules="[rules.optionalMin(15), rules.max(150)]"
                  label="Challonge URL"
                  variant="outlined"
                  prepend-inner-icon="mdi-tournament"
                  placeholder="e.g. https://challonge.com/xwc2727/"
                  density="compact"
                  persistent-counter
                  clearable
                />
                <v-text-field
                  v-model="twitchFirstLink"
                  :counter="100"
                  :rules="[rules.optionalMin(10), rules.max(100)]"
                  label="Twitch (мейн канал) URL"
                  variant="outlined"
                  prepend-inner-icon="mdi-twitch"
                  placeholder="e.g. https://www.twitch.tv/xwc2727"
                  density="compact"
                  persistent-counter
                  clearable
                />
                <v-text-field
                  :counter="100"
                  v-model="twitchSecondLink"
                  :rules="[rules.optionalMin(10), rules.max(100)]"
                  label="Twitch (доп. канал) URL"
                  variant="outlined"
                  prepend-inner-icon="mdi-twitch"
                  placeholder="e.g. https://www.twitch.tv/xwc2727_2"
                  density="compact"
                  persistent-counter
                  clearable
                />
              </div>
            </template>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-form>
    </template>
    <template #actions>
      <div class="plan-tournament-modal__modal-btns-wrapper">
        <v-btn
          :disabled="isLoading"
          height="50"
          class="plan-tournament-modal__btn plan-tournament-modal__btn_cancel"
          @click="onCloseModal"
        >
          Отмена
        </v-btn>
        <v-btn
          :disabled="isConfirmBtnDisabled || isTournamentDataSame"
          :loading="isLoading"
          height="50"
          class="plan-tournament-modal__btn"
          @click="onConfirmTournament"
        >
          {{ confirmBtnLabel }}
        </v-btn>
      </div>
    </template>
  </AppModal>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import { useDate } from "vuetify";
import useToast from "@/composables/useToast";
import useFormValidation from "@/composables/useFormValidation";
import { useAuthStore } from "@/stores/auth";
import { useTournamentsStore } from "@/stores/tournaments";
import { isRegisteredPlayer } from "@/types/users";
import {
  TOURNAMENT_FORMATS,
  TOURNAMENT_TEAM_SIZES,
  type TournamentFormat,
  type TournamentTeamSize,
  type IAllTournamentsListItem,
  type IAllTournamentsFirebaseOutgoingItem,
} from "@/types/tournaments";
import { getCurrentTimeIso } from "@/utils";

const props = defineProps<{
  isOpened: boolean;
  tournament: IAllTournamentsListItem | null;
}>();

const emit = defineEmits<{
  closeModal: [];
  closeModalAfterRequest: [id: string];
}>();

const vuetifyDate = useDate();
const authStore = useAuthStore();
const tournamentsStore = useTournamentsStore();

const { setErrorToast, setSuccessToast } = useToast();
const { isFormValid, rules } = useFormValidation();

const tournamentTitle = ref("[STD] 6 Digit X Cup 20XX MJ");
const rankRange = ref("100k - 999k");
const tournamentFormat = ref<TournamentFormat>("4v4");
const teamSize = ref<TournamentTeamSize>(8);
const isDoubleElimination = ref(true);
const tournamentDescription = ref(
  "[STD] 6 Digit X Cup 20XX MJ - крутой турнир!"
);
const startDate = ref<Date | null>(null);
const isStartDateMenuOpened = ref(false);
const startTime = ref<string | null>(null);
const isStartTimeMenuOpened = ref(false);
const endDate = ref<Date | null>(null);
const isEndDateMenuOpened = ref(false);
const endTime = ref<string | null>(null);
const isEndTimeMenuOpened = ref(false);
const forumPostLink = ref<string | null>(null);
const mainSheetLink = ref<string | null>(null);
const challongeLink = ref<string | null>(null);
const twitchFirstLink = ref<string | null>(null);
const twitchSecondLink = ref<string | null>(null);
const isLoading = ref(false);

const modalTitle = computed(
  () => `🏆 ${props.tournament ? "Изменить" : "Создать"} запись о турнире 🏆`
);
const confirmBtnLabel = computed(() =>
  props.tournament ? "Сохранить" : "Создать"
);
const bracketFormatLabel = computed(
  () => `${isDoubleElimination.value ? "Double" : "Single"} Elimintation`
);
const startDateLabel = computed(() => {
  if (!startDate.value) return null;
  return vuetifyDate.format(startDate.value, "fullDateWithWeekday");
});
const endDateLabel = computed(() => {
  if (!endDate.value) return null;
  return vuetifyDate.format(endDate.value, "fullDateWithWeekday");
});
const startDateObject = computed(() => {
  if (!startDate.value || !startTime.value) return null;
  let dateObj = vuetifyDate.date(startDate.value) as Date;
  const [hours, minutes] = startTime.value.split(":").map(Number);
  dateObj = vuetifyDate.setHours(dateObj, hours ?? 0) as Date;
  dateObj = vuetifyDate.setMinutes(dateObj, minutes ?? 0) as Date;
  return dateObj;
});
const endDateObject = computed(() => {
  if (!endDate.value || !endTime.value) return null;
  let dateObj = vuetifyDate.date(endDate.value) as Date;
  const [hours, minutes] = endTime.value.split(":").map(Number);
  dateObj = vuetifyDate.setHours(dateObj, hours ?? 0) as Date;
  dateObj = vuetifyDate.setMinutes(dateObj, minutes ?? 0) as Date;
  return dateObj;
});
const isSameDates = computed(() => {
  if (!props.tournament || !startDateObject.value || !endDateObject.value)
    return false;
  return (
    vuetifyDate.format(
      props.tournament.datesInfo.startDate,
      "keyboardDateTime"
    ) === vuetifyDate.format(startDateObject.value, "keyboardDateTime") &&
    vuetifyDate.format(
      props.tournament.datesInfo.endDate,
      "keyboardDateTime"
    ) === vuetifyDate.format(endDateObject.value, "keyboardDateTime")
  );
});
const minEndDate = computed(() => {
  return startDate.value ? startDate.value : undefined;
});
const maxStartDate = computed(() => {
  return endDate.value ? endDate.value : undefined;
});
const minEndTime = computed(() => {
  if (
    startDate.value &&
    endDate.value &&
    startTime.value &&
    vuetifyDate.isSameDay(startDate.value, endDate.value)
  ) {
    return startTime.value;
  }
  return undefined;
});
const maxStartTime = computed(() => {
  if (
    startDate.value &&
    endDate.value &&
    endTime.value &&
    vuetifyDate.isSameDay(startDate.value, endDate.value)
  ) {
    return endTime.value;
  }
  return undefined;
});
const isConfirmBtnDisabled = computed(() => {
  return (
    !isFormValid.value ||
    !tournamentTitle.value ||
    !rankRange.value ||
    !startDateObject.value ||
    !endDateObject.value
  );
});
const isTournamentDataSame = computed(() => {
  if (!props.tournament) return false;
  return (
    props.tournament.title === tournamentTitle.value &&
    props.tournament.rankRange === rankRange.value &&
    props.tournament.format === tournamentFormat.value &&
    props.tournament.teamSize === teamSize.value &&
    props.tournament.isDoubleElimination === isDoubleElimination.value &&
    props.tournament.description === tournamentDescription.value &&
    props.tournament.forumPostLink === forumPostLink.value &&
    props.tournament.mainSheetLink === mainSheetLink.value &&
    props.tournament.challongeLink === challongeLink.value &&
    props.tournament.twitchFirstLink === twitchFirstLink.value &&
    props.tournament.twitchSecondLink === twitchSecondLink.value &&
    isSameDates.value
  );
});

watch(
  () => props.isOpened,
  (isOpened) => {
    if (isOpened) initValues();
  }
);
watch([startDate, startTime], () => {
  if (!startDateObject.value || !endDateObject.value) return;
  const diffMs =
    endDateObject.value.getTime() - startDateObject.value.getTime();
  const ONE_HOUR_MS = 3600000;
  if (diffMs < ONE_HOUR_MS) {
    const newEnd = new Date(startDateObject.value.getTime() + ONE_HOUR_MS);
    endDate.value = newEnd;
    endTime.value = getCurrentTimeIso(newEnd);
  }
});
watch([endDate, endTime], () => {
  if (!startDateObject.value || !endDateObject.value) return;
  const diffMs =
    endDateObject.value.getTime() - startDateObject.value.getTime();
  const ONE_HOUR_MS = 3600000;
  if (diffMs < ONE_HOUR_MS) {
    const newStart = new Date(endDateObject.value.getTime() - ONE_HOUR_MS);
    startDate.value = newStart;
    startTime.value = getCurrentTimeIso(newStart);
  }
});

const initValues = () => {
  if (props.tournament) {
    const t = props.tournament;
    tournamentTitle.value = t.title;
    rankRange.value = t.rankRange;
    tournamentDescription.value = t.description;
    tournamentFormat.value = t.format;
    teamSize.value = t.teamSize;
    isDoubleElimination.value = t.isDoubleElimination;
    startDate.value = t.datesInfo.startDate;
    startTime.value = getCurrentTimeIso(t.datesInfo.startDate);
    endDate.value = t.datesInfo.endDate;
    endTime.value = getCurrentTimeIso(t.datesInfo.endDate);
    forumPostLink.value = t.forumPostLink;
    mainSheetLink.value = t.mainSheetLink;
    challongeLink.value = t.challongeLink;
    twitchFirstLink.value = t.twitchFirstLink;
    twitchSecondLink.value = t.twitchSecondLink;
  } else {
    tournamentTitle.value = "[STD] 6 Digit X Cup 20XX MJ";
    rankRange.value = "100k - 999k";
    tournamentFormat.value = "4v4";
    teamSize.value = 8;
    isDoubleElimination.value = true;
    tournamentDescription.value =
      "[STD] 6 Digit X Cup 20XX MJ - крутой турнир!";
    const now = new Date();
    const utcYear = now.getUTCFullYear();
    const utcMonth = now.getUTCMonth();
    const utcTomorrowDate = now.getUTCDate() + 1;
    const tomorrowUtc = new Date(
      Date.UTC(utcYear, utcMonth, utcTomorrowDate, 0, 0, 0)
    );
    startDate.value = tomorrowUtc;
    startTime.value = getCurrentTimeIso(tomorrowUtc);
    const twoMonthsLaterUtc = new Date(
      Date.UTC(utcYear, utcMonth + 2, utcTomorrowDate, 23, 59, 59)
    );
    endDate.value = twoMonthsLaterUtc;
    endTime.value = getCurrentTimeIso(twoMonthsLaterUtc);
    forumPostLink.value = null;
    mainSheetLink.value = null;
    challongeLink.value = null;
    twitchFirstLink.value = null;
    twitchSecondLink.value = null;
  }
};

const onCloseModal = () => {
  isStartDateMenuOpened.value = false;
  isStartTimeMenuOpened.value = false;
  isEndDateMenuOpened.value = false;
  isEndTimeMenuOpened.value = false;
  emit("closeModal");
};

const onStartDateClear = () => {
  startDate.value = null;
  startTime.value = null;
  isStartDateMenuOpened.value = false;
};
const onStartTimeClear = () => {
  startTime.value = null;
  isStartTimeMenuOpened.value = false;
};
const onEndDateClear = () => {
  endDate.value = null;
  endTime.value = null;
  isEndDateMenuOpened.value = false;
};
const onEndTimeClear = () => {
  endTime.value = null;
  isEndTimeMenuOpened.value = false;
};

const uploadTournament = async () => {
  if (!authStore.user || !startDateObject.value || !endDateObject.value) return;

  try {
    isLoading.value = true;

    const tournament: IAllTournamentsFirebaseOutgoingItem = {
      id: crypto.randomUUID(),
      redactorUid: authStore.user.uid,
      title: tournamentTitle.value,
      rankRange: rankRange.value,
      description: tournamentDescription.value,
      format: tournamentFormat.value,
      teamSize: teamSize.value,
      isDoubleElimination: isDoubleElimination.value,
      isArchived: false,
      forumPostLink: forumPostLink.value || null,
      mainSheetLink: mainSheetLink.value || null,
      challongeLink: challongeLink.value || null,
      twitchFirstLink: twitchFirstLink.value || null,
      twitchSecondLink: twitchSecondLink.value || null,
      rostersInfo: [],
      datesInfo: {
        startDate: startDateObject.value,
        endDate: endDateObject.value,
      },
    };

    await tournamentsStore.uploadTournament(tournament);
    setSuccessToast("🏆🤝🏆 Запись о турнире успешно создана!!! 🏆🤝🏆");
    emit("closeModalAfterRequest", tournament.id);
  } catch (error) {
    const msg = error instanceof Error ? error?.message : error;
    setErrorToast(`Не удалось создать запись о турнире: ${msg}`);
  } finally {
    isLoading.value = false;
  }
};

const updateTournament = async () => {
  if (
    !props.tournament ||
    !authStore.user ||
    !startDateObject.value ||
    !endDateObject.value
  )
    return;

  try {
    isLoading.value = true;

    const tournament: IAllTournamentsFirebaseOutgoingItem = {
      id: props.tournament.id,
      redactorUid: props.tournament.redactorUid,
      title: tournamentTitle.value,
      rankRange: rankRange.value,
      description: tournamentDescription.value,
      format: tournamentFormat.value,
      teamSize: teamSize.value,
      isDoubleElimination: isDoubleElimination.value,
      isArchived: props.tournament.isArchived,
      forumPostLink: forumPostLink.value || null,
      mainSheetLink: mainSheetLink.value || null,
      challongeLink: challongeLink.value || null,
      twitchFirstLink: twitchFirstLink.value || null,
      twitchSecondLink: twitchSecondLink.value || null,
      rostersInfo: props.tournament.rostersInfo.map((r) => ({
        ...r,
        players: r.players.map((p) => (isRegisteredPlayer(p) ? p.uid : p)),
      })),
      datesInfo: {
        startDate: startDateObject.value,
        endDate: endDateObject.value,
      },
    };

    await tournamentsStore.updateTournament(tournament);
    setSuccessToast("🏆✏️🏆 Запись о турнире успешно изменена!!! 🏆✏️🏆");
    emit("closeModalAfterRequest", tournament.id);
  } catch (error) {
    const msg = error instanceof Error ? error?.message : error;
    setErrorToast(`Не удалось изменить запись о турнире: ${msg}`);
  } finally {
    isLoading.value = false;
  }
};

const onConfirmTournament = async () => {
  if (props.tournament) {
    await updateTournament();
  } else {
    await uploadTournament();
  }
};
</script>

<style lang="scss" scoped>
.plan-tournament-modal {
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
  }
  &__btn_cancel {
    background-color: var(--color-btn-cancel-bg);
    &:disabled {
      background-color: var(--color-btn-cancel-bg-disabled);
    }
  }
  &__modal-content-wrapper {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 75vh;
    padding-right: 5px;
  }
  &__grid-2-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    @media (max-width: $phone-l) {
      grid-template-columns: 1fr;
    }
  }
  &__dates-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  &__grid-date-time {
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: 10px;
    @media (max-width: $phone-l) {
      grid-template-columns: 1fr;
    }
  }
  &__switch {
    margin-left: 10px;
  }
  &__links-panels-wrapper {
    margin-bottom: 8px;
  }
  &__links-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 10px;
  }
  &__date-time-btns-wrapper {
    width: 100%;
    display: flex;
    & > * {
      flex: 1 1 calc(50% - 5px);
    }
  }
  &__modal-btns-wrapper {
    width: 100%;
    display: flex;
    gap: 10px;
    & > * {
      flex: 1 1 calc(50% - 5px);
    }
  }
}
</style>
