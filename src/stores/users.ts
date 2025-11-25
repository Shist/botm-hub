import { reactive } from "vue";
import { defineStore } from "pinia";
import { loadAllUsersFromFirebase } from "@/services/firebase";
import { type IAllUsersListItem, DigitCategory } from "@/types";

export const useUsersStore = defineStore("users", () => {
  const users = reactive<IAllUsersListItem[]>([]);

  const getUsersByDigitCategory = (
    digitCategory: DigitCategory
  ): IAllUsersListItem[] =>
    users.filter((user) => user.digitCategory === digitCategory);

  const getAllUsers = async (): Promise<IAllUsersListItem[]> => {
    if (users.length) return users;
    return await loadAllUsers();
  };

  const loadAllUsers = async (): Promise<IAllUsersListItem[]> => {
    try {
      const allUsers = await loadAllUsersFromFirebase();
      users.splice(0, users.length, ...allUsers);
      return allUsers;
    } catch (error) {
      throw error;
    }
  };

  return {
    users,
    getAllUsers,
    loadAllUsers,
    getUsersByDigitCategory,
  };
});
