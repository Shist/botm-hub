<template>
  <div class="skillsets-maps-page">
    <h2 class="skillsets-maps-page__headline">Мапы Скиллсетов</h2>
    <nav>
      <ul class="skillsets-maps-page__links-list">
        <li>
          <router-link
            to="/skillsets-maps/nm1"
            class="skillsets-maps-page__btn skillsets-maps-page__btn_nm1"
          >
            NM1 (Raw Aim)
          </router-link>
        </li>
        <li>
          <router-link
            to="/skillsets-maps/nm2"
            class="skillsets-maps-page__btn skillsets-maps-page__btn_nm2"
          >
            NM2 (Flow Tapping)
          </router-link>
        </li>
        <li>
          <router-link
            to="/skillsets-maps/nm3"
            class="skillsets-maps-page__btn skillsets-maps-page__btn_nm3"
          >
            NM3 (Alternate)
          </router-link>
        </li>
        <li>
          <router-link
            to="/skillsets-maps/nm4"
            class="skillsets-maps-page__btn skillsets-maps-page__btn_nm4"
          >
            NM4 (Technical)
          </router-link>
        </li>
        <li>
          <router-link
            to="/skillsets-maps/nm5"
            class="skillsets-maps-page__btn skillsets-maps-page__btn_nm5"
          >
            NM5 (Finger Control)
          </router-link>
        </li>
        <li>
          <router-link
            to="/skillsets-maps/nm6"
            class="skillsets-maps-page__btn skillsets-maps-page__btn_nm6"
          >
            NM6 (Reading)
          </router-link>
        </li>
        <li>
          <router-link
            to="/skillsets-maps/nm7"
            class="skillsets-maps-page__btn skillsets-maps-page__btn_nm7"
          >
            NM7 (Polyrhythm)
          </router-link>
        </li>
        <li>
          <router-link
            to="/skillsets-maps/hd1"
            class="skillsets-maps-page__btn skillsets-maps-page__btn_hd1"
          >
            HD1 (Consistency)
          </router-link>
        </li>
        <li>
          <router-link
            to="/skillsets-maps/hd2"
            class="skillsets-maps-page__btn skillsets-maps-page__btn_hd2"
          >
            HD2 (Low AR)
          </router-link>
        </li>
        <li>
          <router-link
            to="/skillsets-maps/hd3"
            class="skillsets-maps-page__btn skillsets-maps-page__btn_hd3"
          >
            HD3 (Technical)
          </router-link>
        </li>
        <li>
          <router-link
            to="/skillsets-maps/hr1"
            class="skillsets-maps-page__btn skillsets-maps-page__btn_hr1"
          >
            HR1 (Consistency)
          </router-link>
        </li>
        <li>
          <router-link
            to="/skillsets-maps/hr2"
            class="skillsets-maps-page__btn skillsets-maps-page__btn_hr2"
          >
            HR2 (High CS)
          </router-link>
        </li>
        <li>
          <router-link
            to="/skillsets-maps/hr3"
            class="skillsets-maps-page__btn skillsets-maps-page__btn_hr3"
          >
            HR3 (Technical)
          </router-link>
        </li>
        <li>
          <router-link
            to="/skillsets-maps/dt1"
            class="skillsets-maps-page__btn skillsets-maps-page__btn_dt1"
          >
            DT1 (Consistency)
          </router-link>
        </li>
        <li>
          <router-link
            to="/skillsets-maps/dt2"
            class="skillsets-maps-page__btn skillsets-maps-page__btn_dt2"
          >
            DT2 (High BPM)
          </router-link>
        </li>
        <li>
          <router-link
            to="/skillsets-maps/dt3"
            class="skillsets-maps-page__btn skillsets-maps-page__btn_dt3"
          >
            DT3 (Technical)
          </router-link>
        </li>
        <li>
          <router-link
            to="/skillsets-maps/dt4"
            class="skillsets-maps-page__btn skillsets-maps-page__btn_dt4"
          >
            DT4 (Old Mapping)
          </router-link>
        </li>
        <li>
          <router-link
            to="/skillsets-maps/fm1"
            class="skillsets-maps-page__btn skillsets-maps-page__btn_fm1"
          >
            FM1 (Consistency)
          </router-link>
        </li>
        <li>
          <router-link
            to="/skillsets-maps/fm2"
            class="skillsets-maps-page__btn skillsets-maps-page__btn_fm2"
          >
            FM2 (Antimod)
          </router-link>
        </li>
        <li>
          <router-link
            to="/skillsets-maps/fm3"
            class="skillsets-maps-page__btn skillsets-maps-page__btn_fm3"
          >
            FM3 (Technical)
          </router-link>
        </li>
        <li>
          <router-link
            to="/skillsets-maps/tb"
            class="skillsets-maps-page__btn skillsets-maps-page__btn_tb"
          >
            TB (Long Consistency)
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
.skillsets-maps-page {
  &__headline {
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
  &__links-list {
    padding: 30px;
    display: flex;
    flex-direction: column;
    row-gap: 20px;
    li {
      display: flex;
    }
  }
  &__btn {
    position: relative;
    text-decoration: none;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 15px;
    font-family: $font-roboto;
    font-weight: 700;
    font-size: 28px;
    line-height: 28px;
    text-align: center;
    color: var(--color-btn-text);
    border-radius: 10px;
    border: none;
    cursor: pointer;
    transition: 0.3s;
    &:hover {
      box-shadow: 4px 4px 4px 0 rgba(0, 0, 0, 0.2);
    }
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 10px;
      background: linear-gradient(
        175deg,
        rgba(255, 255, 255, 0.4) 0,
        rgba(255, 255, 255, 0) 100%
      );
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }
    &:hover::before {
      opacity: 1;
    }
    @media (max-width: $phone-l) {
      font-size: 20px;
      line-height: 20px;
    }
    &_nm1 {
      background-color: var(--color-btn-bg-nm1);
    }
    &_nm2 {
      background-color: var(--color-btn-bg-nm2);
    }
    &_nm3 {
      background-color: var(--color-btn-bg-nm3);
    }
    &_nm4 {
      background-color: var(--color-btn-bg-nm4);
    }
    &_nm5 {
      background-color: var(--color-btn-bg-nm5);
    }
    &_nm6 {
      background-color: var(--color-btn-bg-nm6);
    }
    &_nm7 {
      background-color: var(--color-btn-bg-nm7);
    }
    &_hd1 {
      background-color: var(--color-btn-bg-hd1);
    }
    &_hd2 {
      background-color: var(--color-btn-bg-hd2);
    }
    &_hd3 {
      background-color: var(--color-btn-bg-hd3);
    }
    &_hr1 {
      background-color: var(--color-btn-bg-hr1);
    }
    &_hr2 {
      background-color: var(--color-btn-bg-hr2);
    }
    &_hr3 {
      background-color: var(--color-btn-bg-hr3);
    }
    &_dt1 {
      background-color: var(--color-btn-bg-dt1);
    }
    &_dt2 {
      background-color: var(--color-btn-bg-dt2);
    }
    &_dt3 {
      background-color: var(--color-btn-bg-dt3);
    }
    &_dt4 {
      background-color: var(--color-btn-bg-dt4);
    }
    &_fm1 {
      background-color: var(--color-btn-bg-fm1);
    }
    &_fm2 {
      background-color: var(--color-btn-bg-fm2);
    }
    &_fm3 {
      background-color: var(--color-btn-bg-fm3);
    }
    &_tb {
      background-color: var(--color-btn-bg-tb);
    }
  }
}
</style>
