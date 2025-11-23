<template>
  <v-expansion-panel class="training-card">
    <template #title>
      <div class="training-card__panel-header-wrapper">
        <div class="training-card__titles-wrapper">
          <h3 class="training-card__training-name">
            Самая лучшая качалочка в мире
          </h3>
          <h4 class="training-card__trainer">Тренер: {{ "Shist" }}</h4>
        </div>
        <span class="training-card__time-label">00:32:17</span>
      </div>
    </template>
    <template #text>
      <v-divider class="border-opacity-100" />
      <div class="training-card__info-wrapper">
        <div class="training-card__training-info-wrapper">
          <div class="training-card__training-details-wrapper">
            <span>Скиллсеты:</span>
            <div class="training-card__categories-wrapper">
              <CategoryBadge :category="'nm2'" />
              <CategoryBadge :category="'nm5'" />
              <CategoryBadge :category="'dt2'" />
            </div>
            <span>Дата начала:</span>
            <span>{{ "20.12.2025, 19:00" }}</span>
            <span>Длительность:</span>
            <span>2 часа 30 минут</span>
            <span>Описание:</span>
            <p>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quisquam
              libero ratione iste distinctio consectetur natus temporibus
              nesciunt maiores voluptatem! Inventore.
            </p>
            <span>Статус:</span>
            <span>[Ожидается]</span>
            <span v-if="true">MP-link:</span>
            <span v-if="true">(не прикреплена)</span>
          </div>
          <div class="training-card__btns-wrapper">
            <v-btn
              :disabled="false"
              :loading="false"
              height="50"
              class="training-card__btn"
              @click="() => {}"
            >
              Изменить тренировку
            </v-btn>
            <v-btn
              :disabled="false"
              :loading="false"
              height="50"
              class="training-card__btn"
              @click="() => {}"
            >
              Завершить тренировку
            </v-btn>
          </div>
        </div>
        <v-divider vertical class="border-opacity-100" />
        <div class="training-card__players-info-wrapper">
          <h4 class="training-card__players-title">Участники (16/16):</h4>
          <ul class="training-card__players-list">
            <UserCard :osuId="'12772663'" :nick="'Shist'" />
            <UserCard :osuId="'12772663'" :nick="'Shist'" />
            <UserCard :osuId="'12772663'" :nick="'Shist'" />
            <UserCard :osuId="'12772663'" :nick="'Shist'" />
            <UserCard :osuId="'12772663'" :nick="'Shist'" />
            <UserCard :osuId="'12772663'" :nick="'Shist'" />
            <UserCard :osuId="'12772663'" :nick="'Shist'" />
            <UserCard :osuId="'12772663'" :nick="'Shist'" />
            <UserCard :osuId="'12772663'" :nick="'Shist'" />
            <UserCard :osuId="'12772663'" :nick="'Shist'" />
            <UserCard :osuId="'12772663'" :nick="'Shist'" />
            <UserCard :osuId="'12772663'" :nick="'Shist'" />
            <UserCard :osuId="'12772663'" :nick="'Shist'" />
            <UserCard :osuId="'12772663'" :nick="'Shist'" />
            <UserCard :osuId="'12772663'" :nick="'Shist'" />
            <UserCard :osuId="'12772663'" :nick="'Shist'" />
          </ul>
          <v-btn
            :disabled="false"
            :loading="false"
            height="50"
            class="training-card__btn"
            @click="() => {}"
          >
            Записаться
          </v-btn>
        </div>
      </div>
    </template>
  </v-expansion-panel>
</template>

<script lang="ts" setup>
import CategoryBadge from "@/components/CategoryBadge.vue";
import UserCard from "@/components/UserCard.vue";
</script>

<style lang="scss" scoped>
.training-card {
  border-radius: 10px;
  &__panel-header-wrapper {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  &__titles-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  &__training-name {
    @include default-headline(36px, 36px, var(--color-text));
    @media (max-width: $tablet-l) {
      font-size: 28px;
      line-height: 28px;
    }
    @media (max-width: $phone-l) {
      font-size: 20px;
      line-height: 20px;
    }
  }
  &__trainer {
    @include default-text(24px, 24px, var(--color-text));
    @media (max-width: $tablet-l) {
      font-size: 20px;
      line-height: 20px;
    }
    @media (max-width: $phone-l) {
      font-size: 16px;
      line-height: 16px;
    }
  }
  &__time-label {
    margin-right: 20px;
    @include default-text(24px, 24px, var(--color-text));
    @media (max-width: $tablet-l) {
      font-size: 20px;
      line-height: 20px;
    }
    @media (max-width: $phone-l) {
      font-size: 16px;
      line-height: 16px;
    }
  }
  &__info-wrapper {
    padding: 10px;
    display: flex;
    gap: 10px;
  }
  &__training-info-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 10px;
  }
  &__training-details-wrapper {
    display: grid;
    align-items: center;
    grid-template-columns: 120px auto;
    gap: 10px;
    :nth-child(odd) {
      justify-self: end;
      text-align: end;
    }
  }
  &__categories-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  &__btns-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  &__btn {
    @include default-btn(100%, var(--color-btn-text), var(--color-btn-bg), 0);
  }
  &__players-info-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .training-card__players-title {
    @include default-headline(24px, 24px, var(--color-text));
    @media (max-width: $tablet-l) {
      font-size: 20px;
      line-height: 20px;
    }
    @media (max-width: $phone-l) {
      font-size: 16px;
      line-height: 16px;
    }
  }
  .training-card__players-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(8, 1fr);
    gap: 10px;
    @media (max-width: $pc-s) {
      grid-template-columns: repeat(1, 1fr);
      grid-template-rows: repeat(8, 1fr);
    }
    @include default-text(20px, 20px, var(--color-text));
    @media (max-width: $tablet-l) {
      font-size: 16px;
      line-height: 16px;
    }
    @media (max-width: $phone-l) {
      font-size: 14px;
      line-height: 14px;
    }
  }
}
</style>
