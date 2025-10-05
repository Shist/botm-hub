<template>
  <div class="main-page">
    <h2 class="main-page__welcome-msg">
      Добро пожаловать на Belarusian Osu! Tournament Mafia Hub. Это место, где
      можно найти карты по разным скилсетам и тренировать их. В будущем
      планируется добавить конструктор карт для тренировки с параметрами,
      фильтрами и сортировками на основании карт из нашей базы, которая будет
      постоянно расширяться. В будущем планируется добавить лидерборды наших
      игроков по разным скилсетам, ежемесячные баунти, расписания качалочек и
      скримов, а также многое другое.
    </h2>
    <h3 class="main-page__welcome-msg">=========</h3>
    <h3 class="main-page__welcome-msg">=========</h3>
    <h3 class="main-page__welcome-msg">=========</h3>
    <h3 class="main-page__welcome-msg">=========</h3>
    <h3 class="main-page__welcome-msg">=========</h3>
    <h3 class="main-page__welcome-msg">=========</h3>
    <h3 class="main-page__welcome-msg">=========</h3>
    <h3 class="main-page__welcome-msg">=========</h3>
    <h3 class="main-page__welcome-msg">=========</h3>
    <h3 class="main-page__welcome-msg">=========</h3>
    <h3 class="main-page__welcome-msg">=========</h3>
    <h3 class="main-page__welcome-msg">=========</h3>
    <h3 class="main-page__welcome-msg">=========</h3>
    <h3 class="main-page__welcome-msg">=========</h3>
    <h3 class="main-page__welcome-msg">=========</h3>
  </div>
</template>

<script setup lang="ts"></script>

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
