export default class Button {
  constructor(id, buttonObj, language, container) {
    this.id = id;
    this.button = buttonObj;
    this.language = language;
    this.container = container;
  }

  render() {
    const buttonDiv = this.createButtonDiv();
    this.container.append(buttonDiv);
  }

  createButtonDiv() {
    const el = document.createElement('div');
    el.id = this.id;
    el.classList.add('button');
    if ('style' in this.button) {
      this.button.style.forEach((st) => {
        el.classList.add(st);
      });
    }
    el.innerText = this.button[this.language];
    if ('alternative' in this.button) {
      const alterEl = document.createElement('div');
      alterEl.classList.add('alternative');
      alterEl.innerText = this.button.alternative;
      el.append(alterEl);
    }
    return el;
  }
}
