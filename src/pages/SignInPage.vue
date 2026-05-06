<template>
  <div class="sign-in-page">
    <v-form v-model="isFormValid" class="sign-in-page__form">
      <h2 class="sign-in-page__headline">Вход</h2>
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
        class="sign-in-page__email-field"
      />
      <v-text-field
        v-model="password"
        :counter="28"
        :rules="[rules.min(8), rules.max(28), rules.isStrongPassword]"
        type="password"
        autocomplete="current-password"
        variant="solo"
        prepend-inner-icon="mdi-lock"
        label="Пароль"
        placeholder="Введи свой пароль"
        persistent-counter
        clearable
        class="sign-in-page__password-field"
      />
      <v-btn
        :disabled="!isFormValid"
        :loading="isLoading"
        height="50"
        class="sign-in-page__confirm-btn"
        @click.prevent="onConfirmBtnClicked"
      >
        Войти в аккаунт
      </v-btn>
    </v-form>
    <h3 class="sign-in-page__suggestion-headline">Eщё нет аккаунта?</h3>
    <v-btn
      :disabled="isLoading"
      height="50"
      class="sign-in-page__action-btn sign-in-page__action-btn_mb"
      to="/sign-up"
    >
      Зарегистрироваться
    </v-btn>
    <h3
      class="sign-in-page__suggestion-headline sign-in-page__suggestion-headline_mt"
    >
      Забыл пароль?
    </h3>
    <v-tooltip
      :disabled="isEmailValid"
      text="Сначала введи валидную почту в поле выше"
      location="top"
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          :disabled="!isEmailValid || isLoading || isResetLoading"
          :loading="isResetLoading"
          height="50"
          class="sign-in-page__action-btn sign-in-page__action-btn_negative"
          @click.prevent="onResetPasswordClicked"
        >
          Сбросить пароль
        </v-btn>
      </template>
    </v-tooltip>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import useToast from "@/composables/useToast";
import useFormValidation from "@/composables/useFormValidation";
import { getFirebaseErrorMsg } from "@/utils";

const router = useRouter();
const authStore = useAuthStore();

const { setLoadingToast, setSuccessToast, setErrorToast, removeCurrToast } =
  useToast();
const { isFormValid, rules } = useFormValidation();

const email = ref("");
const password = ref("");

const isLoading = ref(false);
const isResetLoading = ref(false);

const isEmailValid = computed(() => {
  return email.value.length >= 5 && rules.isValidEmail(email.value) === true;
});

const onConfirmBtnClicked = async () => {
  isLoading.value = true;
  setLoadingToast("Авторизация...");

  try {
    await authStore.signInUser(email.value, password.value);

    email.value = "";
    password.value = "";

    removeCurrToast();
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

const onResetPasswordClicked = async () => {
  if (!isEmailValid.value) return;

  isResetLoading.value = true;
  setLoadingToast("Отправка письма для сброса...");

  try {
    await authStore.resetUserPassword(email.value);

    removeCurrToast();
    setSuccessToast(
      "✉️✉️✉️ Письмо со ссылкой для сброса пароля отправлено на твою почту!!! ✉️✉️✉️"
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      const errorMsg = getFirebaseErrorMsg(error);
      setErrorToast(errorMsg);
    }
  } finally {
    isResetLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.sign-in-page {
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
  &__email-field {
    margin-bottom: 10px;
  }
  &__password-field {
    margin-bottom: 25px;
  }
  &__confirm-btn {
    align-self: center;
    @include default-btn(500px, var(--color-btn-text), var(--color-btn-bg));
  }
  &__suggestion-headline {
    @include default-text(20px, 20px, var(--color-text));
    margin-bottom: 5px;
  }
  &__action-btn {
    @include default-btn(250px, var(--color-btn-text), var(--color-btn-bg));
    &_mb {
      margin-bottom: 15px;
    }
    &_negative {
      background-color: var(--color-training-deletion);
      &:disabled {
        background-color: var(--color-training-deletion);
      }
    }
  }
}
</style>
