import { watch, onMounted, onUnmounted } from "vue";
import { hexToRgbString, getContrastInfo } from "@/utils";

export default function useProfileTheme(
  themeColorGetter: () => string | null | undefined
) {
  const solidVariables = [
    "--color-btn-bg",
    "--color-vuetify-switch",
    "--color-vuetify-toggle",
    "--color-vuetify-progress",
    "--color-date-picker-header",
    "--color-time-picker-header",
    "--color-scrollbar-thumb",
  ];
  const mutedSolidVariables = [
    "--color-header",
    "--color-footer",
    "--color-theme-slider-dark",
    "--color-theme-slider-light",
  ];
  const mix8Variables = [
    "--color-table-solid-bg",
    "--color-vuetify-table-borders",
    "--color-modal-bg",
    "--color-burger-menu-bg",
    "--color-dropdown-bg",
  ];
  const mix14Variables = ["--color-table-hover-solid-bg"];
  const rgba5Variables = [
    "--color-tabs-bg",
    "--color-user-card-bg",
    "--color-auth-form-bg",
    "--color-text-area-bg",
    "--color-db-score-bg",
  ];
  const rgba8Variables = ["--color-score-row-bg"];
  const rgba14Variables = ["--color-score-hover"];
  const rgba25Variables = ["--color-skeleton-bg"];
  const rgba30Variables = [
    "--color-radar-bg",
    "--color-hoverable-bottom-border",
    "--color-theme-border",
  ];

  const applyTheme = (rawHexColor: string | null | undefined) => {
    const root = document.documentElement;

    if (rawHexColor) {
      const hexColor = rawHexColor.substring(0, 7);

      const { isLight, isExtremelyLight, isExtremelyDark } =
        getContrastInfo(hexColor);
      root.style.setProperty(
        "--color-btn-text",
        isLight ? "#000000" : "#ffffff"
      );

      let radarBorderColor = hexColor;
      if (isExtremelyLight) radarBorderColor = "#aaaaaa";
      if (isExtremelyDark) radarBorderColor = "#666666";
      root.style.setProperty("--color-radar-border", radarBorderColor);

      solidVariables.forEach((v) =>
        root.style.setProperty(
          v,
          `color-mix(in srgb, ${hexColor} 75%, var(--color-global-bg-base))`
        )
      );
      mutedSolidVariables.forEach((v) =>
        root.style.setProperty(
          v,
          `color-mix(in srgb, ${hexColor} 50%, var(--color-global-bg-base))`
        )
      );
      root.style.setProperty(
        "--color-global-bg",
        `color-mix(in srgb, ${hexColor} 5%, var(--color-global-bg-base))`
      );
      mix8Variables.forEach((v) =>
        root.style.setProperty(
          v,
          `color-mix(in srgb, ${hexColor} 8%, var(--color-global-bg-base))`
        )
      );
      mix14Variables.forEach((v) =>
        root.style.setProperty(
          v,
          `color-mix(in srgb, ${hexColor} 14%, var(--color-global-bg-base))`
        )
      );

      const rgbString = hexToRgbString(hexColor);
      if (rgbString) {
        rgba5Variables.forEach((v) =>
          root.style.setProperty(v, `rgba(${rgbString}, 0.05)`)
        );
        rgba8Variables.forEach((v) =>
          root.style.setProperty(v, `rgba(${rgbString}, 0.08)`)
        );
        rgba14Variables.forEach((v) =>
          root.style.setProperty(v, `rgba(${rgbString}, 0.14)`)
        );
        rgba25Variables.forEach((v) =>
          root.style.setProperty(v, `rgba(${rgbString}, 0.25)`)
        );
        rgba30Variables.forEach((v) =>
          root.style.setProperty(v, `rgba(${rgbString}, 0.3)`)
        );
      }
    } else {
      const allVariables = [
        ...solidVariables,
        ...mutedSolidVariables,
        ...mix8Variables,
        ...mix14Variables,
        ...rgba5Variables,
        ...rgba8Variables,
        ...rgba14Variables,
        ...rgba25Variables,
        ...rgba30Variables,
        "--color-global-bg",
        "--color-btn-text",
        "--color-radar-border",
      ];
      allVariables.forEach((v) => root.style.removeProperty(v));
    }
  };

  watch(themeColorGetter, (newColor) => applyTheme(newColor));

  onMounted(() => applyTheme(themeColorGetter()));

  onUnmounted(() => applyTheme(null));
}
