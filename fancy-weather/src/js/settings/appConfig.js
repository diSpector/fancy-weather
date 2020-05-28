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
    langSpec: '.alllangs',
    langValueContainer: '.lang__value',
    unitsContainer: '.button__temp',
    unitSpec: '.temptype',
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

    // errors
    errors: {
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
    },




    // css
    opacityStyle: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%,rgba(0,0,0,0.6) 100%)',

    // omdb: {
    // //   apiKey: 'c3168632',
    //   apiKey: 'e7b6ede6',
    //   apiUrl: 'https://www.omdbapi.com/?',
    // },

    // moviesContainer: '.movies',
    // loaderSelector: '.loader',
    // searchTextContainer: '.search__text',
    // errorTextContainer: '.search__error',
    // glideSelector: '.glide',
    // searchInputId: 'search-input',
    // favoriteContainer: '.favorites',
    // favoriteMoviesContainer: '.favorites__movies',
    // keyboardContainer: '.keyboard',

    // // icons/buttons selectors
    // resetIconSelector: '.close__icon',
    // keyboardIconSelector: '.keyboard__icon',
    // lensIconSelector: '.search__icon',
    // searchButtonIconSelector: '.search__button',
  },
};
