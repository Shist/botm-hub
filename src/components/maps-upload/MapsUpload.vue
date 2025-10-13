<template>
  <div class="map-upload-wrapper">
    <h3 class="map-upload-wrapper__title">Информация о картах для загрузки:</h3>
    <ul
      v-for="mapData in mapsArr"
      :key="mapData.id"
      class="map-upload-wrapper__list"
    >
      <li
        v-for="(value, key) in mapData"
        :key="key"
        class="map-upload-wrapper__list-item"
      >
        <span class="map-upload-wrapper__list-item-key">{{ `${key}:` }}</span>
        <span class="map-upload-wrapper__list-item-value">{{ value }}</span>
      </li>
    </ul>
    <button class="map-upload-wrapper__upload-btn" @click="uploadMaps">
      Загрузить карты
    </button>
  </div>
</template>

<script setup lang="ts">
import { uploadMapsToFirebase } from "@/services/firebase";
import mapsArr from "@/components/maps-upload/maps.json";
import { type IOsuMap } from "@/types";

const uploadMaps = async () => {
  try {
    await uploadMapsToFirebase(mapsArr as Omit<IOsuMap, "link">[]);
    console.log("Конец загрузки карт");
  } catch (error) {
    console.error(error);
  }
};
</script>

<style lang="scss" scoped>
.map-upload-wrapper {
  padding: 20px;
  background-color: black;
  &__title {
    @include default-headline(24px, 24px, var(--color-text));
    margin-bottom: 20px;
  }
  &__list {
    margin-bottom: 10px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    row-gap: 10px;
    border: 2px solid var(--color-btn-bg);
  }
  &__list-item {
    display: grid;
    grid-template-columns: 100px auto;
    column-gap: 10px;
  }
  &__list-item-key {
    @include default-text(20px, 20px, var(--color-text));
    justify-self: end;
  }
  &__list-item-value {
    @include default-text(20px, 20px, var(--color-text));
    font-weight: bold;
  }
  &__upload-btn {
    @include default-btn(500px, var(--color-btn-text), var(--color-btn-bg));
  }
}
</style>
