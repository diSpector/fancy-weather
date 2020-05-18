export default {
  obj: {
    // apis
    yaTranslateApiUrl: 'https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20200322T155651Z.de98a60e6a99185e.089aea4237b51c6db082c966f27a7895cd1e8b44&',
    omdb: {
    //   apiKey: 'c3168632',
      apiKey: 'e7b6ede6',
      apiUrl: 'https://www.omdbapi.com/?',
    },

    // containers selectors
    moviesContainer: '.movies',
    loaderSelector: '.loader',
    searchTextContainer: '.search__text',
    errorTextContainer: '.search__error',
    glideSelector: '.glide',
    searchInputId: 'search-input',
    favoriteContainer: '.favorites',
    favoriteMoviesContainer: '.favorites__movies',
    keyboardContainer: '.keyboard',

    // icons/buttons selectors
    resetIconSelector: '.close__icon',
    keyboardIconSelector: '.keyboard__icon',
    lensIconSelector: '.search__icon',
    searchButtonIconSelector: '.search__button',
  },
};
