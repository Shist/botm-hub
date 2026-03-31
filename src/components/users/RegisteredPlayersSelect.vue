<template>
  <v-autocomplete
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    :items="usersStore.users"
    item-title="nick"
    return-object
    variant="solo"
    prepend-inner-icon="mdi-account-search"
    label="Игрок из BOTM"
    placeholder="Начни вводить ник..."
    no-data-text="Игрок не найден"
    clearable
    hide-details
  >
    <template #selection="{ item }">
      <div class="registered-players-select__selection">
        <AppImage
          :imgPath="`https://a.ppy.sh/${item.raw.osuId}?.png`"
          :imgAlt="`Аватар ${item.raw.nick}`"
          isAvatar
          class="registered-players-select__avatar"
        />
        <span class="registered-players-select__nick">
          {{ item.raw.nick }}
        </span>
      </div>
    </template>
    <template #item="{ props, item }">
      <v-list-item
        v-bind="props"
        :title="undefined"
        class="registered-players-select__list-item"
      >
        <div class="registered-players-select__card-content">
          <AppImage
            :imgPath="`https://a.ppy.sh/${item.raw.osuId}?.png`"
            :imgAlt="`Аватар ${item.raw.nick}`"
            isAvatar
            class="registered-players-select__avatar"
          />
          <span class="registered-players-select__nick">
            {{ item.raw.nick }}
          </span>
        </div>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/stores/users";
import { type IAllUsersListItem } from "@/types/users";

defineProps<{
  modelValue: IAllUsersListItem | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [user: IAllUsersListItem | null];
}>();

const usersStore = useUsersStore();
</script>

<style lang="scss" scoped>
.registered-players-select {
  &__selection {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 2px 0;
  }
  &__list-item {
    margin: 4px 8px;
    border-radius: 6px;
  }
  &__card-content {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 4px 0;
  }
  &__avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
  }
  &__nick {
    @include default-text(18px, 18px, inherit);
    @media (max-width: $tablet-l) {
      font-size: 16px;
      line-height: 16px;
    }
  }
}
</style>
