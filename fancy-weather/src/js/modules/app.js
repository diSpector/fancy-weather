import ApiHelper from './apiHelper';
import dummyImg from '../../img/bg1.jpg'; // для webpack

// import Slider from './slider';
// import KeyboardModule from './keyboard/keyboard_module';
// import moduleConfig from './keyboard/settings/moduleConfig';
// import keysConfig from './keyboard/settings/keysConfig';


export default class App {
  constructor(appConfig, apiConfig) {
    this.appConfig = appConfig;
    this.apiConfig = apiConfig;
    this.state = {};
    this.lang = null; // язык приложения
    this.units = null; // система измерений приложения
    this.timerId = null;
    this.error = null;
    this.map = null;
    // this.timezone = null; 
  }

  async init() { // первоначальный рендеринг
    this.setDefaults();
    this.addListeners();
    await this.getData();
  }

  addListeners() { // установить слушатели событий
    const body = document.querySelector('body');
    body.addEventListener('stateUpdated', this.render); // получены новые данные
    body.addEventListener('mounted', this.runTimer); // новые данные загружены и выведены
    body.addEventListener('errorSearch', this.showError); // вывести ошибку в поле

    // нажатие на языковое меню
    const langsDropdown = document.querySelector(this.appConfig.langsContainer);
    langsDropdown.addEventListener('click', this.toggleLangsMenu);

    // выбор нового языка
    const langSelector = document.querySelector(this.appConfig.langsMenu);
    langSelector.addEventListener('click', this.chooseLanguage);

    // нажатие на переключение единиц измерений
    const unitsContainer = document.querySelector(this.appConfig.unitsContainer);
    unitsContainer.addEventListener('click', this.chooseUnits);

    // нажатие на иконку перезагрузки фоновой картинки
    const reloadButton = document.querySelector(this.appConfig.reloadButton);
    reloadButton.addEventListener('click', this.reloadPic);

    // нажатие на кнопку поиска
    const searchButton = document.querySelector(this.appConfig.searchButton);
    searchButton.addEventListener('click', this.processSearch);

    // нажатие на enter в поле поиска
    const searchInput = document.querySelector(this.appConfig.searchInput);
    searchInput.addEventListener('keyup', this.pushEnter);
  }

  showError = () => { // вывести ошибку под полем поиска
    const errorContainer = document.querySelector(this.appConfig.errorContainer);
    errorContainer.classList.remove('hidden');
    errorContainer.innerText = this.error;

    this.error = null;
  }

  toggleLangsMenu = () => { // открыть/закрыть меню выбора языка
    const langsMenu = document.querySelector(this.appConfig.langsMenu);
    if (langsMenu.classList.contains('hidden')) {
      langsMenu.classList.remove('hidden');
    } else {
      langsMenu.classList.add('hidden');
    }
  }

  chooseUnits = ({ target }) => { // обработать изменение единиц изм. (C/F)
    const newUnits = this.getNewValueFromClicked(target, 'units');
    if (!newUnits || (this.units === newUnits)) {
      return;
    }
    const htmlObj = this.appConfig.unitsObj;
    this.updateHtml(htmlObj, newUnits);
    this.updateApp(htmlObj.data, newUnits);
  }

  chooseLanguage = ({ target }) => { // обработать изменение языка приложения
    const newLang = this.getNewValueFromClicked(target, 'lang');
    if (!newLang || (this.lang === newLang)) {
      return;
    }
    const htmlObj = this.appConfig.langObj;
    this.updateHtml(htmlObj, newLang);
    this.updateApp(htmlObj.data, newLang);
  }

  getNewValueFromClicked(target, dataAttrName) { // получить значение data-атрибута
    const dataAttrVal = target.dataset[dataAttrName];
    return dataAttrVal;
  }

  updateHtml(htmlObj, newValue) { // проставить активные стили при изменении языка/единиц измер.
    const container = document.querySelector(htmlObj.container);
    const items = container.querySelectorAll(htmlObj.spec);
    items.forEach((item) => item.classList.remove('active'));

    const choosedItem = document.querySelector(`${htmlObj.spec}[data-${htmlObj.data}="${newValue}"`);

    choosedItem.classList.add('active');

    if ('value' in htmlObj) {
      const valueContainer = document.querySelector(htmlObj.value);
      valueContainer.innerText = newValue;
    }
  }

  updateApp(param, newValue) { // обновить свойство приложения, перерендерить
    this[param] = newValue;
    this.updateData();
  }

  async updateData() { // обновить данные с учетом языка/единиц измерения - запросы к API
    const cityName = (this.state.city) ? this.state.city : null;
    await this.getData(cityName, false, false, true);
  }

  pushEnter = (e) => { // поиск по нажатию Enter
    e.preventDefault();
    if (e.keyCode === 13) {
      this.processSearch();
    }
  }

  processSearch = async () => { // поиск по населенному пункту
    const searchInput = document.querySelector(this.appConfig.searchInput);
    const searchVal = searchInput.value;

    if (!searchVal) {
      return;
    }

    if (this.state.city && (searchVal.toUpperCase() === this.state.city.toUpperCase())) { // если город тот же
      return;
    }

    await this.getData(searchVal);
  }

  reloadPic = async () => { // обновить фоновую картинку
    const tags = (this.state.tags) ? this.state.tags : this.appConfig.defaults.tags;
    const newImg = await this.getFlickrImgByTags(tags);
    this.state.backImg = newImg;
    const body = document.querySelector('body');
    if (this.state.backImg) {
      body.style.backgroundImage = `${this.appConfig.opacityStyle}, url('${this.state.backImg}')`;
    }
  }

  runTimer = () => { // сбросить старый таймер, запустить новый (часы)
    this.stopTimer();
    this.timerId = setInterval(() => {
      const { time } = this.getDateTimeByTimezone(this.state.timezone);
      const dateContainer = document.querySelector(this.appConfig.dateContainer);
      dateContainer.innerText = `${this.state.date} ${time}`;
    }, 1000);
  }

  stopTimer = () => { // уничтожить таймер 
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  render = () => { // отрендерить весь стейт, запустить часы
    this.renderAllData();
    this.emitEvent('mounted');
  }

  setDefaults() { // установить настройки по умолчанию
    this.lang = this.appConfig.defaults.language;
    this.units = this.appConfig.defaults.units;
  }

  getTownNameFromComponents(compObj) { // получить название нас. пункта из объекта
    let cityName = '';
    switch (true) {
      case ('city' in compObj):
        cityName = compObj.city;
        break;
      case ('town' in compObj):
        cityName = compObj.town;
        break;
      case ('village' in compObj):
        cityName = compObj.village;
        break;
      case ('state' in compObj):
        cityName = compObj.state;
        break;
      case ('state_district' in compObj):
        cityName = compObj.state_district;
        break;
      case ('village' in compObj):
        cityName = compObj.village;
        break;
      case ('river' in compObj):
        cityName = compObj.river;
        break;
      case ('beauty' in compObj):
        cityName = compObj.beauty;
        break;
      case ('neighborhood' in compObj):
        cityName = compObj.neighborhood;
        break;
      case ('suburb' in compObj):
        cityName = compObj.suburb;
        break;
      default:
        cityName = compObj.county;
        break;
    }
    return cityName;
  }

  async getData(townName = null, isUpdImg = true, isUpdMap = true, isSearchByCoords = false) { // запросить данные у всех API
    this.enableLoader();

    const data = await this.getAllDataFromApis(townName, isUpdImg, isUpdMap, isSearchByCoords);

    if (this.error) { // если где-то возникла ошибка, вывести ее
      this.emitEvent('errorSearch');
    } else { // иначе - вывести новые данные
      this.setState(data);
      this.emitEvent('stateUpdated');
    }

    this.disableLoader();
  }

  async getAllDataFromApis(townName, isUpdImg, isUpdMap, isSearchByCoords) { // получить все данные от API - город, дата/время, погода, карта
    // API - получить название города (геолокация или из аргументов) 
    const cityName = (townName) ? townName : await this.getCityByGeoLocation();
    if (this.error) {
      return;
    }

    // API - получить пар-ры города - название, страна, пояс, широта, долгота
    const searchParam = (!isSearchByCoords) ? cityName : this.getCoordsFromState();
    const cityParams = await this.getCityParams(searchParam);
    if (this.error) {
      return;
    }
    console.log('cityParams', cityParams);

    const { components, geometry: { lat, lng }, annotations: { timezone: { name: timezone } } } = cityParams;
    const name = this.getTownNameFromComponents(components);
    const { country } = components;

    // преобразовать дату и время на основании пояса 
    const { date, time, dateObj } = this.getDateTimeByTimezone(timezone);
    const corLat = this.correctCoords(lat);
    const corLng = this.correctCoords(lng);

    console.log('TESTcityObj', { name, country, lat, lng, timezone });
    console.log('TESTdate', { date, time, dateObj });
    console.log('lat, lng', { corLat, corLng });

    // API - получить погоду для города на текущий момент
    const searchObj = (!isSearchByCoords) ? { city: cityName} : this.getCoordsFromState(false);

    const weatherNow = await this.getWeatherNowForCity(searchObj);
    if (this.error) {
      return;
    }

    console.log('weatherNow', weatherNow);
    const { temp, app_temp: feelsLike, wind_spd: wind, rh: humidity, weather: { description } } = weatherNow;
    const roundTemp = Math.round(temp);
    const roundFeels = Math.round(feelsLike);
    const roundWind = Math.round(wind);
    const roundHumidity = Math.round(humidity)
    const weatherToday = { // собрать все данные о погоде на сегодня в объект
      temp: roundTemp,
      feels: roundFeels,
      wind: roundWind,
      humidity: roundHumidity,
      description
    };
    console.log('weatherToday', weatherToday);

    const tags = this.getTagsString(dateObj);
    console.log('tags', tags);

    // API - получить погоду для города на 3 дня
    const weatherDaily = await this.getWeatherDailyForCity(searchObj);
    console.log('weatherDaily', weatherDaily);

    if (this.error) {
      return;
    }

    const weather3Days = this.destructWeatherFor3Days(weatherDaily);
    console.log('weather3Days', weather3Days);

    const backImg = (isUpdImg) ? await this.getFlickrImgByTags(tags) : this.state.backImg;

    if (isUpdMap) {
      this.generateMapFromCoords(lng, lat);
    }

    return {
      city: name,
      country,
      date,
      time,
      timezone,
      lat,
      lng,
      corLat,
      corLng,
      weatherToday,
      weather3Days,
      backImg,
      tags,
    };
  }

  async getCityByGeoLocation() { // получить название города по ip-адресу
    const cityApiHelper = new ApiHelper(this.apiConfig.geolocation);
    const apiUrl = cityApiHelper.getRequestUrl();

    try {
      const cityPromise = await fetch(apiUrl);
      if (cityPromise.status !== 200) {
        this.error = this.appConfig.errors.userGeoLocationError[this.lang];
        return null;
      }

      const cityJson = await cityPromise.json();
      return cityJson.city;

    } catch (e) {
      this.error = this.appConfig.errors.userGeoLocationError[this.lang];
      return null;
    }
  }

  async getCityParams(cityName) { // получить название города на нужном языке, страну, коорд
    const cityParamsApiHelper = new ApiHelper(this.apiConfig.opencage, { q: cityName, language: this.lang });
    const apiUrl = cityParamsApiHelper.getRequestUrl();

    try {
      const cityParamsPromise = await fetch(apiUrl);
      if (cityParamsPromise.status !== 200) {
        this.error = this.appConfig.errors.userCityError[this.lang];
        return null;
      }

      const cityParamsJson = await cityParamsPromise.json();
      if (cityParamsJson.results.length === 0) {
        this.error = this.appConfig.errors.noCityFound[this.lang];
        return null;
      }

      return cityParamsJson.results[0];

    } catch (e) {
      this.error = this.appConfig.errors.userCityError[this.lang];
      return null;
    }
  }

  async getWeatherNowForCity(searchObj) { // получить погоду на текущий момент в указанном городе
    const weatherApiHelper = new ApiHelper(this.apiConfig.weatherCurrent, { lang: this.lang, units: this.units, ...searchObj });
    const apiUrl = weatherApiHelper.getRequestUrl();

    try {
      const weatherPromise = await fetch(apiUrl);
      console.log('weatherPromise', weatherPromise);
      // const weatherPromise = await fetch(`${this.apiConfig.proxyApi}${apiUrl}`, {
      //   headers: { origin: '' },
      // });
      const { status, statusText } = weatherPromise;
      if (status !== 200) {
        this.error = this.appConfig.errors.noWeatherFound[this.lang];
        return null;
      }
      const weatherJson = await weatherPromise.json();
      if (weatherJson.data.length === 0) {
        this.error = this.appConfig.errors.noWeatherFound[this.lang];
        return null;
      }
      const res = weatherJson.data[0];
      return res;

    } catch (e) {
      this.error = this.appConfig.errors.noWeatherFound[this.lang];
      return null;
    }
  }

  async getWeatherDailyForCity(searchObj) { // получить данные о погоде на несколько дней в городе
    const weatherApiHelper = new ApiHelper(this.apiConfig.weatherDaily, { lang: this.lang, units: this.units, ...searchObj });
    const apiUrl = weatherApiHelper.getRequestUrl();

    try {
      const weatherPromise = await fetch(apiUrl);
      // const weatherPromise = await fetch(`${this.apiConfig.proxyApi}${apiUrl}`, {
      //   headers: { origin: '' },
      // });
      if (weatherPromise.status !== 200) {
        this.error = this.appConfig.errors.noWeatherFound[this.lang];
        return null;
      }
      const weatherJson = await weatherPromise.json();
      const dataLength = weatherJson.data.length;
      if (dataLength === 0 || dataLength < 4) {
        this.error = this.appConfig.errors.noWeatherFound[this.lang];
        return null;
      }
      return weatherJson.data.slice(1, 4);

    } catch (e) {
      this.error = this.appConfig.errors.noWeatherFound[this.lang];
      return null;
    }
  }

  async getFlickrImgByTags(tagsStr) { // получить массив фоток, выбрать одну
    const imgApiHelper = new ApiHelper(this.apiConfig.flickr, { tags: tagsStr });
    const apiUrl = imgApiHelper.getRequestUrl();
    const defaultImgUrl = dummyImg;

    try {
      const imgPromise = await fetch(apiUrl);
      if (imgPromise.status !== 200) {
        // this.error = this.appConfig.errors.imgApiError[this.lang];
        return defaultImgUrl;
      }
      const imgJson = await imgPromise.json();
      const photos = imgJson.photos.photo;
      console.log('photos', photos);
      const photoObj = (photos.length) ? photos[Math.floor(Math.random() * photos.length)] : null;
      if (!photoObj) {
        return defaultImgUrl;
      }
      const imgUrl = await this.getFarmImg(photoObj);
      if (!imgUrl) {
        return defaultImgUrl;
      }
      return imgUrl;

    } catch (e) {
      // this.error = this.appConfig.errors.imgApiError[this.lang];
      return defaultImgUrl;
    }
  }

  async getFarmImg(photoObj) { // получить url картинки с flickr
    const apiUrl = `https://farm${photoObj.farm}.staticflickr.com/${photoObj.server}/${photoObj.id}_${photoObj.secret}_b.jpg`;
    
    try {
      const imgObj = await fetch(apiUrl);
      return imgObj.url;
    
    } catch (e) {
      return null;
    } 
  }

  setState(state) { // установить глобальное состояние приложения
    this.state = state;
  }

  getCoordsFromState(isStr = true) { // получить координаты из стейта, по умолчанию - в строке, иначе - в объекте
    return (isStr) 
      ? `${this.state.lat},${this.state.lng}`
      : { lat: this.state.lat, lon: this.state.lng};
  }

  emitEvent(eventName) { // задиспатчить событие
    const app = document.querySelector('body');
    let event = new Event(eventName);
    app.dispatchEvent(event);
  }

  enableLoader() { // показать иконку загрузки
    const loader = document.querySelector(this.appConfig.loaderSelector);
    if (loader && loader.classList.contains('hidden')) {
      loader.classList.remove('hidden');
    }
  }

  disableLoader() { // спрятать иконку загрузки
    const loader = document.querySelector(this.appConfig.loaderSelector);
    if (loader && !loader.classList.contains('hidden')) {
      loader.classList.add('hidden');
    }
  }

  correctCoords(coord) { // перевести дробные доли градусов в минуты
    const newCoord = Math.trunc(coord);
    const expn = coord - newCoord;
    const expInMin = Math.trunc(expn * 60);
    return `${newCoord}°${expInMin}'`;
  }

  getTagsString(dateObj) { // получить строку с тегами
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
      case dayHour <= 5:
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

  destructWeatherFor3Days(weather3Obj) { // записать погоду за 3 дня в массив
    const weather3DaysObj = weather3Obj.map(this.destructWeatherForDay);
    return weather3DaysObj;
  }

  destructWeatherForDay = (weather1Obj) => { // подготовить объект погоды за 1 день
    const locale = this.appConfig.languagesCodes[this.lang];
    const { temp, valid_date, weather: { description, code } } = weather1Obj;
    const roundTemp = Math.round(temp);
    let weekday = (new Date(valid_date)).toLocaleDateString(locale, { weekday: 'long' });
    if (this.lang === 'be') { // слегка костыльный перевод полного дня недели для бел.яза
      weekday = this.appConfig.translations.weekdays.full[(new Date(valid_date)).getDay()];
    }
    return { roundTemp, weekday, description, code };
  }

  getDateTimeByTimezone(timeZone) { // получить дату и время для текущего часового пояса
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
      timeZone: timeZone,
    };

    const locale = this.appConfig.languagesCodes[this.lang];
    const dateObj = new Date();

    let date = dateObj.toLocaleString(locale, dateFormatObj).replace(',', '');
    const time = dateObj.toLocaleString(locale, timeFormatObj);

    if (this.lang === 'be') { // немного костыльный перевод месяца/дня недели на бел.яз
      const corDateObj = (new Date((new Date()).toLocaleDateString('en-US', {timeZone: timeZone})));
      const weekDay = corDateObj.getDay();
      const monthNum = corDateObj.getMonth();
      const dateNum = corDateObj.getDate();
      const translateConfig = this.appConfig.translations;
      date = `${translateConfig.weekdays.short[weekDay]} ${dateNum} ${translateConfig.monthes.full[monthNum]}`;
    }

    return { date, time, dateObj };
  }

  renderAllData = () => { // наполнить контейнеры значениями из state

    const inputSearch = document.querySelector(this.appConfig.searchInput);
    inputSearch.placeholder = this.appConfig.placeholderText[this.lang];

    const errorContainer = document.querySelector(this.appConfig.errorContainer);
    errorContainer.classList.add('hidden');

    const serviceText = this.appConfig.serviceText[this.lang];

    const body = document.querySelector('body');
    if (this.state.backImg) {
      body.style.backgroundImage = `${this.appConfig.opacityStyle}, url('${this.state.backImg}')`;
    }

    const cityContainer = document.querySelector(this.appConfig.cityContainer);
    cityContainer.innerText = `${this.state.city}, ${this.state.country}`;

    const dateContainer = document.querySelector(this.appConfig.dateContainer);
    dateContainer.innerText = `${this.state.date} ${this.state.time}`;

    const tempNowContainer = document.querySelector(this.appConfig.tempNowContainer);
    tempNowContainer.innerText = `${this.state.weatherToday.temp}`;

    const overcastContainer = document.querySelector(this.appConfig.overcastContainer);
    overcastContainer.innerText = `${this.state.weatherToday.description}`;

    const feelsContainer = document.querySelector(this.appConfig.feelsContainer);
    feelsContainer.innerText = `${serviceText.feels}: ${this.state.weatherToday.feels}°`;

    const windContainer = document.querySelector(this.appConfig.windContainer);
    windContainer.innerText = `${serviceText.wind}: ${this.state.weatherToday.wind} ${serviceText.vel[this.units]}`;

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
    latitudeContainer.innerText = `${serviceText.latitude}: ${this.state.corLat}`;

    const longitudeContainer = document.querySelector(this.appConfig.longitudeContainer);
    longitudeContainer.innerText = `${serviceText.longitude}: ${this.state.corLng}`;

    // this.generateMapFromState();
  }

  generateMapFromState() { // нарисовать карту по коорд из state
    mapboxgl.accessToken = this.apiConfig.mapbox.token;
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.state.lng, this.state.lat],
      zoom: 10,
    });
    (new mapboxgl.Marker()).setLngLat([this.state.lng, this.state.lat]).addTo(this.map);
  }

  generateMapFromCoords(lng, lat) { // нарисовать карту по переданным коорд
    mapboxgl.accessToken = this.apiConfig.mapbox.token;
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: 10,
    });
    (new mapboxgl.Marker()).setLngLat([lng, lat]).addTo(this.map);
  }

  // async getAllDataFromApis(townName = null, isUpdImg = true, isUpdMap = true) { // получить все данные от API - город, дата/время, погода, карта
  //   this.enableLoader();
  //   let state = {};
  //   console.log('townName', townName);

  //   // API - получить название города (геолокация или из аргументов) 
  //   const cityName = (townName) ? townName : await this.getCityByGeoLocation();

  //   // API - получить пар-ры города - название, страна, пояс, широта, долгота
  //   const cityParams = await this.getCityParams(cityName);
  //   console.log('cityParams', cityParams);
  //   if (!cityParams && this.error) {
  //     this.disableLoader();
  //     this.emitEvent('errorSearch');
  //     // console.log(this.error);
  //     return;
  //   }

  //   const { components, geometry: { lat, lng }, annotations: { timezone: { name: timezone } } } = cityParams;
  //   const name = this.getTownNameFromComponents(components);
  //   const { country } = components;
  //   console.log('name', name);
  //   console.log('country', country);
  //   console.log('lat', lat);
  //   console.log('lng', lng);
  //   console.log('timezone', timezone);

  //   // преобразовать дату и время на основании пояса 
  //   const { date, time, dateObj } = this.getDateTimeByTimezone(timezone);
  //   console.log('date', date);
  //   console.log('time', time);
  //   console.log('dateObj', dateObj);

  //   const corLat = this.correctCoords(lat);
  //   const corLng = this.correctCoords(lng);
  //   console.log('lat from cityParams', corLat);
  //   console.log('lng from cityParams', corLng);

  //   // API - получить погоду для города на текущий момент
  //   const weatherNow = await this.getWeatherNowForCity(name);

  //   if (!weatherNow && this.error) {
  //     this.disableLoader();
  //     this.emitEvent('errorSearch');
  //     return;
  //   }

  //   console.log('weatherNow', weatherNow);
  //   const { temp, app_temp: feelsLike, wind_spd: wind, rh: humidity, weather: { description } } = weatherNow;
  //   const roundTemp = Math.round(temp);
  //   const roundFeels = Math.round(feelsLike);
  //   const roundWind = Math.round(wind);
  //   const roundHumidity = Math.round(humidity);
  //   console.log('temp', roundTemp);
  //   console.log('feelsLike', roundFeels);
  //   console.log('wind', roundWind);
  //   console.log('humidity', roundHumidity);
  //   console.log('description', description);

  //   const tags = this.getTagsString(dateObj);
  //   console.log('tags', tags);

  //   // API - получить погоду для города на 3 дня
  //   const weatherDaily = await this.getWeatherDailyForCity(name);
  //   const weather3Days = this.destructWeatherFor3Days(weatherDaily);
  //   console.log('weather3Days', weather3Days);

  //   // API - получить картинку-фон
  //   // if (isUpdImg) {
  //   //   const backImg = await this.getFlickrImgByTags(tags);
  //   //   console.log('backImg', backImg);
  //   // }

  //   const backImg = (isUpdImg) ? await this.getFlickrImgByTags(tags) : this.state.backImg;

  //   if (isUpdMap) {
  //     this.generateMapFromCoords(lng, lat);
  //   }


  //   state = {
  //     city: name,
  //     country,
  //     date,
  //     time,
  //     timezone,
  //     lat,
  //     lng,
  //     corLat,
  //     corLng,
  //     weatherToday: {
  //       temp: roundTemp,
  //       feels: roundFeels,
  //       wind: roundWind,
  //       humidity: roundHumidity,
  //       description
  //     },
  //     weather3Days,
  //     backImg,
  //     tags,
  //   };
  //   console.log('state', state);

  //   this.setState(state);
  //   this.disableLoader();
  //   // РАБОЧИЙ КОД
  // }

  // updateHtmlUnits(newUnits) { // добавить активный класс выбранному переключателю (язык)
  //   const unitsContainer = document.querySelector(this.appConfig.unitsContainer);
  //   const allUnits = unitsContainer.querySelectorAll(this.appConfig.unitSpec);
  //   allUnits.forEach((unit) => unit.classList.remove('active'));
  //   const choosedUnit = unitsContainer.querySelector(`${this.appConfig.unitSpec}[data-${this.appConfig.unitData}="${newUnits}"]`);
  //   choosedUnit.classList.add('active');
  // }

  // updateHtmlLang(newLang) { // обновить меню
  //   console.log('updateHtmlLang', newLang);
  //   const langsDropdown = document.querySelector(this.appConfig.langsContainer);
  //   const allLangs = langsDropdown.querySelectorAll(this.appConfig.langSpec);
  //   allLangs.forEach((lang) => lang.classList.remove('active'));

  //   const choosedLang = document.querySelector(`${this.appConfig.langSpec}.${newLang}`);
  //   console.log('choosedLang', choosedLang);

  //   choosedLang.classList.add('active');

  //   const langValueContainer = document.querySelector(this.appConfig.langValueContainer);
  //   langValueContainer.innerText = newLang;
  // }

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
