<template>
  <div class="map-upload-wrapper">
    <h3 class="map-upload-wrapper__title">Информация о картах для загрузки:</h3>
    <ul
      v-for="mapData in arrayOfMapsData"
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
import { uploadMapToFirebase } from "@/services/firebase";
import { OsuMapCategory, type IOsuMap } from "@/types";

const arrayOfMapsData = [
  {
    id: 2907027,
    ar: 10.1,
    bpm: 233,
    category: "dt1",
    comment: "6WC25 GF (Speed aim DT1)",
    cs: 4.2,
    duration: "01:47",
    hp: 5.4,
    mapper: "SuckMyAnimeXDD",
    name: "Lida, GSPD - Eurobit [Eurobit]",
    od: 10.1,
    starRate: 5.86,
  },
  {
    id: 1275050,
    ar: 9,
    bpm: 186,
    category: "nm2",
    comment: "из коллекции D33MKA",
    cs: 4,
    duration: "01:48",
    hp: 5,
    mapper: "HighTec",
    name: "positive MAD-crew – Lapistoria no yakusoku [Shizuku's Hyper]",
    od: 7.5,
    starRate: 4.38,
  },
];

const uploadMaps = async () => {
  for (let i = 0; i < arrayOfMapsData.length; i++) {
    const mapData = arrayOfMapsData[i] as Omit<IOsuMap, "link">;
    const mapId = mapData.id;
    const mapInfo = {
      ar: mapData.ar,
      bpm: mapData.bpm,
      category: OsuMapCategory[mapData.category as OsuMapCategory],
      comment: mapData.comment,
      cs: mapData.cs,
      duration: mapData.duration,
      hp: mapData.hp,
      mapper: mapData.mapper,
      name: mapData.name,
      od: mapData.od,
      starRate: mapData.starRate,
    };
    try {
      await uploadMapToFirebase(mapId, mapInfo);
      console.log("Успешная загрузка!!!");
    } catch (error) {
      console.error(error);
    }
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
