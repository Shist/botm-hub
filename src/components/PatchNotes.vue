<template>
  <ul class="patch-notes">
    <li class="patch-notes__patch-wrapper">
      <h3 class="patch-notes__patch-version">Версия 1.0.0</h3>
      <ol class="patch_notes__patch-features-wrapper">
        <li class="patch_notes__patch-feature">Создан проект</li>
        <li class="patch_notes__patch-feature">TODO #2...</li>
        <li class="patch_notes__patch-feature">TODO #3...</li>
      </ol>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.patch-notes {
  padding: 5px;
  display: flex;
  flex-direction: column;
  row-gap: 20px;
  &__patch-wrapper {
    .patch-notes__patch-version {
      @include default-headline(32px, 32px, var(--color-modal-text));
      margin-bottom: 10px;
      @media (max-width: $tablet-l) {
        font-size: 20px;
        line-height: 20px;
      }
    }
    .patch_notes__patch-features-wrapper {
      display: flex;
      flex-direction: column;
      row-gap: 10px;
      list-style-type: decimal;
      list-style-position: inside;
      .patch_notes__patch-feature {
        @include default-text(16px, 16px, var(--color-burger-menu-text));
        @media (max-width: $tablet-l) {
          font-size: 12px;
          line-height: 12px;
        }
      }
    }
  }
}
</style>
