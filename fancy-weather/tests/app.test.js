import App from '../src/js/modules/app';
import appConfig from '../src/js/settings/appConfig';
import apiConfig from '../src/js/settings/apiConfig';
import imagesConfig from '../src/js/settings/imagesConfig';

const app = new App(appConfig.obj, apiConfig.obj, imagesConfig.obj);

test('all images loaded correctly', () => {
  expect(Object.keys(app.images).length).toBe(64);
});

test('default language is English', () => {
  app.loadUserSettings();
  expect(app.lang).toEqual('en');
});

test('default units are Celsius (Metrical)', () => {
  app.setDefaults();
  expect(app.units).toEqual('M');
});

test('data-attr from clicked element is getting correctly', () => {
  document.body.innerHTML = '<div class="test" data-lang="be"></div>';
  const div = document.querySelector('.test');
  expect(app.getNewValueFromClicked(div, 'lang')).toEqual('be');
});

test('get correct city name from city object', () => {
  const cityObj = {
    village: 'Moscow',
  };
  expect(app.getTownNameFromComponents(cityObj)).toEqual('Moscow');
});

test('state setup correctly', () => {
  const state = {
    name: 'Minsk',
    tags: 'summer,night',
  };
  app.setState(state);
  expect(app.state.name).toEqual('Minsk');
});

test('coords in string from state forms correctly', () => {
  const state = {
    name: 'Minsk',
    tags: 'summer,night',
    lat: '37.54',
    lng: '54.55',
  };
  app.setState(state);
  expect(app.getCoordsFromState()).toEqual('37.54,54.55');
});

test('coord conversed from float to deg/mins correctly', () => {
  const coord = '35.5';
  expect(app.correctCoords(coord)).toEqual(`35°30'`);
});

test('correct daytime', () => {
  expect(app.getYearTime(6)).toEqual(`summer`);
});

test('correct year season', () => {
  expect(app.getDayTime(8)).toEqual(`morning`);
});

test('tags forms correctly', () => {
  const dateObj = new Date('2020-07-01 19:30');
  expect(app.getTagsString(dateObj)).toEqual(`summer,evening`);
});
