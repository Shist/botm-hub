import { computed, onMounted } from "vue";
import { useOsumapsStore } from "@/stores/osumaps";
import useToast from "@/composables/useToast";
import { LoadingState } from "@/types/global";
import { OsuMapCategory } from "@/types/osumaps";

export default function useSkillsetPageFlow(category: OsuMapCategory) {
  const mapsStore = useOsumapsStore();
  const { setErrorToast } = useToast();

  onMounted(async () => {
    try {
      await mapsStore.loadMapsByCategory(category);
    } catch (error) {
      const msg = error instanceof Error ? error?.message : error;
      setErrorToast(
        `Не удалось загрузить карты для категории "${category.toUpperCase()}": ${msg}`
      );
    }
  });

  const categoryMapsList = computed(() => mapsStore.osumaps[category].mapsList);
  const isLoading = computed(
    () => mapsStore.osumaps[category].loadingState === LoadingState.LOADING
  );

  return { categoryMapsList, isLoading };
}
