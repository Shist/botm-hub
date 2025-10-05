import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import { ru } from "vuetify/locale";
import components from "@/plugins/vuetify/components";
import "vuetify/styles";

export default createVuetify({
  components,
  theme: {
    defaultTheme: localStorage.getItem("theme") ?? "dark",
  },
  locale: {
    locale: "ru",
    fallback: "ru",
    messages: { ru },
  },
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
});
