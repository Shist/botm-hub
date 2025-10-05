<template>
  <div class="skillset-maps-page">
    <h2 class="skillset-maps-page__headline">Мапы NM1 (Raw Aim)</h2>
    <v-data-table-virtual
      :headers="headers"
      :items="mockData"
      :mobile-breakpoint="768"
    >
      <template v-slot:[`item.link`]="{ item }">
        <a :href="item.link" target="_blank">{{ item.link }}</a>
      </template>
    </v-data-table-virtual>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";

const headers = reactive([
  {
    key: "id",
    title: "ID",
  },
  {
    key: "link",
    title: "Ссылка",
  },
  {
    key: "name",
    title: "Название",
  },
  {
    key: "starRate",
    title: "Сложность",
  },
  {
    key: "duration",
    title: "Длительность",
  },
  {
    key: "bpm",
    title: "BPM",
  },
  {
    key: "cs",
    title: "CS",
  },
  {
    key: "ar",
    title: "AR",
  },
  {
    key: "od",
    title: "OD",
  },
  {
    key: "hp",
    title: "HP",
  },
]);
const mockData = reactive([
  {
    id: "585895",
    link: "https://osu.ppy.sh/b/585895",
    name: "Imy - Beyond the despair [Abysm] (Riana)",
    starRate: "4.09",
    duration: "3:17",
    bpm: "175",
    cs: "4.00",
    ar: "9.00",
    od: "7.50",
    hp: "6.00",
  },
  {
    id: "2163594",
    link: "https://osu.ppy.sh/b/2163594",
    name: "TWICE - HAPPY HAPPY [Hytex's Insane]",
    starRate: "4.22",
    duration: "3:24",
    bpm: "180",
    cs: "3.80",
    ar: "9.00",
    od: "6.30",
    hp: "5.00",
  },
  {
    id: "145442",
    link: "https://osu.ppy.sh/b/145442",
    name: "yanaginagi - Killer Song [Insane] (Ryafuka)",
    starRate: "4.37",
    duration: "4:18",
    bpm: "166",
    cs: "4.00",
    ar: "9.00",
    od: "7.00",
    hp: "7.00",
  },
]);
</script>
