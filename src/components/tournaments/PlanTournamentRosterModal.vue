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
        class="plan-tournament-roster-modal__modal-content-wrapper"
      >
        <v-text-field
          v-model="teamName"
          :counter="70"
          :rules="[rules.min(3), rules.max(70), rules.wordsNotMoreThan(20)]"
          variant="solo"
          prepend-inner-icon="mdi-account-group"
          label="Название команды"
          placeholder="e.g. Belarus A"
          persistent-counter
          clearable
        />
        <div class="plan-tournament-roster-modal__achievements-wrapper">
          <v-select
            v-model="achievedPlace"
            :items="ACHIEVED_PLACES"
            variant="solo"
            prepend-inner-icon="mdi-trophy"
            label="Достигнутое место"
            placeholder="Выбери достигнутое место"
            clearable
            hide-details
          />
          <v-select
            v-model="achievedStage"
            :items="ACHIEVED_STAGES"
            variant="solo"
            prepend-inner-icon="mdi-tournament"
            label="Достигнутая стадия"
            placeholder="Выбери достигнутую стадию"
            clearable
            hide-details
          />
        </div>
        <v-divider
          class="plan-tournament-roster-modal__divider border-opacity-100"
        />
        <v-expansion-panels
          v-model="playersPanel"
          class="plan-tournament-roster-modal__players-panel"
        >
          <v-expansion-panel>
            <v-expansion-panel-title>
              <span class="plan-tournament-roster-modal__panel-title">
                Состав команды ({{ filledSlotsCount }} /
                {{ tournamentTeamSize }})
              </span>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="plan-tournament-roster-modal__slots-wrapper">
                <div
                  v-for="(slot, index) in currentSlots"
                  :key="slot.localId"
                  class="plan-tournament-roster-modal__player-slot"
                >
                  <div class="plan-tournament-roster-modal__slot-header">
                    <div class="plan-tournament-roster-modal__slot-header-top">
                      <span class="plan-tournament-roster-modal__slot-title">
                        Игрок {{ index + 1 }}
                        <span
                          v-if="index === 0"
                          class="plan-tournament-roster-modal__captain-label"
                        >
                          (Капитан)
                        </span>
                      </span>
                      <v-btn
                        icon="mdi-close"
                        variant="text"
                        size="small"
                        color="var(--color-error)"
                        @click="removeSlot(index)"
                      />
                    </div>
                    <v-btn-toggle
                      v-model="slot.isRegistered"
                      color="var(--color-vuetify-toggle)"
                      density="compact"
                      rounded="lg"
                      mandatory
                      class="plan-tournament-roster-modal__slot-toggle"
                    >
                      <v-btn :value="true" size="small">Из базы</v-btn>
                      <v-btn :value="false" size="small">Внешний</v-btn>
                    </v-btn-toggle>
                  </div>
                  <RegisteredPlayersSelect
                    v-if="slot.isRegistered"
                    v-model="slot.registeredPlayer"
                  />
                  <UnregisteredPlayerCard
                    v-else
                    v-model="slot.unregisteredPlayer"
                  />
                </div>
                <v-btn
                  v-if="currentSlots.length < tournamentTeamSize"
                  class="plan-tournament-roster-modal__btn plan-tournament-roster-modal__btn_add-player"
                  prepend-icon="mdi-plus"
                  height="44"
                  @click="addSlot"
                >
                  Добавить игрока
                </v-btn>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-divider
          class="plan-tournament-roster-modal__divider border-opacity-100"
        />
        <div class="plan-tournament-roster-modal__media-wrapper">
          <v-text-field
            v-model="collabImgLink"
            :counter="300"
            :rules="[rules.optionalMin(15), rules.max(300)]"
            label="Коллаб"
            variant="solo"
            prepend-inner-icon="mdi-image"
            placeholder="e.g. https://i.ibb.co/a7b2c7/6ec26-blr-a.png"
            persistent-counter
            clearable
          />
          <v-text-field
            v-model="rosterRevealLink"
            :counter="100"
            :rules="[rules.optionalMin(15), rules.max(100)]"
            label="Ростер Ревил"
            variant="solo"
            prepend-inner-icon="mdi-youtube"
            placeholder="e.g. https://youtu.be/a7b2c7"
            persistent-counter
            clearable
          />
        </div>
      </v-form>
    </template>
    <template #actions>
      <div class="plan-tournament-roster-modal__actions-wrapper">
        <v-alert
          v-if="duplicatedNicks.length > 0"
          type="error"
          variant="tonal"
          density="compact"
          class="plan-tournament-roster-modal__duplicates-alert"
        >
          Обнаружены дубликаты игроков: {{ duplicatedNicks.join(", ") }}. Каждый
          игрок должен быть уникальным.
        </v-alert>
        <div class="plan-tournament-roster-modal__modal-btns-wrapper">
          <v-btn
            :disabled="isLoading"
            height="50"
            class="plan-tournament-roster-modal__btn plan-tournament-roster-modal__btn_cancel"
            @click="onCloseModal"
          >
            Отмена
          </v-btn>
          <div class="plan-tournament-roster-modal__btn-wrapper">
            <v-btn
              :disabled="isConfirmBtnDisabled || isRosterDataSame"
              :loading="isLoading"
              height="50"
              class="plan-tournament-roster-modal__btn plan-tournament-roster-modal__btn_add-roster"
              @click="onConfirmRoster"
            >
              {{ confirmBtnLabel }}
            </v-btn>
            <v-tooltip
              v-if="duplicatedNicks.length > 0"
              activator="parent"
              location="top"
            >
              Устрани дубликаты игроков перед сохранением
            </v-tooltip>
          </div>
        </div>
      </div>
    </template>
  </AppModal>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import RegisteredPlayersSelect from "@/components/users/RegisteredPlayersSelect.vue";
import UnregisteredPlayerCard from "@/components/users/UnregisteredPlayerCard.vue";
import useFormValidation from "@/composables/useFormValidation";
import useToast from "@/composables/useToast";
import { useTournamentsStore } from "@/stores/tournaments";
import {
  ACHIEVED_PLACES,
  ACHIEVED_STAGES,
  type AchievedPlaceType,
  type AchievedStageType,
  type IRosterInfo,
} from "@/types/tournaments";
import {
  type IAllUsersListItem,
  type IUnregisteredUser,
  type IPlayerSlot,
} from "@/types/users";

const props = defineProps<{
  isOpened: boolean;
  tournamentId: string;
  roster: IRosterInfo<IAllUsersListItem> | null;
}>();

const emit = defineEmits<{
  closeModal: [];
  closeModalAfterRequest: [rosterId: string];
}>();

const { isFormValid, rules } = useFormValidation();
const { setErrorToast, setSuccessToast } = useToast();
const tournamentsStore = useTournamentsStore();

const teamName = ref("");
const achievedPlace = ref<AchievedPlaceType | null>(null);
const achievedStage = ref<AchievedStageType | null>(null);
const collabImgLink = ref<string | null>(null);
const rosterRevealLink = ref<string | null>(null);
const currentSlots = ref<IPlayerSlot[]>([]);
const isLoading = ref(false);
const playersPanel = ref<number | null>(0);

const tournamentTeamSize = computed(() => {
  const tournament = tournamentsStore.tournaments.find(
    (t) => t.id === props.tournamentId
  );
  return tournament?.teamSize ?? 0;
});
const filledSlotsCount = computed(() => {
  return currentSlots.value.filter((s) =>
    s.isRegistered ? s.registeredPlayer !== null : s.unregisteredPlayer !== null
  ).length;
});
const modalTitle = computed(
  () => `📋 ${props.roster ? "Изменить" : "Добавить"} команду 📋`
);
const confirmBtnLabel = computed(() =>
  props.roster ? "Изменить" : "Добавить"
);
const duplicatedNicks = computed(() => {
  const nicks = currentSlots.value
    .map((s) =>
      s.isRegistered ? s.registeredPlayer?.nick : s.unregisteredPlayer?.nick
    )
    .filter(
      (nick): nick is string => typeof nick === "string" && nick.trim() !== ""
    );

  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const nick of nicks) {
    const normalizedNick = nick.toLowerCase();
    if (seen.has(normalizedNick)) {
      duplicates.add(nick);
    } else {
      seen.add(normalizedNick);
    }
  }

  return Array.from(duplicates);
});
const isConfirmBtnDisabled = computed(() => {
  return (
    !isFormValid.value || !teamName.value || duplicatedNicks.value.length > 0
  );
});
const isRosterDataSame = computed(() => {
  if (!props.roster) return false;

  const currentExtractedPlayers = currentSlots.value
    .map((s) => (s.isRegistered ? s.registeredPlayer : s.unregisteredPlayer))
    .filter((p) => p !== null);

  return (
    props.roster.teamName === teamName.value &&
    props.roster.achievedPlace === achievedPlace.value &&
    props.roster.achievedStage === achievedStage.value &&
    props.roster.collabImgLink === collabImgLink.value &&
    props.roster.rosterRevealLink === rosterRevealLink.value &&
    JSON.stringify(props.roster.players) ===
      JSON.stringify(currentExtractedPlayers)
  );
});

watch(
  () => props.isOpened,
  (isOpened) => {
    if (isOpened) initValues();
  }
);

const initValues = () => {
  playersPanel.value = 0;

  if (props.roster) {
    teamName.value = props.roster.teamName;
    achievedPlace.value = props.roster.achievedPlace;
    achievedStage.value = props.roster.achievedStage;
    collabImgLink.value = props.roster.collabImgLink;
    rosterRevealLink.value = props.roster.rosterRevealLink;

    currentSlots.value = props.roster.players.map((p) => {
      const isReg = p ? "uid" in p : true;
      return {
        localId: crypto.randomUUID(),
        isRegistered: isReg,
        registeredPlayer: isReg ? (p as IAllUsersListItem) : null,
        unregisteredPlayer: !isReg ? (p as IUnregisteredUser) : null,
      };
    });
  } else {
    teamName.value = "";
    achievedPlace.value = null;
    achievedStage.value = null;
    collabImgLink.value = null;
    rosterRevealLink.value = null;
    currentSlots.value = [];
  }
};

const addSlot = () => {
  if (currentSlots.value.length < tournamentTeamSize.value) {
    currentSlots.value.push({
      localId: crypto.randomUUID(),
      isRegistered: true,
      registeredPlayer: null,
      unregisteredPlayer: null,
    });
  }
};

const removeSlot = (index: number) => {
  currentSlots.value.splice(index, 1);
};

const onCloseModal = () => {
  emit("closeModal");
};

const onConfirmRoster = async () => {
  try {
    isLoading.value = true;

    const extractedPlayers = currentSlots.value
      .map((s) => (s.isRegistered ? s.registeredPlayer : s.unregisteredPlayer))
      .filter((p) => p !== null) as (IAllUsersListItem | IUnregisteredUser)[];

    const newRoster: IRosterInfo<IAllUsersListItem> = {
      id: props.roster ? props.roster.id : crypto.randomUUID(),
      teamName: teamName.value,
      achievedPlace: achievedPlace.value,
      achievedStage: achievedStage.value,
      collabImgLink: collabImgLink.value,
      rosterRevealLink: rosterRevealLink.value,
      players: extractedPlayers,
    };

    if (props.roster) {
      await tournamentsStore.updateRoster(props.tournamentId, newRoster);
      setSuccessToast("📋🤝📋 Команда успешно изменена!!! 📋🤝📋");
    } else {
      await tournamentsStore.addRoster(props.tournamentId, newRoster);
      setSuccessToast("📋🤝📋 Команда успешно добавлена!!! 📋🤝📋");
    }

    emit("closeModalAfterRequest", newRoster.id);
  } catch (error) {
    const msg = error instanceof Error ? error?.message : error;
    setErrorToast(`Ошибка во время сохранения команды: ${msg}`);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.plan-tournament-roster-modal {
  &__divider {
    margin: 16px 0;
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
    &_add-roster {
      background-color: var(--color-tournament-roster-add);
      color: var(--color-text-white);
      &:hover {
        filter: brightness(1.1);
      }
      &:disabled {
        background-color: var(--color-tournament-roster-add);
      }
    }
    &_add-player {
      background-color: var(--color-btn-bg);
      color: var(--color-text-white);
      border-radius: 8px;
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
  }
  &__achievements-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  &__panel-title {
    @include default-headline(18px, 18px, var(--color-text));
  }
  &__players-panel {
    border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
    border-radius: 8px;
  }
  &__slots-wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  &__player-slot {
    padding: 10px;
    background-color: var(--color-text-area-bg);
    border-radius: 8px;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  }
  &__slot-header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 12px;
  }
  &__slot-header-top {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  &__slot-toggle {
    margin-bottom: 4px;
  }
  &__slot-title {
    font-weight: bold;
    font-size: 16px;
    color: var(--color-text);
  }
  &__captain-label {
    color: var(--color-tournament-roster-captain);
    font-size: 14px;
    margin-left: 4px;
  }
  &__slot-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  &__media-wrapper {
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
  &__actions-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  &__duplicates-alert {
    padding: 10px;
    width: 0;
    min-width: 100%;
    font-size: 14px;
  }
  &__btn-wrapper {
    flex: 1 1 calc(50% - 5px);
  }
}
</style>
