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
              <CategoryBadge :category="OsuMapCategory.nm2" />
              <CategoryBadge :category="OsuMapCategory.nm5" />
              <CategoryBadge :category="OsuMapCategory.dt2" />
              <CategoryBadge :category="OsuMapCategory.nm2" />
              <CategoryBadge :category="OsuMapCategory.nm5" />
              <CategoryBadge :category="OsuMapCategory.dt2" />
              <CategoryBadge :category="OsuMapCategory.nm2" />
              <CategoryBadge :category="OsuMapCategory.nm5" />
              <CategoryBadge :category="OsuMapCategory.dt2" />
              <CategoryBadge :category="OsuMapCategory.nm2" />
              <CategoryBadge :category="OsuMapCategory.nm5" />
              <CategoryBadge :category="OsuMapCategory.dt2" />
              <CategoryBadge :category="OsuMapCategory.nm2" />
              <CategoryBadge :category="OsuMapCategory.nm5" />
              <CategoryBadge :category="OsuMapCategory.dt2" />
              <CategoryBadge :category="OsuMapCategory.nm2" />
              <CategoryBadge :category="OsuMapCategory.nm5" />
              <CategoryBadge :category="OsuMapCategory.dt2" />
              <CategoryBadge :category="OsuMapCategory.nm2" />
              <CategoryBadge :category="OsuMapCategory.nm5" />
              <CategoryBadge :category="OsuMapCategory.dt2" />
            </div>
            <span>Дата начала:</span>
            <span>{{ "20.12.2025, 19:00" }}</span>
            <span>Длительность:</span>
            <span>2 ч 30 мин</span>
            <span>Описание:</span>
            <p class="training-card__training-description">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Facilis
              qui voluptatem numquam neque modi debitis fugit, voluptatum
              assumenda nostrum dignissimos, magnam veritatis quidem natus
              commodi excepturi molestiae quo nam delectus placeat. Harum sint
              corporis et amet atque doloremque consequuntur deleniti ipsam
              neque quidem, tempora exercitationem eveniet ut ratione,
              aspernatur officiis blanditiis id sunt pariatur minus vitae
              veritatis numquam placeat praesentium! Saepe dolore inventore qui
              numquam corporis aut hic porro cupiditate. Facilis exercitationem
              aperiam repudiandae ea asperiores minima, aliquid illo tempore est
              nam saepe eum aliquam temporibus quis quidem fuga natus recusandae
              dolor cupiditate dolore ullam laudantium commodi! Cumque, minus
              sit.
            </p>
            <span>Статус:</span>
            <TrainingStatusBadge :status="TrainingStatus.waiting" />
            <span v-if="true">MP-link:</span>
            <div v-if="true">
              <a
                href="https://osu.ppy.sh/community/matches/119894518"
                target="_blank"
              >
                119894518
              </a>
            </div>
          </div>
          <div class="training-card__btns-wrapper">
            <v-btn
              :disabled="false"
              :loading="false"
              height="50"
              class="training-card__btn"
              @click="() => {}"
            >
              Изменить качалочку
            </v-btn>
            <v-btn
              :disabled="false"
              :loading="false"
              height="50"
              class="training-card__btn"
              @click="() => {}"
            >
              Завершить качалочку
            </v-btn>
          </div>
        </div>
        <v-divider
          class="training-card__horizontal-divider border-opacity-100"
        />
        <v-divider
          vertical
          class="training-card__vertical-divider border-opacity-100"
        />
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
import TrainingStatusBadge from "@/components/TrainingStatusBadge.vue";
import UserCard from "@/components/UserCard.vue";
import { OsuMapCategory, TrainingStatus } from "@/types";
</script>

<style lang="scss" scoped>
.training-card {
  border-radius: 10px;
  &__panel-header-wrapper {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    @media (max-width: $phone-l) {
      flex-direction: column;
      align-items: flex-start;
    }
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
      margin-right: 10px;
      font-size: 20px;
      line-height: 20px;
    }
    @media (max-width: $phone-l) {
      margin-right: 5px;
      font-size: 16px;
      line-height: 16px;
    }
  }
  &__info-wrapper {
    padding: 10px;
    display: flex;
    gap: 10px;
    @media (max-width: $tablet-l) {
      padding: 5px;
      flex-direction: column;
    }
  }
  &__training-info-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 10px;
  }
  &__horizontal-divider {
    display: none;
    @media (max-width: $tablet-l) {
      display: block;
    }
  }
  &__vertical-divider {
    display: block;
    @media (max-width: $tablet-l) {
      display: none;
    }
  }
  &__training-details-wrapper {
    display: grid;
    grid-template-columns: 140px auto;
    gap: 10px;
    :nth-child(odd) {
      justify-self: end;
      text-align: end;
    }
    @include default-text(20px, 20px, var(--color-text));
    @media (max-width: $tablet-l) {
      grid-template-columns: 115px auto;
      font-size: 16px;
      line-height: 16px;
    }
    @media (max-width: $phone-l) {
      grid-template-columns: 100px auto;
      font-size: 14px;
      line-height: 14px;
    }
    @media (max-width: $phone-m) {
      grid-template-columns: repeat(1, 1fr);
      justify-items: center;
      :nth-child(odd) {
        justify-self: center;
        text-align: center;
      }
    }
  }
  &__training-description {
    padding: 5px;
    height: 150px;
    overflow: auto;
    background-color: var(--color-text-area-bg);
  }
  &__categories-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    @media (max-width: $phone-m) {
      justify-content: center;
    }
  }
  &__btns-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  &__btn {
    @include default-btn(100%, var(--color-btn-text), var(--color-btn-bg), 0);
    @media (max-width: $phone-l) {
      font-size: 12px;
      line-height: 12px;
    }
    @media (max-width: $phone-m) {
      font-size: 10px;
      line-height: 10px;
    }
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
