import { ref, reactive } from "vue";
import { defineStore } from "pinia";
import { loadAllUsersFromFirebase } from "@/services/firebase/users";
import { useMetaStore } from "@/stores/meta";
import { useClubsStore } from "@/stores/clubs";
import { type IAllUsersListItem, DigitCategory } from "@/types/users";

export const useUsersStore = defineStore("users", () => {
  const metaStore = useMetaStore();
  const clubsStore = useClubsStore();

  const users = reactive<IAllUsersListItem[]>([]);

  const isLoaded = ref(false);
  let loadPromise: Promise<IAllUsersListItem[]> | null = null;

  const getUsersByDigitCategory = (
    digitCategory: DigitCategory
  ): IAllUsersListItem[] =>
    users.filter((user) => user.digitCategory === digitCategory);

  const getAllUsersAndLoadClubs = async (): Promise<IAllUsersListItem[]> => {
    if (!clubsStore.isLoaded) await clubsStore.loadAllClubs();
    if (isLoaded.value) return users;
    return await loadAllUsers();
  };

  const loadAllUsers = async (): Promise<IAllUsersListItem[]> => {
    if (loadPromise) return loadPromise;

    const chunksCount = metaStore.metaConfig?.chunks?.users ?? 1;

    loadPromise = (async () => {
      try {
        const [allUsers] = await Promise.all([
          loadAllUsersFromFirebase(chunksCount),
          clubsStore.loadAllClubs(),
        ]);
        users.splice(0, users.length, ...allUsers);
        isLoaded.value = true;
        return allUsers;
      } catch (error) {
        throw error;
      }
    })();

    const result = await loadPromise;
    loadPromise = null;
    return result;
  };

  return {
    users,
    isLoaded,
    getUsersByDigitCategory,
    getAllUsersAndLoadClubs,
    loadAllUsers,
  };
});
