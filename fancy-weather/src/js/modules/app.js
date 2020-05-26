import ApiHelper from './apiHelper';

// import Slider from './slider';
// import KeyboardModule from './keyboard/keyboard_module';
// import moduleConfig from './keyboard/settings/moduleConfig';
// import keysConfig from './keyboard/settings/keysConfig';

// import dummyImg from '../../img/dummy.jpg'; // для webpack

export default class App {
  constructor(appConfig, apiConfig) {
    this.appConfig = appConfig;
    this.apiConfig = apiConfig;
    this.state = {};
    this.lang = null; // язык приложения
    this.units = null; // система измерений приложения
    this.timerId = null;
    // this.timezone = null; 
  }

  async init() { // первоначальный рендеринг
    this.setDefaults();
    this.addListeners();

    const dataObj = await this.getAllDataFromApis();
    // this.renderAllData();

  }

  addListeners() { // установить слушатели событий
    const body = document.querySelector('body');
    body.addEventListener('stateUpdated', this.render);
    body.addEventListener('mounted', this.runTimer);

    // const search = document.querySelector('.search__button');
    // search.addEventListener('click', this.stopTimer);


    // body.addEventListener('stateUpdated', this.renderAllData);
    //   const resetIcon = document.querySelector(this.appConfig.resetIconSelector);
    //   resetIcon.addEventListener('click', this.resetInput);

    //   const lensIcon = document.querySelector(this.appConfig.lensIconSelector);
    //   lensIcon.addEventListener('click', () => this.search());
  }

  runTimer = () => { // запустить таймер (часы)
    this.timerId = setInterval(() => {
      const { time } = this.getDateTimeByTimezone(this.state.timezone);
      const dateContainer = document.querySelector(this.appConfig.dateContainer);
      dateContainer.innerText = `${this.state.date}, ${time}`;
    }, 1000);
  }

  stopTimer = () => { // остановить таймер (пока не используется)
    clearInterval(this.timerId); //
  }

  render = () => {
    this.renderAllData();
    this.emitEvent('mounted');
  }

  setDefaults() { // установить настройки по умолчанию
    // this.lang = 'be';
    this.lang = this.appConfig.defaults.language;
    this.units = this.appConfig.defaults.units;
  }

  async getAllDataFromApis() { // получить все данные от API - город, дата/время, погода, карта
    let state = {};

    const cityObj = await this.getCity();
    console.log('cityObj', cityObj);
    const { city: cityName, timezone } = cityObj;
    console.log('cityName', cityName);
    console.log('timezone', timezone);

    const { date, time, dateObj } = this.getDateTimeByTimezone(timezone);
    console.log('date', date);
    console.log('time', time);
    console.log('dateObj', dateObj); //

    // setInterval(() => {
    //   const {time} = this.getDateTimeByTimezone(timezone);
    //   console.log('time', time);
    // }, 1000);

    const cityParams = await this.getCityParams(cityName);
    console.log('cityParams', cityParams);

    const { components: { town: name, country }, geometry: { lat, lng } } = cityParams;
    console.log('cityName from cityParams', name);
    console.log('country from cityParams', country);
    const corLat = this.correctCoords(lat);
    const corLng = this.correctCoords(lng);
    console.log('lat from cityParams', corLat);
    console.log('lng from cityParams', corLng);

    const weatherNow = await this.getWeatherNowForCity(cityName);
    console.log('weatherNow', weatherNow);
    const { temp, app_temp: feelsLike, wind_spd: wind, rh: humidity, weather: { description } } = weatherNow;
    const roundTemp = Math.round(temp);
    const roundFeels = Math.round(feelsLike);
    const roundWind = Math.round(wind);
    const roundHumidity = Math.round(humidity);
    console.log('temp', roundTemp);
    console.log('feelsLike', roundFeels);
    console.log('wind', roundWind);
    console.log('humidity', roundHumidity);
    console.log('description', description);

    const tags = this.getTagsString(dateObj, description);
    console.log('tags', tags);

    const weatherDaily = await this.getWeatherDailyForCity(cityName);
    const weather3Days = this.destructWeatherFor3Days(weatherDaily);
    // const weather3Days = weatherDaily.map((weatherForDay))
    // const datesAfterArr = this.getAfterDates(dateObj);
    console.log('weather3Days', weather3Days);

    const backImg = await this.getFlickrImgByTags(tags);
    // const backImg = await this.getFlickrImgByTags('spring');

    console.log('backImg', backImg); //

    state = {
      city: name,
      country,
      date,
      time,
      timezone,
      lat: corLat,
      lng: corLng,
      weatherToday: {
        temp: roundTemp,
        feels: roundFeels,
        wind: roundWind,
        humidity: roundHumidity,
        description
      },
      weather3Days,
      backImg,
    };
    console.log('state', state);

    this.setState(state);
  }

  setState(state) { // установить глобальное состояние приложения
    this.state = state;
    this.emitEvent('stateUpdated');
  }

  emitEvent(eventName) {
    const app = document.querySelector('body');
    let event = new Event(eventName);
    app.dispatchEvent(event);
  }

  correctCoords(coord) { // перевести дробные доли градусов в минуты
    const newCoord = Math.trunc(coord);
    const expn = coord - newCoord;
    const expInMin = Math.trunc(expn * 60);
    return `${newCoord}°${expInMin}'`;
  }

  async getFlickrImgByTags(tagsStr) { // получить массив фоток, выбрать одну
    const imgApiHelper = new ApiHelper(this.apiConfig.flickr, { tags: tagsStr });
    const apiUrl = imgApiHelper.getRequestUrl();

    const imgPromise = await fetch(apiUrl);
    const imgJson = await imgPromise.json();
    console.log('imgJson', imgJson);

    const photos = imgJson.photos.photo;
    console.log('photos', photos);
    const photoObj = (photos.length) ? photos[Math.floor(Math.random() * photos.length)] : null;
    if (!photoObj) {
      return null;
    }
    // console.log('photoObj', photoObj);
    const imgUrl = await this.getFarmImg(photoObj);
    return imgUrl;
  }

  async getFarmImg(photoObj) { // получить url картинки с flickr
    const apiUrl = `https://farm${photoObj.farm}.staticflickr.com/${photoObj.server}/${photoObj.id}_${photoObj.secret}_b.jpg`;
    const imgObj = await fetch(apiUrl);
    return imgObj.url;
  }

  getTagsString(dateObj, weathDescr) { // получить строку с тегами
    // const tags = [weathDescr];
    const tags = [];

    const month = dateObj.getMonth() + 1;
    const hour = dateObj.getHours();

    tags.push(this.getYearTime(month), this.getDayTime(hour));
    return tags.join(',');
  }

  getYearTime(monthNum) { // получить название времени года
    let yearTime = '';
    switch (true) {
      case monthNum <= 3:
        yearTime = 'winter';
        break;
      case monthNum <= 6:
        yearTime = 'spring';
        break;
      case monthNum <= 9:
        yearTime = 'summer';
        break;
      default:
        yearTime = 'autumn';
        break;
    }
    return yearTime;
  }

  getDayTime(dayHour) { // получить название времени суток
    let dayTime = '';
    switch (true) {
      case dayHour <= 6:
        dayTime = 'night';
        break;
      case dayHour <= 10:
        dayTime = 'morning';
        break;
      case dayHour <= 18:
        dayTime = 'daytime';
        break;
      default:
        dayTime = 'evening';
        break;
    }
    return dayTime;
  }

  destructWeatherFor3Days(weather3Obj) {
    const weather3DaysObj = weather3Obj.map(this.destructWeatherForDay);
    return weather3DaysObj;
  }

  destructWeatherForDay = (weather1Obj) => {
    const locale = this.appConfig.languagesCodes[this.lang];
    const { temp, valid_date, weather: { description, code } } = weather1Obj;
    const roundTemp = Math.round(temp);
    const weekday = (new Date(valid_date)).toLocaleDateString(locale, { weekday: 'long' });
    return { roundTemp, weekday, description, code };
  }

  getAfterDates(dateObj) {
    console.log('today', dateObj);
    dateObj.setDate(dateObj.getDate() + 1);
    console.log('tomorrow', `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}`); //
    // console.logt('tomorrow', dateObj.toISOString().slice(0,10));
    // console.log('after tomorrow', dateObj.addDays(2).toString("dd-mm-yyyy"));
    // console.log(new Date(date));
  }

  getDateTimeByTimezone(timeZone) {
    const dateFormatObj = {
      month: 'short',
      day: '2-digit',
      weekday: 'short',
      timeZone: timeZone,
    };

    const timeFormatObj = {
      hour: '2-digit',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    };

    const locale = this.appConfig.languagesCodes[this.lang];
    const dateObj = new Date();

    const date = dateObj.toLocaleString(locale, dateFormatObj);
    const time = dateObj.toLocaleString(locale, timeFormatObj);

    return { date, time, dateObj };
  }

  async getCity() { // получить название города по ip-адресу
    const cityApiHelper = new ApiHelper(this.apiConfig.geolocation);
    const apiUrl = cityApiHelper.getRequestUrl();

    const cityPromise = await fetch(apiUrl);
    const cityJson = await cityPromise.json();
    return cityJson;
  }

  async getCityParams(cityName) { // получить название города на нужном языке, страну, коорд
    const cityParamsApiHelper = new ApiHelper(this.apiConfig.opencage, { q: cityName, language: this.lang });
    const apiUrl = cityParamsApiHelper.getRequestUrl();
    const cityParamsPromise = await fetch(apiUrl);
    const cityParamsJson = await cityParamsPromise.json();
    return cityParamsJson.results[0];
  }

  async getWeatherNowForCity(cityName) { // получить погоду на текущий момент в указанном городе
    const weatherApiHelper = new ApiHelper(this.apiConfig.weatherCurrent, { lang: this.lang, city: cityName });
    const apiUrl = weatherApiHelper.getRequestUrl();

    const weatherPromise = await fetch(apiUrl);
    const weatherJson = await weatherPromise.json();
    const res = weatherJson.data[0];
    return res;
  }

  async getWeatherDailyForCity(cityName) { // получить данные о погоде на несколько дней в городе
    const weatherApiHelper = new ApiHelper(this.apiConfig.weatherDaily, { lang: this.lang, city: cityName });
    const apiUrl = weatherApiHelper.getRequestUrl();

    const weatherPromise = await fetch(apiUrl);
    const weatherJson = await weatherPromise.json();
    return weatherJson.data.slice(1, 4);
  }



  renderAllData = () => {
    console.log('renderAllData');
    const serviceText = this.appConfig.serviceText[this.lang];

    const body = document.querySelector('body');
    if (this.state.backImg) {
      body.style.backgroundImage = `url('${this.state.backImg}')`;
    }

    const cityContainer = document.querySelector(this.appConfig.cityContainer);
    cityContainer.innerText = `${this.state.city}, ${this.state.country}`;

    const dateContainer = document.querySelector(this.appConfig.dateContainer);
    dateContainer.innerText = `${this.state.date}, ${this.state.time}`;

    const tempNowContainer = document.querySelector(this.appConfig.tempNowContainer);
    tempNowContainer.innerText = `${this.state.weatherToday.temp}`;

    const overcastContainer = document.querySelector(this.appConfig.overcastContainer);
    overcastContainer.innerText = `${this.state.weatherToday.description}`;

    const feelsContainer = document.querySelector(this.appConfig.feelsContainer);
    feelsContainer.innerText = `${serviceText.feels}: ${this.state.weatherToday.feels}°`;

    const windContainer = document.querySelector(this.appConfig.windContainer);
    windContainer.innerText = `${serviceText.wind}: ${this.state.weatherToday.wind} ${serviceText.vel}`;

    const humidityContainer = document.querySelector(this.appConfig.humidityContainer);
    humidityContainer.innerText = `${serviceText.humidity}: ${this.state.weatherToday.humidity}%`;

    const weatherTomorrowContainers = document.querySelectorAll(this.appConfig.dayContainer);
    weatherTomorrowContainers.forEach((item, index) => {
      const dayTemp = item.querySelector(this.appConfig.dayTempContainer);
      const dayName = item.querySelector(this.appConfig.dayNameContainer);
      dayTemp.innerText = `${this.state.weather3Days[index].roundTemp}°`;
      dayName.innerText = `${this.state.weather3Days[index].weekday}`;
    });

    const latitudeContainer = document.querySelector(this.appConfig.latitudeContainer);
    latitudeContainer.innerText = `${serviceText.latitude}: ${this.state.lat}`;

    const longitudeContainer = document.querySelector(this.appConfig.longitudeContainer);
    longitudeContainer.innerText = `${serviceText.longitude}: ${this.state.lng}`;

  }

  // getUserLocation() {
  //   return fetch(finalUrl)
  //     .then((res) => res.json())
  //     .then((resMovies) => (!('Error' in resMovies) ? resMovies : null))
  //     .then((data) => ((data)
  //       ? Promise.all(data.Search.map((movie) => this.getMovieWithRating(movie)))
  //       : data))
  //     .catch((e) => this.processError(e, 'Something went wrong while loading movies info'));
  // }

  // init() { // первоначальный рендеринг - слайдер + слушатели событий
  //   this.loadFavorites();
  //   this.renderMovies();
  //   this.focusInput();
  //   this.renderFavorites();
  //   this.renderKeyboard();
  //   this.addListeners();
  // }

  // loadFavorites() { // загрузить избранное из LocalStorage
  //   this.favorites = JSON.parse(localStorage.getItem('dsFavoriteMovies')) || [];
  // }

  // saveFavorites() { // сохранить избранное в LocalStorage
  //   localStorage.setItem('dsFavoriteMovies', JSON.stringify(this.favorites));
  // }

  // renderMovies() { // отрендерить фильмы
  //   this.enableLoader();
  //   const movies = this.getMovies();
  //   movies.then((movs) => {
  //     this.resetSlider();
  //     this.movies = movs;
  //     this.showResultsText();
  //     return (movs && !this.isNullsAmongMovs(movs)) ? this.initSlider(movs) : this.disableLoader();
  //   })
  //     .catch((e) => this.processError(e, 'Something went wrong while slider mounting'));
  // }

  // isNullsAmongMovs(movsArr) { // есть ли пустые фильмы в массиве фильмов
  //   return (movsArr.findIndex((el) => el === null) !== -1);
  // }

  // showResultsText() { // отображение поисковой фразы
  //   const searchTextContainer = document.querySelector(this.appConfig.searchTextContainer);
  //   if (searchTextContainer.classList.contains('hidden')) {
  //     searchTextContainer.classList.remove('hidden');
  //   }

  //   if (!this.movies || !this.searchEng) {
  //     searchTextContainer.innerText = (this.movies)
  //       ? `Showing results for "${this.searchPhrase}"`
  //       : `No results for "${this.searchPhrase}"`;
  //   }
  // }

  // enableLoader() {
  //   const loader = document.querySelector(this.appConfig.loaderSelector);
  //   if (loader && loader.classList.contains('hidden')) {
  //     loader.classList.remove('hidden');
  //   }
  // }

  // disableLoader() {
  //   const loader = document.querySelector(this.appConfig.loaderSelector);
  //   if (loader && !loader.classList.contains('hidden')) {
  //     loader.classList.add('hidden');
  //   }
  // }

  // resetSlider() { // удалить слайдер
  //   const glideContainer = document.querySelector(this.appConfig.glideSelector);
  //   if (glideContainer) {
  //     glideContainer.remove();
  //   }
  // }

  // initSlider(movies) { // инициализировать слайдер
  //   this.slider = new Slider(this.glideConfig, movies, this.favorites);
  //   this.slider.render();
  // }

  // getMovies() { // получить информацию по запросу
  //   const { omdb } = this.appConfig;
  //   const url = omdb.apiUrl;
  //   const { apiKey } = omdb;
  //   const title = (!this.searchPhrase) ? 'star wars' : this.searchPhrase;
  //   const finalUrl = `${url}s=${title}&apikey=${apiKey}&page=${this.page}`;

  //   return fetch(finalUrl)
  //     .then((res) => res.json())
  //     .then((resMovies) => (!('Error' in resMovies) ? resMovies : null))
  //     .then((data) => ((data)
  //       ? Promise.all(data.Search.map((movie) => this.getMovieWithRating(movie)))
  //       : data))
  //     .catch((e) => this.processError(e, 'Something went wrong while loading movies info'));
  // }

  // getMovieWithRating(movie) { // получить рейтинг фильма
  //   const { omdb } = this.appConfig;
  //   const url = omdb.apiUrl;
  //   const { apiKey } = omdb;
  //   const finalUrl = `${url}i=${movie.imdbID}&apikey=${apiKey}`;

  //   return fetch(finalUrl)
  //     .then((res) => res.json())
  //     .then((resMovie) => (!('Error' in resMovie) ? resMovie : null))
  //     .then((data) => data)
  //     .catch((e) => this.processError(e, 'Something went wrong while loading detailed movie info'));
  // }

  // addListeners() { // добавить слушатели событий
  //   const resetIcon = document.querySelector(this.appConfig.resetIconSelector);
  //   resetIcon.addEventListener('click', this.resetInput);

  //   const lensIcon = document.querySelector(this.appConfig.lensIconSelector);
  //   lensIcon.addEventListener('click', () => this.search());

  //   const keyboardIcon = document.querySelector(this.appConfig.keyboardIconSelector);
  //   keyboardIcon.addEventListener('click', this.showKeyboard);

  //   const searchButton = document.querySelector(this.appConfig.searchButtonIconSelector);
  //   searchButton.addEventListener('click', () => this.search());

  //   const searchInput = document.getElementById(this.appConfig.searchInputId);
  //   searchInput.addEventListener('keyup', this.pushEnter);

  //   const sliderContainer = document.querySelector(this.appConfig.moviesContainer);
  //   sliderContainer.addEventListener('loadMore', () => this.loadMore());
  //   sliderContainer.addEventListener('loadingIsOver', () => this.disableLoader());

  //   sliderContainer.addEventListener('click', this.processFavorite);

  //   const favoritesContainer = document.querySelector(this.appConfig.favoriteContainer);
  //   favoritesContainer.addEventListener('click', this.clickToDeleteFavorite);

  //   const keyboardContainer = document.querySelector(this.appConfig.keyboardContainer);
  //   keyboardContainer.addEventListener('searchThis', () => this.search());
  // }

  // showKeyboard = () => { // показать/скрыть клавиатуру
  //   const keyboardContainer = document.querySelector(this.appConfig.keyboardContainer);
  //   keyboardContainer.classList.toggle('underscreen');
  // }

  // async loadMore() { // загрузить еще слайды
  //   this.enableLoader();
  //   this.page += 1;
  //   const newSlides = await this.getMovies();
  //   this.movies = this.movies.concat(newSlides);
  //   this.slider.updateFavorites(this.favorites);
  //   await this.slider.addNewSlides(newSlides);
  // }

  //   clickToDeleteFavorite = ({ target }) => { // удаление из Избранного при клике на 'х'
  //     if (!target.classList.contains('cross')) {
  //       return;
  //     }
  //     this.addOrDeleteFavorite(target.dataset.id, 'delete');
  //     this.renderFavorites();
  //   }

  //   processFavorite = ({ target }) => { // добавить в избранное или удалить (клик на сердечко)
  //     if (!target.classList.contains('heart')) {
  //       return;
  //     }

  //     const { id } = target.dataset;

  //     const operation = (this.isFavorite(id)) ? 'delete' : 'add';
  //     this.addOrDeleteFavorite(id, operation);

  //     this.renderFavorites();
  //   }

  //   addOrDeleteFavorite(id, operation) { // добавить или удалить фильм
  //     const fromArr = (operation === 'add') ? 'movies' : 'favorites';
  //     const movie = this.getMovieById(id, fromArr);
  //     if (!movie) {
  //       return;
  //     }

  //     const moviesContainer = document.querySelector(this.appConfig.moviesContainer);
  //     const hearts = moviesContainer.querySelectorAll('.heart');
  //     const newFavorite = Array.from(hearts).filter((el) => el.dataset.id === movie.imdbID)[0];
  //     const foundIndex = this.favorites.findIndex((el) => (el.imdbID === movie.imdbID));

  //     switch (operation) {
  //       case 'add':
  //         this.favorites.push(movie);
  //         break;
  //       case 'delete':
  //       //   const foundIndex = this.favorites.findIndex((el) => (el.imdbID === movie.imdbID));
  //         this.favorites.splice(foundIndex, 1);
  //         break;
  //       default:
  //         break;
  //     }
  //     if (newFavorite) {
  //       newFavorite.classList.toggle('favorite');
  //     }
  //     this.saveFavorites();
  //   }

  //   isFavorite(movieId) { // проверить, находится ли фильм в Favorites
  //     const favIdArr = Array.from(this.favorites, (elem) => elem.imdbID);
  //     return favIdArr.includes(movieId);
  //   }

  //   getMovieById(id, fromArr = 'movies') { // получить объект фильма из списка фильмов или избранных
  //     const searchMovsArr = (fromArr === 'movies') ? this.movies : this.favorites;
  //     const movieArr = Array.from(searchMovsArr, (elem) => elem.imdbID);
  //     const movieIndex = movieArr.findIndex((el) => (el === id));
  //     return (movieIndex !== -1) ? searchMovsArr[movieIndex] : null;
  //   }

  //   renderFavorites() { // отрендерить раздел "My Favorites"
  //     const globalFavContainer = document.querySelector(this.appConfig.favoriteContainer);
  //     const favMoviesContainer = document.querySelector(this.appConfig.favoriteMoviesContainer);
  //     favMoviesContainer.innerHTML = '';

  //     if (this.favorites.length === 0) {
  //       globalFavContainer.classList.add('hidden');
  //       return;
  //     }

  //     globalFavContainer.classList.remove('hidden');

  //     this.favorites.forEach((movie) => {
  //       const newFav = document.createElement('div');
  //       newFav.classList.add('favorite__movie');

  //       const newLink = document.createElement('a');
  //       newLink.href = `https://www.imdb.com/title/${movie.imdbID}/`;
  //       newLink.innerText = movie.Title;
  //       newLink.target = '_blank';

  //       newFav.append(newLink);
  //       favMoviesContainer.append(newFav);

  //       const deleteSpan = document.createElement('span');
  //       deleteSpan.dataset.id = movie.imdbID;
  //       deleteSpan.classList.add('cross');
  //       newFav.append(deleteSpan);
  //     });
  //   }

  //   pushEnter = (e) => { // поиск по нажатию Enter на физической клавиатуре
  //     e.preventDefault();
  //     if (e.keyCode === 13) {
  //       this.search();
  //     }
  //   }

  //   resetInput = () => { // удалить текст из инпута
  //     const input = document.getElementById(this.appConfig.searchInputId);
  //     input.value = '';
  //   }

  //   async search() { // поиск по введенной фразе
  //     this.page = 1;
  //     this.resetErrorsAndSearch();
  //     const input = document.getElementById(this.appConfig.searchInputId);
  //     let searchText = input.value;
  //     this.searchPhrase = searchText;
  //     this.searchEng = true;

  //     if (this.checkIsRussian(searchText)) {
  //       searchText = await this.translateToEnglish(searchText);
  //       this.searchPhrase = searchText;
  //       this.searchEng = false;
  //     }
  //     this.renderMovies(searchText);
  //   }

  //   resetErrorsAndSearch() {
  //     const searchTextContainer = document.querySelector(this.appConfig.searchTextContainer);
  //     const errorTextContainer = document.querySelector(this.appConfig.errorTextContainer);
  //     searchTextContainer.innerText = '';
  //     errorTextContainer.innerText = '';
  //   }

  //   checkIsRussian(text) { // проверить, не является ли язык русским
  //     const regExp = new RegExp('[а-яА-ЯёЁ]');
  //     return regExp.test(text);
  //   }

  //   async translateToEnglish(text) { // перевести поисковый запрос на англ.
  //     const url = `${this.appConfig.yaTranslateApiUrl}text=${text}&lang=ru-en`;
  //     try {
  //       const translationObj = await fetch(url);
  //       const json = await translationObj.json();
  //       const translation = json.text[0];
  //       return translation;
  //     } catch (e) {
  //       this.processError(e, 'The error occurs while word translating');
  //     }
  //     return true;
  //   }

  //   focusInput() {
  //     const input = document.getElementById(this.appConfig.searchInputId);
  //     input.focus();
  //   }

  //   processError(e, errorText) { // вывод ошибки
  //     const errorContainer = document.querySelector(this.appConfig.errorTextContainer);
  //     errorContainer.classList.remove('hidden');
  //     errorContainer.classList.add('error');
  //     errorContainer.innerText = errorText;
  //     this.lastError = e;
  //   }

  //   renderKeyboard() { // отрендерить клавиатуру
  //     const keyboard = new KeyboardModule(
  //       moduleConfig.obj,
  //       keysConfig.obj,
  //       this.appConfig.keyboardContainer,
  //       this.appConfig.searchInputId,
  //     );
  //     keyboard.init();
  //   }
}
