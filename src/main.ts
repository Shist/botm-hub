import { createApp, type App as IApp } from "vue";
import App from "@/App.vue";
import router from "@/router";
import { createPinia } from "pinia";
// import { useAuthStore } from "@/stores/auth";
import { useThemeStore } from "@/stores/theme";
import { type User as IFirebaseUser } from "firebase/auth";
import { onFirebaseAuthStateChanged } from "@/services/firebase";
import appComponents from "@/components/ui";
import Vue3Toasity from "vue3-toastify";
import "vue3-toastify/dist/index.css";

let app: IApp | null = null;

onFirebaseAuthStateChanged((user: IFirebaseUser | null) => {
  if (!app) {
    app = createApp(App);

    Object.keys(appComponents).forEach((name) => {
      const component = appComponents[name];
      if (component) app!.component(name, component);
    });

    app
      .use(router)
      .use(createPinia())
      .use(Vue3Toasity, {
        clearOnUrlChange: false,
        theme: useThemeStore().currTheme,
      })
      .mount("#app");
  }

  if (user) {
    // const { setBaseUserInfo, setUserImportance } = useAuthStore();
    // setBaseUserInfo(user.uid, user.email ?? "");
    // loadUserAccessInfoFromFirbase()
    //   .then((isUserImportant) => {
    //     setUserImportance(isUserImportant);
    //   })
    //   .catch(() => {
    //     setUserImportance("loadingError");
    //   });
  }
});
