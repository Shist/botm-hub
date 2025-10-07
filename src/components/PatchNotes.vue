<template>
  <ul class="patch-notes">
    <li class="patch-notes__patch-wrapper">
      <h3 class="patch-notes__patch-version">Версия 1.1.0</h3>
      <ol class="patch_notes__patch-features-wrapper">
        <li class="patch_notes__patch-feature">
          Высота таблиц с картами теперь адаптируется под доступную высоту
          страницы браузера устройства (ранее она была захардкожена в 425
          пикселей)
        </li>
        <li class="patch_notes__patch-feature">
          Добавлены значения минимальной ширины столбцов для таблиц с картами,
          теперь колонки никогда не перекрывают друг друга (включая иконки
          сортировки), при этом они полностью видны на вьюпортах full hd (1920
          пикселей), начиная с 1903 пикселей ширины экрана и меньше появляется
          горизонтальный ползунок, позволяющий смотреть не вмещающуюся таблицу
          вширь
        </li>
        <li class="patch_notes__patch-feature">
          Начиная с 768 пикселей и меньше (планшеты и телефоны) таблицы с
          картами адаптируются под свою мобильную версию, позволяя удобно
          смотреть карты с мобильных устройств
        </li>
      </ol>
    </li>
    <li class="patch-notes__patch-wrapper">
      <h3 class="patch-notes__patch-version">Версия 1.0.0</h3>
      <ol class="patch_notes__patch-features-wrapper">
        <li class="patch_notes__patch-feature">Создан проект</li>
        <li class="patch_notes__patch-feature">
          Добавлены все необходимые зависимости и настроены конфиги
        </li>
        <li class="patch_notes__patch-feature">
          Заранее подготовлены глобальные компоненты (картинки, модальные окна,
          спиннеры, переключатели)
        </li>
        <li class="patch_notes__patch-feature">
          Подготовлены стили и цвета для всего приложения, а также светлая и
          тёмная темы
        </li>
        <li class="patch_notes__patch-feature">
          Подготовлен роутер со всеми планируемыми страницами (главная,
          авторизация, регистрация, игроки, карты скиллсетов (21 скиллсет),
          конструктор тренировки, расписания качалочек, турниры и ростеры,
          баунти, 404 страница)
        </li>
        <li class="patch_notes__patch-feature">
          Реализована возможность авторизации/регистрации (пока не обязательно и
          ничего не даёт), где нужно указать почту (по которой если что можно
          сбросить пароль), пароль, а также osu! ник (будет использоваться в
          будущем)
        </li>
        <li class="patch_notes__patch-feature">
          Добавлено модальное окно, появляющееся при каждом новом патче,
          показывающее список последних обновлений
        </li>
        <li class="patch_notes__patch-feature">
          На страницах скиллсетов карт реализована таблица, которая динамически
          подгружает карты с базы данных, в которой можно сортировать и
          фильтровать карты (подгруженные карты кэшируются до обновления
          страницы, чтобы при переходе между разделами не нужно было подгружать
          их снова)
        </li>
        <li class="patch_notes__patch-feature">
          Обработаны сценарии ожидания загрузки данных, а также ошибочные
          сценарии
        </li>
        <li class="patch_notes__patch-feature">
          Добавлена возможность скопировать ID карты из таблицы в один клик
        </li>
        <li class="patch_notes__patch-feature">
          Добавлен компонент (а также написан запрос в базу), позволяющий быстро
          загружать в базу готовый список карт с помощью JSON-объектов
          (используется только в режиме разработки)
        </li>
        <li class="patch_notes__patch-feature">
          Приложение задеплоено на домен `https://botm-hub.web.app`
        </li>
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
