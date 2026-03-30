<template>
  <v-expansion-panel :value="roster.id" class="tournament-roster-card">
    <template #title>
      <div class="tournament-roster-card__header-content">
        <div class="tournament-roster-card__name-and-badges">
          <h5 class="tournament-roster-card__team-name">
            {{ roster.teamName }}
          </h5>
          <div
            v-if="roster.achievedPlace || roster.achievedStage"
            class="tournament-roster-card__achievements-wrapper"
          >
            <span
              v-if="roster.achievedPlace"
              class="tournament-roster-card__badge"
              :class="placeBadgeClass"
            >
              Достигнутое Место: #{{ roster.achievedPlace }}
            </span>
            <span
              v-if="roster.achievedStage"
              class="tournament-roster-card__badge"
              :class="stageBadgeClass"
            >
              Достигнутая Стадия: {{ roster.achievedStage }}
            </span>
          </div>
        </div>
        <div
          v-if="isUserRedactor"
          class="tournament-roster-card__redactor-actions"
        >
          <v-btn
            icon="mdi-pencil"
            variant="text"
            color="var(--color-tournament-roster-edit)"
            @click.stop="emit('onEditRoster', roster.id)"
          />
          <v-btn
            icon="mdi-delete"
            variant="text"
            color="var(--color-tournament-roster-delete)"
            @click.stop="emit('onDeleteRoster', roster.id)"
          />
        </div>
      </div>
    </template>
    <template #text>
      <div class="tournament-roster-card__players-grid mb-4">
        <template
          v-for="player in roster.players"
          :key="'uid' in player ? player.uid : player.osuId"
        >
          <UserCard v-if="isRegisteredPlayer(player)" :user="player" />
          <a
            v-else
            :href="`https://osu.ppy.sh/users/${player.osuId}`"
            target="_blank"
            class="tournament-roster-card__unregistered-card"
          >
            <div class="tournament-roster-card__unregistered-constant-info">
              <div class="tournament-roster-card__unregistered-avatar-nick">
                <AppImage
                  :imgPath="`https://a.ppy.sh/${player.osuId}?.png`"
                  :imgAlt="`Аватар ${player.nick}`"
                  isAvatar
                  class="tournament-roster-card__unregistered-avatar"
                />
                <span class="tournament-roster-card__unregistered-nick">
                  {{ player.nick }}
                </span>
                <v-icon
                  icon="mdi-open-in-new"
                  size="x-small"
                  color="grey"
                  class="ml-1"
                />
              </div>
            </div>
          </a>
        </template>
      </div>
      <template v-if="roster.collabImgLink">
        <v-divider class="mb-3 border-opacity-100" />
        <div class="tournament-roster-card__media-section">
          <h6 class="tournament-roster-card__media-title">Коллаб</h6>
          <AppImage
            :imgPath="roster.collabImgLink"
            :imgAlt="`Коллаб команды ${roster.teamName}`"
          />
        </div>
      </template>
      <template v-if="roster.rosterRevealLink && embedRosterRevealUrl">
        <v-divider class="my-3 border-opacity-100" />
        <div class="tournament-roster-card__media-section">
          <h6 class="tournament-roster-card__media-title">Ростер Ревил</h6>
          <div class="tournament-roster-card__video-wrapper">
            <iframe
              :src="embedRosterRevealUrl"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      </template>
    </template>
  </v-expansion-panel>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import UserCard from "@/components/users/UserCard.vue";
import { type IAllUsersListItem, isRegisteredPlayer } from "@/types/users";
import { type IRosterInfo } from "@/types/tournaments";

const props = defineProps<{
  roster: IRosterInfo<IAllUsersListItem>;
}>();

const emit = defineEmits<{
  onEditRoster: [rosterId: string];
  onDeleteRoster: [rosterId: string];
}>();

const authStore = useAuthStore();

const isUserRedactor = computed(
  () => authStore.userAdditionalInfo?.isRedactor ?? false
);

const placeBadgeClass = computed(() => {
  if (!props.roster.achievedPlace) return "";
  const place = props.roster.achievedPlace;
  if (place === "1") return "tournament-roster-card__badge_gold";
  if (place === "2") return "tournament-roster-card__badge_silver";
  if (place === "3") return "tournament-roster-card__badge_bronze";
  if (place === "4" || place === "3-4")
    return "tournament-roster-card__badge_place-4";
  if (place === "5-6") return "tournament-roster-card__badge_place-5-6";
  if (place === "7-8" || place === "5-8")
    return "tournament-roster-card__badge_place-7-8";
  if (place === "9-12" || place === "5-12")
    return "tournament-roster-card__badge_place-9-12";
  if (place === "13-16" || place === "9-16")
    return "tournament-roster-card__badge_place-13-16";
  if (place === "17-22" || place === "17-24" || place === "9-24")
    return "tournament-roster-card__badge_place-17-24";
  if (
    place === "23-28" ||
    place === "29-32" ||
    place === "25-32" ||
    place === "17-32"
  )
    return "tournament-roster-card__badge_place-25-32";
  if (place === "33-64" || place === "17-64")
    return "tournament-roster-card__badge_place-33-64";
  if (place === "33+" || place === "65+")
    return "tournament-roster-card__badge_place-65-plus";
  return "tournament-roster-card__badge_place-65-plus";
});

const stageBadgeClass = computed(() => {
  if (!props.roster.achievedStage) return "";
  const stage = props.roster.achievedStage;
  if (stage === "Grand Finals")
    return "tournament-roster-card__badge_stage-grand-finals";
  if (stage === "Finals") return "tournament-roster-card__badge_stage-finals";
  if (stage === "Semifinals")
    return "tournament-roster-card__badge_stage-semis";
  if (stage === "Quarterfinals")
    return "tournament-roster-card__badge_stage-quarters";
  if (stage === "Round of 16") return "tournament-roster-card__badge_stage-r16";
  if (stage === "Round of 32") return "tournament-roster-card__badge_stage-r32";
  if (stage === "Groups Stage")
    return "tournament-roster-card__badge_stage-groups";
  if (stage === "Swiss Stage 3")
    return "tournament-roster-card__badge_stage-swiss-3";
  if (stage === "Swiss Stage 2")
    return "tournament-roster-card__badge_stage-swiss-2";
  if (stage === "Swiss Stage 1")
    return "tournament-roster-card__badge_stage-swiss-1";
  return "tournament-roster-card__badge_stage-dnq";
});

const embedRosterRevealUrl = computed(() => {
  const url = props.roster.rosterRevealLink;
  if (!url) return null;

  let videoId = "";
  if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1]?.split("?")[0] ?? "";
  } else if (url.includes("youtube.com/watch")) {
    const urlParams = new URLSearchParams(url.split("?")[1]);
    videoId = urlParams.get("v") ?? "";
  } else if (url.includes("youtube.com/embed/")) {
    return url;
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
});
</script>

<style lang="scss" scoped>
.tournament-roster-card {
  background-color: var(--color-roster-card-bg);
  &__header-content {
    width: 100%;
    padding-right: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    @media (max-width: $phone-l) {
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
    }
  }
  &__name-and-badges {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  &__redactor-actions {
    display: flex;
    gap: 4px;
  }
  &__team-name {
    @include default-headline(24px, 24px, var(--color-text));
    @media (max-width: $tablet-l) {
      font-size: 20px;
      line-height: 20px;
    }
  }
  &__achievements-wrapper {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  &__badge {
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 16px;
    font-weight: bold;
    background-color: rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    @include default-text(16px, 16px, var(--color-text));
    &_gold {
      color: #ffd700;
      border: 2px solid #ffd700;
      text-shadow:
        0 0 6px rgba(255, 215, 0, 1),
        0 0 12px rgba(255, 215, 0, 0.8);
      box-shadow:
        0 0 12px rgba(255, 215, 0, 0.4),
        inset 0 0 8px rgba(255, 215, 0, 0.2);
      .light-theme & {
        color: #b39700;
        border-color: #b39700;
        text-shadow: none;
        box-shadow: inset 0 0 8px rgba(179, 151, 0, 0.2);
        background-color: rgba(0, 0, 0, 0.05);
      }
    }
    &_silver {
      color: #e0e0e0;
      border: 2px solid #e0e0e0;
      text-shadow:
        0 0 6px rgba(224, 224, 224, 1),
        0 0 12px rgba(224, 224, 224, 0.8);
      box-shadow:
        0 0 12px rgba(224, 224, 224, 0.4),
        inset 0 0 8px rgba(224, 224, 224, 0.2);
      .light-theme & {
        color: #757575;
        border-color: #757575;
        text-shadow: none;
        box-shadow: inset 0 0 8px rgba(117, 117, 117, 0.2);
        background-color: rgba(0, 0, 0, 0.05);
      }
    }
    &_bronze {
      color: #ff9e5e;
      border: 2px solid #cd7f32;
      text-shadow:
        0 0 6px rgba(205, 127, 50, 1),
        0 0 12px rgba(205, 127, 50, 0.8);
      box-shadow:
        0 0 12px rgba(205, 127, 50, 0.4),
        inset 0 0 8px rgba(205, 127, 50, 0.2);
      .light-theme & {
        color: #a05a1c;
        border-color: #a05a1c;
        text-shadow: none;
        box-shadow: inset 0 0 8px rgba(160, 90, 28, 0.2);
        background-color: rgba(0, 0, 0, 0.05);
      }
    }
    &_place-4 {
      @include colored-badge(55, 100%);
    }
    &_place-5-6 {
      @include colored-badge(75, 90%);
    }
    &_place-7-8 {
      @include colored-badge(100, 80%);
    }
    &_place-9-12 {
      @include colored-badge(130, 80%);
    }
    &_place-13-16 {
      @include colored-badge(160, 80%);
    }
    &_place-17-24 {
      @include colored-badge(190, 80%);
    }
    &_place-25-32 {
      @include colored-badge(220, 80%);
    }
    &_place-33-64 {
      @include colored-badge(250, 80%);
    }
    &_place-65-plus {
      color: hsl(0, 0%, 65%);
      border: 2px solid hsla(0, 0%, 65%, 0.3);
      opacity: 0.7;
      .light-theme & {
        color: hsl(0, 0%, 35%);
        border-color: hsla(0, 0%, 35%, 0.5);
      }
    }
    &_stage-grand-finals {
      @include colored-badge(350, 100%);
    }
    &_stage-finals {
      @include colored-badge(10, 100%);
    }
    &_stage-semis {
      @include colored-badge(25, 100%);
    }
    &_stage-quarters {
      @include colored-badge(40, 100%);
    }
    &_stage-r16 {
      @include colored-badge(55, 100%);
    }
    &_stage-r32 {
      @include colored-badge(100, 80%);
    }
    &_stage-groups {
      @include colored-badge(180, 80%);
    }
    &_stage-swiss-3 {
      @include colored-badge(210, 80%);
    }
    &_stage-swiss-2 {
      @include colored-badge(240, 80%);
    }
    &_stage-swiss-1 {
      @include colored-badge(270, 80%);
    }
    &_stage-dnq {
      color: hsl(0, 0%, 65%);
      border: 2px solid hsla(0, 0%, 65%, 0.3);
      opacity: 0.7;
      .light-theme & {
        color: hsl(0, 0%, 35%);
        border-color: hsla(0, 0%, 35%, 0.5);
      }
    }
  }
  &__players-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    @media (max-width: $pc-s) {
      grid-template-columns: repeat(1, 1fr);
    }
    @include default-text(20px, 20px, var(--color-text));
    @media (max-width: $tablet-l) {
      font-size: 16px;
      line-height: 16px;
    }
    @media (max-width: $phone-l) {
      font-size: 14px;
      line-height: 14px;
    }
  }
  &__unregistered-card {
    padding: 4px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background-color: var(--color-user-card-bg);
    border-radius: 4px;
    text-decoration: none;
    cursor: pointer;
    min-height: 44px;
    &:hover {
      filter: brightness(var(--user-card-hover-brightness));
    }
  }
  &__unregistered-constant-info {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  &__unregistered-avatar-nick {
    display: flex;
    align-items: center;
    column-gap: 10px;
  }
  &__unregistered-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
  }
  &__unregistered-nick {
    @include default-text(20px, 20px, var(--color-text));
    @media (max-width: $tablet-l) {
      font-size: 16px;
      line-height: 16px;
    }
  }
  &__media-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
  &__media-title {
    @include default-headline(20px, 20px, var(--color-text));
    width: 100%;
    text-align: center;
  }
  &__video-wrapper {
    width: 100%;
    max-width: 800px;
    aspect-ratio: 16 / 9;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
    iframe {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
