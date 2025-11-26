import { reactive } from "vue";
import { defineStore } from "pinia";
import {
  loadAllTrainingsFromFirebase,
  uploadTrainingToFirebase,
  updateTrainingToFirebase,
  deleteTrainingFromFirebase,
  archiveTrainingInFirebase,
} from "@/services/firebase";
import {
  OsuMapCategory,
  type IAllTrainingsListItem,
  type IAllTrainingsFirebaseOutgoingItem,
} from "@/types";
import { useUsersStore } from "@/stores/users";

export const useTrainingsStore = defineStore("trainings", () => {
  const usersStore = useUsersStore();

  const trainings = reactive<IAllTrainingsListItem[]>([]);

  const getAllTrainings = async (): Promise<IAllTrainingsListItem[]> => {
    if (trainings.length) return trainings;
    return await loadAllTrainings();
  };

  const loadAllTrainings = async (): Promise<IAllTrainingsListItem[]> => {
    try {
      const allUsers = await usersStore.loadAllUsers();

      const allTrainings = (await loadAllTrainingsFromFirebase()).map(
        (training) => {
          const participantsUids = JSON.parse(
            training.participantsUids
          ) as string[];

          return {
            id: training.id,
            title: training.title,
            trainerUid: training.trainerUid,
            skillsets: JSON.parse(training.skillsets) as OsuMapCategory[],
            dateTime: training.dateTime.toDate(),
            durationMins: training.durationMins,
            description: training.description,
            participants: allUsers.filter((u) =>
              participantsUids.includes(u.uid)
            ),
            mpLinkId: training.mpLinkId,
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

  const uploadTraining = async (
    training: IAllTrainingsFirebaseOutgoingItem
  ) => {
    try {
      await uploadTrainingToFirebase(training);
      await loadAllTrainings();
    } catch (error) {
      throw error;
    }
  };

  const updateTraining = async (
    training: IAllTrainingsFirebaseOutgoingItem
  ) => {
    try {
      await updateTrainingToFirebase(training);
      await loadAllTrainings();
    } catch (error) {
      throw error;
    }
  };

  const deleteTraining = async (trainingId: string) => {
    try {
      await deleteTrainingFromFirebase(trainingId);
      await loadAllTrainings();
    } catch (error) {
      throw error;
    }
  };

  const archiveTraining = async (trainingId: string, mpLinkId: number) => {
    try {
      await archiveTrainingInFirebase(trainingId, mpLinkId);
      await loadAllTrainings();
    } catch (error) {
      throw error;
    }
  };

  return {
    trainings,
    getAllTrainings,
    loadAllTrainings,
    uploadTraining,
    updateTraining,
    deleteTraining,
    archiveTraining,
  };
});
