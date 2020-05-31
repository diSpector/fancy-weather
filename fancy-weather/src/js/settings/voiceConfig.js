export default {
  obj: {
    // голосовые команды
    voiceCommands: {
      russian: {
        method: 'chooseLanguage',
        arg: {
          target: {
            dataset: { lang: 'ru' },
          },
        },
      },
      рашин: {
        method: 'chooseLanguage',
        arg: {
          target: {
            dataset: { lang: 'ru' },
          },
        },
      },
      рашан: {
        method: 'chooseLanguage',
        arg: {
          target: {
            dataset: { lang: 'ru' },
          },
        },
      },
      english: {
        method: 'chooseLanguage',
        arg: {
          target: {
            dataset: { lang: 'en' },
          },
        },
      },
      инглиш: {
        method: 'chooseLanguage',
        arg: {
          target: {
            dataset: { lang: 'en' },
          },
        },
      },
      belarusian: {
        method: 'chooseLanguage',
        arg: {
          target: {
            dataset: { lang: 'be' },
          },
        },
      },
      белоруссия: {
        method: 'chooseLanguage',
        arg: {
          target: {
            dataset: { lang: 'be' },
          },
        },
      },
      celsius: {
        method: 'chooseUnits',
        arg: {
          target: {
            dataset: { units: 'M' },
          },
        },
      },
      цельсий: {
        method: 'chooseUnits',
        arg: {
          target: {
            dataset: { units: 'M' },
          },
        },
      },
      fahrenheit: {
        method: 'chooseUnits',
        arg: {
          target: {
            dataset: { units: 'I' },
          },
        },
      },
      фаренгейт: {
        method: 'chooseUnits',
        arg: {
          target: {
            dataset: { units: 'I' },
          },
        },
      },
      weather: {
        method: 'playWeather',
        arg: {},
      },
      forecast: {
        method: 'playWeather',
        arg: {},
      },
      погода: {
        method: 'playWeather',
        arg: {},
      },
      надворе: {
        method: 'playWeather',
        arg: {},
      },
      louder: {
        method: 'updateVolume',
        arg: 0.1,
      },
      lauder: {
        method: 'updateVolume',
        arg: 0.1,
      },
      громче: {
        method: 'updateVolume',
        arg: 0.1,
      },
      quieter: {
        method: 'updateVolume',
        arg: -0.1,
      },
      тише: {
        method: 'updateVolume',
        arg: -0.1,
      },
      цішэй: {
        method: 'updateVolume',
        arg: -0.1,
      },
      ціша: {
        method: 'updateVolume',
        arg: -0.1,
      },
    },

  },
};
