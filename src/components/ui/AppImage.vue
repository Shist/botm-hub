<template>
  <div>
    <div
      v-if="currImgState === 'loading' && showSkeleton"
      class="img-skeleton"
      :class="{ 'avatar-img': isAvatar }"
    >
      <img
        v-if="!isAvatar"
        src="@/assets/images/img-loading.png"
        alt="Изображение загружается"
        class="img-skeleton__img-loading-icon"
      />
    </div>
    <img
      v-show="currImgState === 'loaded'"
      :src="imgSrc"
      :alt="imgAlt"
      class="main-img"
      :class="{ 'avatar-img': isAvatar }"
      @load="handleImageSrcLoad"
      @error="handleImageSrcError"
    />
    <div v-if="currImgState === 'error'" class="img-error">
      <img
        src="@/assets/images/img-error.png"
        alt="Ошибка при загрузке изображения"
        class="img-error__icon"
        :class="{ 'avatar-img': isAvatar }"
      />
      <span v-if="!isAvatar" class="img-error__message">
        Во время загрузки изображения произошла ошибка
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref, onMounted, onUnmounted, watch } from "vue";

const props = defineProps<{
  imgPath: string;
  imgAlt: string;
  isAvatar?: boolean;
}>();

const currImgState = ref("loading");
const imgSrc: Ref<string | undefined> = ref(undefined);
const showSkeleton = ref(false);
let skeletonTimeout: ReturnType<typeof setTimeout> | null = null;

const handleImageSrcLoad = () => {
  currImgState.value = "loaded";
};

const handleImageSrcError = () => {
  if (imgSrc.value) {
    currImgState.value = "error";
  }
};

const initLoading = (newSrc: string) => {
  if (!newSrc) return;

  imgSrc.value = newSrc;
  currImgState.value = "loading";
  showSkeleton.value = false;

  if (skeletonTimeout) clearTimeout(skeletonTimeout);

  skeletonTimeout = setTimeout(() => {
    if (currImgState.value === "loading") {
      showSkeleton.value = true;
    }
  }, 50);
};

onMounted(() => {
  initLoading(props.imgPath);
});

onUnmounted(() => {
  if (skeletonTimeout) clearTimeout(skeletonTimeout);
});

watch(
  () => props.imgPath,
  (newSrc) => {
    if (newSrc) {
      initLoading(newSrc);
    } else {
      if (skeletonTimeout) clearTimeout(skeletonTimeout);
      showSkeleton.value = false;
      currImgState.value = "loading";
    }
  }
);
</script>

<style lang="scss" scoped>
.avatar-img {
  border-radius: 50%;
}
.main-img {
  width: 100%;
  max-width: 100%;
}
.img-skeleton {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--color-skeleton-bg);
  animation: pulse 1.5s ease-in-out infinite;
  &.avatar-img {
    width: 100%;
    height: 100%;
    aspect-ratio: 1 / 1;
    padding: 0;
  }
  &:not(.avatar-img) {
    padding: 20%;
    width: 100%;
  }
  &__img-loading-icon {
    width: 100%;
    &.avatar-img & {
      width: 50%;
      max-height: 100%;
      object-fit: contain;
    }
  }
}
@keyframes pulse {
  0% {
    opacity: 0.8;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 0.8;
  }
}
.img-error {
  align-self: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 20px;
  border-radius: 10px;
  &__icon {
    width: 100%;
    &:not(.avatar-img) {
      max-width: 100px;
    }
  }
  &__message {
    @include default-text(20px, 20px, var(--color-error));
    text-align: center;
    @media (max-width: $tablet-l) {
      font-size: 16px;
      line-height: 16px;
    }
    @media (max-width: $phone-l) {
      font-size: 12px;
      line-height: 12px;
    }
  }
}
</style>
