<template>
  <header class="app-header" ref="headerRef">
    <div class="app-header__container">
      <h1 class="app-header__headline">
        <router-link to="/" class="app-header__headline-link">
          <span class="app-header__full-headline">
            Belarusian Osu! Tournament Mafia
          </span>
          <span class="app-header__short-headline">BOTM</span>
        </router-link>
      </h1>
      <BurgerMenu />
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import BurgerMenu from "@/components/BurgerMenu.vue";

const headerRef = ref<HTMLElement | null>(null);

const handleHeaderScroll = () => {
  if (!headerRef.value) {
    return;
  }

  if (window.scrollY > 0) {
    headerRef.value.classList.add("app-header_scrolled");
  } else {
    headerRef.value.classList.remove("app-header_scrolled");
  }
};

onMounted(() => {
  window.addEventListener("scroll", handleHeaderScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleHeaderScroll);
});
</script>

<style lang="scss" scoped>
.app-header {
  position: sticky;
  z-index: 5;
  top: 0;
  transition: opacity 0.3s ease;
  --header-opacity: 1;
  opacity: var(--header-opacity);
  background-color: var(--color-header);
  &_scrolled {
    --header-opacity: 0.9;
  }
  &__container {
    padding: 20px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    @media (max-width: $laptop-l) {
      padding-inline: 20px;
    }
    .app-header__headline {
      padding: 5px;
      .app-header__headline-link {
        @include default-headline(45px, 45px, var(--color-text));
        text-decoration: none;
        @media (max-width: $tablet-l) {
          font-size: 35px;
          line-height: 35px;
        }
        @media (max-width: $phone-l) {
          font-size: 30px;
          line-height: 30px;
        }
        .app-header__full-headline {
          @media (max-width: $laptop-s) {
            display: none;
          }
        }
        .app-header__short-headline {
          display: none;
          @media (max-width: $laptop-s) {
            display: inline;
          }
        }
      }
    }
  }
}
</style>
