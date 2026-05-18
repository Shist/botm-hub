import { reactive } from "vue";
import { defineStore } from "pinia";
import { LoadingState } from "@/types/global";
import { BotmClub, type IClub, type IClubState } from "@/types/clubs";
import {
  loadClubByIdFromFirebase,
  toggleClubMembershipInFirebase,
  updateLeaderMessageInFirebase,
} from "@/services/firebase/clubs";
import { useUsersStore } from "@/stores/users";

export const useClubsStore = defineStore("clubs", () => {
  const usersStore = useUsersStore();

  const clubs = reactive<Record<BotmClub, IClubState>>({
    [BotmClub.AIM]: { data: null, loadingState: LoadingState.NOT_LOADED },
    [BotmClub.SPEED]: { data: null, loadingState: LoadingState.NOT_LOADED },
    [BotmClub.TECH]: { data: null, loadingState: LoadingState.NOT_LOADED },
    [BotmClub.READING]: { data: null, loadingState: LoadingState.NOT_LOADED },
    [BotmClub.HIDDEN]: { data: null, loadingState: LoadingState.NOT_LOADED },
    [BotmClub.HARDROCK]: { data: null, loadingState: LoadingState.NOT_LOADED },
  });

  const loadClubById = async (clubId: BotmClub): Promise<IClub | null> => {
    if (clubs[clubId].loadingState === LoadingState.LOADED)
      return clubs[clubId].data;

    try {
      clubs[clubId].loadingState = LoadingState.LOADING;
      const clubData = await loadClubByIdFromFirebase(clubId);
      clubs[clubId].data = clubData;
      clubs[clubId].loadingState = LoadingState.LOADED;
      return clubData;
    } catch (error) {
      clubs[clubId].loadingState = LoadingState.ERROR;
      throw error;
    }
  };

  const updateLeaderMessage = async (clubId: BotmClub, message: string) => {
    await updateLeaderMessageInFirebase(clubId, message);
    if (clubs[clubId].data) {
      clubs[clubId].data!.leaderMessage = message;
    }
  };

  const joinClub = async (clubId: BotmClub, userUid: string) => {
    await toggleClubMembershipInFirebase(clubId, userUid, true);
    clubs[clubId].loadingState = LoadingState.NOT_LOADED;
    await Promise.all([loadClubById(clubId), usersStore.loadAllUsers()]);
  };

  const leaveClub = async (clubId: BotmClub, userUid: string) => {
    await toggleClubMembershipInFirebase(clubId, userUid, false);
    clubs[clubId].loadingState = LoadingState.NOT_LOADED;
    await Promise.all([loadClubById(clubId), usersStore.loadAllUsers()]);
  };

  return {
    clubs,
    loadClubById,
    updateLeaderMessage,
    joinClub,
    leaveClub,
  };
});
