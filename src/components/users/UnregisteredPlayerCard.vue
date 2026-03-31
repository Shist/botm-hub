<template>
  <div class="unregistered-player-card">
    <div class="unregistered-player-card__avatar-wrapper">
      <AppImage
        v-if="localOsuId"
        :imgPath="`https://a.ppy.sh/${localOsuId}?.png`"
        :imgAlt="`Аватар ${localNick || 'неизвестного игрока'}`"
        isAvatar
        class="unregistered-player-card__avatar"
      />
      <v-icon
        v-else
        icon="mdi-account"
        size="28"
        color="grey"
        class="unregistered-player-card__fallback-icon"
      />
    </div>
    <div class="unregistered-player-card__inputs-wrapper">
      <v-text-field
        v-model="localOsuId"
        :counter="9"
        :rules="[rules.min(1), rules.max(9)]"
        variant="solo"
        density="compact"
        prepend-inner-icon="mdi-identifier"
        label="osu! ID"
        placeholder="Введи osu! ID"
        persistent-counter
        clearable
      />
      <v-text-field
        v-model="localNick"
        :counter="15"
        :rules="[rules.min(3), rules.max(15)]"
        autocomplete="username"
        variant="solo"
        density="compact"
        prepend-inner-icon="mdi-account"
        label="osu! Ник"
        placeholder="Введи osu! ник"
        persistent-counter
        clearable
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import useFormValidation from "@/composables/useFormValidation";
import { type IUnregisteredUser } from "@/types/users";

const props = defineProps<{
  modelValue: IUnregisteredUser | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: IUnregisteredUser | null];
}>();

const { rules } = useFormValidation();

const localOsuId = ref<string>(props.modelValue?.osuId ?? "");
const localNick = ref<string>(props.modelValue?.nick ?? "");

watch([localOsuId, localNick], ([newId, newNick]) => {
  if (!newId && !newNick) {
    emit("update:modelValue", null);
    return;
  }
  emit("update:modelValue", {
    osuId: newId,
    nick: newNick,
  });
});

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      if (localOsuId.value !== newVal.osuId) {
        localOsuId.value = newVal.osuId;
      }
      if (localNick.value !== newVal.nick) {
        localNick.value = newVal.nick;
      }
    } else {
      localOsuId.value = "";
      localNick.value = "";
    }
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
.unregistered-player-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background-color: var(--color-user-card-bg);
  border-radius: 8px;
  @media (max-width: $phone-l) {
    flex-direction: column;
    align-items: center;
  }
  &__avatar-wrapper {
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 48px;
    height: 48px;
    margin-top: 4px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.2);
    overflow: hidden;
    @media (max-width: $phone-l) {
      margin-top: 0;
    }
  }
  &__avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  &__inputs-wrapper {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    @media (max-width: $phone-l) {
      width: 100%;
    }
  }
}
</style>
