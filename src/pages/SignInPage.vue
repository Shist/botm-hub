<template>
  <div class="sign-in-page">
    <form action="#" class="sign-in-page__form">
      <h2 class="sign-in-page__headline">Вход</h2>
      <div class="control-wrapper sign-in-page__email-control-wrapper">
        <label class="control-wrapper__email-input-label" for="emailInput">
          Почта:
        </label>
        <input
          v-model="email"
          type="email"
          name="email"
          class="control-wrapper__email-input"
          id="emailInput"
          placeholder="Ввести почту..."
          required
        />
      </div>
      <div class="control-wrapper sign-in-page__password-control-wrapper">
        <label
          class="control-wrapper__password-input-label"
          for="passwordInput"
        >
          Пароль:
        </label>
        <input
          v-model="password"
          type="password"
          name="password"
          class="control-wrapper__password-input"
          id="passwordInput"
          placeholder="Ввести пароль..."
          autocomplete="on"
          required
        />
      </div>
      <button
        class="sign-in-page__confirm-btn"
        @click.prevent="onConfirmBtnClicked"
        :disabled="isLoading"
      >
        Войти в аккаунт
      </button>
    </form>
    <h3 class="sign-in-page__sign-up-suggestion-headline">Eщё нет аккаунта?</h3>
    <router-link
      to="/sign-up"
      class="sign-in-page__sign-up-btn"
      :class="{ 'disabled-link': isLoading }"
    >
      Зарегистрироваться
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import useToast from "@/composables/useToast";
import useFirebaseErrorMsg from "@/composables/useFirebaseErrorMsg";

const router = useRouter();

const authStore = useAuthStore();

const { setLoadingToast, setErrorToast, removeCurrToast } = useToast();
const { getErrorMsg } = useFirebaseErrorMsg();

const email = ref("");
const password = ref("");

const isLoading = ref(false);

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
      const errorMsg = getErrorMsg(error);
      setErrorToast(errorMsg);
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.sign-in-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  &__form {
    margin-bottom: 20px;
    padding: 40px 20px;
    max-width: 700px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: var(--color-auth-form-bg);
    border-radius: 20px;
    .sign-in-page__headline {
      @include default-headline(42px, 42px, var(--color-text));
      margin-bottom: 30px;
      text-align: center;
      @media (max-width: $phone-l) {
        font-size: 32px;
        line-height: 32px;
      }
    }
    .sign-in-page__email-control-wrapper {
      margin-bottom: 20px;
    }
    .sign-in-page__password-control-wrapper {
      margin-bottom: 40px;
    }
    .sign-in-page__confirm-btn {
      align-self: center;
      @include default-btn(500px, var(--color-btn-text), var(--color-btn-bg));
    }
  }
  &__sign-up-suggestion-headline {
    @include default-text(20px, 20px, var(--color-text));
    margin-bottom: 5px;
  }
  &__sign-up-btn {
    @include default-btn(200px, var(--color-btn-text), var(--color-btn-bg));
    text-decoration: none;
  }
}

.control-wrapper {
  max-width: 500px;
  width: 100%;
  display: flex;
  flex-direction: column;
  &__email-input-label {
    @include default-text(24px, 24px, var(--color-text));
    padding-bottom: 5px;
    @media (max-width: $phone-l) {
      font-size: 20px;
      line-height: 20px;
    }
  }
  &__email-input {
    @extend %default-input;
  }
  &__password-input-label {
    @include default-text(24px, 24px, var(--color-text));
    padding-bottom: 5px;
    @media (max-width: $phone-l) {
      font-size: 20px;
      line-height: 20px;
    }
  }
  &__password-input {
    @extend %default-input;
  }
}
</style>
