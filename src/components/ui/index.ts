import { type Component } from "vue";
import AppImage from "@/components/ui/AppImage.vue";
import AppModal from "@/components/ui/AppModal.vue";
import AppSpinner from "@/components/ui/AppSpinner.vue";
import AppSwitcher from "@/components/ui/AppSwitcher.vue";

export default {
  AppImage,
  AppModal,
  AppSpinner,
  AppSwitcher,
} as {
  [key: string]: Component;
};
