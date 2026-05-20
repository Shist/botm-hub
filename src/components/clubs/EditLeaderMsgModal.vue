<template>
  <AppModal
    :isOpened="isOpened"
    title="Послание лидера"
    :isClosableByClickOutside="false"
    @closeModal="$emit('closeModal')"
  >
    <template #default>
      <v-form v-model="isFormValid" class="edit-leader-message-modal__form">
        <v-textarea
          v-model="editableMessage"
          :counter="400"
          :rules="[rules.max(400)]"
          variant="solo"
          prepend-inner-icon="mdi-bullhorn"
          label="Послание участникам"
          placeholder="Напиши что-нибудь вдохновляющее для участников..."
          persistent-counter
          clearable
          auto-grow
          rows="3"
          max-rows="10"
        />
      </v-form>
    </template>
    <template #actions>
      <div class="edit-leader-message-modal__modal-btns-wrapper">
        <v-btn
          :disabled="isSaving"
          height="50"
          class="edit-leader-message-modal__btn edit-leader-message-modal__btn_cancel"
          @click="$emit('closeModal')"
        >
          Отмена
        </v-btn>
        <div class="w-100">
          <v-btn
            :disabled="!isMessageChanged || !isFormValid"
            :loading="isSaving"
            height="50"
            class="edit-leader-message-modal__btn"
            @click="onConfirmSaving"
          >
            Сохранить
          </v-btn>
        </div>
      </div>
    </template>
  </AppModal>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import useToast from "@/composables/useToast";
import useFormValidation from "@/composables/useFormValidation";
import { useClubsStore } from "@/stores/clubs";
import { BotmClub } from "@/types/clubs";

const props = defineProps<{
  isOpened: boolean;
  clubId: BotmClub;
  currentMessage: string;
}>();

const emit = defineEmits<{
  closeModal: [];
  closeModalAfterSaving: [];
}>();

const clubsStore = useClubsStore();
const { setErrorToast, setSuccessToast } = useToast();
const { isFormValid, rules } = useFormValidation();

const editableMessage = ref("");
const isSaving = ref(false);

const isMessageChanged = computed(() => {
  return editableMessage.value.trim() !== props.currentMessage.trim();
});

watch(
  () => props.isOpened,
  (opened) => {
    if (opened) {
      editableMessage.value = props.currentMessage;
    }
  }
);

const onConfirmSaving = async () => {
  try {
    isSaving.value = true;
    await clubsStore.updateLeaderMessage(
      props.clubId,
      editableMessage.value.trim()
    );
    setSuccessToast("✏️✏️✏️ Послание успешно обновлено! ✏️✏️✏️");
    emit("closeModalAfterSaving");
  } catch (error) {
    const msg = error instanceof Error ? error?.message : error;
    setErrorToast(`Не удалось сохранить послание: ${msg}`);
  } finally {
    isSaving.value = false;
  }
};
</script>

<style lang="scss" scoped>
.edit-leader-message-modal {
  &__form {
    width: 550px;
    max-width: 100%;
    @media (max-width: $tablet-m) {
      min-width: 100%;
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
}
</style>
