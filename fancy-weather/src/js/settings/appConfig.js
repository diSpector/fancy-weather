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

    serviceText: {
      en: {
        feels: 'Feels like',
        wind: 'Wind',
        humidity: 'Humidity',
        vel: 'm/s',
        latitude: 'latitude',
        longitude: 'longitude',
      },
      ru: {
        feels: 'По ощущению',
        wind: 'Ветер',
        humidity: 'Влажность',
        vel: 'м/с',
        latitude: 'широта',
        longitude: 'долгота',
      },
      be: {
        feels: 'АДЧУВАЕЦЦА ЯК',
        wind: 'ВЕЦЕР',
        humidity: 'ВІЛЬГОТНАСЦЬ',
        vel: 'м/с',
        latitude: 'Шырата',
        longitude: 'Даўгата',
      },
    },

    // containers selectors
    reloadButton: '.button__reload',
    searchButton: '.search__button',
    searchInput: '.search__input input',
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
