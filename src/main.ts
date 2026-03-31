import { createApp } from "vue";
import App from "@/App.vue";
import router from "@/router";
import { createPinia } from "pinia";
import "@mdi/font/css/materialdesignicons.css";
import "@/styles/reset.css";
import "vuetify/styles";
import "vue3-toastify/dist/index.css";
import { useAuthStore } from "@/stores/auth";
import { useThemeStore } from "@/stores/theme";
import { onFirebaseAuthStateChanged } from "@/services/firebase/config";
import { loadUserInfoFromFirebase } from "@/services/firebase/users";
import appComponents from "@/components/ui";
import vuetifyConfig from "@/plugins/vuetify";
import Vue3Toasity from "vue3-toastify";

const app = createApp(App);
const pinia = createPinia();

Object.keys(appComponents).forEach((name) => {
  const component = appComponents[name];
  if (component) app.component(name, component);
});

app.use(pinia);
app.use(router);
app.use(vuetifyConfig);
app.use(Vue3Toasity, {
  clearOnUrlChange: false,
  theme: useThemeStore().currTheme,
});

let isMounted = false;

onFirebaseAuthStateChanged((user) => {
  const authStore = useAuthStore();

  if (user) {
    authStore.setBaseUserInfo(user.uid, user.email ?? "");
    loadUserInfoFromFirebase()
      .then((userInfo) => {
        authStore.setAdditionalUserInfo(userInfo);
      })
      .catch(() => {
        authStore.setAdditionalUserInfo("loadingError");
      });
  } else {
    authStore.user = null;
  }

  if (!isMounted) {
    isMounted = true;
    app.mount("#app");
  }
});
