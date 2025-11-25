<template>
  <AppModal
    :isOpened="isOpened"
    title="🎯 Запланировать качалочку 🎯"
    :isClosableByClickOutside="false"
    @closeModal="$emit('closeModal')"
  >
    <template #default>
      <div class="plan-training-modal__modal-content-wrapper">
        <v-text-field
          v-model="trainingTitle"
          variant="solo"
          prepend-inner-icon="mdi-format-title"
          label="Заголовок"
          placeholder="Введи заголовок качалочки"
          clearable
          hide-details
        />
        <SkillsetsSelect v-model="trainingCategories" />
        <v-menu v-model="isDateMenuOpened" :close-on-content-click="false">
          <template #activator="{ props }">
            <v-text-field
              v-bind="props"
              :model-value="trainingDateLabel"
              variant="solo"
              prepend-inner-icon="mdi-calendar"
              label="Дата начала качалочки"
              placeholder="Укажи дату начала качалочки"
              hide-details
              readonly
            />
          </template>
          <v-date-picker
            v-model="trainingDate"
            :min="minPossibleDateIso"
            color="var(--color-date-picker-header)"
            title="Укажи дату начала качалочки"
            show-adjacent-months
            divided
          >
            <template #actions>
              <div class="plan-training-modal__modal-btns-wrapper">
                <v-btn
                  height="50"
                  class="plan-training-modal__btn plan-training-modal__btn_cancel"
                  @click="onDateClear"
                >
                  Очистить
                </v-btn>
                <v-btn
                  height="50"
                  class="plan-training-modal__btn"
                  @click="isDateMenuOpened = false"
                >
                  Подтвердить
                </v-btn>
              </div>
            </template>
          </v-date-picker>
        </v-menu>
        <v-menu v-model="isTimeMenuOpened" :close-on-content-click="false">
          <template #activator="{ props }">
            <v-text-field
              v-bind="props"
              :model-value="trainingTime"
              :disabled="!trainingDate"
              variant="solo"
              prepend-inner-icon="mdi-clock"
              label="Время начала качалочки"
              placeholder="Укажи время начала качалочки"
              hide-details
              readonly
            />
          </template>
          <v-time-picker
            v-model="trainingTime"
            :min="minPossibleTimeIso"
            color="var(--color-time-picker-header)"
            title="Укажи время начала качалочки"
            format="24hr"
            divided
          >
            <template #actions>
              <div class="plan-training-modal__modal-btns-wrapper">
                <v-btn
                  height="50"
                  class="plan-training-modal__btn plan-training-modal__btn_cancel"
                  @click="onTimeClear"
                >
                  Очистить
                </v-btn>
                <v-btn
                  height="50"
                  class="plan-training-modal__btn"
                  @click="isTimeMenuOpened = false"
                >
                  Подтвердить
                </v-btn>
              </div>
            </template>
          </v-time-picker>
        </v-menu>
        <v-number-input
          v-model="trainingDuration"
          :min="30"
          :max="960"
          variant="solo"
          control-variant="stacked"
          label="Длительность (мин.)"
          placeholder="Укажи длительность качалочки (в минутах)"
          clearable
          hide-details
        />
      </div>
    </template>
    <template #actions>
      <div class="plan-training-modal__modal-btns-wrapper">
        <v-btn
          height="50"
          class="plan-training-modal__btn plan-training-modal__btn_cancel"
          @click="$emit('closeModal')"
        >
          Отмена
        </v-btn>
        <v-btn height="50" class="plan-training-modal__btn" @click="() => {}">
          Запланировать
        </v-btn>
      </div>
    </template>
  </AppModal>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import SkillsetsSelect from "@/components/SkillsetsSelect.vue";
import { useDate } from "vuetify";
import { useAuthStore } from "@/stores/auth";
import { OsuMapCategory } from "@/types";
import {
  getCurrentDateIso,
  getCurrentTimeIso,
  isFirstTimeBeforeSecond,
} from "@/utils";

const props = defineProps<{
  isOpened: boolean;
}>();

defineEmits<{
  closeModal: [];
}>();

const vuetifyDate = useDate();
const authStore = useAuthStore();

const trainingTitle = ref("");
const trainingCategories = ref<OsuMapCategory[]>([]);
const trainingDate = ref<Date | null>(null);
const isDateMenuOpened = ref(false);
const trainingTime = ref<string | null>(null);
const isTimeMenuOpened = ref(false);
const trainingDuration = ref(120);

const currDate = ref(new Date());
const timeUpdateIntervalId = ref<number | null>(null);

const userInfo = computed(() => {
  if (
    authStore.user?.additionalInfo === "loading" ||
    authStore.user?.additionalInfo === "loadingError"
  ) {
    return null;
  } else {
    return authStore.user?.additionalInfo ?? null;
  }
});

const trainingDateObject = computed(() => {
  if (!trainingDate.value || !trainingTime.value) return null;
  let dateObject = vuetifyDate.date(trainingDate.value);
  const [hours, minutes] = trainingTime.value.split(":").map(Number);
  dateObject = vuetifyDate.setHours(dateObject, hours ?? 0);
  dateObject = vuetifyDate.setMinutes(dateObject, minutes ?? 0);
  return dateObject;
});
const trainingDateLabel = computed(() => {
  if (!trainingDate.value) return null;
  return vuetifyDate.format(trainingDate.value, "fullDateWithWeekday");
});
const minPossibleDateTime = computed(() => {
  return vuetifyDate.addMinutes(currDate.value, 5) as Date;
});
const minPossibleDateIso = computed(() => {
  return getCurrentDateIso(minPossibleDateTime.value);
});
const minPossibleTimeIso = computed(() => {
  if (vuetifyDate.isSameDay(trainingDate.value, currDate.value)) {
    return getCurrentTimeIso(minPossibleDateTime.value);
  } else {
    return undefined;
  }
});

watch(
  () => props.isOpened,
  (isOpened) => {
    if (isOpened) initValues();
  }
);
watch(userInfo, (valueFromStore) => {
  const nick = valueFromStore?.nick;
  if (nick) trainingTitle.value = `Качалочка от ${nick}`;
  trainingCategories.value = valueFromStore?.skillsets ?? [];
});
watch(trainingDate, (value) => {
  if (!value || !minPossibleTimeIso.value || !trainingTime.value) return;
  if (
    vuetifyDate.isSameDay(trainingDate.value, currDate.value) &&
    isFirstTimeBeforeSecond(trainingTime.value, minPossibleTimeIso.value)
  ) {
    trainingTime.value = minPossibleTimeIso.value;
  }
});

onMounted(() => {
  initValues();

  timeUpdateIntervalId.value = setInterval(() => {
    currDate.value = new Date();
    if (
      trainingDateObject.value &&
      vuetifyDate.isBefore(trainingDateObject.value, minPossibleDateTime.value)
    ) {
      if (trainingDate.value) {
        trainingDate.value = minPossibleDateTime.value;
      }
      if (trainingTime.value) {
        trainingTime.value = minPossibleTimeIso.value ?? null;
      }
    }
  }, 60000);
});

onUnmounted(() => {
  if (timeUpdateIntervalId.value) clearInterval(timeUpdateIntervalId.value);
});

const initValues = () => {
  const nick = userInfo.value?.nick;
  if (nick) trainingTitle.value = `Качалочка от ${nick}`;
  trainingCategories.value = userInfo.value?.skillsets ?? [];
  trainingDate.value =
    minPossibleDateTime.value.getHours() < 21
      ? currDate.value
      : (vuetifyDate.addDays(currDate.value, 1) as Date);
  trainingTime.value = "21:00";
  trainingDuration.value = 120;
};

const onDateClear = () => {
  trainingDate.value = null;
  trainingTime.value = null;
  isDateMenuOpened.value = false;
};
const onTimeClear = () => {
  trainingTime.value = null;
  isTimeMenuOpened.value = false;
};
</script>

<style lang="scss" scoped>
.plan-training-modal {
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
  }
  &__modal-content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
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
