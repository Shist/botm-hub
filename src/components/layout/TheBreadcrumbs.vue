<template>
  <div v-if="breadcrumbs.length > 0">
    <v-breadcrumbs :items="breadcrumbs" class="the-breadcrumbs">
      <template #divider>
        <v-icon icon="mdi-chevron-right" class="the-breadcrumbs__icon"></v-icon>
      </template>
      <template v-slot:title="{ item }">
        <span class="the-breadcrumbs__label">{{ item.title }}</span>
      </template>
    </v-breadcrumbs>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useUsersStore } from "@/stores/users";
import { useOsumapsStore } from "@/stores/osumaps";
import { MAPS_CATEGORIES, CLUB_SETTINGS } from "@/constants";
import { isOsuMapCategory } from "@/types/osumaps";
import { isBotmClub } from "@/types/clubs";

const route = useRoute();

const usersStore = useUsersStore();
const mapsStore = useOsumapsStore();

const HIDDEN_ON_ROUTES = ["sign-in", "sign-up", "not-found", "main"];

const ROUTE_LABELS: Record<string, string> = {
  "personal-account": "Личный Кабинет",
  players: "Наши Игроки",
  "player-by-uid": "Профиль Игрока",
  "skillsets-maps": "Карты Скиллсетов",
  "workout-constructor": "Конструктор Тренировочной Сессии",
  trainings: "Расписания Качалочек",
  tournaments: "Турниры и Наши Ростеры",
  clubs: "Клубы и Лидерборды",
};

const breadcrumbs = computed(() => {
  const routeName = String(route.name);

  if (!routeName || HIDDEN_ON_ROUTES.includes(routeName)) {
    return [];
  }

  const items = [];

  items.push({
    title: "Главная",
    disabled: false,
    to: "/",
  });

  if (routeName === "map-profile") {
    items.push({
      title: ROUTE_LABELS["skillsets-maps"] ?? "Карты Скиллсетов",
      disabled: false,
      to: "/skillsets-maps",
    });

    const categoryRaw = String(route.params.category).toLowerCase();
    const mapIdRaw = Number(route.params.mapId);

    if (isOsuMapCategory(categoryRaw)) {
      const readableCategory = MAPS_CATEGORIES[categoryRaw];
      items.push({
        title: readableCategory,
        disabled: false,
        to: `/skillsets-maps/${categoryRaw}`,
      });

      const categoryMaps = mapsStore.getMapsOfGivenCategories([categoryRaw]);
      const foundMap = categoryMaps.find((m) => m.id === mapIdRaw);
      const displayTitle = foundMap ? foundMap.name : `Карта ${mapIdRaw}`;

      items.push({
        title: displayTitle,
        disabled: true,
        to: route.path,
      });
    } else {
      items.push({
        title: `Категория '${route.params.category}' не найдена`,
        disabled: true,
        to: route.path,
      });
    }

    return items;
  }

  if (routeName.startsWith("skillsets-maps-")) {
    const categoryKey = routeName.replace("skillsets-maps-", "");
    const readableTitle = isOsuMapCategory(categoryKey)
      ? MAPS_CATEGORIES[categoryKey]
      : categoryKey.toUpperCase();

    items.push({
      title: ROUTE_LABELS["skillsets-maps"] ?? "Карты Скиллсетов",
      disabled: false,
      to: "/skillsets-maps",
    });

    items.push({
      title: readableTitle,
      disabled: true,
      to: route.path,
    });

    return items;
  }

  if (routeName === "player-profile") {
    items.push({
      title: ROUTE_LABELS["players"] ?? "Наши Игроки",
      disabled: false,
      to: "/players",
    });

    const rawNick = route.params.nick
      ? decodeURIComponent(String(route.params.nick))
      : "";
    const userFromStore = usersStore.users.find(
      (u) => u.nick.toLowerCase() === rawNick.toLowerCase()
    );
    const displayNick = userFromStore ? userFromStore.nick : rawNick;

    items.push({
      title: displayNick || "Профиль Игрока",
      disabled: true,
      to: route.path,
    });

    return items;
  }

  if (routeName === "club-profile") {
    items.push({
      title: ROUTE_LABELS["clubs"] ?? "Клубы и Лидерборды",
      disabled: false,
      to: "/clubs",
    });

    const displayClubId = route.params.clubId
      ? String(route.params.clubId)
      : "";
    const normalizedClubId = displayClubId.toLowerCase();

    if (isBotmClub(normalizedClubId)) {
      const readableClubTitle = CLUB_SETTINGS[normalizedClubId].title;

      items.push({
        title: readableClubTitle,
        disabled: true,
        to: route.path,
      });
    } else {
      items.push({
        title: displayClubId,
        disabled: true,
        to: route.path,
      });
    }

    return items;
  }

  if (ROUTE_LABELS[routeName]) {
    items.push({
      title: ROUTE_LABELS[routeName] ?? "",
      disabled: true,
      to: route.path,
    });
  }

  return items;
});
</script>

<style lang="scss" scoped>
.the-breadcrumbs {
  padding: 0;
  flex-wrap: wrap;
  :deep(a.v-breadcrumbs-item--link) {
    color: var(--color-text);
    transition: color 0.3s ease;
    &:hover {
      color: var(--color-link-active);
    }
  }
  &__icon {
    font-size: 20px;
    color: var(--color-text);
    opacity: 0.7;
    @media (max-width: $tablet-l) {
      font-size: 18px;
    }
    @media (max-width: $phone-l) {
      font-size: 16px;
    }
  }
  &__label {
    @include default-text(16px, 16px, inherit);
    transition: 0.3s;
    .v-breadcrumbs-item--disabled & {
      color: var(--color-text);
    }
    @media (max-width: $tablet-l) {
      font-size: 14px;
      line-height: 14px;
    }
    @media (max-width: $phone-l) {
      font-size: 12px;
      line-height: 12px;
    }
  }
}
</style>
