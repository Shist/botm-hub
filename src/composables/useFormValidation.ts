import { ref } from "vue";

export default function useFormValidation() {
  const isFormValid = ref(false);

  const rules = {
    min: (minLength: number) => (givenValue: string | number | null) =>
      String(givenValue ?? "").length >= minLength ||
      `Требуется не менее ${minLength} символов!`,
    optionalMin: (minLength: number) => (givenValue: string | null) => {
      if (!givenValue) return true;
      return (
        String(givenValue).length >= minLength ||
        `Требуется не менее ${minLength} символов!`
      );
    },
    max: (maxLength: number) => (givenValue: string | number | null) =>
      String(givenValue ?? "").length <= maxLength ||
      `Требуется не более ${maxLength} символов!`,
    wordsNotMoreThan: (maxLetters: number) => (givenText: string | null) =>
      (givenText ?? "").split(" ").every((word) => word.length <= maxLetters) ||
      `Требуется не более ${maxLetters} символов в каждом слове!`,
    isValidEmail: (emailValue: string | null) =>
      /^[a-z\d._%+-]+@[a-z\d.-]+\.[a-z]{2,}$/i.test(emailValue ?? "") ||
      "Требуется указать валидную почту!",
    notOnlySpaces: (givenValue: string | null) =>
      (givenValue ?? "").trim().length > 0 ||
      "Требуется, чтобы поле не состояло только из пробелов!",
    noEdgeSpaces: (givenValue: string | null) =>
      !/^\s|\s$/.test(givenValue ?? "") ||
      "Требуется, чтобы не было пробелов в начале или конце!",
    noMultipleSpaces: (givenValue: string | null) =>
      !/\s{2,}/.test(givenValue ?? "") ||
      "Требуется, чтобы внутри поля не было нескольких пробелов подряд!",
    noMultipleUnderscores: (givenValue: string | null) =>
      !/_{2,}/.test(givenValue ?? "") ||
      "Требуется, чтобы внутри поля не было нескольких подчеркиваний подряд!",
    isOptionalUrl: (givenValue: string | null) => {
      const val = (givenValue ?? "").trim();
      if (!val) return true;
      return (
        /^(https?:\/\/[^\s]+)$/i.test(val) ||
        "Требуется корректная ссылка (начинается с http:// или https://)!"
      );
    },
    isStrongPassword: (passwordValue: string | null) =>
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(passwordValue ?? "") ||
      "Требуется минимум одна строчная и одна заглавная латинские буквы, а также цифра!",
    isPasswordSame: (firstPass: string | null) => (secondPass: string | null) =>
      (firstPass ?? "") === (secondPass ?? "") ||
      "Требуется повторить точно такой же пароль!",
  };

  return { isFormValid, rules };
}
