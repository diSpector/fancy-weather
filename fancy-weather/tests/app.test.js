import App from '../src/js/modules/app';
import appConfig from '../src/js/settings/appConfig';
import glideConfig from '../src/js/settings/glideConfig';

const app = new App(appConfig.obj, glideConfig.obj);
test('movie 3 is not in the favorites', () => {
  expect(app.isFavorite(3)).toBeFalsy();
});

test('favorite movies length is 0 after start', () => {
  expect(app.favorites.length).toBe(0);
});

test('favorite movies length is 1 after push', () => {
  app.favorites.push({ movie: 'tes' });
  expect(app.favorites.length).toBe(1);
});
