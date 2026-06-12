import { createRouter, createWebHistory } from "vue-router";
import MainPage from "@/pages/MainPage.vue";
import SignInPage from "@/pages/auth/SignInPage.vue";
import SignUpPage from "@/pages/auth/SignUpPage.vue";
import PersonalAccountPage from "@/pages/PersonalAccountPage.vue";
import GuidePage from "@/pages/guide/GuidePage.vue";
import PlayersPage from "@/pages/players/PlayersPage.vue";
import PlayerProfilePage from "@/pages/players/PlayerProfilePage.vue";
import SkillsetsMapsPage from "@/pages/skillsets-maps/SkillsetsMapsPage.vue";
import AllMapsPage from "@/pages/skillsets-maps/AllMapsPage.vue";
import CategoryMapsPage from "@/pages/skillsets-maps/CategoryMapsPage.vue";
import MapProfilePage from "@/pages/skillsets-maps/MapProfilePage.vue";
import WorkoutConstructorPage from "@/pages/WorkoutConstructorPage.vue";
import TrainingsPage from "@/pages/TrainingsPage.vue";
import TournamentsPage from "@/pages/TournamentsPage.vue";
import ClubsPage from "@/pages/clubs/ClubsPage.vue";
import ClubProfilePage from "@/pages/clubs/ClubProfilePage.vue";
import LeaderboardsPage from "@/pages/leaderboards/LeaderboardsPage.vue";
import GlobalLeaderboardPage from "@/pages/leaderboards/GlobalLeaderboardPage.vue";
import CategoryLeaderboardPage from "@/pages/leaderboards/CategoryLeaderboardPage.vue";
import NotFoundPage from "@/pages/NotFoundPage.vue";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "main",
      component: MainPage,
    },
    {
      path: "/sign-in",
      name: "sign-in",
      component: SignInPage,
    },
    {
      path: "/sign-up",
      name: "sign-up",
      component: SignUpPage,
    },
    {
      path: "/personal-account",
      name: "personal-account",
      component: PersonalAccountPage,
    },
    {
      path: "/guide",
      name: "guide",
      component: GuidePage,
    },
    {
      path: "/players",
      name: "players",
      component: PlayersPage,
    },
    {
      path: "/players/:nick",
      name: "player-profile",
      component: PlayerProfilePage,
    },
    {
      path: "/skillsets-maps",
      children: [
        {
          path: "",
          component: SkillsetsMapsPage,
          name: "skillsets-maps",
        },
        {
          path: "all",
          component: AllMapsPage,
          name: "skillsets-maps-all",
        },
        {
          path: ":category",
          component: CategoryMapsPage,
          name: "skillset-maps-category",
        },
        {
          path: ":category/:mapId",
          component: MapProfilePage,
          name: "map-profile",
        },
      ],
    },
    {
      path: "/workout-constructor",
      name: "workout-constructor",
      component: WorkoutConstructorPage,
    },
    {
      path: "/trainings",
      name: "trainings",
      component: TrainingsPage,
    },
    {
      path: "/tournaments",
      name: "tournaments",
      component: TournamentsPage,
    },
    {
      path: "/clubs",
      name: "clubs",
      component: ClubsPage,
    },
    {
      path: "/clubs/:clubId",
      name: "club-profile",
      component: ClubProfilePage,
    },
    {
      path: "/leaderboards",
      children: [
        {
          path: "",
          component: LeaderboardsPage,
          name: "leaderboards",
        },
        {
          path: "all",
          component: GlobalLeaderboardPage,
          name: "leaderboards-all",
        },
        {
          path: ":category",
          component: CategoryLeaderboardPage,
          name: "leaderboards-category",
        },
      ],
    },
    {
      path: "/:catchAll(.*)",
      name: "not-found",
      component: NotFoundPage,
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to, _, next) => {
  const { user } = useAuthStore();

  if (to.name === "sign-in" || to.name === "sign-up") {
    if (user) {
      next({ name: "main" });
    } else {
      next();
    }
  } else if (to.name === "personal-account") {
    if (user) {
      next();
    } else {
      next({ name: "sign-in" });
    }
  } else {
    next();
  }
});

export default router;
