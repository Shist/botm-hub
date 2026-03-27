import { reactive } from "vue";
import { defineStore } from "pinia";
import {
  loadAllTournamentsFromFirebase,
  uploadTournamentToFirebase,
  updateTournamentToFirebase,
  deleteTournamentFromFirebase,
  archiveTournamentInFirebase,
} from "@/services/firebase";
import {
  type IAllUsersListItem,
  type IUnregisteredUser,
  type IRosterInfo,
  type ITournamentDatesInfo,
  type IAllTournamentsListItem,
  type IAllTournamentsFirebaseOutgoingItem,
} from "@/types";
import { useUsersStore } from "@/stores/users";

export const useTournamentsStore = defineStore("tournaments", () => {
  const usersStore = useUsersStore();

  const tournaments = reactive<IAllTournamentsListItem[]>([]);

  const getAllTournaments = async (): Promise<IAllTournamentsListItem[]> => {
    if (tournaments.length) return tournaments;
    return await loadAllTournaments();
  };

  const loadAllTournaments = async (): Promise<IAllTournamentsListItem[]> => {
    try {
      const allUsers = await usersStore.getAllUsers();

      const allTournaments = (await loadAllTournamentsFromFirebase()).map(
        (tournament) => {
          const rostersInfoFromFirebase = tournament.rostersInfo ?? [];

          const rostersInfo: IRosterInfo<IAllUsersListItem>[] =
            rostersInfoFromFirebase.map((rosterInfo) => {
              return {
                ...rosterInfo,
                players: rosterInfo.players.reduce(
                  (acc, player) => {
                    if (typeof player === "string") {
                      const userInfo = allUsers.find((u) => u.uid === player);
                      if (userInfo) acc.push(userInfo);
                    } else {
                      acc.push(player);
                    }
                    return acc;
                  },
                  [] as (IAllUsersListItem | IUnregisteredUser)[]
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
        }
      );

      tournaments.splice(0, tournaments.length, ...allTournaments);
      return allTournaments;
    } catch (error) {
      throw error;
    }
  };

  const uploadTournament = async (
    tournament: IAllTournamentsFirebaseOutgoingItem
  ) => {
    try {
      await uploadTournamentToFirebase(tournament);
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

  return {
    tournaments,
    getAllTournaments,
    loadAllTournaments,
    uploadTournament,
    updateTournament,
    deleteTournament,
    archiveTournament,
  };
});
