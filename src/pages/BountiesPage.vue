<template>
  <div class="dev-page">
    <h1 class="dev-page__headline">Эта страница пока в разработке</h1>
    <router-link to="/" class="dev-page__link-to-main">
      Назад на главную страницу
    </router-link>
  </div>
</template>

<style lang="scss" scoped>
.dev-page {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  row-gap: 20px;
  &__headline {
    @include default-headline(48px, 48px, var(--color-text));
  }
  &__link-to-main {
    @include default-text(36px, 36px, var(--color-text));
    transition: 0.3s;
    &:hover {
      scale: 1.05;
      color: var(--color-link-active);
    }
  }
}
</style>
