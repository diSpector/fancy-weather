export default {
  obj: {
    proxyApi: 'https://cors-anywhere.herokuapp.com/',
    globalContainer: 'movies',
    mountTo: '.glide',
    maxTitleLength: 35,
    glideBlocks: [
      'glideSelector',
      'glideTrack',
      'glideSlidesContainer',
      'glideControls',
      // 'glideSlide',
      'glideBulletsContainer',
    ],
    glideSelector: {
      inside: '.movies',
      // cssClass: ['glide', 'hidden'],
      cssClass: ['glide'],
    },
    glideTrack: {
      inside: '.glide',
      cssClass: ['glide__track'],
      dataProps: [
        {
          key: 'glideEl',
          value: 'track',
        },
      ],
    },
    glideSlidesContainer: {
      inside: '.glide__track',
      tag: 'ul',
      cssClass: ['glide__slides'],
    },
    glideSlide: {
      inside: '.glide__slides',
      tag: 'li',
      cssClass: ['glide__slide'],
      innerElements: [
        {
          inside: '.glide__slide',
          cssClass: ['movie__slide'],
          innerElements: [
            {
              inside: '.movie__slide',
              cssClass: ['movie__title'],
            },
            {
              inside: '.movie__slide',
              cssClass: ['movie__img'],
            },
            {
              inside: '.movie__slide',
              cssClass: ['movie__year'],
            },
            {
              inside: '.movie__slide',
              cssClass: ['movie__rating'],
              innerElements: [
                {
                  inside: '.movie__rating',
                  tag: 'span',
                  cssClass: ['rating_text'],
                },
                {
                  inside: '.movie__rating',
                  tag: 'span',
                  cssClass: ['heart'],
                  dataProps: [
                    {
                      key: 'id',
                      value: '',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    glideControls: {
      inside: '.glide',
      cssClass: ['glide__arrows'],
      dataProps: [
        {
          key: 'glideEl',
          value: 'controls',
        },
      ],
      innerElements: [
        {
          inside: '.glide__arrows',
          tag: 'button',
          cssClass: ['glide__arrow', 'glide__arrow--left'],
          dataProps: [
            {
              key: 'glideDir',
              value: '<',
            },
          ],
          innerText: '<',
        },
        {
          inside: '.glide__arrows',
          tag: 'button',
          cssClass: ['glide__arrow', 'glide__arrow--right'],
          dataProps: [
            {
              key: 'glideDir',
              value: '>',
            },
          ],
          innerText: '>',
        },
      ],
    },
    glideBulletsContainer: {
      inside: '.glide',
      cssClass: ['glide__bullets'],
      dataProps: [
        {
          key: 'glideEl',
          value: 'controls[nav]',
        },
      ],
    },

    glideBullets: {
      inside: '.glide__bullets',
      tag: 'button',
      cssClass: ['glide__bullet'],
      dataProps: [
        {
          key: 'glideDir',
          value: '=1',
        },
      ],
    },
    configObj: {
      type: 'slider',
      rewind: false,
      startAt: 0,
      perView: 4,
      // bound: 5,
      focusAt: 0,
      breakpoints: {
        1080: {
          perView: 3,
        },
        780: {
          perView: 2,
        },
        500: {
          perView: 1,
        },
      },
    },
  },
};
