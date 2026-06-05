import { ref, reactive } from "vue";
import { defineStore } from "pinia";
import {
  loadAllTournamentsFromFirebase,
  uploadTournamentToFirebase,
  updateTournamentToFirebase,
  deleteTournamentFromFirebase,
  archiveTournamentInFirebase,
} from "@/services/firebase/tournaments";
import { useMetaStore } from "@/stores/meta";
import { useUsersStore } from "@/stores/users";
import {
  isRegisteredPlayer,
  type IAllUsersListItem,
  type IUnregisteredUser,
} from "@/types/users";
import {
  type IRosterInfo,
  type ITournamentDatesInfo,
  type IAllTournamentsListItem,
  type IAllTournamentsFirebaseOutgoingItem,
} from "@/types/tournaments";

export const useTournamentsStore = defineStore("tournaments", () => {
  const metaStore = useMetaStore();
  const usersStore = useUsersStore();

  const tournaments = reactive<IAllTournamentsListItem[]>([]);

  const isLoaded = ref(false);
  let loadPromise: Promise<IAllTournamentsListItem[]> | null = null;

  const getAllTournaments = async (): Promise<IAllTournamentsListItem[]> => {
    if (isLoaded.value) return tournaments;
    return await loadAllTournaments();
  };

  const loadAllTournaments = async (): Promise<IAllTournamentsListItem[]> => {
    if (loadPromise) return loadPromise;

    const chunksCount = metaStore.metaConfig?.chunks?.tournaments ?? 1;

    loadPromise = (async () => {
      try {
        const allUsers = await usersStore.getAllUsersAndLoadClubs();

        const allTournaments = (
          await loadAllTournamentsFromFirebase(chunksCount)
        ).map((tournament) => {
          const rostersInfoFromFirebase = tournament.rostersInfo ?? [];

          const rostersInfo: IRosterInfo<IAllUsersListItem>[] =
            rostersInfoFromFirebase.map((rosterInfo) => {
              return {
                ...rosterInfo,
                players: rosterInfo.players.reduce(
                  (
                    acc: (IAllUsersListItem | IUnregisteredUser | null)[],
                    player
                  ) => {
                    if (typeof player === "string") {
                      const userInfo = allUsers.find((u) => u.uid === player);
                      if (userInfo) acc.push(userInfo);
                    } else {
                      acc.push(player);
                    }
                    return acc;
                  },
                  []
                ),
              };
            });

          const datesInfo = {
            startDate: tournament.datesInfo.startDate.toDate(),
            endDate: tournament.datesInfo.endDate.toDate(),
          } as ITournamentDatesInfo;

          return {
            id: tournament.id,
            redactorUid: tournament.redactorUid,
            title: tournament.title,
            rankRange: tournament.rankRange,
            description: tournament.description,
            format: tournament.format,
            teamSize: tournament.teamSize,
            isDoubleElimination: tournament.isDoubleElimination,
            forumPostLink: tournament.forumPostLink,
            mainSheetLink: tournament.mainSheetLink,
            challongeLink: tournament.challongeLink,
            twitchFirstLink: tournament.twitchFirstLink,
            twitchSecondLink: tournament.twitchSecondLink,
            isArchived: tournament.isArchived,
            rostersInfo,
            datesInfo,
          };
        });

        tournaments.splice(0, tournaments.length, ...allTournaments);
        return allTournaments;
      } catch (error) {
        throw error;
      }
    })();

    const result = await loadPromise;
    loadPromise = null;
    isLoaded.value = true;
    return result;
  };

  const uploadTournament = async (
    tournament: IAllTournamentsFirebaseOutgoingItem
  ) => {
    try {
      const newChunksCount = await uploadTournamentToFirebase(tournament);
      if (newChunksCount && metaStore.metaConfig) {
        metaStore.metaConfig.chunks.tournaments = newChunksCount;
      }
      await loadAllTournaments();
    } catch (error) {
      throw error;
    }
  };

  const updateTournament = async (
    tournament: IAllTournamentsFirebaseOutgoingItem
  ) => {
    try {
      await updateTournamentToFirebase(tournament);
      await loadAllTournaments();
    } catch (error) {
      throw error;
    }
  };

  const deleteTournament = async (tournamentId: string) => {
    try {
      await deleteTournamentFromFirebase(tournamentId);
      await loadAllTournaments();
    } catch (error) {
      throw error;
    }
  };

  const archiveTournament = async (tournamentId: string) => {
    try {
      await archiveTournamentInFirebase(tournamentId);
      await loadAllTournaments();
    } catch (error) {
      throw error;
    }
  };

  const getUpdatedTournament = (
    tournament: IAllTournamentsListItem,
    updatedRosterInfo: IRosterInfo<IAllUsersListItem>[]
  ) => {
    return {
      ...tournament,
      rostersInfo: updatedRosterInfo.map((r) => ({
        ...r,
        players: r.players.map((p) => (isRegisteredPlayer(p) ? p.uid : p)),
      })),
    };
  };

  const addRoster = async (
    tournamentId: string,
    roster: IRosterInfo<IAllUsersListItem>
  ) => {
    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (!tournament) {
      throw new Error(`Турнир с id = ${tournamentId} не найден в базе!`);
    }

    const newRostersInfo = tournament.rostersInfo.concat(roster);
    const updatedTournament = getUpdatedTournament(tournament, newRostersInfo);

    await updateTournamentToFirebase(updatedTournament);
    await loadAllTournaments();
  };

  const updateRoster = async (
    tournamentId: string,
    updatedRoster: IRosterInfo<IAllUsersListItem>
  ) => {
    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (!tournament) {
      throw new Error(`Турнир с id = ${tournamentId} не найден в базе!`);
    }

    const newRostersInfo = tournament.rostersInfo.map((r) =>
      r.id === updatedRoster.id ? updatedRoster : r
    );
    const updatedTournament = getUpdatedTournament(tournament, newRostersInfo);

    await updateTournamentToFirebase(updatedTournament);
    await loadAllTournaments();
  };

  const deleteRoster = async (tournamentId: string, rosterId: string) => {
    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (!tournament) {
      throw new Error(`Турнир с id = ${tournamentId} не найден в базе!`);
    }

    const newRostersInfo = tournament.rostersInfo.filter(
      (r) => r.id !== rosterId
    );
    const updatedTournament = getUpdatedTournament(tournament, newRostersInfo);

    await updateTournamentToFirebase(updatedTournament);
    await loadAllTournaments();
  };

  return {
    tournaments,
    isLoaded,
    getAllTournaments,
    loadAllTournaments,
    uploadTournament,
    updateTournament,
    deleteTournament,
    archiveTournament,
    addRoster,
    updateRoster,
    deleteRoster,
  };
});
