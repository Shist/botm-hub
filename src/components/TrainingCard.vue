<template>
  <v-expansion-panel :value="training.id" class="training-card">
    <template #title>
      <div class="training-card__panel-header-wrapper">
        <div class="training-card__titles-wrapper">
          <h3 class="training-card__training-name">
            {{ training.title }}
          </h3>
          <h4 class="training-card__trainer">Тренер: {{ trainerNick }}</h4>
        </div>
        <div class="training-card__time-status-wrapper">
          <span v-if="remainingTimeLabel" class="training-card__time-label">
            {{ remainingTimeLabel }}
          </span>
          <TrainingStatusBadge :status="currentStatus" />
        </div>
      </div>
    </template>
    <template #text>
      <v-divider class="border-opacity-100" />
      <div class="training-card__info-wrapper">
        <div class="training-card__training-info-wrapper">
          <div class="training-card__training-details-wrapper">
            <span>Скиллсеты:</span>
            <div class="training-card__categories-wrapper">
              <CategoryBadge
                v-for="skillset in training.skillsets"
                :key="skillset"
                :category="OsuMapCategory[skillset]"
              />
            </div>
            <span>Дата начала:</span>
            <span>{{ dateTimeLabel }}</span>
            <span>Длительность:</span>
            <span>{{ durationLabel }}</span>
            <span>Описание:</span>
            <p class="training-card__training-description">
              {{ training.description }}
            </p>
            <span v-if="training.isArchived">MP-link:</span>
            <div v-if="training.isArchived">
              <a
                :href="`https://osu.ppy.sh/community/matches/${training.mpLinkId}`"
                target="_blank"
              >
                {{ training.mpLinkId }}
              </a>
            </div>
          </div>
          <div class="training-card__btns-wrapper">
            <v-tooltip
              v-if="isUserTrainer && isTrainingEditable"
              :disabled="isUserTrainerOfThisTraining"
              text="Нельзя удалять качалочки других тренеров!"
              location="top"
            >
              <template #activator="{ props }">
                <div v-bind="props">
                  <v-btn
                    v-bind="props"
                    :disabled="!isUserTrainerOfThisTraining"
                    height="50"
                    class="training-card__btn training-card__btn_negative"
                    @click="$emit('onDeleteTraining', training.id)"
                  >
                    Удалить качалочку
                  </v-btn>
                </div>
              </template>
            </v-tooltip>
            <v-tooltip
              v-if="isUserTrainer && isTrainingEditable"
              :disabled="isUserTrainerOfThisTraining"
              text="Нельзя изменять качалочки других тренеров!"
              location="top"
            >
              <template #activator="{ props }">
                <div v-bind="props">
                  <v-btn
                    :disabled="!isUserTrainerOfThisTraining"
                    height="50"
                    class="training-card__btn"
                    @click="$emit('onEditTraining', training)"
                  >
                    Изменить качалочку
                  </v-btn>
                </div>
              </template>
            </v-tooltip>
            <v-tooltip
              v-if="isUserTrainer && isArchiveTrainingBtnVisible"
              :disabled="isUserTrainerOfThisTraining"
              text="Нельзя архивировать качалочки других тренеров!"
              location="top"
            >
              <template #activator="{ props }">
                <div v-bind="props">
                  <v-btn
                    :disabled="!isUserTrainerOfThisTraining"
                    height="50"
                    class="training-card__btn training-card__btn_archive"
                    @click="$emit('onArchiveTraining', training.id)"
                  >
                    Заархивировать качалочку
                  </v-btn>
                </div>
              </template>
            </v-tooltip>
          </div>
        </div>
        <v-divider
          class="training-card__horizontal-divider border-opacity-100"
        />
        <v-divider
          vertical
          class="training-card__vertical-divider border-opacity-100"
        />
        <div class="training-card__players-info-wrapper">
          <h4 class="training-card__players-title">
            {{ participantsTitle }}
          </h4>
          <ul class="training-card__players-list">
            <UserCard
              v-for="participant in training.participants"
              :key="participant.uid"
              :osuId="participant.osuId"
              :nick="participant.nick"
            />
            <FreeSlotCard v-for="i in freeSlotsCount" :key="i" />
          </ul>
          <div v-if="isSubscribeBtnVisible">
            <v-tooltip
              v-if="!isUserSubscribed"
              :disabled="!isFullLobby"
              text="Все слоты для этой качалочки уже заняты!"
              location="top"
            >
              <template #activator="{ props }">
                <div v-bind="props">
                  <v-btn
                    :disabled="isFullLobby"
                    :loading="isUpdating"
                    height="50"
                    class="training-card__btn"
                    @click="onSubscribe"
                  >
                    Записаться
                  </v-btn>
                </div>
              </template>
            </v-tooltip>
            <v-tooltip
              v-else
              :disabled="!isUserTrainerOfThisTraining"
              text="Ты не можешь отписаться, так как ты тренер!"
              location="top"
            >
              <template #activator="{ props }">
                <div v-bind="props">
                  <v-btn
                    :disabled="isUserTrainerOfThisTraining"
                    :loading="isUpdating"
                    height="50"
                    class="training-card__btn training-card__btn_negative"
                    @click="onUnsubscribe"
                  >
                    Отписаться
                  </v-btn>
                </div>
              </template>
            </v-tooltip>
          </div>
        </div>
      </div>
    </template>
  </v-expansion-panel>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useDate } from "vuetify";
import CategoryBadge from "@/components/CategoryBadge.vue";
import TrainingStatusBadge from "@/components/TrainingStatusBadge.vue";
import UserCard from "@/components/UserCard.vue";
import FreeSlotCard from "@/components/FreeSlotCard.vue";
import { useAuthStore } from "@/stores/auth";
import { useUsersStore } from "@/stores/users";
import { useTrainingsStore } from "@/stores/trainings";
import useToast from "@/composables/useToast";
import {
  OsuMapCategory,
  TrainingStatus,
  type IAllTrainingsListItem,
} from "@/types";
import { fromMinsToDurationLabel, fromSecondsToDurationLabel } from "@/utils";

const props = defineProps<{
  training: IAllTrainingsListItem;
  currDate: Date;
}>();

defineEmits<{
  onEditTraining: [training: IAllTrainingsListItem];
  onDeleteTraining: [trainingId: string];
  onArchiveTraining: [trainingId: string];
}>();

defineExpose({
  trainingId: props.training.id,
});

const vuetifyDate = useDate();
const authStore = useAuthStore();
const usersStore = useUsersStore();
const trainingsStore = useTrainingsStore();

const { setErrorToast, setSuccessToast } = useToast();

const isUpdating = ref(false);

const userUid = computed(() => authStore.user?.uid ?? null);
const isUserTrainerOfThisTraining = computed(() => {
  return userUid.value === props.training.trainerUid;
});
const isUserTrainer = computed(() => {
  return authStore.userAdditionalInfo?.isTrainer ?? false;
});
const timeDiffSeconds = computed(() => {
  return vuetifyDate.getDiff(props.training.dateTime, props.currDate) / 1000;
});
const currentStatus = computed(() => {
  if (props.training.isArchived) {
    return TrainingStatus.archived;
  } else {
    const totalDurationSec = props.training.durationMins * 60;
    if (timeDiffSeconds.value > 0) {
      return TrainingStatus.waiting;
    } else if (timeDiffSeconds.value > -totalDurationSec) {
      return TrainingStatus.inProgress;
    } else {
      return TrainingStatus.completed;
    }
  }
});
const trainerNick = computed(() => {
  return (
    usersStore.users.find((u) => u.uid === props.training.trainerUid)?.nick ??
    ""
  );
});
const dateTimeLabel = computed(() => {
  const dateLabel = vuetifyDate.format(
    props.training.dateTime,
    "fullDateWithWeekday"
  );
  const timeLabel = vuetifyDate.format(props.training.dateTime, "fullTime24h");
  return `${dateLabel}, ${timeLabel}`;
});
const totalDurationSecs = computed(() => {
  return props.training.durationMins * 60;
});
const remainingTimeLabel = computed(() => {
  switch (currentStatus.value) {
    case TrainingStatus.waiting:
      return fromSecondsToDurationLabel(timeDiffSeconds.value);
    case TrainingStatus.inProgress:
      return fromSecondsToDurationLabel(
        totalDurationSecs.value + timeDiffSeconds.value
      );
    default:
      return null;
  }
});
const durationLabel = computed(() => {
  return fromMinsToDurationLabel(props.training.durationMins);
});
const participantsTitle = computed(() => {
  return `Участники (${props.training.participants.length}/16):`;
});
const freeSlotsCount = computed(() => {
  return 16 - props.training.participants.length;
});
const isTrainingEditable = computed(() => {
  return currentStatus.value !== TrainingStatus.archived;
});
const isArchiveTrainingBtnVisible = computed(() => {
  return currentStatus.value === TrainingStatus.completed;
});
const isSubscribeBtnVisible = computed(() => {
  return (
    authStore.user &&
    (currentStatus.value === TrainingStatus.waiting ||
      currentStatus.value === TrainingStatus.inProgress)
  );
});
const isFullLobby = computed(() => {
  return props.training.participants.length >= 16;
});
const isUserSubscribed = computed(() => {
  return props.training.participants.some((p) => p.uid === userUid.value);
});

const onSubscribe = async () => {
  if (!userUid.value) return;
  try {
    isUpdating.value = true;
    await trainingsStore.subscribeParticipantToTraining(
      props.training.id,
      userUid.value
    );
    setSuccessToast("✏️✅✏️ Ты успешно записался на качалочку!!! ✏️✅✏️");
  } catch (error) {
    const msg = error instanceof Error ? error?.message : error;
    setErrorToast(`Не удалось записаться на качалочку: ${msg}`);
  } finally {
    isUpdating.value = false;
  }
};
const onUnsubscribe = async () => {
  if (!userUid.value) return;
  try {
    isUpdating.value = true;
    await trainingsStore.unsubscribeParticipantFromTraining(
      props.training.id,
      userUid.value
    );
    setSuccessToast("✏️❌✏️ Ты успешно отписался от качалочки!!! ✏️❌✏️");
  } catch (error) {
    const msg = error instanceof Error ? error?.message : error;
    setErrorToast(`Не удалось записаться на качалочку: ${msg}`);
  } finally {
    isUpdating.value = false;
  }
};
</script>

<style lang="scss" scoped>
.training-card {
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
  &__training-name {
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
  &__trainer {
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
  &__time-status-wrapper {
    margin-right: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  &__time-label {
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
    @media (max-width: $tablet-l) {
      padding: 5px;
      flex-direction: column;
    }
  }
  &__training-info-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 10px;
  }
  &__horizontal-divider {
    display: none;
    @media (max-width: $tablet-l) {
      display: block;
    }
  }
  &__vertical-divider {
    display: block;
    @media (max-width: $tablet-l) {
      display: none;
    }
  }
  &__training-details-wrapper {
    display: grid;
    grid-template-columns: 140px auto;
    gap: 10px;
    :nth-child(odd) {
      justify-self: end;
      text-align: end;
    }
    @include default-text(20px, 20px, var(--color-text));
    @media (max-width: $tablet-l) {
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
  &__training-description {
    padding: 5px;
    height: 150px;
    overflow: auto;
    background-color: var(--color-text-area-bg);
  }
  &__categories-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    @media (max-width: $phone-m) {
      justify-content: center;
    }
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
      background-color: var(--color-training-deletion);
      &:disabled {
        background-color: var(--color-training-deletion);
      }
    }
    &_archive {
      background-color: var(--color-training-archived);
      &:disabled {
        background-color: var(--color-training-archived);
      }
    }
  }
  &__players-info-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .training-card__players-title {
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
  .training-card__players-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(8, 1fr);
    gap: 10px;
    @media (max-width: $pc-s) {
      grid-template-columns: repeat(1, 1fr);
      grid-template-rows: repeat(16, 1fr);
    }
    @include default-text(20px, 20px, var(--color-text));
    @media (max-width: $tablet-l) {
      font-size: 16px;
      line-height: 16px;
    }
    @media (max-width: $phone-l) {
      font-size: 14px;
      line-height: 14px;
    }
  }
}
</style>
