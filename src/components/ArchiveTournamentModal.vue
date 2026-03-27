<template>
  <AppModal
    :isOpened="isOpened"
    title="Архивация записи о турнире"
    :isClosableByClickOutside="false"
    @closeModal="$emit('closeModal')"
  >
    <template #default> </template>
    <template #actions> </template>
  </AppModal>
</template>

<script lang="ts" setup>
defineProps<{
  isOpened: boolean;
  tournamentId: string;
}>();

defineEmits<{
  closeModal: [];
  closeModalAfterArchiving: [tournamentId: string];
}>();
</script>

<style lang="scss" scoped></style>
