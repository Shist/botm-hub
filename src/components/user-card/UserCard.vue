<template>
  <router-link :to="`/players/${user.uid}`" class="user-card">
    <slot />
    <div class="user-card__constant-info-wrapper">
      <div class="user-card__tags-wrapper">
        <IconAdmin v-if="isShist" />
        <IconTrainer v-if="isTrainer" />
        <component :is="digitIconComponent" />
      </div>
      <div class="user-card__avatar-nick-wrapper">
        <AppImage
          :imgPath="`https://a.ppy.sh/${user.osuId}?.png`"
          :imgAlt="`Аватар ${user.nick}`"
          isAvatar
          class="user-card__avatar"
        />
        <span class="user-card__nick">
          {{ user.nick }}
        </span>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import useUserTags from "@/composables/useUserTags";
import IconAdmin from "@/components/user-card/IconAdmin.vue";
import IconTrainer from "@/components/user-card/IconTrainer.vue";
import { type IAllUsersListItem } from "@/types";

const props = defineProps<{ user: IAllUsersListItem }>();

const { isShist, digitIconComponent, isTrainer } = useUserTags(
  toRef(props.user)
);
</script>

<style lang="scss" scoped>
.user-card {
  padding: 4px;
  display: flex;
  flex-direction: column;
  row-gap: 4px;
  background-color: var(--color-user-card-bg);
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
  &:hover {
    filter: brightness(var(--user-card-hover-brightness));
  }
  &__constant-info-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  &__avatar-nick-wrapper {
    display: flex;
    align-items: center;
    column-gap: 10px;
  }
  &__tags-wrapper {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px;
    * {
      width: 30px;
      height: 30px;
      color: var(--color-text);
    }
  }
  &__avatar {
    width: 36px;
    height: 36px;
  }
  &__nick {
    @include default-text(20px, 20px, var(--color-text));
    @media (max-width: $tablet-l) {
      font-size: 16px;
      line-height: 16px;
    }
  }
}
</style>
