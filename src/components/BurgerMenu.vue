<template>
  <AppModal
    :isOpened="isPatchNotesModalOpened"
    title="Последние обновления"
    closeBtnText="Понятно"
    :isClosableByClickOutside="true"
    @closeModal="closePatchNotesModal"
  >
    <PatchNotes />
  </AppModal>
  <button class="burger-btn" @click="openMenu" />
  <Teleport defer to=".global-container">
    <Transition name="fade-slide">
      <div v-if="isMenuOpened" class="burger-menu" @click="closeMenu">
        <nav v-if="isMenuOpened" class="burger-menu__nav">
          <div class="burger-menu__curr-acc-wrapper">
            <span class="burger-menu__curr-acc-label">Текущий аккаунт</span>
            <span v-if="!userEmail" class="burger-menu__no-auth-label">
              Ещё не авторизован
            </span>
            <div v-else class="burger-menu__acc-info-wrapper">
              <div class="burger-menu__email-wrapper">
                <span class="burger-menu__email-label">Почта:</span>
                <span class="burger-menu__email-value">{{ userEmail }}</span>
              </div>
              <div class="burger-menu__user-info-wrapper">
                <span class="burger-menu__user-info-label">Ник:</span>
                <AppSpinner v-if="userNick === 'loading'" />
                <span
                  v-else-if="userNick === 'loadingError'"
                  class="burger-menu__user-info-error-label"
                >
                  (ошибка загрузки)
                </span>
                <span v-else class="burger-menu__user-info-label">
                  {{ userNick }}
                </span>
              </div>
            </div>
          </div>
          <h2 class="burger-menu__headline">Меню</h2>
          <div class="burger-menu__option-wrapper">
            <span class="burger-menu__theme-switch-label">
              {{ switchThemeLabel }}
            </span>
            <ThemeSwitcher class="burger-menu__theme-switch" />
          </div>
          <ul class="burger-menu__nav-list">
            <li class="burger-menu__nav-list-item">
              <button
                class="burger-menu__btn"
                @click.stop="openPatchNotesModal"
              >
                Последние обновления
              </button>
            </li>
            <li v-if="userEmail" class="burger-menu__nav-list-item">
              <a class="burger-menu__link" @click.stop="onLogOutBtnClicked">
                Выйти
              </a>
            </li>
            <li
              v-else-if="isLogInBtnVisible"
              class="burger-menu__nav-list-item"
            >
              <a class="burger-menu__link" @click.stop="onLogInBtnClicked">
                Войти
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useThemeStore } from "@/stores/theme";
import useToast from "@/composables/useToast";
import useFirebaseErrorMsg from "@/composables/useFirebaseErrorMsg";
import ThemeSwitcher from "@/components/ThemeSwitcher.vue";
import PatchNotes from "@/components/PatchNotes.vue";

const router = useRouter();

const authStore = useAuthStore();
const themeStore = useThemeStore();

const { setErrorToast } = useToast();
const { getErrorMsg } = useFirebaseErrorMsg();

const isMenuOpened = ref(false);
const isPatchNotesModalOpened = ref(false);

const userEmail = computed(() => authStore.user?.email);
const userNick = computed(() => {
  if (!authStore.user) return "";

  if (typeof authStore.user.additionalInfo === "string") {
    return authStore.user.additionalInfo;
  } else {
    return authStore.user.additionalInfo.nick;
  }
});

const switchThemeLabel = computed(
  () =>
    `Включить ${themeStore.currTheme === "dark" ? "светлую" : "тёмную"} тему:`
);

const isLogInBtnVisible = computed(
  () => !userEmail.value && router.currentRoute.value.name !== "sign-in"
);

const openMenu = () => {
  isMenuOpened.value = true;
};

const openPatchNotesModal = () => {
  isPatchNotesModalOpened.value = true;
};
const closePatchNotesModal = () => {
  isPatchNotesModalOpened.value = false;
};

const closeMenu = (event: MouseEvent) => {
  const element = event.target as HTMLElement;

  if (element.className === "burger-menu") {
    isMenuOpened.value = false;
  }
};

const onLogInBtnClicked = () => {
  isMenuOpened.value = false;

  router.push({ name: "sign-in" });
};

const onLogOutBtnClicked = async () => {
  try {
    await authStore.signOutUser();

    isMenuOpened.value = false;

    router.push({ name: "sign-in" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      const errorMsg = getErrorMsg(error);
      setErrorToast(errorMsg);
    }
  }
};
</script>

<style scoped lang="scss">
.burger-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent var(--burger-menu-btn-img) no-repeat center / cover;
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    transform: scale(1.1);
  }
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  background-color: rgba(var(--color-burger-menu-back-bg-rgb), 0);
}
.fade-slide-enter-from nav,
.fade-slide-leave-to nav {
  transform: translateX(100%);
}

.fade-slide-enter-active {
  transition: background-color 0.3s ease-out;
}
.fade-slide-leave-active {
  transition: background-color 0.3s ease-in;
}
.fade-slide-enter-active nav {
  transition: transform 0.3s ease-out;
}
.fade-slide-leave-active nav {
  transition: transform 0.3s ease-in;
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  background-color: rgba(var(--color-burger-menu-back-bg-rgb), 0.5);
}
.fade-slide-enter-to nav,
.fade-slide-leave-from nav {
  transform: translateX(0);
}

.burger-menu {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  min-width: 100vw;
  min-height: 100dvh;
  display: flex;
  justify-content: flex-end;
  &:not(.fade-slide-enter-active):not(.fade-slide-leave-active) {
    background-color: rgba(var(--color-burger-menu-back-bg-rgb), 0.5);
  }
  &__nav {
    position: relative;
    max-width: 70%;
    width: 100%;
    padding: 30px;
    display: flex;
    flex-direction: column;
    background-color: var(--color-burger-menu-bg);
    max-height: 100dvh;
    overflow-y: auto;
    @media (max-width: $tablet-l) {
      padding: 20px;
    }
    @media (max-width: $phone-l) {
      padding: 10px;
    }
    .burger-menu__curr-acc-wrapper {
      margin-bottom: 30px;
      width: 100%;
      display: flex;
      flex-direction: column;
      row-gap: 10px;
      .burger-menu__curr-acc-label {
        @include default-headline(32px, 32px, var(--color-burger-menu-text));
        @media (max-width: $tablet-l) {
          font-size: 20px;
          line-height: 20px;
        }
      }
      .burger-menu__no-auth-label {
        @include default-text(28px, 28px, var(--color-burger-menu-text));
        @media (max-width: $tablet-l) {
          font-size: 20px;
          line-height: 20px;
        }
      }
      .burger-menu__acc-info-wrapper {
        display: flex;
        flex-direction: column;
        row-gap: 5px;
        .burger-menu__email-wrapper {
          display: flex;
          align-items: center;
          column-gap: 5px;
          .burger-menu__email-label {
            @include default-text(28px, 28px, var(--color-burger-menu-text));
            @media (max-width: $tablet-l) {
              font-size: 20px;
              line-height: 20px;
            }
            @media (max-width: $phone-l) {
              font-size: 14px;
              line-height: 14px;
            }
            @media (max-width: $phone-m) {
              font-size: 12px;
              line-height: 12px;
            }
          }
          .burger-menu__email-value {
            @include default-text(28px, 30px, var(--color-burger-menu-text));
            overflow: hidden;
            text-overflow: ellipsis;
            text-wrap: nowrap;
            @media (max-width: $tablet-l) {
              font-size: 16px;
              line-height: 18px;
            }
            @media (max-width: $phone-l) {
              font-size: 12px;
              line-height: 14px;
            }
          }
        }
        .burger-menu__user-info-wrapper {
          display: flex;
          align-items: center;
          column-gap: 5px;
          .burger-menu__user-info-label,
          .burger-menu__user-info-error-label {
            @include default-text(28px, 28px, var(--color-burger-menu-text));
            @media (max-width: $tablet-l) {
              font-size: 20px;
              line-height: 20px;
            }
            @media (max-width: $phone-l) {
              font-size: 14px;
              line-height: 14px;
            }
            @media (max-width: $phone-m) {
              font-size: 12px;
              line-height: 12px;
            }
          }
        }
      }
    }
    .burger-menu__headline {
      @include default-headline(48px, 48px, var(--color-burger-menu-text));
      margin-bottom: 40px;
      text-align: center;
      @media (max-width: $tablet-l) {
        font-size: 36px;
        line-height: 36px;
      }
    }
    .burger-menu__option-wrapper {
      margin-bottom: 30px;
      display: flex;
      flex-direction: column;
      align-items: center;
      row-gap: 5px;
      .burger-menu__theme-switch-label {
        @include default-text(32px, 32px, var(--color-burger-menu-text));
        @media (max-width: $tablet-l) {
          font-size: 24px;
          line-height: 24px;
        }
        @media (max-width: $phone-l) {
          font-size: 18px;
          line-height: 18px;
        }
      }
    }
    .burger-menu__nav-list {
      display: flex;
      flex-direction: column;
      align-items: center;
      row-gap: 20px;
      .burger-menu__nav-list-item {
        width: 80%;
        text-align: center;
        border: 3px solid var(--color-burger-menu-link-borders);
        border-radius: 10px;
        cursor: pointer;
        transition: 0.3s;
        &:hover {
          transform: scale(1.1);
          border: 3px solid var(--color-burger-menu-link);
          .burger-menu__link {
            color: var(--color-burger-menu-link);
          }
          .burger-menu__btn {
            color: var(--color-burger-menu-link);
          }
        }
        .burger-menu__link {
          @include default-text(36px, 36px, var(--color-burger-menu-text));
          display: inline-block;
          width: 100%;
          padding: 20px;
          text-decoration: none;
          transition: 0.3s;
          @media (max-width: $laptop-s) {
            font-size: 24px;
            line-height: 24px;
          }
          @media (max-width: $phone-l) {
            font-size: 20px;
            line-height: 20px;
          }
        }
        .burger-menu__btn {
          @include default-text(36px, 36px, var(--color-burger-menu-text));
          width: 100%;
          padding: 20px;
          background-color: transparent;
          border: none;
          cursor: pointer;
          transition: 0.3s;
          @media (max-width: $laptop-s) {
            font-size: 24px;
            line-height: 24px;
          }
          @media (max-width: $phone-l) {
            font-size: 20px;
            line-height: 20px;
          }
        }
      }
    }
  }
}
</style>
