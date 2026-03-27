<template>
  <AppModal
    :isOpened="isOpened"
    :title="modalTitle"
    :isClosableByClickOutside="false"
    @closeModal="$emit('closeModal')"
  >
    <template #default> </template>
    <template #actions> </template>
  </AppModal>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { type IAllTournamentsListItem } from "@/types";

const props = defineProps<{
  isOpened: boolean;
  tournament: IAllTournamentsListItem | null;
}>();

defineEmits<{
  closeModal: [];
  closeModalAfterRequest: [id: string];
}>();

const modalTitle = computed(
  () => `🏆 ${props.tournament ? "Изменить" : "Создать"} запись о турнире 🏆`
);
</script>

<style lang="scss" scoped></style>
