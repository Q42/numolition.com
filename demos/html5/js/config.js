/*

test results: iPhone 4 runs fine when exploding, but when shake is added, explosion looks to go slow

*/

window.Config = {
  'requireUnlockToPlay': true,
  'shake': !$.browser.ios || window.BubbleWrappInfo.isApp,
  'explode': true,
  'shine': true,
  'sound': true,
  'kapow': true,
  'allowLongMoves': false,
  'waitForAnimationFrame': false, //!$.browser.ios,

  init: function() {
  }
}