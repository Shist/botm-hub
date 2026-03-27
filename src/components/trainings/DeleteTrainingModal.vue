<template>
  <AppModal
    :isOpened="isOpened"
    title="Точно удалить качалочку?"
    :isClosableByClickOutside="false"
    @closeModal="$emit('closeModal')"
  >
    <template #default>
      <p class="delete-training-modal__message">
        После нажатия кнопки "Удалить" качалочка будет удалена. Это действие не
        может быть отменено. Точно хочешь удалить качалочку?
      </p>
    </template>
    <template #actions>
      <div class="delete-training-modal__modal-btns-wrapper">
        <v-btn
          :disabled="isDeleting"
          height="50"
          class="delete-training-modal__btn delete-training-modal__btn_cancel"
          @click="$emit('closeModal')"
        >
          Отмена
        </v-btn>
        <v-btn
          :loading="isDeleting"
          height="50"
          class="delete-training-modal__btn delete-training-modal__btn_delete"
          @click="onConfirmDeleting"
        >
          Удалить
        </v-btn>
      </div>
    </template>
  </AppModal>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import useToast from "@/composables/useToast";
import { useTrainingsStore } from "@/stores/trainings";

const props = defineProps<{
  isOpened: boolean;
  trainingId: string;
}>();

const emit = defineEmits<{
  closeModal: [];
  closeModalAfterDeleting: [];
}>();

const trainingsStore = useTrainingsStore();

const { setErrorToast, setSuccessToast } = useToast();

const isDeleting = ref(false);

const onConfirmDeleting = async () => {
  try {
    isDeleting.value = true;
    await trainingsStore.deleteTraining(props.trainingId);
    setSuccessToast("🗑️🗑️🗑️ Качалочка успешно удалена!!! 🗑️🗑️🗑️");
    emit("closeModalAfterDeleting");
  } catch (error) {
    const msg = error instanceof Error ? error?.message : error;
    setErrorToast(`Не удалось удалить качалочку: ${msg}`);
  } finally {
    isDeleting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.delete-training-modal {
  &__message {
    text-align: center;
    @include default-text(20px, 20px, var(--color-text));
    @media (max-width: $phone-l) {
      font-size: 16px;
      line-height: 16px;
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
  &__btn_delete {
    background-color: var(--color-training-deletion);
    &:disabled {
      background-color: var(--color-training-deletion);
    }
  }
}
</style>
