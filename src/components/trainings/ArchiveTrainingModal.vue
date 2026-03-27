<template>
  <AppModal
    :isOpened="isOpened"
    title="Архивация качалочки"
    :isClosableByClickOutside="false"
    @closeModal="$emit('closeModal')"
  >
    <template #default>
      <p class="archive-training-modal__message">
        Для архивации качалочки нужно ввести MP Link ID. Его можно достать из
        ссылки 'https://osu.ppy.sh/community/matches/ID', где ID - это нужное
        число. После нажатия кнопки "Заархивировать" качалочка будет
        заархивирована. Это значит, что она больше не будет видна в списке
        активных качалочек, а её поля нельзя будет изменить. Это действие не
        может быть отменено.
      </p>
      <v-number-input
        v-model="chosenMpLinkId"
        :min="0"
        :max="1000000000"
        variant="solo"
        control-variant="hidden"
        prepend-inner-icon="mdi-identifier"
        label="MP Link ID"
        placeholder="Введи MP Link ID ('https://osu.ppy.sh/community/matches/<ID>')"
        clearable
        hide-details
      />
    </template>
    <template #actions>
      <div class="archive-training-modal__modal-btns-wrapper">
        <v-btn
          :disabled="isArchiving"
          height="50"
          class="archive-training-modal__btn archive-training-modal__btn_cancel"
          @click="$emit('closeModal')"
        >
          Отмена
        </v-btn>
        <v-tooltip
          :disabled="chosenMpLinkId !== null"
          text="Для архивации качалочки нужно ввести MP Link ID"
          location="top"
        >
          <template #activator="{ props }">
            <div v-bind="props">
              <v-btn
                :disabled="chosenMpLinkId === null"
                :loading="isArchiving"
                height="50"
                class="archive-training-modal__btn archive-training-modal__btn_archive"
                @click="onConfirmArchiving"
              >
                Заархивировать
              </v-btn>
            </div>
          </template>
        </v-tooltip>
      </div>
    </template>
  </AppModal>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import useToast from "@/composables/useToast";
import { useTrainingsStore } from "@/stores/trainings";

const props = defineProps<{
  isOpened: boolean;
  trainingId: string;
}>();

const emit = defineEmits<{
  closeModal: [];
  closeModalAfterArchiving: [trainingId: string];
}>();

const trainingsStore = useTrainingsStore();

const { setErrorToast, setSuccessToast } = useToast();

const isArchiving = ref(false);
const chosenMpLinkId = ref<number | null>(null);

watch(
  () => props.isOpened,
  (isOpened) => {
    if (isOpened) chosenMpLinkId.value = null;
  }
);

const onConfirmArchiving = async () => {
  if (!chosenMpLinkId.value) return;

  try {
    isArchiving.value = true;
    await trainingsStore.archiveTraining(
      props.trainingId,
      chosenMpLinkId.value
    );
    setSuccessToast("🗃️🗃️🗃️ Качалочка успешно заархивирована!!! 🗃️🗃️🗃️");
    emit("closeModalAfterArchiving", props.trainingId);
  } catch (error) {
    const msg = error instanceof Error ? error?.message : error;
    setErrorToast(`Не удалось заархивировать качалочку: ${msg}`);
  } finally {
    isArchiving.value = false;
  }
};
</script>

<style lang="scss" scoped>
.archive-training-modal {
  &__message {
    text-align: center;
    @include default-text(20px, 20px, var(--color-text));
    @media (max-width: $phone-l) {
      font-size: 16px;
      line-height: 16px;
    }
    @media (max-width: $phone-m) {
      font-size: 12px;
      line-height: 12px;
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
  &__btn_archive {
    background-color: var(--color-training-archived);
    &:disabled {
      background-color: var(--color-training-archived);
    }
  }
}
</style>
