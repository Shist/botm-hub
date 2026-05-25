import { ref, reactive } from "vue";
import { defineStore } from "pinia";
import {
  loadAllTrainingsFromFirebase,
  uploadTrainingToFirebase,
  updateTrainingToFirebase,
  deleteTrainingFromFirebase,
  archiveTrainingInFirebase,
  subscribeTrainingParticipantInFirebase,
  unsubscribeTrainingParticipantInFirebase,
} from "@/services/firebase/trainings";
import { OsuMapCategory } from "@/types/osumaps";
import {
  type IAllTrainingsListItem,
  type IAllTrainingsFirebaseOutgoingItem,
} from "@/types/trainings";
import { useUsersStore } from "@/stores/users";

export const useTrainingsStore = defineStore("trainings", () => {
  const usersStore = useUsersStore();

  const trainings = reactive<IAllTrainingsListItem[]>([]);

  const isLoaded = ref(false);
  let loadPromise: Promise<IAllTrainingsListItem[]> | null = null;

  const getAllTrainings = async (): Promise<IAllTrainingsListItem[]> => {
    if (isLoaded.value) return trainings;
    return await loadAllTrainings();
  };

  const loadAllTrainings = async (): Promise<IAllTrainingsListItem[]> => {
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
      try {
        const allUsers = await usersStore.getAllUsersAndLoadClubs();

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
    })();

    const result = await loadPromise;
    loadPromise = null;
    isLoaded.value = true;
    return result;
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

  const subscribeParticipantToTraining = async (
    trainingId: string,
    playerUid: string
  ) => {
    try {
      await subscribeTrainingParticipantInFirebase(trainingId, playerUid);
      await loadAllTrainings();
    } catch (error) {
      throw error;
    }
  };

  const unsubscribeParticipantFromTraining = async (
    trainingId: string,
    playerUid: string
  ) => {
    try {
      await unsubscribeTrainingParticipantInFirebase(trainingId, playerUid);
      await loadAllTrainings();
    } catch (error) {
      throw error;
    }
  };

  return {
    trainings,
    isLoaded,
    getAllTrainings,
    loadAllTrainings,
    uploadTraining,
    updateTraining,
    deleteTraining,
    archiveTraining,
    subscribeParticipantToTraining,
    unsubscribeParticipantFromTraining,
  };
});
