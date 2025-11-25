<template>
  <v-expansion-panel class="training-card">
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
                :href="`https://osu.ppy.sh/community/matches/${training.mpLink}`"
                target="_blank"
              >
                {{ training.mpLink }}
              </a>
            </div>
          </div>
          <div class="training-card__btns-wrapper">
            <v-tooltip
              v-if="isTrainingEditable"
              :disabled="!isOtherTrainer"
              text="Нельзя удалять качалочки других тренеров!"
              location="top"
            >
              <template #activator="{ props }">
                <div v-bind="props">
                  <v-btn
                    v-bind="props"
                    :disabled="isOtherTrainer"
                    height="50"
                    class="training-card__btn training-card__btn_delete"
                    @click="() => {}"
                  >
                    Удалить качалочку
                  </v-btn>
                </div>
              </template>
            </v-tooltip>
            <v-tooltip
              v-if="isTrainingEditable"
              :disabled="!isOtherTrainer"
              text="Нельзя изменять качалочки других тренеров!"
              location="top"
            >
              <template #activator="{ props }">
                <div v-bind="props">
                  <v-btn
                    :disabled="isOtherTrainer"
                    height="50"
                    class="training-card__btn"
                    @click="isEditTrainingModalOpened = true"
                  >
                    Изменить качалочку
                  </v-btn>
                </div>
              </template>
            </v-tooltip>
            <v-btn
              v-if="isArchiveTrainingBtnVisible"
              :disabled="false"
              :loading="false"
              height="50"
              class="training-card__btn training-card__btn_archive"
              @click="() => {}"
            >
              Заархивировать качалочку
            </v-btn>
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
          </ul>
          <v-btn
            v-if="isTrainingEditable"
            :disabled="isSignUpBtnDisabled"
            :loading="false"
            height="50"
            class="training-card__btn"
            @click="() => {}"
          >
            Записаться
          </v-btn>
        </div>
      </div>
    </template>
    <PlanTrainingModal
      :isOpened="isEditTrainingModalOpened"
      :training="training"
      @closeModal="isEditTrainingModalOpened = false"
    />
  </v-expansion-panel>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useDate } from "vuetify";
import CategoryBadge from "@/components/CategoryBadge.vue";
import TrainingStatusBadge from "@/components/TrainingStatusBadge.vue";
import UserCard from "@/components/UserCard.vue";
import PlanTrainingModal from "@/components/PlanTrainingModal.vue";
import { useAuthStore } from "@/stores/auth";
import { useUsersStore } from "@/stores/users";
import {
  OsuMapCategory,
  TrainingStatus,
  type IAllTrainingsListItem,
} from "@/types";
import { fromMinsToDurationLabel, fromSecondsToDurationLabel } from "@/utils";

const props = defineProps<{
  training: IAllTrainingsListItem;
}>();

const vuetifyDate = useDate();
const authStore = useAuthStore();
const usersStore = useUsersStore();

const timeDiffSeconds = ref(0);
const timeUpdateIntervalId = ref<number | null>(null);
const isEditTrainingModalOpened = ref(false);

const isOtherTrainer = computed(() => {
  const currUserUid = authStore.user?.uid ?? null;
  return currUserUid !== props.training.trainerUid;
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
const isTrainingEditable = computed(() => {
  return [TrainingStatus.waiting, TrainingStatus.inProgress].includes(
    currentStatus.value
  );
});
const isArchiveTrainingBtnVisible = computed(() => {
  return currentStatus.value === TrainingStatus.completed;
});
const isSignUpBtnDisabled = computed(() => {
  return props.training.participants.length >= 16;
});

onMounted(() => {
  usersStore.getAllUsers();

  updateTimeLabel();
  timeUpdateIntervalId.value = setInterval(updateTimeLabel, 1000);
});

onUnmounted(() => {
  if (timeUpdateIntervalId.value) clearInterval(timeUpdateIntervalId.value);
});

const updateTimeLabel = () => {
  timeDiffSeconds.value =
    vuetifyDate.getDiff(props.training.dateTime, new Date()) / 1000;
  if (timeDiffSeconds.value < -totalDurationSecs.value) {
    if (timeUpdateIntervalId.value) clearInterval(timeUpdateIntervalId.value);
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
    &_delete {
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
      grid-template-rows: repeat(8, 1fr);
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
