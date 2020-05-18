import Slider from '../src/js/modules/slider';
import glideConfig from '../src/js/settings/glideConfig';

const fetch = require('node-fetch');

const slider = new Slider(glideConfig, [], []);
const getImageStatus = (src) => fetch(src);

test('there are no movies at start', () => {
  expect(slider.movies.length).toBe(0);
});

test('there are 2 favorite movies after update', () => {
  slider.updateFavorites([
    {
      img: 'https://m.media-amazon.com/images/M/MV5BNzVlY2MwMjktM2E4OS00Y2Y3LWE3ZjctYzhkZGM3YzA1ZWM2XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
    },
    {
      img: 'https://m.media-amazon.com/images/M/MV5BNjAyNTk1NTEwM15BMl5BanBnXkFtZTcwMjE4NzMyMQ@@._V1_SX300.jpg',
    },
  ]);
  expect(slider.favorites.length).toBe(2);
});

test('status of the first image from favorites is 200', async () => {
  const resStatus = await getImageStatus(slider.favorites[0].img).then((res) => res.status);
  expect(resStatus).toBe(200);
});

test('status of the second image from favorites is 404', async () => {
  const resStatus = await getImageStatus(slider.favorites[1].img).then((res) => res.status);
  expect(resStatus).toBe(404);
});
