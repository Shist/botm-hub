import { ref } from "vue";

export default function useFormValidation() {
  const isFormValid = ref(false);

  const rules = {
    min: (minLength: number) => (givenValue: string | null) =>
      (givenValue ?? "").length >= minLength ||
      `Требуется не менее ${minLength} символов!`,
    max: (maxLength: number) => (givenValue: string | null) =>
      (givenValue ?? "").length <= maxLength ||
      `Требуется не более ${maxLength} символов!`,
    wordsNotMoreThan: (maxLetters: number) => (givenText: string | null) =>
      (givenText ?? "").split(" ").every((word) => word.length <= maxLetters) ||
      `Требуется не более ${maxLetters} символов в каждом слове!`,
  };

  return { isFormValid, rules };
}
