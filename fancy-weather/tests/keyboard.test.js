import KeyboardModule from '../src/js/modules/keyboard/keyboard_module';
import appConfig from '../src/js/settings/appConfig';
import moduleConfig from '../src/js/modules/keyboard/settings/moduleConfig';
import keysConfig from '../src/js/modules/keyboard/settings/keysConfig';

const keyboard = new KeyboardModule(
  moduleConfig.obj,
  keysConfig.obj,
  appConfig.obj.keyboardContainer,
  appConfig.obj.searchInputId,
);

test('default keyboard language is Rus', () => {
  expect(keyboard.getLanguage()).toBe('rus');
});

test('keyboard language after switching is Eng', () => {
  keyboard.switchLanguage();
  expect(keyboard.getLanguage()).toBe('eng');
});

test('default case is lower', () => {
  expect(keyboard.caps).toBeFalsy();
});

// написать mock или разбить метод на независимые от значения внешнего инпута
// test('case after CapsLock pushing is upper', () => {
//   keyboard.processSpecialClick('CapsLock')
//   expect(keyboard.caps).toBeTruthy();
// });
