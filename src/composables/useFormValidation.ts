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
    isValidEmail: (emailValue: string | null) =>
      /^[a-z\d._%+-]+@[a-z\d.-]+\.[a-z]{2,}$/i.test(emailValue ?? "") ||
      "Требуется указать валидную почту!",
    isStrongPassword: (passwordValue: string | null) =>
      /^(?=.*[a-z])(?=.*\d).+$/i.test(passwordValue ?? "") ||
      "Требуется указать как минимум одну букву и одну цифру!",
    isPasswordSame: (firstPass: string | null) => (secondPass: string | null) =>
      (firstPass ?? "") === (secondPass ?? "") ||
      "Требуется повторить точно такой же пароль!",
  };

  return { isFormValid, rules };
}
