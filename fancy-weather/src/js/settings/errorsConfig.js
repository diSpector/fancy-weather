export default {
  obj: {
    errors: {
      userGeoLocationError: { // ошибка ipinfo.io
        en: 'Could not locate you. Please try again later.',
        ru: 'Не удалось определить ваше местоположение. Пожалуйста, попробуйте позже',
        be: 'Не атрымалася вызначыць ваша месцазнаходжанне. Калі ласка, паспрабуйце пазней',
      },

      userCityError: { // ошибка opencage
        en: 'Error retrieving city data',
        ru: 'Ошибка при получении данных о населенном пункте',
        be: 'Памылка пры атрыманні дадзеных аб населеным пункце',
      },

      noCityFound: { // пустой results от opencage
        en: 'There aren\'t cities. Please, fix search phrase',
        ru: 'По вашему запросу ничего не найдено. Пожалуйста, исправьте запрос',
        be: 'Па вашаму запыту нічога не знойдзена, калі ласка, выпраўце запыт',
      },

      noWeatherFound: { // статус 204 от weatherbit
        en: 'There isn\'t weather data for the city. Please, fix search phrase',
        ru: 'По вашему запросу нет данных о погоде. Пожалуйста, исправьте запрос',
        be: 'Па вашаму запыту няма дадзеных пра надвор\'е. Калі ласка, выпраўце запыт',
      },

      imgApiError: { // ошибка от Flickr
        en: 'Error getting picture',
        ru: 'Ошибка при получении картинки',
        be: 'Памылка пры атрыманні карцінкі',
      },
    },
  },
};
