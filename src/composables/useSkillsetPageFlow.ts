import { computed, onMounted } from "vue";
import { useMapsStore } from "@/stores/maps";
import useToast from "@/composables/useToast";
import { LoadingState, OsuMapCategory } from "@/types";

export default function useSkillsetPageFlow(category: OsuMapCategory) {
  const mapsStore = useMapsStore();

  const { setErrorToast } = useToast();

  onMounted(async () => {
    try {
      await mapsStore.loadMapsByCategory(OsuMapCategory[category]);
    } catch (error) {
      const msg = error instanceof Error ? error?.message : error;
      setErrorToast(
        `Не удалось загрузить карты для категории "${OsuMapCategory[category]}": ${msg}`
      );
    }
  });

  const categoryMapsList = computed(() => mapsStore.maps[category].mapsList);
  const isLoading = computed(
    () => mapsStore.maps[category].loadingState === LoadingState.LOADING
  );

  return { categoryMapsList, isLoading };
}
