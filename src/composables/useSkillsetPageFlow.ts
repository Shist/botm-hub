import { computed, onMounted } from "vue";
import { useOsumapsStore } from "@/stores/osumaps";
import useToast from "@/composables/useToast";
import { OsuMapCategory } from "@/types/osumaps";

export default function useSkillsetPageFlow(category: OsuMapCategory) {
  const mapsStore = useOsumapsStore();
  const { setErrorToast } = useToast();

  onMounted(async () => {
    try {
      await mapsStore.loadAllMaps();
    } catch (error) {
      const msg = error instanceof Error ? error?.message : error;
      setErrorToast(`Не удалось загрузить карты для пула: ${msg}`);
    }
  });

  const categoryMapsList = computed(() => mapsStore.osumaps[category]);

  const isLoading = computed(() => mapsStore.isLoading);

  return { categoryMapsList, isLoading };
}
