import { computed, type Ref } from "vue";
import IconDigitFour from "@/components/user-card/IconDigitFour.vue";
import IconDigitFive from "@/components/user-card/IconDigitFive.vue";
import IconDigitSix from "@/components/user-card/IconDigitSix.vue";
import { SHIST_UID } from "@/constants";
import { DigitCategory, type IAllUsersListItem } from "@/types";

export default function useUserTags(userRef: Ref<IAllUsersListItem | null>) {
  const isShist = computed(() => {
    if (!userRef.value) return false;
    return userRef.value.uid === SHIST_UID;
  });

  const digitIconComponent = computed(() => {
    if (!userRef.value) return null;
    switch (userRef.value.digitCategory) {
      case DigitCategory.fourDigit:
        return IconDigitFour;
      case DigitCategory.fiveDigit:
        return IconDigitFive;
      case DigitCategory.sixDigit:
        return IconDigitSix;
      default:
        return null;
    }
  });

  const isTrainer = computed(() => {
    if (!userRef.value) return false;
    return userRef.value.isTrainer;
  });

  return { isShist, digitIconComponent, isTrainer };
}
