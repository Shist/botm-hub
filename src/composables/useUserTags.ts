import { computed, type Ref } from "vue";
import { useClubsStore } from "@/stores/clubs";
import IconDigitFour from "@/components/users/user-icons/IconDigitFour.vue";
import IconDigitFive from "@/components/users/user-icons/IconDigitFive.vue";
import IconDigitSix from "@/components/users/user-icons/IconDigitSix.vue";
import { SHIST_UID } from "@/constants";
import { DigitCategory, type IAllUsersListItem } from "@/types/users";
import { BotmClub } from "@/types/clubs";

export default function useUserTags(userRef: Ref<IAllUsersListItem | null>) {
  const clubsStore = useClubsStore();

  const isShist = computed(() => {
    if (!userRef.value) return false;
    return userRef.value.uid === SHIST_UID;
  });

  const isRedactor = computed(() => {
    if (!userRef.value) return false;
    return userRef.value.isRedactor;
  });

  const isTrainer = computed(() => {
    if (!userRef.value) return false;
    return userRef.value.isTrainer;
  });

  const digitIconComponent = computed(() => {
    if (!userRef.value) return null;
    switch (userRef.value.digitCategory) {
      case DigitCategory.FOUR_DIGIT:
        return IconDigitFour;
      case DigitCategory.FIVE_DIGIT:
        return IconDigitFive;
      case DigitCategory.SIX_DIGIT:
        return IconDigitSix;
      default:
        return null;
    }
  });

  const isAimLead = computed(
    () => clubsStore.clubs[BotmClub.AIM].leaderUid === userRef.value?.uid
  );
  const isSpeedLead = computed(
    () => clubsStore.clubs[BotmClub.SPEED].leaderUid === userRef.value?.uid
  );
  const isTechLead = computed(
    () => clubsStore.clubs[BotmClub.TECH].leaderUid === userRef.value?.uid
  );
  const isReadingLead = computed(
    () => clubsStore.clubs[BotmClub.READING].leaderUid === userRef.value?.uid
  );
  const isHiddenLead = computed(
    () => clubsStore.clubs[BotmClub.HIDDEN].leaderUid === userRef.value?.uid
  );
  const isHardrockLead = computed(
    () => clubsStore.clubs[BotmClub.HARDROCK].leaderUid === userRef.value?.uid
  );

  return {
    isShist,
    isRedactor,
    isTrainer,
    digitIconComponent,
    isAimLead,
    isSpeedLead,
    isTechLead,
    isReadingLead,
    isHiddenLead,
    isHardrockLead,
  };
}
