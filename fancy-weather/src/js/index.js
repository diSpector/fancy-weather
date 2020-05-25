import App from '@modules/app';
import appConfig from '@settings/appConfig';
import apiConfig from '@settings/apiConfig';
// import glideConfig from '@settings/glideConfig';
import '../css/style.css';
// import '../css/keyboard.css';

const app = new App(appConfig.obj, apiConfig.obj);
app.init();
