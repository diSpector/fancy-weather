import App from '@modules/app';
import appConfig from '@settings/appConfig';
import glideConfig from '@settings/glideConfig';
import '../css/style.css';
// import '../css/keyboard.css';

const app = new App(appConfig.obj, glideConfig.obj);
app.init();
