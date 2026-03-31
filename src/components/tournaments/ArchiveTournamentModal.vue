<template>
  <AppModal
    :isOpened="isOpened"
    title="Архивация записи о турнире"
    :isClosableByClickOutside="false"
    @closeModal="$emit('closeModal')"
  >
    <template #default>
      <div class="archive-tournament-modal__content">
        <p class="archive-tournament-modal__message">
          После нажатия кнопки "Заархивировать" запись о турнире будет
          перенесена в архив. Это значит, что она больше не будет видна в списке
          текущих турниров, а её данные и команды нельзя будет изменить.
          <strong>Это действие не может быть отменено.</strong>
        </p>

        <div class="archive-tournament-modal__requirements">
          <span class="archive-tournament-modal__req-title">
            Условия для архивации:
          </span>
          <ul class="archive-tournament-modal__req-list">
            <li>Заявлена хотя бы <strong>1 команда</strong>;</li>
            <li>В каждой команде есть хотя бы <strong>1 игрок</strong>;</li>
            <li>У всех команд указаны <strong>стадия и место</strong>.</li>
          </ul>
        </div>
      </div>
    </template>
    <template #actions>
      <div class="archive-tournament-modal__modal-btns-wrapper">
        <v-btn
          :disabled="isArchiving"
          height="50"
          class="archive-tournament-modal__btn archive-tournament-modal__btn_cancel"
          @click="$emit('closeModal')"
        >
          Отмена
        </v-btn>
        <v-tooltip
          :disabled="canBeArchived"
          :text="archivingError"
          location="top"
        >
          <template #activator="{ props: tooltipProps }">
            <div v-bind="tooltipProps">
              <v-btn
                :disabled="!canBeArchived"
                :loading="isArchiving"
                height="50"
                class="archive-tournament-modal__btn archive-tournament-modal__btn_archive"
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
import { ref, computed } from "vue";
import useToast from "@/composables/useToast";
import { useTournamentsStore } from "@/stores/tournaments";

const props = defineProps<{
  isOpened: boolean;
  tournamentId: string;
}>();

const emit = defineEmits<{
  closeModal: [];
  closeModalAfterArchiving: [tournamentId: string];
}>();

const tournamentsStore = useTournamentsStore();
const { setErrorToast, setSuccessToast } = useToast();

const isArchiving = ref(false);

const tournament = computed(() => {
  return tournamentsStore.tournaments.find((t) => t.id === props.tournamentId);
});

const archivingError = computed(() => {
  if (!tournament.value) return "";

  if (tournament.value.rostersInfo.length === 0) {
    return "Нельзя заархивировать турнир без команд. Добавь хотя бы одну команду.";
  }

  const hasEmptyRosters = tournament.value.rostersInfo.some(
    (roster) => roster.players.length === 0
  );
  if (hasEmptyRosters) {
    return "В одной из команд нет ни одного игрока. Добавь игроков или удали пустую команду.";
  }

  const hasRostersWithoutAchievements = tournament.value.rostersInfo.some(
    (roster) => !roster.achievedPlace || !roster.achievedStage
  );
  if (hasRostersWithoutAchievements) {
    return "У всех команд должны быть указаны 'Достигнутое место' и 'Достигнутая стадия'. Отредактируй команды перед архивацией.";
  }

  return "";
});

// Если строка ошибки пустая, значит всё валидно
const canBeArchived = computed(() => archivingError.value === "");

const onConfirmArchiving = async () => {
  if (!canBeArchived.value) return;

  try {
    isArchiving.value = true;
    await tournamentsStore.archiveTournament(props.tournamentId);
    setSuccessToast("🗃️🏆🗃️ Запись о турнире успешно заархивирована!!! 🗃️🏆🗃️");
    emit("closeModalAfterArchiving", props.tournamentId);
  } catch (error) {
    const msg = error instanceof Error ? error?.message : error;
    setErrorToast(`Не удалось заархивировать запись о турнире: ${msg}`);
  } finally {
    isArchiving.value = false;
  }
};
</script>

<style lang="scss" scoped>
.archive-tournament-modal {
  &__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  &__message {
    text-align: center;
    @include default-text(20px, 20px, var(--color-text));
    @media (max-width: $phone-l) {
      font-size: 16px;
      line-height: 16px;
    }
    @media (max-width: $phone-m) {
      font-size: 14px;
      line-height: 14px;
    }
  }
  &__requirements {
    background-color: rgba(var(--v-theme-on-surface), 0.05);
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  }
  &__req-title {
    display: block;
    font-weight: bold;
    margin-bottom: 8px;
    @include default-text(18px, 18px, var(--color-text));
    @media (max-width: $phone-l) {
      font-size: 14px;
      line-height: 14px;
    }
  }
  &__req-list {
    padding-left: 24px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    @include default-text(16px, 18px, var(--color-text));
    li {
      list-style-type: disc;
    }
    @media (max-width: $phone-l) {
      font-size: 14px;
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
  &__btn_archive {
    background-color: var(--color-tournament-archived);
    &:disabled {
      background-color: var(--color-tournament-archived);
    }
  }
}
</style>
