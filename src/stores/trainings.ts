import { reactive } from "vue";
import { defineStore } from "pinia";
import {
  convertFirestoreTimestampToDate,
  loadAllTrainingsFromFirbase,
} from "@/services/firebase";
import { OsuMapCategory, type IAllTrainingsListItem } from "@/types";
import { useUsersStore } from "@/stores/users";

export const useTrainingsStore = defineStore("trainings", () => {
  const usersStore = useUsersStore();

  const trainings = reactive<IAllTrainingsListItem[]>([]);

  const loadAllTrainings = async (): Promise<IAllTrainingsListItem[]> => {
    if (trainings.length) return trainings;

    try {
      const allUsers = await usersStore.loadAllUsers();

      const allTrainings = (await loadAllTrainingsFromFirbase()).map(
        (training) => {
          const participantsUids = JSON.parse(
            training.participantsUids
          ) as string[];

          return {
            id: training.id,
            title: training.title,
            trainerNick:
              allUsers.find((u) => u.uid === training.trainerUid)?.nick ?? "",
            skillsets: JSON.parse(training.skillsets) as OsuMapCategory[],
            dateTime: convertFirestoreTimestampToDate(training.dateTime),
            durationMins: training.durationMins,
            description: training.description,
            participants: allUsers.filter((u) =>
              participantsUids.includes(u.uid)
            ),
            mpLink: training.mpLink,
            isArchived: training.isArchived,
          };
        }
      );

      trainings.splice(0, trainings.length, ...allTrainings);
      return allTrainings;
    } catch (error) {
      throw error;
    }
  };

  return {
    trainings,
    loadAllTrainings,
  };
});
