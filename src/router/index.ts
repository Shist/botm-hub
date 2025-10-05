import { createRouter, createWebHistory } from "vue-router";
import MainPage from "@/pages/MainPage.vue";
import SignInPage from "@/pages/SignInPage.vue";
import SignUpPage from "@/pages/SignUpPage.vue";
import PlayersPage from "@/pages/PlayersPage.vue";
import SkillsetsMapsPage from "@/pages/SkillsetsMapsPage.vue";
import WorkoutConstructorPage from "@/pages/WorkoutConstructorPage.vue";
import TrainingsPage from "@/pages/TrainingsPage.vue";
import TournamentsPage from "@/pages/TournamentsPage.vue";
import BountiesPage from "@/pages/BountiesPage.vue";
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
      path: "/players",
      name: "players",
      component: PlayersPage,
    },
    {
      path: "/skillsets-maps",
      name: "skillsets-maps",
      component: SkillsetsMapsPage,
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
      path: "/bounties",
      name: "bounties",
      component: BountiesPage,
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
  } else {
    next();
  }
});

export default router;
