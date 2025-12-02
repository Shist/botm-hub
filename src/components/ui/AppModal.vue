<template>
  <Teleport defer to=".global-container">
    <Transition name="fade-fall">
      <div v-if="isOpened" class="modal" @click="close(false)">
        <dialog class="modal__window-wrapper" @click.stop>
          <header>
            <h2 class="modal__title">{{ title }}</h2>
          </header>
          <slot />
          <slot name="actions">
            <button @click="close(true)" class="modal__ok-btn">
              {{ closeBtnText ?? "Закрыть" }}
            </button>
          </slot>
        </dialog>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useScrollbarPaddingStore } from "@/stores/scrollbar-padding";

const props = defineProps<{
  isOpened: boolean;
  title: string;
  closeBtnText?: string;
  isClosableByClickOutside: boolean;
}>();

const emit = defineEmits<{
  closeModal: [];
}>();

const scrollbarPaddingStore = useScrollbarPaddingStore();

const close = (isClosedByBtn: boolean) => {
  if (isClosedByBtn || props.isClosableByClickOutside) {
    emit("closeModal");
  }
};

watch(
  () => props.isOpened,
  (newValue) => {
    if (newValue) {
      document.documentElement.style.overflowY = "hidden";
      scrollbarPaddingStore.isPaddingNeeded = true;
    } else {
      document.documentElement.style.overflowY = "scroll";
      scrollbarPaddingStore.isPaddingNeeded = false;
    }
  }
);
</script>

<style lang="scss" scoped>
.fade-fall-enter-from,
.fade-fall-leave-to {
  background-color: rgba(var(--color-modal-back-bg-rgb), 0);
}
.fade-fall-enter-from dialog {
  transform: translateY(-100px);
  opacity: 0;
}
.fade-fall-leave-to dialog {
  transform: translateY(100px);
  opacity: 0;
}

.fade-fall-enter-active {
  transition: background-color 0.3s ease-out;
}
.fade-fall-leave-active {
  transition: background-color 0.3s ease-in;
}
.fade-fall-enter-active dialog {
  transition:
    transform 0.3s ease-out,
    opacity 0.3s ease-out;
}
.fade-fall-leave-active dialog {
  transition:
    transform 0.3s ease-in,
    opacity 0.3s ease-in;
}

.fade-fall-enter-to,
.fade-fall-leave-from {
  background-color: rgba(var(--color-modal-back-bg-rgb), 0.5);
}

.fade-fall-enter-to dialog {
  transform: translateY(0);
  opacity: 1;
}
.fade-fall-leave-from dialog {
  transform: translateY(0);
  opacity: 1;
}

.modal {
  padding: 10px;
  position: fixed;
  z-index: 15;
  top: 0;
  left: 0;
  min-width: 100vw;
  min-height: 100dvh;
  display: flex;
  &:not(.fade-fall-enter-active):not(.fade-fall-leave-active) {
    background-color: rgba(var(--color-modal-back-bg-rgb), 0.5);
  }
  &__window-wrapper {
    justify-self: center;
    align-self: center;
    margin: 0 10px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    row-gap: 15px;
    max-width: 650px;
    max-height: 90dvh;
    background-color: var(--color-modal-bg);
    border-radius: 10px;
    border: none;
    @media (max-width: $phone-l) {
      padding: 10px;
    }
    .modal__title {
      @include default-headline(36px, 36px, var(--color-text));
      text-align: center;
      @media (max-width: $tablet-l) {
        font-size: 30px;
        line-height: 30px;
      }
      @media (max-width: $phone-l) {
        font-size: 24px;
        line-height: 24px;
      }
    }
    .modal__ok-btn {
      @include default-btn(250px, var(--color-btn-text), var(--color-btn-bg));
      align-self: center;
    }
  }
}
</style>
