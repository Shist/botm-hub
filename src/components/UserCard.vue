<template>
  <a
    :href="`https://osu.ppy.sh/users/${nick}`"
    target="_blank"
    class="user-card"
  >
    <AppImage
      :imgPath="`https://a.ppy.sh/${osuId}?.png`"
      :imgAlt="`Аватар ${nick}`"
      isRounded
      class="user-card__avatar"
    />
    <span class="user-card__nick">
      {{ nick }}
    </span>
  </a>
</template>

<script setup lang="ts">
import { type IAllUsersListItem } from "@/types";

defineProps<Pick<IAllUsersListItem, "osuId" | "nick">>();
</script>

<style lang="scss" scoped>
.user-card {
  padding: 4px;
  display: flex;
  align-items: center;
  column-gap: 10px;
  background-color: var(--color-user-card-bg);
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
  &:hover {
    filter: brightness(var(--user-card-hover-brightness));
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
