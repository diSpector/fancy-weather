import Glide, { Controls, Breakpoints, Swipe } from '@glidejs/glide/dist/glide.modular.esm';
import Html from '@glidejs/glide/src/components/html'; // фикс для GlideJs для update слайдов
import noPosterImg from '../../img/no_poster.png'; // для webpack

export default class Slider {
  constructor(config, movies, favorites) {
    this.config = config;
    this.movies = movies;
    this.favorites = favorites;
    this.glide = null;
  }

  async render() {
    this.renderHtml();
    await this.renderSlides();
    this.renderBullets();
    this.mountSlider();
    this.addListeners();
  }

  addListeners() { // назначить события
    const bulletContainer = document.querySelector(`.${this.config.glideBulletsContainer.cssClass}`);
    bulletContainer.addEventListener('click', this.clickOnBullet);
  }

  clickOnBullet = ({ target }) => { // клик на буллет для НОВЫХ слайдов
    // этот костыль (весь метод) нужен, т.к. Glide.js некорректно работает
    // с динамически добавляемыми буллетами
    if (target.tagName !== 'BUTTON') {
      return;
    }
    const bulletNumber = parseInt(target.dataset.glideDir.slice(1), 10);

    if (bulletNumber < 10) { // для первых 10 буллетов все работает нормально
      return;
    }

    this.glide.go(`=${bulletNumber}`);
  }

  renderHtml() { // отрендерить разметку для слайдера
    this.renderGlideContainer();
  }

  async renderSlides() { // отрендерить слайды
    const promises = this.movies.map((movie) => this.renderSlide(movie));
    await Promise.all(promises);
    // this.movies.forEach((movie) => this.renderSlide(movie));
  }

  renderBullets() { // отрисовать буллеты для перехода между слайдами
    this.movies.forEach((movie, index) => this.renderBullet(index));
  }

  renderBullet(index) { // отрисовать один буллет
    const newBullet = this.renderBlockByConfig(this.config.glideBullets); // html для буллета
    newBullet.dataset.glideDir = `=${index}`;
  }

  mountSlider() { // примонтировать слайдер
    const container = document.querySelector(`${this.config.mountTo}`);
    const glideConfigObj = this.config.configObj;
    const { movies } = this;

    // фикс для динамического добавления слайдов
    // const HtmlFix = (Glide, Components, Events) => {
    //   const HtmlFix = Html(Glide, Components, Events);
    //   Events.on('update', () => {
    //     HtmlFix.mount();
    //   });
    //   return HtmlFix;//
    // };
    const HtmlFix = (Glide, Components, Events) => {
      const HtmlFixed = Html(Glide, Components, Events);
      Events.on('update', () => {
        HtmlFixed.mount();
      });
      return HtmlFixed;
    };

    const glide = new Glide(container, glideConfigObj);

    glide.on('mount.after', () => { // обновить конфиг, если слайдов мало
      if (movies.length < glide.settings.perView) {
        glide.update({ perView: movies.length });
      }
    });

    glide.on('run', (move) => { // после каждого перемещения
      if (
        ( // загрузить новые слайды на 6-ом слайде в последнем ряду (медленная прокрутка)
          ((this.movies.length % 10) === 0)
          && (glide.index === (this.movies.length - 4))
          && (move.direction === '>')
        )
        // загрузить новые слайды на последнем слайде в последнем ряду (быстрая прокрутка)
        || (((this.movies.length % 10) === 0)
          && (glide.index === (this.movies.length - 1))
        )) {
        this.emitLoadMoreEvent();
      }
    });

    glide.mount({
      Controls, Breakpoints, Swipe, Html: HtmlFix,
    });
    this.emitLoadingIsOverEvent();

    this.glide = glide;
  }

  emitLoadingIsOverEvent() {
    const container = document.querySelector(`${this.config.glideSelector.inside}`);
    const loadingIsOverEvent = new Event('loadingIsOver');
    container.dispatchEvent(loadingIsOverEvent);
  }

  emitLoadMoreEvent() { // передать событие "Загрузить новые слайды"
    const container = document.querySelector(`${this.config.glideSelector.inside}`);
    const loadMoreEvent = new Event('loadMore');
    container.dispatchEvent(loadMoreEvent);
  }

  updateFavorites(favorites) {
    this.favorites = favorites;
  }

  async addNewSlides(slides) { // добавление новых слайдов
    const slidesCount = slides.length;
    if (slidesCount > 0) { // если пришло больше 0 новых слайдов
      // slides.forEach((slide, index) => { // отрендерить слайд и буллет для него
      //     this.renderSlide(slide);
      //     this.renderBullet(index + this.movies.length);
      // });
      const promises = slides.map(async (slide, index) => {
        // await this.renderSlide(slide);
        this.renderSlide(slide); //
        this.renderBullet(index + this.movies.length);
      });
      await Promise.all(promises);

      this.glide.update();
      this.movies = this.movies.concat(slides);
    }
    await this.emitLoadingIsOverEvent();
  }

  hideSliderControls(blockArr) { // спрятать стрелки и буллеты
    blockArr.forEach((block) => {
      const blockSelector = document.querySelector(`.${block.cssClass}`);
      blockSelector.classList.add('hidden');
    });
  }

  async renderSlide(movie) { // отрисовать слайд для фильма
    const newSlide = this.renderBlockByConfig(this.config.glideSlide); // html для слайда
    await this.fillSlide(newSlide, movie);
  }

  async fillSlide(slideObject, movieObject) { // заполнить слайд данными о фильме
    const titleContainer = slideObject.querySelector('.movie__title');
    const imageContainer = slideObject.querySelector('.movie__img');
    const yearContainer = slideObject.querySelector('.movie__year');
    const ratingContainer = slideObject.querySelector('.movie__rating');
    const ratingText = ratingContainer.querySelector('.rating_text');
    const ratingHeart = ratingContainer.querySelector('.heart');

    const titleHref = document.createElement('a');
    titleHref.href = `https://www.imdb.com/title/${movieObject.imdbID}/videogallery`;
    let titleText = movieObject.Title;
    const titleMaxLength = this.config.maxTitleLength;
    if (titleText.length > titleMaxLength) {
      titleText = `${titleText.slice(0, titleMaxLength)}...`;
    }
    titleHref.innerText = titleText;
    titleHref.target = '_blank';
    titleContainer.append(titleHref);

    const posterImg = movieObject.Poster;
    const imgStatus = (posterImg !== 'N/A') ? await this.getImageStatus(posterImg) : 200;

    imageContainer.style.backgroundImage = (posterImg === 'N/A' || imgStatus === 404)
      ? `url(${noPosterImg})`
      : `url(${posterImg})`;

    yearContainer.innerText = movieObject.Year;
    ratingText.innerText = movieObject.imdbRating;
    ratingHeart.dataset.id = movieObject.imdbID;

    if (this.isFavorite(movieObject.imdbID)) {
      ratingHeart.classList.add('favorite');
    }
  }

  isFavorite(movieId) { // есть ли переданный фильм в избранных
    const favIdArr = Array.from(this.favorites, (elem) => elem.imdbID);
    return favIdArr.includes(movieId);
  }

  getImageStatus(src) { // получить статус картинки или ошибку
    return fetch(`${this.config.proxyApi}${src}`, { // запрос через прокси
      headers: { origin: '' },
    })
      .then((res) => res.status)
      .catch((e) => e.message);
  }

  renderGlideContainer() { // отрендерить .glide
    const blocks = this.config.glideBlocks;
    blocks.forEach((block) => this.renderGlideBlock(block));
  }

  renderGlideBlock(block) { // отрендерить блок слайдера
    const blockObj = this.config[block];
    this.renderBlockByConfig(blockObj);
  }

  renderBlockByConfig(configObj) { // отрендерить блок в соотв. с конфигом
    const containers = document.querySelectorAll(`${configObj.inside}`);
    const container = containers[containers.length - 1];

    const blockContainer = ('tag' in configObj)
      ? document.createElement(configObj.tag)
      : document.createElement('div');

    if ('cssClass' in configObj) {
      configObj.cssClass.forEach((cClass) => blockContainer.classList.add(cClass));
    }

    if ('dataProps' in configObj) {
      configObj.dataProps.forEach((dataProp) => {
        const { key } = dataProp;
        const { value } = dataProp;
        blockContainer.dataset[key] = value;
      });
    }

    if ('innerText' in configObj) {
      blockContainer.innerText = configObj.innerText;
    }

    container.append(blockContainer);

    if ('innerElements' in configObj) { // если есть вложенные элементы
      configObj.innerElements
        .forEach((innerElementObj) => this.renderBlockByConfig(innerElementObj));
    }
    return blockContainer;
  }
}
