import ApiHelper from './apiHelper';
import dummyImg from '../../img/bg1.jpg'; // для webpack

export default class App {
  constructor(appConfig, apiConfig, imagesConfig, errorsConfig, translateConfig, voiceConfig) {
    this.appConfig = appConfig;
    this.apiConfig = apiConfig;
    this.images = imagesConfig;
    this.errorsConfig = errorsConfig;
    this.translateConfig = translateConfig;
    this.voiceConfig = voiceConfig;
    this.state = {};
    this.lang = null; // язык приложения
    this.units = null; // система измерений приложения
    this.timerId = null;
    this.error = null;
    this.map = null;
    this.mic = false;
    this.recognition = null;
    this.voiceCommands = null;
    this.volume = 0.5;
  }

  async init() { // первоначальный рендеринг
    this.setInitSettings();
    this.addListeners();
    await this.getData();
  }

  setInitSettings() { // получить значения языка/ед. изм., установить св-ва, заполнить меню
    this.loadUserSettings();
    this.setHtmlSetting();
  }

  setHtmlSetting() { // проставить начальные значения в меню (ед. изм., язык)
    this.updateHtml(this.appConfig.unitsObj, this.units);
    this.updateHtml(this.appConfig.langObj, this.lang);
    this.updateButtonText(this.lang);
  }

  loadUserSettings() { // загрузить данные о языке и ед. изм. из localStorage
    let userSettings = JSON.parse(localStorage.getItem('dsWeatherData'));
    if (!userSettings) {
      userSettings = {
        lang: this.appConfig.defaults.language,
        units: this.appConfig.defaults.units,
      };

      localStorage.setItem('dsWeatherData', JSON.stringify(userSettings));
    }
    this.lang = userSettings.lang;
    this.units = userSettings.units;
  }

  saveUserSettings(key, value) { // сохранить настройки в localStorage
    let userSettings = JSON.parse(localStorage.getItem('dsWeatherData'));

    if (!userSettings) {
      userSettings = {
        lang: this.appConfig.defaults.language,
        units: this.appConfig.defaults.units,
      };
    }
    userSettings[key] = value;
    localStorage.setItem('dsWeatherData', JSON.stringify(userSettings));
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

    // нажатие на иконку микрофона
    const micIcon = document.querySelector(this.appConfig.micIcon);
    micIcon.addEventListener('click', this.toggleMic);

    // нажатие на кнопку с динамиком
    const soundButton = document.querySelector(this.appConfig.soundButton);
    soundButton.addEventListener('click', this.playWeather);
  }

  playWeather = () => { // проиграть погоду
    this.downMic();
    const lang = this.appConfig.languagesCodes[this.lang];
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    const weatherText = this.getWeatherText();
    const utterThis = new SpeechSynthesisUtterance(weatherText);
    utterThis.volume = this.volume;
    utterThis.lang = lang;
    utterThis.voice = this.getVoiceForLang(voices, lang);
    synth.speak(utterThis);
  }

  updateVolume(dif) { // изменить громкость проигрывания звуков
    this.volume += dif;
    this.blinkIcon();
  }

  blinkIcon() { // моргнуть иконкой
    const soundButton = document.querySelector(this.appConfig.soundButton);
    if (soundButton.classList.contains('blink')) {
      soundButton.classList.remove('blink');
    }
    setTimeout(() => {
      soundButton.classList.add('blink');
    }, 100);
  }

  getVoiceForLang(voicesArr, lang) { // подобрать голос для озвучивания
    for (let i = 0; i < voicesArr.length; i += 1) {
      if (voicesArr[i].lang === lang) {
        return voicesArr[i];
      }
    }
    return null;
  }

  getWeatherText() { // подготовить текст для озвучивания погоды
    const serviceText = this.translateConfig.translations.serviceText[this.lang];
    const text = `
      ${serviceText.overall} ${this.state.city}! 
      ${this.state.weatherToday.temp} ${serviceText.deg}!  
      ${serviceText.feels} ${this.state.weatherToday.feels} ${serviceText.deg}! 
      ${serviceText.wind} ${this.state.weatherToday.wind}!
      ${serviceText.humidity} ${this.state.weatherToday.humidity} ${serviceText.percent}!
      ${this.state.weatherToday.description}!
    `;
    return text;
  }

  downMic() { // выключить микрофон
    this.mic = false;
    const micIcon = document.querySelector(this.appConfig.micIcon);
    if (micIcon.classList.contains('on')) {
      micIcon.classList.remove('on');
    }
  }

  toggleMic = () => { // включить/выключить микрофон для прослушивания
    this.mic = !this.mic;
    this.setMicCssStyle();
    this.setRecognition();
  }

  setRecognition() { // инициализировать микрофон при его первом нажатии
    if (!this.recognition) {
      this.initRecognition();
    }
  }

  initRecognition() { // инициализация микрофона
    this.recognition = new webkitSpeechRecognition();
    this.voiceCommands = this.getVoiceCommands();

    this.recognition.addEventListener('result', (event) => {
      if (this.mic) {
        this.recognition.lang = this.appConfig.languagesCodes[this.lang];
        const speakedWord = event.results[0][0].transcript.toLowerCase();
        if (this.checkWordForCommand(speakedWord)) {
          const command = this.voiceConfig.voiceCommands[speakedWord];
          this[command.method](command.arg);
        } else {
          const searchInput = document.querySelector(this.appConfig.searchInput);
          searchInput.value = speakedWord;
          this.processSearch();
        }
      }
    });

    this.recognition.addEventListener('end', this.recognition.start);

    this.recognition.start();
  }

  getVoiceCommands() { // получить массив голосовых команд
    return Object.keys(this.voiceConfig.voiceCommands);
  }

  checkWordForCommand(word) { // проверить, является ли слово командой
    return this.voiceCommands.includes(word);
  }

  setMicCssStyle() { // добавить/убрать стиль включенного микрофона
    const micIcon = document.querySelector(this.appConfig.micIcon);
    micIcon.classList.toggle('on');
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
    this.saveUserSettings('units', newUnits);
    this.updateHtml(htmlObj, newUnits);
    this.updateApp(htmlObj.data, newUnits);
  }

  chooseLanguage = ({ target }) => { // обработать изменение языка приложения
    const newLang = this.getNewValueFromClicked(target, 'lang');
    if (!newLang || (this.lang === newLang)) {
      return;
    }
    const htmlObj = this.appConfig.langObj;
    this.saveUserSettings('lang', newLang);
    this.updateHtml(htmlObj, newLang);
    this.updateButtonText(newLang);
    this.updateApp(htmlObj.data, newLang);
  }

  getNewValueFromClicked(target, dataAttrName) { // получить значение data-атрибута
    const dataAttrVal = target.dataset[dataAttrName];
    return dataAttrVal;
  }

  updateButtonText(newLang) { // обновить текст на кнопке поиска
    const searchButton = document.querySelector(this.appConfig.searchButton);
    searchButton.innerText = this.translateConfig.translations.searchButtonText[newLang];
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
    // если город тот же
    if (this.state.city && (searchVal.toUpperCase() === this.state.city.toUpperCase())) {
      return;
    }

    await this.getData(searchVal);
  }

  reloadPic = async () => { // обновить фоновую картинку
    const reloadIcon = document.querySelector(this.appConfig.reloadIcon);
    reloadIcon.classList.add('rotated');
    const tags = (this.state.tags) ? this.state.tags : this.appConfig.defaults.tags;
    const newImg = await this.getFlickrImgByTags(tags);
    this.state.backImg = newImg;
    const body = document.querySelector('body');
    if (this.state.backImg) {
      body.style.backgroundImage = `${this.appConfig.opacityStyle}, url('${this.state.backImg}')`;
    }
    reloadIcon.classList.remove('rotated');
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

  // запросить данные у всех API
  async getData(townName = null, isUpdImg = true, isUpdMap = true, isSearchByCoords = false) {
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

  // получить все данные от API - город, дата/время, погода, карта
  async getAllDataFromApis(townName, isUpdImg, isUpdMap, isSearchByCoords) {
    // API - получить название города (геолокация или из аргументов)
    const cityName = (townName) || await this.getCityByGeoLocation();
    if (this.error) {
      return null;
    }

    // API - получить пар-ры города - название, страна, пояс, широта, долгота
    const searchParam = (!isSearchByCoords) ? cityName : this.getCoordsFromState();
    const cityParams = await this.getCityParams(searchParam);
    if (this.error) {
      return null;
    }

    const {
      components, geometry: { lat, lng }, annotations: { timezone: { name: timezone } },
    } = cityParams;
    const name = this.getTownNameFromComponents(components);
    const { country } = components;

    // преобразовать дату и время на основании пояса
    const { date, time, dateObj } = this.getDateTimeByTimezone(timezone);
    const corLat = this.correctCoords(lat);
    const corLng = this.correctCoords(lng);

    // API - получить погоду для города на текущий момент
    const searchObj = (!isSearchByCoords) ? { city: cityName } : this.getCoordsFromState(false);

    const weatherNow = await this.getWeatherNowForCity(searchObj);
    if (this.error) {
      return null;
    }

    // console.log('weatherNow', weatherNow);
    const {
      temp, app_temp: feelsLike, wind_spd: wind, rh: humidity, weather: { description, icon },
    } = weatherNow;
    const roundTemp = Math.round(temp);
    const roundFeels = Math.round(feelsLike);
    const roundWind = Math.round(wind);
    const roundHumidity = Math.round(humidity);
    const weatherToday = { // собрать все данные о погоде на сегодня в объект
      temp: roundTemp,
      feels: roundFeels,
      wind: roundWind,
      humidity: roundHumidity,
      description,
      icon,
    };

    const tags = this.getTagsString(dateObj);

    // API - получить погоду для города на 3 дня
    const weatherDaily = await this.getWeatherDailyForCity(searchObj);

    if (this.error) {
      return null;
    }

    const weather3Days = this.destructWeatherFor3Days(weatherDaily);

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
        this.error = this.errorsConfig.errors.userGeoLocationError[this.lang];
        return null;
      }

      const cityJson = await cityPromise.json();
      return cityJson.city;
    } catch (e) {
      this.error = this.errorsConfig.errors.userGeoLocationError[this.lang];
      return null;
    }
  }

  async getCityParams(cityName) { // получить название города на нужном языке, страну, коорд
    const cityParamsApiHelper = new ApiHelper(this.apiConfig.opencage, {
      q: cityName, language: this.lang,
    });
    const apiUrl = cityParamsApiHelper.getRequestUrl();

    try {
      const cityParamsPromise = await fetch(apiUrl);
      if (cityParamsPromise.status !== 200) {
        this.error = this.errorsConfig.errors.userCityError[this.lang];
        return null;
      }

      const cityParamsJson = await cityParamsPromise.json();
      if (cityParamsJson.results.length === 0) {
        this.error = this.errorsConfig.errors.noCityFound[this.lang];
        return null;
      }

      return cityParamsJson.results[0];
    } catch (e) {
      this.error = this.errorsConfig.errors.userCityError[this.lang];
      return null;
    }
  }

  async getWeatherNowForCity(searchObj) { // получить погоду на текущий момент в указанном городе
    const weatherApiHelper = new ApiHelper(this.apiConfig.weatherCurrent, {
      lang: this.lang, units: this.units, ...searchObj,
    });
    const apiUrl = weatherApiHelper.getRequestUrl();

    try {
      const weatherPromise = await fetch(apiUrl);
      // console.log('weatherPromise', weatherPromise);
      // const weatherPromise = await fetch(`${this.apiConfig.proxyApi}${apiUrl}`, {
      //   headers: { origin: '' },
      // });
      const { status } = weatherPromise;
      if (status !== 200) {
        this.error = this.errorsConfig.errors.noWeatherFound[this.lang];
        return null;
      }
      const weatherJson = await weatherPromise.json();
      if (weatherJson.data.length === 0) {
        this.error = this.errorsConfig.errors.noWeatherFound[this.lang];
        return null;
      }
      const res = weatherJson.data[0];
      return res;
    } catch (e) {
      this.error = this.errorsConfig.errors.noWeatherFound[this.lang];
      return null;
    }
  }

  async getWeatherDailyForCity(searchObj) { // получить данные о погоде на несколько дней в городе
    const weatherApiHelper = new ApiHelper(this.apiConfig.weatherDaily, {
      lang: this.lang, units: this.units, ...searchObj,
    });
    const apiUrl = weatherApiHelper.getRequestUrl();

    try {
      const weatherPromise = await fetch(apiUrl);
      // const weatherPromise = await fetch(`${this.apiConfig.proxyApi}${apiUrl}`, {
      //   headers: { origin: '' },
      // });
      if (weatherPromise.status !== 200) {
        this.error = this.errorsConfig.errors.noWeatherFound[this.lang];
        return null;
      }
      const weatherJson = await weatherPromise.json();
      const dataLength = weatherJson.data.length;
      if (dataLength === 0 || dataLength < 4) {
        this.error = this.errorsConfig.errors.noWeatherFound[this.lang];
        return null;
      }
      return weatherJson.data.slice(1, 4);
    } catch (e) {
      this.error = this.errorsConfig.errors.noWeatherFound[this.lang];
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
        // this.error = this.errorsConfig.errors.imgApiError[this.lang];
        return defaultImgUrl;
      }
      const imgJson = await imgPromise.json();
      const photos = imgJson.photos.photo;
      // console.log('photos', photos);
      const photoObj = (photos.length)
        ? photos[Math.floor(Math.random() * photos.length)]
        : null;
      if (!photoObj) {
        return defaultImgUrl;
      }
      const imgUrl = await this.getFarmImg(photoObj);
      if (!imgUrl) {
        return defaultImgUrl;
      }
      return imgUrl;
    } catch (e) {
      // this.error = this.errorsConfig.errors.imgApiError[this.lang];
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

  // получить координаты из стейта, по умолчанию - в строке, иначе - в объекте
  getCoordsFromState(isStr = true) {
    return (isStr)
      ? `${this.state.lat},${this.state.lng}`
      : { lat: this.state.lat, lon: this.state.lng };
  }

  emitEvent(eventName) { // задиспатчить событие
    const app = document.querySelector('body');
    const event = new Event(eventName);
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
      case monthNum <= 2:
        yearTime = 'winter';
        break;
      case monthNum <= 5:
        yearTime = 'spring';
        break;
      case monthNum <= 8:
        yearTime = 'summer';
        break;
      case monthNum <= 11:
        yearTime = 'autumn';
        break;
      default:
        yearTime = 'winter';
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
    const { temp, valid_date: validDate, weather: { description, code, icon } } = weather1Obj;
    const roundTemp = Math.round(temp);
    let weekday = (new Date(validDate)).toLocaleDateString(locale, { weekday: 'long' });
    if (this.lang === 'be') { // слегка костыльный перевод полного дня недели для бел.яза
      weekday = this.translateConfig.translations.weekdays.full[(new Date(validDate)).getDay()];
    }
    return {
      roundTemp, weekday, description, code, icon,
    };
  }

  getDateTimeByTimezone(timeZone) { // получить дату и время для текущего часового пояса
    const dateFormatObj = {
      month: 'short',
      day: '2-digit',
      weekday: 'short',
      timeZone,

    };

    const timeFormatObj = {
      hour: '2-digit',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
      timeZone,
    };

    const locale = this.appConfig.languagesCodes[this.lang];
    const dateObj = new Date();

    let date = dateObj.toLocaleString(locale, dateFormatObj).replace(',', '');
    const time = dateObj.toLocaleString(locale, timeFormatObj);

    if (this.lang === 'be') { // немного костыльный перевод месяца/дня недели на бел.яз
      const corDateObj = (new Date((new Date()).toLocaleDateString('en-US', { timeZone })));
      const weekDay = corDateObj.getDay();
      const monthNum = corDateObj.getMonth();
      const dateNum = corDateObj.getDate();
      const translateConfig = this.translateConfig.translations;
      date = `${translateConfig.weekdays.short[weekDay]} ${dateNum} ${translateConfig.monthes.full[monthNum]}`;
    }

    return { date, time, dateObj };
  }

  renderAllData = () => { // наполнить контейнеры значениями из state
    const inputSearch = document.querySelector(this.appConfig.searchInput);
    inputSearch.placeholder = this.translateConfig.translations.placeholderText[this.lang];

    const errorContainer = document.querySelector(this.appConfig.errorContainer);
    errorContainer.classList.add('hidden');

    const serviceText = this.translateConfig.translations.serviceText[this.lang];

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

    const iconWeatherNow = document.querySelector(this.appConfig.tempNowIcon);
    iconWeatherNow.style.backgroundImage = `url(${this.images[this.state.weatherToday.icon]})`;

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
      const dayTempIcon = item.querySelector(this.appConfig.dayTempIcon);
      dayTemp.innerText = `${this.state.weather3Days[index].roundTemp}°`;
      dayName.innerText = `${this.state.weather3Days[index].weekday}`;
      dayTempIcon.style.backgroundImage = `url(${
        this.images[this.state.weather3Days[index].icon]
      })`;
    });

    const latitudeContainer = document.querySelector(this.appConfig.latitudeContainer);
    latitudeContainer.innerText = `${serviceText.latitude}: ${this.state.corLat}`;

    const longitudeContainer = document.querySelector(this.appConfig.longitudeContainer);
    longitudeContainer.innerText = `${serviceText.longitude}: ${this.state.corLng}`;
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
}
