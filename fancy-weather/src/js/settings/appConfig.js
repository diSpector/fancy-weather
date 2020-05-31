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

    // containers selectors
    loaderSelector: '.loader',
    langsContainer: '.button__lang',
    langsMenu: '.lang__alllangs',
    unitsContainer: '.button__temp',
    reloadButton: '.button__reload',
    reloadIcon: '.icon__reload',
    soundButton: '.button__sound',
    searchButton: '.search__button',
    searchInput: '.search__input input',
    micIcon: '.mic',
    errorContainer: '.error__block',
    cityContainer: '.city',
    dateContainer: '.date',
    tempNowContainer: '.today__temperature',
    tempNowIcon: '.info__icon',
    overcastContainer: '.overcast',
    feelsContainer: '.feels',
    windContainer: '.wind',
    humidityContainer: '.humidity',
    daysContainer: '.weather__3days',
    dayContainer: '.weather__tomorrow',
    dayTempContainer: '.temperature__value',
    dayNameContainer: '.weekday__name',
    dayTempIcon: '.temperature__icon',
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

    // css
    opacityStyle: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%,rgba(0,0,0,0.6) 100%)',
  },
};
