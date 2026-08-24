<template>
  <AppModal
    :isOpened="isOpened"
    title="🎆 Сезонные украшения 🎆"
    closeBtnText="Готово"
    :isClosableByClickOutside="true"
    @closeModal="emit('close')"
  >
    <template #default>
      <div class="seasonal-modal">
        <div class="seasonal-modal__master-switch">
          <label
            class="seasonal-modal__option-label seasonal-modal__option-label_master"
          >
            <AppSwitcher
              :modelValue="isAnyEnabled"
              @update:modelValue="onMasterToggle"
            />
            <span>{{ masterLabel }}</span>
          </label>
        </div>
        <div class="seasonal-modal__group">
          <h3 class="seasonal-modal__group-title">
            💖 День Святого Валентина (13.02 - 15.02)
          </h3>
          <label class="seasonal-modal__option-label">
            <AppSwitcher v-model="seasonalStore.settings.valCorners" />
            <span>Угловые декорации</span>
          </label>
          <label class="seasonal-modal__option-label">
            <AppSwitcher v-model="seasonalStore.settings.valHearts" />
            <span>Летящие сердечки</span>
          </label>
        </div>
        <div class="seasonal-modal__group">
          <h3 class="seasonal-modal__group-title">🤡 1 Апреля (01.04)</h3>
          <label class="seasonal-modal__option-label">
            <AppSwitcher v-model="seasonalStore.settings.aprilClowns" />
            <span>Выглядывающие eh-клоуны</span>
          </label>
          <label class="seasonal-modal__option-label">
            <AppSwitcher v-model="seasonalStore.settings.aprilCursor" />
            <span>Курсор eh-клоун</span>
          </label>
        </div>
        <div class="seasonal-modal__group">
          <h3 class="seasonal-modal__group-title">
            🎂 День рождения osu! (16.09)
          </h3>
          <label class="seasonal-modal__option-label">
            <AppSwitcher v-model="seasonalStore.settings.osuPeppy" />
            <span>Пеппи по бокам (+ подсветка)</span>
          </label>
          <label class="seasonal-modal__option-label">
            <AppSwitcher v-model="seasonalStore.settings.osuCursor" />
            <span>Курсор osu-how</span>
          </label>
        </div>
        <div class="seasonal-modal__group">
          <h3 class="seasonal-modal__group-title">
            🎃 Хэллоуин (30.10 - 01.11)
          </h3>
          <label class="seasonal-modal__option-label">
            <AppSwitcher v-model="seasonalStore.settings.halloweenPumpkins" />
            <span>Тыквы по бокам (+ затемнение)</span>
          </label>
        </div>
        <div class="seasonal-modal__group">
          <h3 class="seasonal-modal__group-title">
            🎄 Рождество и Новый год (25.12 - 07.01)
          </h3>
          <label class="seasonal-modal__option-label">
            <AppSwitcher v-model="seasonalStore.settings.newYearBranches" />
            <span>Еловые ветки</span>
          </label>
          <label class="seasonal-modal__option-label">
            <AppSwitcher v-model="seasonalStore.settings.newYearSnow" />
            <span>Снегопад</span>
          </label>
        </div>
      </div>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSeasonalStore } from "@/stores/seasons";
import AppSwitcher from "@/components/ui/AppSwitcher.vue";

defineProps<{
  isOpened: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const seasonalStore = useSeasonalStore();

const isAnyEnabled = computed(() =>
  Object.values(seasonalStore.settings).some(Boolean)
);

const masterLabel = computed(() =>
  isAnyEnabled.value ? "Выключить все эффекты" : "Включить все эффекты"
);

const onMasterToggle = (val: boolean) => {
  seasonalStore.toggleAll(val);
};
</script>

<style lang="scss" scoped>
.seasonal-modal {
  max-height: calc(80vh - 100px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  row-gap: 15px;
  padding-right: 5px;
  &__master-switch {
    padding-bottom: 10px;
    border-bottom: 2px solid var(--color-burger-menu-link-borders);
  }
  &__group {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    &-title {
      @include default-headline(18px, 20px, var(--color-burger-menu-text));
      font-weight: bold;
    }
  }
  &__option-label {
    @include default-text(16px, 18px, var(--color-burger-menu-text));
    display: flex;
    align-items: center;
    column-gap: 12px;
    cursor: pointer;
    &_master {
      font-weight: bold;
      font-size: 18px;
    }
  }
}
</style>
