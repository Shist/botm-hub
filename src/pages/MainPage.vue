<template>
  <div class="main-page">
    <h2 class="main-page__welcome-msg">
      Добро пожаловать на Belarusian Osu! Tournament Mafia Hub
    </h2>
    <nav>
      <ul class="main-page__links-list">
        <li>
          <router-link
            to="/players"
            class="main-page__btn main-page__btn_our-players"
          >
            Наши Игроки
          </router-link>
        </li>
        <li>
          <router-link
            to="/skillsets-maps"
            class="main-page__btn main-page__btn_skillsets-maps"
          >
            Карты Скиллсетов
          </router-link>
        </li>
        <li>
          <router-link
            to="/workout-constructor"
            class="main-page__btn main-page__btn_workout-constructor"
          >
            Конструктор Тренировочной Сессии
          </router-link>
        </li>
        <li>
          <router-link
            to="/trainings"
            class="main-page__btn main-page__btn_trainings"
          >
            Расписания Качалочек
          </router-link>
        </li>
        <li>
          <router-link
            to="/tournaments"
            class="main-page__btn main-page__btn_tournaments"
          >
            Текущие Турниры и Наши Ростеры
          </router-link>
        </li>
        <li>
          <router-link
            to="/bounties"
            class="main-page__btn main-page__btn_bounties"
          >
            Баунти Карты Месяца
          </router-link>
        </li>
      </ul>
    </nav>
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
  &__links-list {
    padding: 30px;
    display: flex;
    flex-direction: column;
    row-gap: 20px;
    li {
      display: flex;
    }
  }
  &__btn {
    position: relative;
    text-decoration: none;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 15px;
    font-family: $font-roboto;
    font-weight: 700;
    font-size: 28px;
    line-height: 28px;
    text-align: center;
    color: var(--color-btn-text);
    border-radius: 10px;
    border: none;
    cursor: pointer;
    transition: 0.3s;
    &:hover {
      box-shadow: 4px 4px 4px 0 rgba(0, 0, 0, 0.2);
    }
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 10px;
      background: linear-gradient(
        175deg,
        rgba(255, 255, 255, 0.4) 0,
        rgba(255, 255, 255, 0) 100%
      );
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }
    &:hover::before {
      opacity: 1;
    }
    @media (max-width: $phone-l) {
      font-size: 20px;
      line-height: 20px;
    }
    &_our-players {
      background-color: var(--color-btn-bg-our-players);
    }
    &_skillsets-maps {
      background-color: var(--color-btn-bg-skillsets-maps);
    }
    &_workout-constructor {
      background-color: var(--color-btn-bg-workout-constructor);
    }
    &_trainings {
      background-color: var(--color-btn-bg-trainings);
    }
    &_tournaments {
      background-color: var(--color-btn-bg-tournaments);
    }
    &_bounties {
      background-color: var(--color-btn-bg-bounties);
    }
  }
}
</style>
