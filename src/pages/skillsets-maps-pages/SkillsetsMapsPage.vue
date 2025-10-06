<template>
  <div class="skillsets-maps-page">
    <h2 class="skillsets-maps-page__headline">Мапы Скиллсетов</h2>
    <nav>
      <ul class="skillsets-maps-page__links-list">
        <li
          v-for="(mapCategoryName, mapCategoryKey) in MAPS_CATEGORIES"
          :key="mapCategoryKey"
        >
          <router-link
            :to="`/skillsets-maps/${mapCategoryKey}`"
            class="skillsets-maps-page__btn"
            :class="`skillsets-maps-page__btn_${mapCategoryKey}`"
          >
            {{ mapCategoryName }}
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { MAPS_CATEGORIES } from "@/constants";
</script>

<style lang="scss" scoped>
.skillsets-maps-page {
  &__headline {
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
    &_nm1 {
      background-color: var(--color-btn-bg-nm1);
    }
    &_nm2 {
      background-color: var(--color-btn-bg-nm2);
    }
    &_nm3 {
      background-color: var(--color-btn-bg-nm3);
    }
    &_nm4 {
      background-color: var(--color-btn-bg-nm4);
    }
    &_nm5 {
      background-color: var(--color-btn-bg-nm5);
    }
    &_nm6 {
      background-color: var(--color-btn-bg-nm6);
    }
    &_nm7 {
      background-color: var(--color-btn-bg-nm7);
    }
    &_hd1 {
      background-color: var(--color-btn-bg-hd1);
    }
    &_hd2 {
      background-color: var(--color-btn-bg-hd2);
    }
    &_hd3 {
      background-color: var(--color-btn-bg-hd3);
    }
    &_hr1 {
      background-color: var(--color-btn-bg-hr1);
    }
    &_hr2 {
      background-color: var(--color-btn-bg-hr2);
    }
    &_hr3 {
      background-color: var(--color-btn-bg-hr3);
    }
    &_dt1 {
      background-color: var(--color-btn-bg-dt1);
    }
    &_dt2 {
      background-color: var(--color-btn-bg-dt2);
    }
    &_dt3 {
      background-color: var(--color-btn-bg-dt3);
    }
    &_dt4 {
      background-color: var(--color-btn-bg-dt4);
    }
    &_fm1 {
      background-color: var(--color-btn-bg-fm1);
    }
    &_fm2 {
      background-color: var(--color-btn-bg-fm2);
    }
    &_fm3 {
      background-color: var(--color-btn-bg-fm3);
    }
    &_tb {
      background-color: var(--color-btn-bg-tb);
    }
  }
}
</style>
