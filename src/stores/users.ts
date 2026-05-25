import { reactive } from "vue";
import { defineStore } from "pinia";
import { loadAllUsersFromFirebase } from "@/services/firebase/users";
import { useClubsStore } from "@/stores/clubs";
import { type IAllUsersListItem, DigitCategory } from "@/types/users";

export const useUsersStore = defineStore("users", () => {
  const clubsStore = useClubsStore();

  const users = reactive<IAllUsersListItem[]>([]);

  const getUsersByDigitCategory = (
    digitCategory: DigitCategory
  ): IAllUsersListItem[] =>
    users.filter((user) => user.digitCategory === digitCategory);

  const getAllUsersAndLoadClubs = async (): Promise<IAllUsersListItem[]> => {
    if (!clubsStore.isLoaded) await clubsStore.loadAllClubs();
    if (users.length) return users;
    return await loadAllUsers();
  };

  const loadAllUsers = async (): Promise<IAllUsersListItem[]> => {
    try {
      const [allUsers] = await Promise.all([
        loadAllUsersFromFirebase(),
        clubsStore.loadAllClubs(),
      ]);
      users.splice(0, users.length, ...allUsers);
      return allUsers;
    } catch (error) {
      throw error;
    }
  };

  return {
    users,
    getUsersByDigitCategory,
    getAllUsersAndLoadClubs,
    loadAllUsers,
  };
});
