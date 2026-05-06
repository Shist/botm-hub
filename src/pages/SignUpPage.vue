<template>
  <div class="sign-up-page">
    <v-form v-model="isFormValid" class="sign-up-page__form">
      <h2 class="sign-up-page__headline">Регистрация</h2>
      <v-text-field
        v-model="email"
        :counter="254"
        :rules="[rules.min(5), rules.max(254), rules.isValidEmail]"
        type="email"
        autocomplete="email"
        variant="solo"
        prepend-inner-icon="mdi-email"
        label="Почта"
        placeholder="Введи свою почту"
        persistent-counter
        clearable
        class="sign-up-page__email-field"
      />
      <v-text-field
        v-model="nick"
        :counter="15"
        :rules="[rules.min(3), rules.max(15)]"
        autocomplete="username"
        variant="solo"
        prepend-inner-icon="mdi-account"
        label="osu! Ник"
        placeholder="Введи свой osu! ник"
        persistent-counter
        clearable
        class="sign-up-page__nick-field"
      />
      <v-text-field
        v-model="password"
        :counter="28"
        :rules="[rules.min(8), rules.max(28), rules.isStrongPassword]"
        type="password"
        autocomplete="new-password"
        variant="solo"
        prepend-inner-icon="mdi-lock"
        label="Пароль"
        placeholder="Введи свой пароль"
        persistent-counter
        clearable
        class="sign-up-page__password-field"
      />
      <v-text-field
        v-model="repeatPassword"
        :counter="28"
        :rules="[
          rules.min(8),
          rules.max(28),
          rules.isStrongPassword,
          rules.isPasswordSame(password),
        ]"
        type="password"
        autocomplete="new-password"
        variant="solo"
        prepend-inner-icon="mdi-lock-check"
        label="Повтор пароля"
        placeholder="Введи свой пароль ещё раз"
        persistent-counter
        clearable
        class="sign-up-page__repeat-password-field"
      />
      <v-btn
        :disabled="!isFormValid"
        :loading="isLoading"
        height="50"
        class="sign-up-page__confirm-btn"
        @click.prevent="onConfirmBtnClicked"
      >
        Зарегистрировать аккаунт
      </v-btn>
    </v-form>
    <h3 class="sign-up-page__sign-up-suggestion-headline">Уже есть аккаунт?</h3>
    <v-btn
      :disabled="isLoading"
      height="50"
      class="sign-up-page__sign-in-btn"
      to="/sign-in"
    >
      Войти
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import useToast from "@/composables/useToast";
import useFormValidation from "@/composables/useFormValidation";
import { getFirebaseErrorMsg } from "@/utils";

const router = useRouter();

const authStore = useAuthStore();

const { setLoadingToast, setSuccessToast, setErrorToast } = useToast();
const { isFormValid, rules } = useFormValidation();

const email = ref("");
const nick = ref("");
const password = ref("");
const repeatPassword = ref("");

const isLoading = ref(false);

const onConfirmBtnClicked = async () => {
  isLoading.value = true;
  setLoadingToast("Регистрация...");

  try {
    const partialInfo = { nick: nick.value, email: email.value };
    await authStore.signUpUser(email.value, password.value, partialInfo);

    email.value = "";
    nick.value = "";
    password.value = "";
    repeatPassword.value = "";

    setSuccessToast("🥳🥳🥳 Аккаунт успешно зарегистрирован!!! 🥳🥳🥳");
    router.replace({ name: "main" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      const errorMsg = getFirebaseErrorMsg(error);
      setErrorToast(errorMsg);
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.sign-up-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  &__form {
    margin-bottom: 15px;
    padding: 40px 20px;
    max-width: 700px;
    width: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--color-auth-form-bg);
    border-radius: 20px;
  }
  &__headline {
    @include default-headline(42px, 42px, var(--color-text));
    margin-bottom: 30px;
    text-align: center;
    @media (max-width: $phone-l) {
      font-size: 32px;
      line-height: 32px;
    }
  }
  &__email-field,
  &__nick-field,
  &__password-field {
    margin-bottom: 10px;
  }
  &__repeat-password-field {
    margin-bottom: 25px;
  }
  &__confirm-btn {
    align-self: center;
    @include default-btn(500px, var(--color-btn-text), var(--color-btn-bg));
  }
  &__sign-up-suggestion-headline {
    @include default-text(20px, 20px, var(--color-text));
    margin-bottom: 5px;
  }
  &__sign-in-btn {
    @include default-btn(250px, var(--color-btn-text), var(--color-btn-bg));
  }
}
</style>
