export default {
  obj: {
    yaTranslateApiUrl: {
      url: 'https://translate.yandex.net/api/v1.5/tr.json/translate?',
      params: {
        key: 'trnsl.1.1.20200322T155651Z.de98a60e6a99185e.089aea4237b51c6db082c966f27a7895cd1e8b44&',
      },
    },

    geolocation: {
      url: 'https://ipinfo.io/json?',
      params: {
        token: '14137bcb7de365',
      },
    },

    weatherDaily: {
      url: 'https://api.weatherbit.io/v2.0/forecast/daily?',
      params: {
        key: '9cdf299171544412be174b94e11dd47f',
        // key: '209d602ed65944f5ac3de85bf8b00f43',
        lang: 'en',
        units: 'M', // metric, I - Fahrenheit,
        days: 5,
        // city: 'Moscow',
      },
    },

    weatherCurrent: {
      url: 'https://api.weatherbit.io/v2.0/current?',
      params: {
        key: '9cdf299171544412be174b94e11dd47f',
        // key: '209d602ed65944f5ac3de85bf8b00f43',
        lang: 'en',
        units: 'M', // metric, I - Fahrenheit,
        // city: 'Moscow',
      },
    },

    flickr: {
      url: 'https://www.flickr.com/services/rest/?',
      params: {
        method: 'flickr.photos.search',
        api_key: 'b690d29aff650cd0fb6a24fa2830c1d5',
        secret: 'a4879623dd575d22',
        // tags: 'nature,spring,morning',
        tag_mode: 'all',
        extras: 'url_h',
        format: 'json',
        nojsoncallback: 1,
      },
      // get photo
      // https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg
    },

    mapbox: {
      url: '',
      token: 'pk.eyJ1IjoidGVzdGluZ2FwaXMiLCJhIjoiY2thbGx6dnRnMHZ5ZjMwdGR5MXVmYzdtaSJ9.laJHrx2lp_5xUzjuM75N-Q',

    },

    opencage: {
      url: 'https://api.opencagedata.com/geocode/v1/json?',
      params: {
        q: 'Minsk',
        pretty: 1,
        key: '8114533ae47e43bbb81149a84de22e25',
      },
    },

    proxyApi: 'https://cors-anywhere.herokuapp.com/',
  },
};
