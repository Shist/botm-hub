import { type IFirebaseError } from "@/types";

export default function useFirebaseErrorMsg() {
  const getErrorMsg = (error: IFirebaseError | Error) => {
    if (!("code" in error)) {
      return error.message;
    }
    switch (error.code) {
      case "auth/invalid-email":
        return "Указанный вами адрес электронной почты не зарегистрирован!";
      case "auth/missing-password":
        return "Вы не указали пароль!";
      case "auth/invalid-credential":
        return "Указанные вами учетные данные неверны. Перепроверьте указанный адрес электронной почты и пароль!";
      case "auth/email-already-in-use":
        return "Указанный вами адрес электронной почты уже зарегистрирован. Войдите или зарегистрируйте другой.";
      default:
        return error.message;
    }
  };

  return { getErrorMsg };
}
