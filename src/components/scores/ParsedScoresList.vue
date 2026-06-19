<template>
  <div class="parsed-scores-list">
    <div class="parsed-scores-list__groups-list">
      <div
        v-for="group in enrichedGroupedScores"
        :key="group.id"
        class="parsed-scores-list__group-card"
      >
        <v-img
          :src="
            group.mapInfo?.coverUrl ||
            `https://assets.ppy.sh/beatmaps/${group.mapId}/covers/cover.jpg`
          "
          cover
          class="parsed-scores-list__group-bg"
        />
        <div class="parsed-scores-list__group-overlay">
          <div class="parsed-scores-list__group-header">
            <div class="parsed-scores-list__map-title-wrapper">
              <span
                class="parsed-scores-list__map-title"
                :title="group.mapInfo?.fullName"
              >
                {{
                  group.mapInfo?.fullName ||
                  `Неизвестная карта (ID: ${group.mapId})`
                }}
              </span>
              <span class="parsed-scores-list__map-star-rate">
                ({{ group.dbMapInfo.starRate.toFixed(2) }}★)
              </span>
            </div>
            <v-chip
              size="small"
              :color="getModsChipColor(group.mods)"
              variant="elevated"
              class="parsed-scores-list__mods-chip"
            >
              {{ group.mods.join("") || "NM" }}
            </v-chip>
          </div>
          <div class="parsed-scores-list__scores-wrapper">
            <div
              v-for="score in group.scores"
              :key="score.gameId"
              class="parsed-scores-list__score-row"
              :class="{
                'parsed-scores-list__score-row_disabled': score.isInsufficient,
                'parsed-scores-list__score-row_db': score.isDbScore,
                'parsed-scores-list__score-row_selected': score.isSelected,
              }"
              @click="
                $emit('toggleScore', group.originalGroup, score.originalScore)
              "
            >
              <div class="parsed-scores-list__score-content">
                <div class="parsed-scores-list__score-left">
                  <span
                    class="parsed-scores-list__score-rank"
                    :class="`rank-${score.rank}`"
                  >
                    {{ formatMapRank(score.rank) }}
                  </span>
                  <span class="parsed-scores-list__score-stats-text">
                    | {{ (score.accuracy * 100).toFixed(2) }}% |
                    {{ score.combo }}x
                  </span>
                </div>
                <div class="parsed-scores-list__score-right">
                  <span
                    v-if="score.isDbScore"
                    class="parsed-scores-list__score-db-label"
                  >
                    Текущий скор в BOTM
                  </span>
                  <span
                    class="parsed-scores-list__score-value"
                    :class="{
                      'parsed-scores-list__score-value_error':
                        (!score.passed || score.isInsufficient) &&
                        !score.isDbScore,
                      'parsed-scores-list__score-value_db': score.isDbScore,
                    }"
                  >
                    {{ score.score.toLocaleString("ru-RU") }}
                  </span>
                  <div class="parsed-scores-list__score-subtext">
                    <span
                      v-if="score.isInsufficient"
                      class="parsed-scores-list__score-subtext-error"
                    >
                      ({{ !score.passed ? "Скор зафейлен" : "<60% скора" }})
                    </span>
                    <span
                      v-else
                      class="parsed-scores-list__score-subtext-points"
                      :class="{
                        'parsed-scores-list__score-subtext-points_db':
                          score.isDbScore,
                      }"
                    >
                      ({{ score.percentage.toFixed(2) }}% от максимума)
                    </span>
                  </div>
                  <div
                    class="parsed-scores-list__categories-wrapper"
                    v-if="!score.isInsufficient"
                  >
                    <div
                      v-if="score.validSrInfo.length === 1"
                      class="parsed-scores-list__cat-single"
                    >
                      <CategoryBadge
                        v-if="score.validSrInfo[0]"
                        :category="score.validSrInfo[0].category"
                      />
                      <span class="parsed-scores-list__cat-points">
                        {{ score.validSrInfo[0]?.finalPoints.toFixed(2) }}
                      </span>
                    </div>
                    <div v-else-if="score.validSrInfo.length > 1">
                      <v-tooltip location="top">
                        <template #activator="{ props }">
                          <div
                            v-bind="props"
                            class="parsed-scores-list__cat-mixed"
                            @click.stop
                          >
                            <v-icon size="20" color="var(--color-points)">
                              mdi-bullseye-arrow
                            </v-icon>
                            <span class="parsed-scores-list__cat-points">
                              {{ score.validSrInfo[0]?.finalPoints.toFixed(2) }}
                            </span>
                          </div>
                        </template>
                        <div class="parsed-scores-list__cat-tooltip">
                          <span class="parsed-scores-list__cat-tooltip-title">
                            Очки по категориям:
                          </span>
                          <div
                            v-for="info in score.validSrInfo"
                            :key="info.category"
                            class="parsed-scores-list__cat-tooltip-row"
                          >
                            <CategoryBadge :category="info.category" />
                            <span
                              class="parsed-scores-list__cat-points parsed-scores-list__cat-points_outlined"
                            >
                              {{ info.finalPoints.toFixed(2) }}
                            </span>
                          </div>
                        </div>
                      </v-tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useOsumapsStore } from "@/stores/osumaps";
import CategoryBadge from "@/components/osumaps/CategoryBadge.vue";
import { formatMapRank, isValidModCombinationForCategory } from "@/utils";
import {
  getAdjustedStarRate,
  calculateBasePoints,
  calculateFinalCategoryPoints,
} from "@/utils/scores-calcs";
import { OsuMapCategory } from "@/types/osumaps";
import type { IMpModalGroup, IMpModalScore } from "@/types/scores";

const props = defineProps<{
  groupedScores: IMpModalGroup[];
}>();

defineEmits<{
  (e: "toggleScore", group: IMpModalGroup, score: IMpModalScore): void;
}>();

const mapsStore = useOsumapsStore();

const getModsChipColor = (mods: string[]): string => {
  if (mods.includes("DT")) return "var(--color-mod-combination-dt)";
  if (mods.includes("FL")) return "var(--color-mod-combination-fl)";
  if (mods.includes("HR")) return "var(--color-mod-combination-hr)";
  if (mods.includes("HD")) return "var(--color-mod-combination-hd)";
  if (mods.includes("EZ")) return "var(--color-mod-combination-ez)";
  return "var(--color-mod-combination-nm)";
};

const enrichedGroupedScores = computed(() => {
  const allMaps = mapsStore.getMapsOfGivenCategories(
    Object.values(OsuMapCategory)
  );

  return props.groupedScores.map((group) => {
    const enrichedScores = group.scores.map((score) => {
      const actualMods = group.mods;
      const actualMapId = group.mapId;

      const rawModKey = (
        actualMods && actualMods.length ? actualMods.join("") : "nm"
      ).toLowerCase();
      const modsArray =
        rawModKey === "nm"
          ? ["NM"]
          : (rawModKey.toUpperCase().match(/.{1,2}/g) ?? []);

      const validDbMaps = allMaps.filter(
        (m) =>
          m.id === actualMapId &&
          isValidModCombinationForCategory(modsArray, m.category)
      );

      const validSrInfo = validDbMaps
        .map((m) => {
          const currentBasePts =
            score.percentage >= 60
              ? calculateBasePoints(
                  score.percentage,
                  getAdjustedStarRate(m.starRate, m.category, modsArray)
                )
              : 0;

          const finalPts = calculateFinalCategoryPoints(
            currentBasePts,
            m.category
          );

          return {
            category: m.category,
            finalPoints: finalPts,
          };
        })
        .sort((a, b) => b.finalPoints - a.finalPoints);

      return {
        ...score,
        originalScore: score,
        validSrInfo,
      };
    });

    return {
      ...group,
      originalGroup: group,
      scores: enrichedScores,
    };
  });
});
</script>

<style lang="scss" scoped>
.parsed-scores-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  &__groups-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    max-height: 50vh;
    overflow-y: auto;
    padding-right: 8px;
    @media (max-width: $laptop-l) {
      max-height: none;
      overflow-y: visible;
      padding-right: 0;
    }
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: var(--color-scrollbar-thumb);
      border-radius: 4px;
    }
  }
  &__group-card {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    border: 2px solid var(--color-scores-group-card-border);
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
  }
  &__group-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }
  &__group-overlay {
    position: relative;
    z-index: 1;
    background: linear-gradient(
      to right,
      var(--color-group-overlay-bg-gradient-left) 0%,
      var(--color-group-overlay-bg-gradient-right) 100%
    );
    flex-grow: 1;
    width: 100%;
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
  }
  &__group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  &__map-title-wrapper {
    display: flex;
    align-items: center;
    min-width: 0;
    flex: 1;
  }
  &__map-title {
    @include default-text(18px, 22px, var(--color-text-white));
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    @media (max-width: $phone-l) {
      font-size: 16px;
      line-height: 20px;
    }
  }
  &__map-star-rate {
    margin-left: 6px;
    color: var(--color-map-star-rate);
    font-weight: bold;
    flex-shrink: 0;
    @media (max-width: $phone-l) {
      font-size: 14px;
    }
  }
  &__mods-chip {
    font-weight: bold;
    color: var(--color-text-white);
  }
  &__scores-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  &__score-row {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 6px 12px;
    background-color: var(--color-score-row-bg);
    border-radius: 8px;
    border: 2px solid transparent;
    transition: 0.3s ease-in-out;
    cursor: pointer;
    &:hover:not(&_disabled):not(&_db) {
      background-color: var(--color-score-hover);
    }
    &_db {
      background-color: var(--color-db-score-bg);
      border: 1px dashed var(--color-db-score-border);
      cursor: default;
    }
    &_selected {
      background-color: var(--color-selected-score-bg);
      border: 2px solid var(--color-selected-score-border);
    }
    &_disabled {
      background-color: var(--color-disabled-score-bg);
      opacity: 0.5;
      cursor: not-allowed;
    }
    @media (max-width: $phone-l) {
      gap: 10px;
      padding: 6px 8px;
    }
  }
  &__score-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  &__score-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  &__score-stats-text {
    @include default-text(24px, 24px, var(--color-text-gray));
    font-weight: bold;
    @media (max-width: $phone-l) {
      font-size: 16px;
      line-height: 16px;
    }
    @media (max-width: $phone-m) {
      font-size: 14px;
      line-height: 14px;
    }
  }
  &__score-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
    gap: 2px;
    flex-shrink: 0;
  }
  &__score-db-label {
    color: var(--color-db-score-label);
    font-size: 10px;
    line-height: 10px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  &__score-value {
    @include default-text(20px, 20px, var(--color-text-white));
    font-weight: bold;
    &_db {
      color: var(--color-db-score-label);
    }
    &_error {
      color: var(--color-error);
    }
    @media (max-width: $phone-l) {
      font-size: 18px;
      line-height: 18px;
    }
  }
  &__score-subtext {
    @include default-text(12px, 14px, var(--color-text-gray));
    text-align: right;
    @media (max-width: $phone-l) {
      font-size: 10px;
      line-height: 12px;
    }
  }
  &__score-subtext-error {
    color: var(--color-error);
    font-weight: bold;
  }
  &__score-subtext-points {
    color: var(--color-text-gray);
    font-weight: bold;
    &_db {
      color: var(--color-db-score-label);
    }
  }
  &__score-rank {
    @include default-text(36px, 36px, var(--color-text-white));
    font-weight: bold;
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
    &.rank-X,
    &.rank-SS,
    &.rank-S {
      color: var(--color-rank-s-or-ss);
    }
    &.rank-XH,
    &.rank-SSH,
    &.rank-SH {
      color: var(--color-rank-silver-s-or-ss);
    }
    &.rank-A {
      color: var(--color-rank-a);
    }
    &.rank-B {
      color: var(--color-rank-b);
    }
    &.rank-C {
      color: var(--color-rank-c);
    }
    &.rank-D {
      color: var(--color-rank-d);
    }
    &.rank-F {
      color: var(--color-rank-f);
    }
    @media (max-width: $phone-l) {
      font-size: 24px;
      line-height: 24px;
    }
  }
  &__categories-wrapper {
    display: flex;
    justify-content: flex-end;
  }
  &__cat-single {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  &__cat-mixed {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: help;
    padding: 2px 6px;
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.05);
    transition: background-color 0.3s;
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
  &__cat-points {
    color: var(--color-points);
    font-weight: bold;
    font-size: 14px;
    &_outlined {
      text-shadow:
        1px 1px 0 #000,
        -1px -1px 0 #000,
        1px -1px 0 #000,
        -1px 1px 0 #000;
    }
  }
  &__cat-tooltip {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 4px;
  }
  &__cat-tooltip-title {
    @include default-text(14px, 14px, inherit);
  }
  &__cat-tooltip-row {
    display: flex;
    align-items: center;
    gap: 5px;
  }
}
</style>
