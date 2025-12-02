<template>
  <div class="not-found-page">
    <h1 class="not-found-page__headline">Эта страница не существует</h1>
    <router-link to="/" class="not-found-page__link-to-main">
      Назад на главную страницу
    </router-link>
  </div>
</template>

<style lang="scss" scoped>
.not-found-page {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  row-gap: 20px;
  &__headline {
    @include default-headline(48px, 48px, var(--color-text));
    @media (max-width: $tablet-l) {
      font-size: 36px;
      line-height: 36px;
    }
    @media (max-width: $phone-l) {
      font-size: 28px;
      line-height: 28px;
    }
  }
  &__link-to-main {
    @include default-text(36px, 36px, var(--color-text));
    transition: 0.3s;
    &:hover {
      scale: 1.05;
      color: var(--color-link-active);
    }
    @media (max-width: $tablet-l) {
      font-size: 28px;
      line-height: 28px;
    }
    @media (max-width: $phone-l) {
      font-size: 24px;
      line-height: 24px;
    }
  }
}
</style>
