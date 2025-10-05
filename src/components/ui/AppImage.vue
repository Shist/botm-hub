<template>
  <div>
    <div v-if="currImgState === 'loading'" class="img-skeleton">
      <img
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
      @load="handleImageSrcLoad"
      @error="handleImageSrcError"
    />
    <div v-if="currImgState === 'error'" class="img-error">
      <img
        src="@/assets/images/img-error.png"
        alt="Ошибка при загрузке изображения"
        class="img-error__icon"
      />
      <span class="img-error__message">
        Во время загрузки изображения произошла ошибка
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref, onMounted } from "vue";

const props = defineProps<{
  imgPath: string;
  imgAlt: string;
}>();

const currImgState = ref("loading");
const imgSrc: Ref<string | undefined> = ref(undefined);

const handleImageSrcLoad = () => {
  currImgState.value = "loaded";
};

const handleImageSrcError = () => {
  if (imgSrc.value) {
    currImgState.value = "error";
  }
};

onMounted(() => {
  imgSrc.value = props.imgPath;
});
</script>

<style lang="scss" scoped>
.main-img {
  padding: 10px;
  width: 100%;
  max-width: 100%;
}

.img-skeleton {
  padding: 20%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--color-skeleton-bg);
  animation: pulse 1.5s ease-in-out infinite;
  &__img-loading-icon {
    width: 100%;
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
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 10px;
  &__icon {
    width: 100px;
    height: 100px;
    margin-bottom: 20px;
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
