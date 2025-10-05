import { type ISignUpStateRef } from "@/types";

export default function useValidationErrorMsg() {
  const getSignUpValidationError = ({
    email,
    nick,
    password,
    repeatPassword,
  }: ISignUpStateRef) => {
    if (!email.value) {
      return "Электронная почта не может быть пустой!";
    } else if (!/^[a-z\d._%+-]+@[a-z\d.-]+\.[a-z]{2,}$/i.test(email.value)) {
      return "Введенный вами адрес электронной почты недействителен!";
    }

    if (!nick.value) {
      return "Ник не может быть пустым!";
    } else if (nick.value.length < 3) {
      return "Ник не может быть короче 3 символов!";
    } else if (nick.value.length > 15) {
      return "Ник не может быть длиннее 15 символов!";
    }

    if (password.value.length < 8) {
      return "Пароль не может быть короче 8 символов!";
    } else if (password.value.length > 28) {
      return "Пароль не может быть длиннее 28 символов!";
    } else if (!/^(?=.*[a-z])(?=.*\d).+$/i.test(password.value)) {
      return "Пароль должен содержать как минимум одну букву и одну цифру!";
    } else if (password.value !== repeatPassword.value) {
      return "Введенные пароли не совпадают!";
    }

    return null;
  };

  return { getSignUpValidationError };
}
