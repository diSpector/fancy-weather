import Button from './button';

export default class Keyboard {
  constructor(keysObj, language, container) {
    this.keysObj = keysObj;
    this.language = language;
    this.container = container;
  }

  render() { // нарисовать кнопки
    const container = document.querySelector(`.${this.container}`);
    Object.keys(this.keysObj).forEach((buttonId) => {
      const button = new Button(buttonId, this.keysObj[buttonId], this.language, container);
      button.render();
    });
  }
}
