import { createRouter, createWebHistory } from "vue-router";
import MainPage from "@/pages/MainPage.vue";
import SignInPage from "@/pages/SignInPage.vue";
import SignUpPage from "@/pages/SignUpPage.vue";
import PlayersPage from "@/pages/PlayersPage.vue";
import SkillsetsMapsPage from "@/pages/skillsets-maps-pages/SkillsetsMapsPage.vue";
import NM1MapsPage from "@/pages/skillsets-maps-pages/nm/NM1MapsPage.vue";
import NM2MapsPage from "@/pages/skillsets-maps-pages/nm/NM2MapsPage.vue";
import NM3MapsPage from "@/pages/skillsets-maps-pages/nm/NM3MapsPage.vue";
import NM4MapsPage from "@/pages/skillsets-maps-pages/nm/NM4MapsPage.vue";
import NM5MapsPage from "@/pages/skillsets-maps-pages/nm/NM5MapsPage.vue";
import NM6MapsPage from "@/pages/skillsets-maps-pages/nm/NM6MapsPage.vue";
import NM7MapsPage from "@/pages/skillsets-maps-pages/nm/NM7MapsPage.vue";
import HD1MapsPage from "@/pages/skillsets-maps-pages/hd/HD1MapsPage.vue";
import HD2MapsPage from "@/pages/skillsets-maps-pages/hd/HD2MapsPage.vue";
import HD3MapsPage from "@/pages/skillsets-maps-pages/hd/HD3MapsPage.vue";
import HR1MapsPage from "@/pages/skillsets-maps-pages/hr/HR1MapsPage.vue";
import HR2MapsPage from "@/pages/skillsets-maps-pages/hr/HR2MapsPage.vue";
import HR3MapsPage from "@/pages/skillsets-maps-pages/hr/HR3MapsPage.vue";
import DT1MapsPage from "@/pages/skillsets-maps-pages/dt/DT1MapsPage.vue";
import DT2MapsPage from "@/pages/skillsets-maps-pages/dt/DT2MapsPage.vue";
import DT3MapsPage from "@/pages/skillsets-maps-pages/dt/DT3MapsPage.vue";
import DT4MapsPage from "@/pages/skillsets-maps-pages/dt/DT4MapsPage.vue";
import FM1MapsPage from "@/pages/skillsets-maps-pages/fm/FM1MapsPage.vue";
import FM2MapsPage from "@/pages/skillsets-maps-pages/fm/FM2MapsPage.vue";
import FM3MapsPage from "@/pages/skillsets-maps-pages/fm/FM3MapsPage.vue";
import TBMapsPage from "@/pages/skillsets-maps-pages/TBMapsPage.vue";
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
      children: [
        {
          path: "",
          component: SkillsetsMapsPage,
          name: "skillsets-maps",
        },
        {
          path: "nm1",
          component: NM1MapsPage,
          name: "skillsets-maps-nm1",
        },
        {
          path: "nm2",
          component: NM2MapsPage,
          name: "skillsets-maps-nm2",
        },
        {
          path: "nm3",
          component: NM3MapsPage,
          name: "skillsets-maps-nm3",
        },
        {
          path: "nm4",
          component: NM4MapsPage,
          name: "skillsets-maps-nm4",
        },
        {
          path: "nm5",
          component: NM5MapsPage,
          name: "skillsets-maps-nm5",
        },
        {
          path: "nm6",
          component: NM6MapsPage,
          name: "skillsets-maps-nm6",
        },
        {
          path: "nm7",
          component: NM7MapsPage,
          name: "skillsets-maps-nm7",
        },
        {
          path: "hd1",
          component: HD1MapsPage,
          name: "skillsets-maps-hd1",
        },
        {
          path: "hd2",
          component: HD2MapsPage,
          name: "skillsets-maps-hd2",
        },
        {
          path: "hd3",
          component: HD3MapsPage,
          name: "skillsets-maps-hd3",
        },
        {
          path: "hr1",
          component: HR1MapsPage,
          name: "skillsets-maps-hr1",
        },
        {
          path: "hr2",
          component: HR2MapsPage,
          name: "skillsets-maps-hr2",
        },
        {
          path: "hr3",
          component: HR3MapsPage,
          name: "skillsets-maps-hr3",
        },
        {
          path: "dt1",
          component: DT1MapsPage,
          name: "skillsets-maps-dt1",
        },
        {
          path: "dt2",
          component: DT2MapsPage,
          name: "skillsets-maps-dt2",
        },
        {
          path: "dt3",
          component: DT3MapsPage,
          name: "skillsets-maps-dt3",
        },
        {
          path: "dt4",
          component: DT4MapsPage,
          name: "skillsets-maps-dt4",
        },
        {
          path: "fm1",
          component: FM1MapsPage,
          name: "skillsets-maps-fm1",
        },
        {
          path: "fm2",
          component: FM2MapsPage,
          name: "skillsets-maps-fm2",
        },
        {
          path: "fm3",
          component: FM3MapsPage,
          name: "skillsets-maps-fm3",
        },
        {
          path: "tb",
          component: TBMapsPage,
          name: "skillsets-maps-tb",
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
