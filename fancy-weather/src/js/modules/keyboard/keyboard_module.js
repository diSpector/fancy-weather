import Keyboard from './keyboard';

export default class KeyboardModule {
  constructor(moduleConfigObj, keysObj, mountTo, inputId) {
    this.mountTo = mountTo;
    this.inputId = inputId;
    this.hideClass = moduleConfigObj.hideKeyboardClass;
    this.wrapperClass = moduleConfigObj.wrapperClass;
    this.keyboardConatainerClass = moduleConfigObj.keyboardConatainerClass;
    this.keyboardKeysClass = moduleConfigObj.keyboardKeysClass;
    this.keysObj = keysObj;
    this.language = this.getLanguage();
    this.caps = false;
  }

  init() { // создать разметку (клавиатура с клавишами)
    this.renderKeyboardContainer();
    this.renderKeyboard(this.keysObj, this.language, this.keyboardKeysClass);
    this.attachEventListeners();
  }

  attachEventListeners() { // назначить слушатели кликов и нажатий на клавиши
    this.attachClickEventListeners();
  }

  attachClickEventListeners() { // назначить слушатели кликов
    const container = document.querySelector(`.${this.keyboardKeysClass}`);
    const textInput = document.getElementById(this.inputId);

    container.addEventListener('mousedown', (event) => {
      // делегируем контейнеру клавиатуры клик по кнопке
      const button = event.target.closest('.button');
      if (!button) {
        return;
      }
      this.processEvent(button);
    });

    container.addEventListener('mouseup', (event) => {
      // делегируем контейнеру клавиатуры клик по кнопке
      const button = event.target.closest('.button');
      if (!button) {
        return;
      }
      button.classList.remove('pressed');
      textInput.focus(); // чтобы фокус оставался в поле после клика по кнопкам вне его
    });
  }

  processEvent(element) { // обработка события нажатия/клика
    const cursorPos = this.getCursorPosition();
    const textInput = document.getElementById(this.inputId);

    element.classList.add('pressed');
    if (!element.classList.contains('special')) { // напечатать обычный символ
      const text = textInput.value;
      textInput.value = text.substring(0, cursorPos)
      + ((this.caps) ? element.firstChild.nodeValue.toUpperCase() : element.firstChild.nodeValue)
      + text.substring(cursorPos);
      textInput.selectionStart = cursorPos + 1;
      textInput.selectionEnd = cursorPos + 1;
    } else {
      this.processSpecialClick(element.id);
    }
  }

  processSpecialClick(elementId) {
    const textInput = document.getElementById(this.inputId);
    const text = textInput.value;
    const cursorPos = this.getCursorPosition();
    const textInputConfig = this.getTextInputConfig();
    switch (elementId) {
      case 'Backspace':
        if (cursorPos) {
          textInput.value = text.substring(0, cursorPos - 1) + text.substring(cursorPos);
          textInput.selectionStart = cursorPos - 1;
          textInput.selectionEnd = cursorPos - 1;
        }
        break;
      case 'Tab':
        textInput.value = `${text.substring(0, cursorPos)}    ${text.substring(cursorPos)}`;
        textInput.selectionStart = cursorPos + 4;
        textInput.selectionEnd = cursorPos + 4;
        break;
      case 'Delete':
        textInput.value = text.substring(0, cursorPos) + text.substring(cursorPos + 1);
        textInput.selectionStart = cursorPos;
        textInput.selectionEnd = cursorPos;
        break;
      case 'CapsLock':
        this.caps = !this.caps;
        break;
      case 'ChangeLanguageRight':
        this.switchKeyboardLanguage();
        break;
      case 'ChangeLanguageLeft':
        this.switchKeyboardLanguage();
        break;
      case 'Enter':
        this.emitEnterTextEvent();
        // this.hideKeyboard();
        break;
      case 'ArrowUp':
        if (textInputConfig.resStr === 0) {
          textInput.selectionStart = 0;
          textInput.selectionEnd = 0;
        } else {
          let finalPos = 0;
          if (
            textInputConfig.cursorPositionInCurrentString >= textInputConfig.previousStringLength
          ) {
            finalPos = textInputConfig.nIndices[textInputConfig.resStr - 1] - 1;
          } else {
            finalPos = cursorPos - textInputConfig.previousStringLength;
          }
          textInput.selectionStart = finalPos;
          textInput.selectionEnd = finalPos;
        }
        break;
      case 'ArrowLeft':
        if (cursorPos !== 0) {
          textInput.selectionStart = cursorPos - 1;
          textInput.selectionEnd = cursorPos - 1;
        }
        break;
      case 'ArrowDown':
        if (textInputConfig.resStr === (textInputConfig.strsLength.length - 1)) {
          textInput.selectionStart = textInput.value.length;
          textInput.selectionEnd = textInput.value.length;
        } else {
          let finalPos = 0;
          if (textInputConfig.cursorPositionInCurrentString > textInputConfig.nextStringLength) {
            finalPos = textInputConfig.nIndices[textInputConfig.resStr]
              + textInputConfig.nextStringLength - 1;
          } else {
            finalPos = cursorPos + textInputConfig.thisStringLength;
          }
          textInput.selectionStart = finalPos;
          textInput.selectionEnd = finalPos;
        }
        break;
      case 'ArrowRight':
        textInput.selectionStart = cursorPos + 1;
        textInput.selectionEnd = cursorPos + 1;
        break;
      default:
        break;
    }
  }

  getTextInputConfig() {
    const textInput = document.getElementById(this.inputId);
    const text = textInput.value;
    const cursorPos = this.getCursorPosition();
    const strsArrayInsideTextInput = text.split('\n');
    const strsLength = []; // массив с длиной каждой строки
    const nIndices = []; // массив с позициями переносов строк

    let counter = 0;
    let resStr = 0;

    strsArrayInsideTextInput.forEach((oneStr) => { // перебрать все строки
      strsLength.push(oneStr.length + 1);
    });

    for (let i = 0; i < text.length; i += 1) {
      if (text[i] === '\n') nIndices.push(i + 1);
    }

    while (cursorPos >= nIndices[counter]) {
      resStr += 1;
      counter += 1;
    }

    const cursorPositionInCurrentString = (resStr === 0)
      ? cursorPos
      : (cursorPos - nIndices[resStr - 1]);
    const thisStringLength = strsLength[resStr];
    const previousStringLength = (resStr === 0) ? null : strsLength[resStr - 1];
    const nextStringLength = (resStr === (strsArrayInsideTextInput.length - 1))
      ? null
      : strsLength[resStr + 1];

    return {
      cursorPos,
      strsLength,
      resStr,
      nIndices,
      thisStringLength,
      cursorPositionInCurrentString,
      previousStringLength,
      nextStringLength,
    };
  }

  getCursorPosition() { // получить позицию курсора в textInput
    const textInput = document.getElementById(this.inputId);
    return textInput.selectionStart;
  }

  renderKeyboard(keysObj, language, container) { // нарисовать клавиатуру
    const keyboard = new Keyboard(keysObj, language, container);
    keyboard.render();
  }

  switchKeyboardLanguage() { // удалить клавиутуру, поменять язык, отрисовать заново
    this.switchLanguage();
    this.deleteKeyboard();
    this.renderKeyboard(this.keysObj, this.language, this.keyboardKeysClass);
  }

  deleteKeyboard() { // удалить все клавиши из контейнера
    const keyboard = document.querySelector(`.${this.keyboardKeysClass}`);
    keyboard.innerHTML = '';
  }

  switchLanguage() { // поменять язык приложения
    const curLang = this.language;
    const newLang = (curLang === 'rus') ? 'eng' : 'rus';
    this.setLanguage(newLang);
  }

  setLanguage(language) { // записать новый язык в localStorage
    localStorage.setItem('language', language);
    this.language = language;
  }

  getLanguage() { // получить язык из localStorage или присвоить язык по умолчанию
    let curLang = localStorage.getItem('language');

    if (!curLang) { // если язык не установлен
      curLang = 'rus'; // по умолчанию
      localStorage.setItem('language', curLang);
    }

    return curLang;
  }

  emitEnterTextEvent() { // событие на нажатие Enter
    const container = document.querySelector(`${this.mountTo}`);
    const loadMoreEvent = new Event('searchThis');
    container.dispatchEvent(loadMoreEvent);
  }

  renderKeyboardContainer() { // нарисовать разметку для клавиатуры
    this.createDivWithClassInside(this.wrapperClass, this.mountTo);
    this.createDivWithClassInside(this.keyboardConatainerClass, `.${this.wrapperClass}`);
    this.createDivWithClassInside(this.keyboardKeysClass, `.${this.keyboardConatainerClass}`);
  }

  createDivWithClassInside(cssClass, outerElementSelector) {
    const outerElement = document.querySelector(outerElementSelector);
    const innerElement = document.createElement('div');
    innerElement.className = cssClass;
    outerElement.append(innerElement);
  }

  createElementInside(elementName, outerElementSelector, text = '') {
    const outerElement = document.querySelector(outerElementSelector);
    const innerElement = document.createElement(elementName);
    if (text) {
      innerElement.innerHTML = text;
    }
    outerElement.append(innerElement);
  }

  hideKeyboard() { // убрать клавиатуру после запроса
    const keyboardConatainer = document.querySelector(this.mountTo);
    keyboardConatainer.classList.add(this.hideClass);
  }
}
