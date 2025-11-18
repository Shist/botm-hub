import { reactive } from "vue";
import { defineStore } from "pinia";
import { loadAllUsersFromFirbase } from "@/services/firebase";
import { type IAllUsersListItem, DigitCategory } from "@/types";

export const useUsersStore = defineStore("users", () => {
  const users = reactive<IAllUsersListItem[]>([]);

  const getUsersByDigitCategory = (
    digitCategory: DigitCategory
  ): IAllUsersListItem[] =>
    users.filter((user) => user.digitCategory === digitCategory);

  const loadAllUsers = async (): Promise<IAllUsersListItem[]> => {
    if (users.length) return users;

    try {
      const allUsers = await loadAllUsersFromFirbase();
      users.splice(0, users.length, ...allUsers);
      return allUsers;
    } catch (error) {
      throw error;
    }
  };

  return {
    users,
    loadAllUsers,
    getUsersByDigitCategory,
  };
});
