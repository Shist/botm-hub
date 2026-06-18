<template>
  <div class="guide-page">
    <h2 class="guide-page__headline">Памятка и Калькулятор Скоров</h2>
    <div class="guide-page__content">
      <div class="guide-page__calculator-section">
        <h3 class="guide-page__sub-headline">Калькулятор</h3>
        <div class="guide-page__calc-card">
          <SkillsetsSelect v-model="selectedCategory" :isMultiple="false" />
          <v-select
            v-model="selectedMods"
            :items="availableModsOptions"
            label="Комбинация Модов"
            variant="solo-filled"
            prepend-inner-icon="mdi-gamepad-variant"
            hide-details
            :disabled="!selectedCategory"
            class="guide-page__input"
          />
          <v-number-input
            v-model="starRate"
            :precision="2"
            :step="0.01"
            decimal-separator="."
            control-variant="stacked"
            label="Старрейт"
            placeholder="Например: 5.25"
            variant="solo-filled"
            prepend-inner-icon="mdi-star"
            hide-details
            class="guide-page__input"
            @update:model-value="clampStarRate"
          />
          <v-number-input
            v-model="rawScore"
            :step="10000"
            :disabled="!selectedMods"
            control-variant="stacked"
            label="Набранный Скор"
            placeholder="Например: 950000"
            variant="solo-filled"
            prepend-inner-icon="mdi-counter"
            :hint="scoreHint"
            persistent-hint
            class="guide-page__input"
            @update:model-value="clampRawScore"
          />
          <v-divider class="border-opacity-100" />
          <div v-if="isValidForCalculation" class="guide-page__results">
            <h4 class="guide-page__results-title">Результат:</h4>
            <div class="guide-page__result-row">
              <span>Скор{{ calcResults?.hasEZ ? " (с учётом EZ)" : "" }}:</span>
              <b>{{ calcResults?.adjustedScore.toLocaleString("ru-RU") }}</b>
            </div>
            <div class="guide-page__result-row">
              <span>Максимум для модов (без спиннеров):</span>
              <b>{{ calcResults?.maxScore.toLocaleString("ru-RU") }}</b>
            </div>
            <div class="guide-page__result-row">
              <span>Процент выполнения (Percent):</span>
              <b :class="{ 'guide-page__text-error': calcResults?.isFail }">
                {{ calcResults?.percentage.toFixed(2) }}%
              </b>
            </div>
            <div v-if="calcResults?.isFail" class="guide-page__fail-msg">
              Скор ниже 60%. Очки не начисляются!
            </div>
            <template v-else>
              <div class="guide-page__result-row">
                <span>Базовые очки (BasePoints):</span>
                <b>{{ calcResults?.basePoints.toFixed(2) }}</b>
              </div>
              <div class="guide-page__result-row">
                <span>Множитель скиллсета:</span>
                <b>x{{ calcResults?.categoryMultiplier.toFixed(2) }}</b>
              </div>
              <div class="guide-page__result-row">
                <span>Бонус за мод (для FM/TB):</span>
                <b>x{{ calcResults?.fmTbMultiplier.toFixed(2) }}</b>
              </div>
              <v-divider class="border-opacity-100" />
              <div class="guide-page__result-final">
                <span>Финальные очки:</span>
                <span class="guide-page__final-points">
                  {{ calcResults?.finalPoints.toFixed(2) }}
                </span>
              </div>
            </template>
          </div>
          <div v-else class="guide-page__no-results">
            Заполни все поля, чтобы увидеть расчёт
          </div>
        </div>
      </div>
      <div class="guide-page__rules-section">
        <h3 class="guide-page__sub-headline">Как это работает?</h3>
        <div class="guide-page__rule-block guide-page__rule-block_formula">
          <h4>Формула расчёта</h4>
          <div class="guide-page__math-box">
            <div class="guide-page__math-line">
              <span class="math-var math-var_final">FinalPoints</span> =
              <span class="math-var math-var_base">BasePoints</span> &times;
              <span class="math-var math-var_cat">CategoryMultiplier</span>
              &times;
              <span class="math-var math-var_fm">ModBonusMultiplier</span>
            </div>
            <v-divider class="border-opacity-100" />
            <div class="guide-page__math-line">
              <span class="math-var math-var_base">BasePoints</span>
              = SR
              <sup>3</sup>
              &times;
              <span class="math-bracket">(</span>
              1 +
              <span class="math-bracket">(</span>
              <div class="math-fraction">
                <span class="math-num">Percent &minus; 60</span>
                <span class="math-den">40</span>
              </div>
              <span class="math-bracket">)</span>
              <sup>2</sup>
              <span class="math-bracket">)</span>
            </div>
          </div>
        </div>
        <div class="guide-page__rule-block">
          <h4>1. BasePoints (SR и Percent)</h4>
          <p>
            Основа скора — куб старрейта карты (SR<sup>3</sup>). Переменная
            <b>Percent</b> — это процент вашего набранного скора от максимально
            возможного капа. Скоры ниже <b>60%</b> не приносят очков. Каждый мод
            меняет максимальный кап скора (например, для DT он равен 1,200,000).
            При этом спиннеры могут дать больше этого капа, тогда будет получено
            больше очков. Если модов несколько, их множители максимума
            <b>перемножаются</b>. У мода <b>Easy (EZ)</b> есть особое турнирное
            правило: он повышает как ваш набранный скор (умножая его на 1.8),
            так и максимальный кап карты (он становится равен 900,000 вместо
            500,000). Только после всех этих корректировок высчитывается
            итоговый <b>Percent</b>.
          </p>
        </div>
        <div class="guide-page__rule-block">
          <h4>2. CategoryMultiplier (Множители Скиллсетов)</h4>
          <p>
            У каждого из 21 скиллсета есть свой уникальный балансный коэффициент
            (от x1.00 до x1.95). Эти цифры не взяты из головы — они отражают
            мнение нашего комьюнити и результаты глобального опроса игроков
            BOTM:
          </p>
          <div class="guide-page__multipliers-grid">
            <v-tooltip
              v-for="category in Object.values(OsuMapCategory)"
              :key="category"
              :text="MAPS_CATEGORIES[category]"
              location="top"
              content-class="guide-page__tooltip"
            >
              <template #activator="{ props }">
                <div v-bind="props" class="guide-page__multiplier-item">
                  <CategoryBadge :category="category" />
                  <span class="guide-page__multiplier-value">
                    x{{ CATEGORY_MULTIPLIERS[category].toFixed(2) }}
                  </span>
                </div>
              </template>
            </v-tooltip>
          </div>
        </div>
        <div class="guide-page__rule-block">
          <h4>3. ModBonusMultiplier (Бонусы FM и TB)</h4>
          <p>
            Мы не можем динамически пересчитывать StarRate карты с учётом
            наложенных модов прямо в браузере. Поэтому для пулов
            <b>FM1, FM2, FM3</b> и <b>TB</b>
            в формулу всегда подставляется базовый (NM) старрейт. Чтобы это было
            честно, игрокам, берущим усложняющие моды, выдаются бонусные
            множители к итоговым очкам:
            <b>HD (x1.06)</b>, <b>HR (x1.1)</b>, <b>EZ (x1.2)</b>,
            <b>FL (x1.5)</b>.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import SkillsetsSelect from "@/components/osumaps/SkillsetsSelect.vue";
import CategoryBadge from "@/components/osumaps/CategoryBadge.vue";
import {
  getAdjustedScore,
  getMaxScoreForMods,
  calculateBasePoints,
  calculateFinalCategoryPoints,
  getFmTbModMultiplier,
} from "@/utils/scores-calcs";
import {
  MAPS_CATEGORIES,
  VALID_MODS_FOR_CATEGORY,
  CATEGORY_MULTIPLIERS,
} from "@/constants";
import { OsuMapCategory } from "@/types/osumaps";
import { isOsuScoreMod } from "@/types/scores";

const SPINNER_BUFFER = 1000000;

const selectedCategory = ref<OsuMapCategory | null>(null);
const starRate = ref<number | null>(null);
const selectedMods = ref<string | null>(null);
const rawScore = ref<number | null>(null);

const availableModsOptions = computed(() => {
  if (!selectedCategory.value) return [];
  return VALID_MODS_FOR_CATEGORY[selectedCategory.value].map((mod) => ({
    value: mod,
    title: mod.toUpperCase(),
  }));
});

const rawOsuMaxScore = computed(() => {
  if (!selectedMods.value) return null;
  const modStr = selectedMods.value;
  const modsArray =
    modStr === "nm" ? ["NM"] : (modStr.toUpperCase().match(/.{1,2}/g) ?? []);

  const adjustedMax = getMaxScoreForMods(modsArray);

  return modsArray.includes("EZ") ? Math.round(adjustedMax / 1.8) : adjustedMax;
});

const dynamicMaxScore = computed(() => {
  if (rawOsuMaxScore.value === null) return null;
  return rawOsuMaxScore.value + SPINNER_BUFFER;
});

const scoreHint = computed(() => {
  if (rawOsuMaxScore.value === null) return "";
  return `Max: ${rawOsuMaxScore.value.toLocaleString("ru-RU")} (+ ${SPINNER_BUFFER.toLocaleString("ru-RU")} на спиннеры)`;
});

const isValidForCalculation = computed(() => {
  return (
    selectedCategory.value &&
    starRate.value !== null &&
    selectedMods.value &&
    rawScore.value !== null
  );
});

const calcResults = computed(() => {
  if (!isValidForCalculation.value) return null;

  const category = selectedCategory.value!;
  const sr = Number(starRate.value);
  const scoreNum = Number(rawScore.value);
  const modStr = selectedMods.value!;

  const modsArray =
    modStr === "nm" ? ["NM"] : (modStr.toUpperCase().match(/.{1,2}/g) ?? []);

  const hasEZ = modsArray.includes("EZ");

  const adjustedScore = getAdjustedScore(scoreNum, modsArray);
  const maxScore = getMaxScoreForMods(modsArray);
  const percentage = (adjustedScore / maxScore) * 100;
  const isFail = percentage < 60;

  const basePoints = calculateBasePoints(percentage, sr);
  const finalPoints = calculateFinalCategoryPoints(
    basePoints,
    category,
    modsArray
  );

  const categoryMultiplier = CATEGORY_MULTIPLIERS[category];

  let fmTbMultiplier = 1;
  const catUpper = category.toUpperCase();
  if (catUpper.startsWith("FM") || catUpper === "TB") {
    fmTbMultiplier = getFmTbModMultiplier(modsArray);
    fmTbMultiplier = Math.round(fmTbMultiplier * 1000) / 1000;
  }

  return {
    hasEZ,
    adjustedScore,
    maxScore,
    percentage,
    isFail,
    basePoints,
    categoryMultiplier,
    fmTbMultiplier,
    finalPoints,
  };
});

const clampStarRate = async () => {
  if (starRate.value !== null) {
    let clamped = starRate.value;

    if (clamped < 0) {
      clamped = 0;
    } else if (clamped > 15) {
      clamped = 15;
    }

    if (clamped !== starRate.value) {
      await nextTick();
      starRate.value = clamped;
    }
  }
};

const clampRawScore = async () => {
  if (rawScore.value !== null) {
    let clamped = rawScore.value;

    if (clamped < 0) {
      clamped = 0;
    } else if (dynamicMaxScore.value && clamped > dynamicMaxScore.value) {
      clamped = dynamicMaxScore.value;
    }

    if (clamped !== rawScore.value) {
      await nextTick();
      rawScore.value = clamped;
    }
  }
};

watch(selectedCategory, (newCat) => {
  if (newCat) {
    const validMods = VALID_MODS_FOR_CATEGORY[newCat];
    const selectedModsVal = selectedMods.value ?? "";
    if (
      isOsuScoreMod(selectedModsVal) &&
      !validMods.includes(selectedModsVal)
    ) {
      selectedMods.value = validMods[0] ?? null;
    } else if (!selectedMods.value) {
      selectedMods.value = validMods[0] ?? null;
    }
  } else {
    selectedMods.value = null;
  }
});

watch(selectedMods, (newMods) => {
  if (!newMods) {
    rawScore.value = null;
  }
});

watch(dynamicMaxScore, () => {
  clampRawScore();
});
</script>

<style lang="scss" scoped>
.guide-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  &__headline {
    @include default-headline(40px, 40px, var(--color-text));
    text-align: center;
    @media (max-width: $phone-l) {
      font-size: 28px;
      line-height: 28px;
    }
  }
  &__sub-headline {
    @include default-headline(28px, 28px, var(--color-text));
    text-align: center;
  }
  &__content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    max-width: 1300px;
    @media (min-width: $pc-s) {
      flex-direction: row;
    }
  }
  &__calculator-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  &__rules-section {
    flex: 1.5;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  &__calc-card {
    background-color: var(--color-tabs-bg);
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 15px;
    position: sticky;
    top: 105px;
    @media (max-width: $tablet-l) {
      top: 95px;
    }
    @media (max-width: $phone-l) {
      top: 90px;
    }
  }
  &__input {
    width: 100%;
  }
  &__results {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  &__results-title {
    @include default-headline(22px, 22px, var(--color-text));
    text-align: center;
  }
  &__result-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 5px;
    @include default-text(16px, 16px, var(--color-text));
  }
  &__result-final {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 5px;
    @include default-headline(22px, 22px, var(--color-text));
  }
  &__final-points {
    color: var(--color-points);
    font-size: 28px;
  }
  &__no-results {
    @include default-text(16px, 16px, var(--color-text-gray));
    text-align: center;
    padding: 20px 0;
    font-style: italic;
  }
  &__text-error {
    color: var(--color-error);
  }
  &__fail-msg {
    color: var(--color-error);
    font-weight: bold;
    text-align: center;
    padding: 10px;
    background-color: rgba(255, 64, 64, 0.1);
    border-radius: 8px;
  }
  &__rule-block {
    background-color: rgba(128, 128, 128, 0.05);
    padding: 20px;
    border-radius: 8px;
    border-left: 4px solid var(--color-text-gray);
    h4 {
      @include default-headline(20px, 24px, var(--color-text));
      margin-bottom: 10px;
    }
    p {
      @include default-text(16px, 24px, var(--color-text));
      margin-bottom: 10px;
      opacity: 0.9;
      b {
        color: var(--color-points);
      }
    }
    &_formula {
      border-left-color: var(--color-points);
    }
  }
  &__math-box {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: var(--color-bg);
    padding: 15px;
    border-radius: 8px;
    border: 1px solid var(--color-vuetify-table-borders);
    overflow-x: auto;
    white-space: nowrap;
    @include default-text(18px, 18px, var(--color-text));
    font-family: "Courier New", Courier, monospace;
    &::-webkit-scrollbar {
      height: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: var(--color-text-gray);
      border-radius: 4px;
    }
  }
  &__math-line {
    display: flex;
    align-items: center;
    gap: 6px;
    padding-block: 5px;
    min-width: min-content;
  }
  .math-var {
    font-weight: bold;
    &_final {
      color: var(--color-points);
    }
    &_base {
      color: var(--color-score-formula-base);
    }
    &_cat {
      color: var(--color-score-formula-cat);
    }
    &_fm {
      color: var(--color-score-formula-fm);
    }
  }
  .math-bracket {
    font-size: 24px;
    font-weight: lighter;
  }
  .math-fraction {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0 4px;
  }
  .math-num {
    padding: 0 5px 2px;
    border-bottom: 1px solid var(--color-text);
  }
  .math-den {
    padding: 2px 5px 0;
  }
  &__multipliers-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    @media (min-width: $tablet-m) {
      grid-template-columns: repeat(7, 1fr);
    }
  }
  &__multiplier-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: var(--color-bg);
    padding: 10px;
    border-radius: 8px;
    border: 1px solid var(--color-vuetify-table-borders);
    transition: 0.2s;
    cursor: help;
    &:hover {
      border-color: var(--color-points);
      transform: translateY(-2px);
    }
  }
  &__multiplier-value {
    @include default-text(16px, 16px, var(--color-text));
    font-weight: bold;
  }
  :deep(.guide-page__tooltip) {
    background-color: var(--color-modal-bg);
    color: var(--color-text);
    border: 1px solid var(--color-vuetify-table-borders);
    font-weight: bold;
  }
}
</style>
