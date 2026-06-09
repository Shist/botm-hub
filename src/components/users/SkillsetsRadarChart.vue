<template>
  <div class="skillsets-radar-chart" ref="chartContainer">
    <Radar
      v-if="isReady"
      :key="chartKey"
      :data="chartDataConfig"
      :options="chartOptions"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type TooltipItem,
} from "chart.js";
import { Radar } from "vue-chartjs";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const props = defineProps<{
  points: number[];
  drawPoints?: number[];
  labelName: string;
  maxScale?: number;
  additionalTooltipLines?: (string | string[])[];
}>();

const chartContainer = ref<HTMLElement | null>(null);
const isReady = ref(false);
const chartKey = ref(crypto.randomUUID());

const colorText = ref("#ffffff");
const colorPoints = ref("#ffec8b");
const colorBtnBg = ref("#bb8800");
const colorRadarBorder = ref("#bb8800");
const colorRadarBg = ref("rgba(187, 136, 0, 0.3)");
const colorRadarGrid = ref("rgba(255, 255, 255, 0.15)");
const colorRadarTooltipBg = ref("rgba(24, 24, 24, 0.9)");

const labelColors = ref<string[]>([]);

const chartDataConfig = computed(() => ({
  labels: ["Aim", "Hidden", "Reading", "Tech", "Speed", "Hardrock"],
  datasets: [
    {
      label: props.labelName,
      data: props.drawPoints || props.points,
      backgroundColor: colorRadarBg.value,
      borderColor: colorRadarBorder.value,
      pointBackgroundColor: colorText.value,
      pointBorderColor: colorText.value,
      pointHoverBackgroundColor: colorPoints.value,
      pointHoverBorderColor: colorPoints.value,
      pointHoverRadius: 8,
      borderWidth: 4,
      borderJoinStyle: "round" as const,
    },
  ],
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      min: 0,
      max: props.maxScale || undefined,
      ticks: {
        display: false,
        count: 5,
      },
      grid: {
        color: colorRadarGrid.value,
        circular: true,
      },
      angleLines: {
        color: colorRadarGrid.value,
      },
      pointLabels: {
        font: {
          size: 14,
          family: "Roboto, sans-serif",
          weight: "bold" as const,
        },
        color: (ctx: { index: number }) => {
          return labelColors.value[ctx.index] || colorText.value;
        },
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      filter: (_: unknown, index: number) => index === 0,
      backgroundColor: colorRadarTooltipBg.value,
      titleFont: { size: 14, family: "Roboto, sans-serif" },
      titleColor: colorText.value,
      bodyFont: {
        size: 16,
        family: "Roboto, sans-serif",
        weight: "bold" as const,
      },
      bodyColor: colorPoints.value,
      footerFont: {
        size: 13,
        family: "Roboto, sans-serif",
        weight: "normal" as const,
      },
      footerColor: colorText.value,
      footerMarginTop: 6,
      padding: 12,
      displayColors: false,
      callbacks: {
        label: (context: TooltipItem<"radar">) => {
          const realValue = props.points[context.dataIndex];
          return `${(realValue ?? 0).toFixed(2)} очков`;
        },
        footer: (tooltipItems: TooltipItem<"radar">[]) => {
          const context = tooltipItems[0];
          if (
            context &&
            props.additionalTooltipLines &&
            props.additionalTooltipLines[context.dataIndex]
          ) {
            return props.additionalTooltipLines[context.dataIndex] ?? "";
          }
          return "";
        },
      },
    },
  },
}));

const updateColors = () => {
  if (!chartContainer.value) return;
  const style = getComputedStyle(chartContainer.value);

  const newText = style.getPropertyValue("--color-text").trim() || "#ffffff";
  const newPoints =
    style.getPropertyValue("--color-points").trim() || "#ffec8b";
  const newBtnBg = style.getPropertyValue("--color-btn-bg").trim() || "#bb8800";
  const newRadarBorder =
    style.getPropertyValue("--color-radar-border").trim() || newBtnBg;
  const newRadarBg =
    style.getPropertyValue("--color-radar-bg").trim() ||
    "rgba(187, 136, 0, 0.3)";
  const newRadarGrid =
    style.getPropertyValue("--color-radar-grid").trim() ||
    "rgba(255, 255, 255, 0.15)";
  const newRadarTooltipBg =
    style.getPropertyValue("--color-radar-tooltip-bg").trim() ||
    "rgba(24, 24, 24, 0.9)";

  const newLabelColors = [
    style.getPropertyValue("--color-club-aim").trim(),
    style.getPropertyValue("--color-club-hidden").trim(),
    style.getPropertyValue("--color-club-reading").trim(),
    style.getPropertyValue("--color-club-tech").trim(),
    style.getPropertyValue("--color-club-speed").trim(),
    style.getPropertyValue("--color-club-hardrock").trim(),
  ];

  const isThemeChanged =
    colorText.value !== newText ||
    colorRadarBg.value !== newRadarBg ||
    colorRadarBorder.value !== newRadarBorder;

  colorText.value = newText;
  colorPoints.value = newPoints;
  colorBtnBg.value = newBtnBg;
  colorRadarBorder.value = newRadarBorder;
  colorRadarBg.value = newRadarBg;
  colorRadarGrid.value = newRadarGrid;
  colorRadarTooltipBg.value = newRadarTooltipBg;
  labelColors.value = newLabelColors;

  if (isThemeChanged && isReady.value) {
    chartKey.value = crypto.randomUUID();
  }
};

const triggerUpdate = () => {
  requestAnimationFrame(() => {
    updateColors();
  });
};

let observer: MutationObserver | null = null;

onMounted(() => {
  updateColors();
  isReady.value = true;

  observer = new MutationObserver(triggerUpdate);

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
    subtree: true,
  });
});

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
});
</script>

<style lang="scss" scoped>
.skillsets-radar-chart {
  position: relative;
  width: 100%;
  height: 300px;
  @media (max-width: $phone-m) {
    height: 240px;
  }
  @media (max-width: $phone-s) {
    height: 200px;
  }
}
</style>
