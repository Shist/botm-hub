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
import { MAPS_CATEGORIES } from "@/constants";
import { isMapCategoryKey } from "@/types/osumaps";

const route = useRoute();
const usersStore = useUsersStore();

const HIDDEN_ON_ROUTES = ["sign-in", "sign-up", "not-found", "main"];

const ROUTE_LABELS: Record<string, string> = {
  "personal-account": "Личный Кабинет",
  players: "Наши Игроки",
  "player-by-uid": "Профиль Игрока",
  "skillsets-maps": "Карты Скиллсетов",
  "workout-constructor": "Конструктор Тренировочной Сессии",
  trainings: "Расписания Качалочек",
  tournaments: "Турниры и Наши Ростеры",
  bounties: "Баунти",
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

  if (routeName.startsWith("skillsets-maps-")) {
    const categoryKey = routeName.replace("skillsets-maps-", "");
    const readableTitle = isMapCategoryKey(categoryKey)
      ? MAPS_CATEGORIES[categoryKey as keyof typeof MAPS_CATEGORIES]
      : categoryKey.toUpperCase();

    items.push({
      title: ROUTE_LABELS["skillsets-maps"] ?? "Карты скиллсетов",
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
      title: displayNick || "Профиль игрока",
      disabled: true,
      to: route.path,
    });

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
