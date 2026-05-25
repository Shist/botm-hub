import { ref } from "vue";
import { defineStore } from "pinia";
import { BotmClub, type IClub, type IClubMember } from "@/types/clubs";
import {
  loadAllClubsFromFirebase,
  toggleClubMembershipInFirebase,
  updateLeaderMessageInFirebase,
} from "@/services/firebase/clubs";

export const useClubsStore = defineStore("clubs", () => {
  const clubs = ref<Record<BotmClub, IClub>>({
    [BotmClub.AIM]: {
      id: BotmClub.AIM,
      leaderMessage: "",
      leaderUid: null,
      members: {},
    },
    [BotmClub.SPEED]: {
      id: BotmClub.SPEED,
      leaderMessage: "",
      leaderUid: null,
      members: {},
    },
    [BotmClub.TECH]: {
      id: BotmClub.TECH,
      leaderMessage: "",
      leaderUid: null,
      members: {},
    },
    [BotmClub.READING]: {
      id: BotmClub.READING,
      leaderMessage: "",
      leaderUid: null,
      members: {},
    },
    [BotmClub.HIDDEN]: {
      id: BotmClub.HIDDEN,
      leaderMessage: "",
      leaderUid: null,
      members: {},
    },
    [BotmClub.HARDROCK]: {
      id: BotmClub.HARDROCK,
      leaderMessage: "",
      leaderUid: null,
      members: {},
    },
  });

  const isLoaded = ref(false);
  let loadPromise: Promise<void> | null = null;

  const loadAllClubs = async () => {
    if (isLoaded.value) return;
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
      const data = await loadAllClubsFromFirebase();
      if (data) {
        const parsed: Record<string, IClub> = {};
        for (const [id, clubData] of Object.entries(data)) {
          const membersMap: Record<string, IClubMember> = {};

          if (clubData.members) {
            for (const [uid, memberData] of Object.entries(clubData.members)) {
              membersMap[uid] = {
                uid,
                joinedAt: memberData.joinedAt?.toDate() ?? new Date(),
              };
            }
          }

          parsed[id] = {
            id: id as BotmClub,
            leaderUid: clubData.leaderUid ?? null,
            leaderMessage: clubData.leaderMessage ?? "",
            members: membersMap,
          };
        }
        clubs.value = parsed;
        isLoaded.value = true;
      }
    })();

    await loadPromise;
    loadPromise = null;
  };

  const updateLeaderMessage = async (clubId: BotmClub, message: string) => {
    await updateLeaderMessageInFirebase(clubId, message);
    if (clubs.value[clubId]) {
      clubs.value[clubId].leaderMessage = message;
    }
  };

  const joinClub = async (clubId: BotmClub, userUid: string) => {
    await toggleClubMembershipInFirebase(clubId, userUid, true);
    if (!clubs.value[clubId].members) clubs.value[clubId].members = {};
    clubs.value[clubId].members[userUid] = {
      uid: userUid,
      joinedAt: new Date(),
    };
  };

  const leaveClub = async (clubId: BotmClub, userUid: string) => {
    await toggleClubMembershipInFirebase(clubId, userUid, false);
    if (clubs.value[clubId].members[userUid]) {
      delete clubs.value[clubId].members[userUid];
    }
  };

  return {
    clubs,
    isLoaded,
    loadAllClubs,
    updateLeaderMessage,
    joinClub,
    leaveClub,
  };
});
