export default {
  obj: {

    defaults: {
      language: 'en',
      units: 'M',
      tags: 'summer,day',
    },

    languagesCodes: {
      en: 'en-US',
      ru: 'ru-RU',
      be: 'be-BY',
    },

    placeholderText: {
      en: 'Search city...',
      ru: 'Искать город...',
      be: 'Шукаць горад...',
    },

    translations: {
      weekdays: {
        full: [
          'нядзеля',
          'панядзелак',
          'аўторак',
          'серада',
          'чацвер',
          'пятніца',
          'субота',
        ],
        short: [
          'нд',
          'пн',
          'аў',
          'ср',
          'чц',
          'пт',
          'сб',
        ]
      },
      monthes: {
        full: [
          'студзеня',
          'лютага',
          'сакавіка',
          'красавіка',
          'мая',
          'чэрвеня',
          'ліпеня',
          'жніўня',
          'верасня',
          'кастрычніка',
          'лістапада',
          'снежні',
        ],
      }
    },

    serviceText: {
      en: {
        feels: 'Feels like',
        wind: 'Wind',
        humidity: 'Humidity',
        vel: {
          M: 'm/s',
          I: 'mph',
        },
        latitude: 'latitude',
        longitude: 'longitude',
      },
      ru: {
        feels: 'По ощущению',
        wind: 'Ветер',
        humidity: 'Влажность',
        vel: {
          M: 'м/с',
          I: 'м/ч',
        },
        latitude: 'широта',
        longitude: 'долгота',
      },
      be: {
        feels: 'АДЧУВАЕЦЦА ЯК',
        wind: 'ВЕЦЕР',
        humidity: 'ВІЛЬГОТНАСЦЬ',
        vel: {
          M: 'м/с',
          I: 'м/ч',
        },
        latitude: 'Шырата',
        longitude: 'Даўгата',
      },
    },

    // containers selectors
    loaderSelector: '.loader',
    langsContainer: '.button__lang',
    langsMenu: '.lang__alllangs',
    unitsContainer: '.button__temp',
    reloadButton: '.button__reload',
    searchButton: '.search__button',
    searchInput: '.search__input input',
    errorContainer: '.error__block',
    cityContainer: '.city',
    dateContainer: '.date',
    tempNowContainer: '.today__temperature',
    overcastContainer: '.overcast',
    feelsContainer: '.feels',
    windContainer: '.wind',
    humidityContainer: '.humidity',
    daysContainer: '.weather__3days',
    dayContainer: '.weather__tomorrow',
    dayTempContainer: '.temperature__value',
    dayNameContainer: '.weekday__name',
    mapContainer: '.location__map',
    latitudeContainer: '.latitude',
    longitudeContainer: '.longitude',

    unitsObj: {
      container: '.button__temp',
      spec: '.temptype',
      data: 'units',
    },

    langObj: {
      container: '.button__lang',
      spec: '.alllangs',
      data: 'lang',
      value: '.lang__value',
    },

    // errors
    errors: {
      userGeoLocationError: { // ошибка ipinfo.io
        en: `Could not locate you. Please try again later.`,
        ru: `Не удалось определить ваше местоположение. Пожалуйста, попробуйте позже`,
        be: `Не атрымалася вызначыць ваша месцазнаходжанне. Калі ласка, паспрабуйце пазней`,
      },

      userCityError: { // ошибка opencage
        en: `Error retrieving city data`,
        ru: `Ошибка при получении данных о населенном пункте`,
        be: `Памылка пры атрыманні дадзеных аб населеным пункце`,
      },

      noCityFound: { // пустой results от opencage
        en: `There aren't cities. Please, fix search phrase`,
        ru: `По вашему запросу ничего не найдено. Пожалуйста, исправьте запрос`,
        be: `Па вашаму запыту нічога не знойдзена, калі ласка, выпраўце запыт`,
      },

      noWeatherFound: { // статус 204 от weatherbit
        en: `There isn't weather data for the city. Please, fix search phrase`,
        ru: `По вашему запросу нет данных о погоде. Пожалуйста, исправьте запрос`,
        be: `Па вашаму запыту няма дадзеных пра надвор'е. Калі ласка, выпраўце запыт`,
      },

      imgApiError: { // ошибка от Flickr
        en: `Error getting picture`,
        ru: `Ошибка при получении картинки`,
        be: `Памылка пры атрыманні карцінкі`,
      }
    },

    // css
    opacityStyle: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%,rgba(0,0,0,0.6) 100%)',
  },
};
