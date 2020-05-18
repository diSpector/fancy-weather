import Slider from './slider';
import KeyboardModule from './keyboard/keyboard_module';
import moduleConfig from './keyboard/settings/moduleConfig';
import keysConfig from './keyboard/settings/keysConfig';

// import dummyImg from '../../img/dummy.jpg'; // для webpack

export default class App {
  constructor(appConfig, glideConfig) {
    this.appConfig = appConfig;
    this.glideConfig = glideConfig;
    this.slider = null;
    this.movies = [];
    this.page = 1; // текущая страница с результатами от API
    this.lastError = null; // последняя ошибка API
    this.searchPhrase = null; // последняя поисковая фраза
    this.searchEng = true; // флаг - поисковая фраза на английском языке
    this.favorites = [];
  }

  init() { // первоначальный рендеринг - слайдер + слушатели событий
    this.loadFavorites();
    this.renderMovies();
    this.focusInput();
    this.renderFavorites();
    this.renderKeyboard();
    this.addListeners();
  }

  loadFavorites() { // загрузить избранное из LocalStorage
    this.favorites = JSON.parse(localStorage.getItem('dsFavoriteMovies')) || [];
  }

  saveFavorites() { // сохранить избранное в LocalStorage
    localStorage.setItem('dsFavoriteMovies', JSON.stringify(this.favorites));
  }

  renderMovies() { // отрендерить фильмы
    this.enableLoader();
    const movies = this.getMovies();
    movies.then((movs) => {
      this.resetSlider();
      this.movies = movs;
      this.showResultsText();
      return (movs && !this.isNullsAmongMovs(movs)) ? this.initSlider(movs) : this.disableLoader();
    })
      .catch((e) => this.processError(e, 'Something went wrong while slider mounting'));
  }

  isNullsAmongMovs(movsArr) { // есть ли пустые фильмы в массиве фильмов
    return (movsArr.findIndex((el) => el === null) !== -1);
  }

  showResultsText() { // отображение поисковой фразы
    const searchTextContainer = document.querySelector(this.appConfig.searchTextContainer);
    if (searchTextContainer.classList.contains('hidden')) {
      searchTextContainer.classList.remove('hidden');
    }

    if (!this.movies || !this.searchEng) {
      searchTextContainer.innerText = (this.movies)
        ? `Showing results for "${this.searchPhrase}"`
        : `No results for "${this.searchPhrase}"`;
    }
  }

  enableLoader() {
    const loader = document.querySelector(this.appConfig.loaderSelector);
    if (loader && loader.classList.contains('hidden')) {
      loader.classList.remove('hidden');
    }
  }

  disableLoader() {
    const loader = document.querySelector(this.appConfig.loaderSelector);
    if (loader && !loader.classList.contains('hidden')) {
      loader.classList.add('hidden');
    }
  }

  resetSlider() { // удалить слайдер
    const glideContainer = document.querySelector(this.appConfig.glideSelector);
    if (glideContainer) {
      glideContainer.remove();
    }
  }

  initSlider(movies) { // инициализировать слайдер
    this.slider = new Slider(this.glideConfig, movies, this.favorites);
    this.slider.render();
  }

  getMovies() { // получить информацию по запросу
    const { omdb } = this.appConfig;
    const url = omdb.apiUrl;
    const { apiKey } = omdb;
    const title = (!this.searchPhrase) ? 'star wars' : this.searchPhrase;
    const finalUrl = `${url}s=${title}&apikey=${apiKey}&page=${this.page}`;

    return fetch(finalUrl)
      .then((res) => res.json())
      .then((resMovies) => (!('Error' in resMovies) ? resMovies : null))
      .then((data) => ((data)
        ? Promise.all(data.Search.map((movie) => this.getMovieWithRating(movie)))
        : data))
      .catch((e) => this.processError(e, 'Something went wrong while loading movies info'));
  }

  getMovieWithRating(movie) { // получить рейтинг фильма
    const { omdb } = this.appConfig;
    const url = omdb.apiUrl;
    const { apiKey } = omdb;
    const finalUrl = `${url}i=${movie.imdbID}&apikey=${apiKey}`;

    return fetch(finalUrl)
      .then((res) => res.json())
      .then((resMovie) => (!('Error' in resMovie) ? resMovie : null))
      .then((data) => data)
      .catch((e) => this.processError(e, 'Something went wrong while loading detailed movie info'));
  }

  addListeners() { // добавить слушатели событий
    const resetIcon = document.querySelector(this.appConfig.resetIconSelector);
    resetIcon.addEventListener('click', this.resetInput);

    const lensIcon = document.querySelector(this.appConfig.lensIconSelector);
    lensIcon.addEventListener('click', () => this.search());

    const keyboardIcon = document.querySelector(this.appConfig.keyboardIconSelector);
    keyboardIcon.addEventListener('click', this.showKeyboard);

    const searchButton = document.querySelector(this.appConfig.searchButtonIconSelector);
    searchButton.addEventListener('click', () => this.search());

    const searchInput = document.getElementById(this.appConfig.searchInputId);
    searchInput.addEventListener('keyup', this.pushEnter);

    const sliderContainer = document.querySelector(this.appConfig.moviesContainer);
    sliderContainer.addEventListener('loadMore', () => this.loadMore());
    sliderContainer.addEventListener('loadingIsOver', () => this.disableLoader());

    sliderContainer.addEventListener('click', this.processFavorite);

    const favoritesContainer = document.querySelector(this.appConfig.favoriteContainer);
    favoritesContainer.addEventListener('click', this.clickToDeleteFavorite);

    const keyboardContainer = document.querySelector(this.appConfig.keyboardContainer);
    keyboardContainer.addEventListener('searchThis', () => this.search());
  }

  showKeyboard = () => { // показать/скрыть клавиатуру
    const keyboardContainer = document.querySelector(this.appConfig.keyboardContainer);
    keyboardContainer.classList.toggle('underscreen');
  }

  async loadMore() { // загрузить еще слайды
    this.enableLoader();
    this.page += 1;
    const newSlides = await this.getMovies();
    this.movies = this.movies.concat(newSlides);
    this.slider.updateFavorites(this.favorites);
    await this.slider.addNewSlides(newSlides);
  }

    clickToDeleteFavorite = ({ target }) => { // удаление из Избранного при клике на 'х'
      if (!target.classList.contains('cross')) {
        return;
      }
      this.addOrDeleteFavorite(target.dataset.id, 'delete');
      this.renderFavorites();
    }

    processFavorite = ({ target }) => { // добавить в избранное или удалить (клик на сердечко)
      if (!target.classList.contains('heart')) {
        return;
      }

      const { id } = target.dataset;

      const operation = (this.isFavorite(id)) ? 'delete' : 'add';
      this.addOrDeleteFavorite(id, operation);

      this.renderFavorites();
    }

    addOrDeleteFavorite(id, operation) { // добавить или удалить фильм
      const fromArr = (operation === 'add') ? 'movies' : 'favorites';
      const movie = this.getMovieById(id, fromArr);
      if (!movie) {
        return;
      }

      const moviesContainer = document.querySelector(this.appConfig.moviesContainer);
      const hearts = moviesContainer.querySelectorAll('.heart');
      const newFavorite = Array.from(hearts).filter((el) => el.dataset.id === movie.imdbID)[0];
      const foundIndex = this.favorites.findIndex((el) => (el.imdbID === movie.imdbID));

      switch (operation) {
        case 'add':
          this.favorites.push(movie);
          break;
        case 'delete':
        //   const foundIndex = this.favorites.findIndex((el) => (el.imdbID === movie.imdbID));
          this.favorites.splice(foundIndex, 1);
          break;
        default:
          break;
      }
      if (newFavorite) {
        newFavorite.classList.toggle('favorite');
      }
      this.saveFavorites();
    }

    isFavorite(movieId) { // проверить, находится ли фильм в Favorites
      const favIdArr = Array.from(this.favorites, (elem) => elem.imdbID);
      return favIdArr.includes(movieId);
    }

    getMovieById(id, fromArr = 'movies') { // получить объект фильма из списка фильмов или избранных
      const searchMovsArr = (fromArr === 'movies') ? this.movies : this.favorites;
      const movieArr = Array.from(searchMovsArr, (elem) => elem.imdbID);
      const movieIndex = movieArr.findIndex((el) => (el === id));
      return (movieIndex !== -1) ? searchMovsArr[movieIndex] : null;
    }

    renderFavorites() { // отрендерить раздел "My Favorites"
      const globalFavContainer = document.querySelector(this.appConfig.favoriteContainer);
      const favMoviesContainer = document.querySelector(this.appConfig.favoriteMoviesContainer);
      favMoviesContainer.innerHTML = '';

      if (this.favorites.length === 0) {
        globalFavContainer.classList.add('hidden');
        return;
      }

      globalFavContainer.classList.remove('hidden');

      this.favorites.forEach((movie) => {
        const newFav = document.createElement('div');
        newFav.classList.add('favorite__movie');

        const newLink = document.createElement('a');
        newLink.href = `https://www.imdb.com/title/${movie.imdbID}/`;
        newLink.innerText = movie.Title;
        newLink.target = '_blank';

        newFav.append(newLink);
        favMoviesContainer.append(newFav);

        const deleteSpan = document.createElement('span');
        deleteSpan.dataset.id = movie.imdbID;
        deleteSpan.classList.add('cross');
        newFav.append(deleteSpan);
      });
    }

    pushEnter = (e) => { // поиск по нажатию Enter на физической клавиатуре
      e.preventDefault();
      if (e.keyCode === 13) {
        this.search();
      }
    }

    resetInput = () => { // удалить текст из инпута
      const input = document.getElementById(this.appConfig.searchInputId);
      input.value = '';
    }

    async search() { // поиск по введенной фразе
      this.page = 1;
      this.resetErrorsAndSearch();
      const input = document.getElementById(this.appConfig.searchInputId);
      let searchText = input.value;
      this.searchPhrase = searchText;
      this.searchEng = true;

      if (this.checkIsRussian(searchText)) {
        searchText = await this.translateToEnglish(searchText);
        this.searchPhrase = searchText;
        this.searchEng = false;
      }
      this.renderMovies(searchText);
    }

    resetErrorsAndSearch() {
      const searchTextContainer = document.querySelector(this.appConfig.searchTextContainer);
      const errorTextContainer = document.querySelector(this.appConfig.errorTextContainer);
      searchTextContainer.innerText = '';
      errorTextContainer.innerText = '';
    }

    checkIsRussian(text) { // проверить, не является ли язык русским
      const regExp = new RegExp('[а-яА-ЯёЁ]');
      return regExp.test(text);
    }

    async translateToEnglish(text) { // перевести поисковый запрос на англ.
      const url = `${this.appConfig.yaTranslateApiUrl}text=${text}&lang=ru-en`;
      try {
        const translationObj = await fetch(url);
        const json = await translationObj.json();
        const translation = json.text[0];
        return translation;
      } catch (e) {
        this.processError(e, 'The error occurs while word translating');
      }
      return true;
    }

    focusInput() {
      const input = document.getElementById(this.appConfig.searchInputId);
      input.focus();
    }

    processError(e, errorText) { // вывод ошибки
      const errorContainer = document.querySelector(this.appConfig.errorTextContainer);
      errorContainer.classList.remove('hidden');
      errorContainer.classList.add('error');
      errorContainer.innerText = errorText;
      this.lastError = e;
    }

    renderKeyboard() { // отрендерить клавиатуру
      const keyboard = new KeyboardModule(
        moduleConfig.obj,
        keysConfig.obj,
        this.appConfig.keyboardContainer,
        this.appConfig.searchInputId,
      );
      keyboard.init();
    }
}
