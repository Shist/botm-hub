<template>
  <div class="main-page">
    <h2 class="main-page__welcome-msg">Личный кабинет</h2>
  </div>
</template>

<style lang="scss" scoped>
.main-page {
  &__welcome-msg {
    @include default-headline(36px, 36px, var(--color-text));
    @media (max-width: $tablet-l) {
      font-size: 28px;
      line-height: 28px;
    }
    @media (max-width: $phone-l) {
      font-size: 20px;
      line-height: 20px;
    }
  }
}
</style>
