<template>
  <AppModal
    :isOpened="isOpened"
    title="Точно покидаешь клуб?"
    :isClosableByClickOutside="false"
    @closeModal="$emit('closeModal')"
  >
    <template #default>
      <p class="leave-club-modal__message">
        Ты уверен(а), что хочешь выйти из клуба? Ты всегда сможешь вернуться, но
        счетчик дней нахождения в клубе обнулится, а клуб временно потеряет твои
        очки и станет слабее без тебя!
      </p>
    </template>
    <template #actions>
      <div class="leave-club-modal__modal-btns-wrapper">
        <v-btn
          :disabled="isLeaving"
          height="50"
          class="leave-club-modal__btn leave-club-modal__btn_cancel"
          @click="$emit('closeModal')"
        >
          Отмена
        </v-btn>
        <v-btn
          :loading="isLeaving"
          height="50"
          class="leave-club-modal__btn leave-club-modal__btn_delete"
          @click="onConfirmLeaving"
        >
          Покинуть
        </v-btn>
      </div>
    </template>
  </AppModal>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import useToast from "@/composables/useToast";
import { useClubsStore } from "@/stores/clubs";
import { useAuthStore } from "@/stores/auth";
import { BotmClub } from "@/types/clubs";

const props = defineProps<{
  isOpened: boolean;
  clubId: BotmClub;
}>();

const emit = defineEmits<{
  (e: "closeModal"): void;
  (e: "closeModalAfterLeaving"): void;
}>();

const clubsStore = useClubsStore();
const authStore = useAuthStore();
const { setErrorToast, setSuccessToast } = useToast();

const isLeaving = ref(false);

const onConfirmLeaving = async () => {
  const userUid = authStore.user?.uid;
  if (!userUid) return;

  try {
    isLeaving.value = true;
    await clubsStore.leaveClub(props.clubId, userUid);
    setSuccessToast("🚪🚪🚪 Ты успешно покинул(а) клуб!!! 🚪🚪🚪");
    emit("closeModalAfterLeaving");
  } catch (error) {
    const msg = error instanceof Error ? error?.message : error;
    setErrorToast(`Не удалось выйти из клуба: ${msg}`);
  } finally {
    isLeaving.value = false;
  }
};
</script>

<style lang="scss" scoped>
.leave-club-modal {
  &__message {
    text-align: center;
    @include default-text(20px, 24px, var(--color-text));
    @media (max-width: $phone-l) {
      font-size: 16px;
      line-height: 20px;
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
    background-color: var(--color-club-exit, #e74c3c);
    &:disabled {
      background-color: var(--color-club-exit, #e74c3c);
    }
  }
}
</style>
