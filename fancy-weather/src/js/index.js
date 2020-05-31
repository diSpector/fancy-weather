import App from '@modules/app';
import appConfig from '@settings/appConfig';
import apiConfig from '@settings/apiConfig';
import imagesConfig from '@settings/imagesConfig';
import errorsConfig from '@settings/errorsConfig';
import translateConfig from '@settings/translateConfig';
import voiceConfig from '@settings/voiceConfig';
import '../css/style.css';

const app = new App(
  appConfig.obj,
  apiConfig.obj,
  imagesConfig.obj,
  errorsConfig.obj,
  translateConfig.obj,
  voiceConfig.obj,
);
app.init();
