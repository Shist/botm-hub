<template>
  <AppModal
    :isOpened="isOpened"
    title="Точно удалить запись о турнире?"
    :isClosableByClickOutside="false"
    @closeModal="$emit('closeModal')"
  >
    <template #default>
      <p class="delete-tournament-modal__message">
        После нажатия кнопки "Удалить" запись о турнире будет удалена. Это
        действие не может быть отменено. Точно хочешь удалить запись о турнире?
      </p>
    </template>
    <template #actions>
      <div class="delete-tournament-modal__modal-btns-wrapper">
        <v-btn
          :disabled="isDeleting"
          height="50"
          class="delete-tournament-modal__btn delete-tournament-modal__btn_cancel"
          @click="$emit('closeModal')"
        >
          Отмена
        </v-btn>
        <v-btn
          :loading="isDeleting"
          height="50"
          class="delete-tournament-modal__btn delete-tournament-modal__btn_delete"
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
import { useTournamentsStore } from "@/stores/tournaments";

const props = defineProps<{
  isOpened: boolean;
  tournamentId: string;
}>();

const emit = defineEmits<{
  closeModal: [];
  closeModalAfterDeleting: [];
}>();

const tournamentsStore = useTournamentsStore();

const { setErrorToast, setSuccessToast } = useToast();

const isDeleting = ref(false);

const onConfirmDeleting = async () => {
  try {
    isDeleting.value = true;
    await tournamentsStore.deleteTournament(props.tournamentId);
    setSuccessToast("🏆🗑️🏆 Запись о турнире успешно удалена!!! 🏆🗑️🏆");
    emit("closeModalAfterDeleting");
  } catch (error) {
    const msg = error instanceof Error ? error?.message : error;
    setErrorToast(`Не удалось удалить запись о турнире: ${msg}`);
  } finally {
    isDeleting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.delete-tournament-modal {
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
    background-color: var(--color-tournament-deletion);
    &:disabled {
      background-color: var(--color-tournament-deletion);
    }
  }
}
</style>
