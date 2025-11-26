<template>
  <div class="free-slot-card"></div>
</template>

<style lang="scss" scoped>
.free-slot-card {
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    var(--color-free-slot-lines) 10px,
    var(--color-free-slot-lines) 20px
  );
  border-radius: 4px;
}
</style>
