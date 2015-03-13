window.Pause = new (function(){
  var that = this,
      _shown = false,
      _toggleEnabled = true;

  function init() {
    $('.retry-toggle .tap-area').bind(Utils.touchEnd(), clickRetry)
    $('.pause-toggle .tap-area').bind(Utils.touchEnd(), toggle)
    $(document).on(Utils.isTouch()? 'touchup' : 'mouseup', '.pause-toggle', toggle);
  }

  function toggle(event) {
    if (!Utils.wasClick(event)) return;

    Utils.eat(event);
    if (!_toggleEnabled) return false;
    if (_shown)
      hide(true);
    else
      show();
  }

  function show() {
    if (Sound.soundEnabled)
      showSoundOnButton();
    else
      showSoundOffButton();
    if (Sound.musicEnabled)
      showMusicOnButton();
    else
      showMusicOffButton();
    Sound.play('swipe1');
    _shown = true;
    $('#level').addClass('speedupTransitions');
    $('html').addClass('pause-screen-enabled');
    $(document).on(Utils.touchEnd(), 'html.pause-screen-enabled', tapWhilePaused);
    //setTimeout(function(){$('html').addClass('pause-screen-enabled');},0);
    //setTimeout(function(){$('#level').removeClass('speedupTransitions');},300);
  }

  function hide(playSound) {
    if (playSound)
      Sound.play('swipe1');
    _shown = false;
    $('html').removeClass('pause-screen-enabled');
    $(document).off(Utils.touchEnd(), 'html.pause-screen-enabled');
  }

  function tapWhilePaused(event) {
    if (!Utils.wasClick(event)) return;

    Utils.eat(event);
    var $el = $(event.target).closest('.tap-target');
    if ($el.length) {
      var action = $el.attr('data-action');
      doAction(action);
    }
    else
      hide(true);
    return false;
  }

  function showSoundOnButton() {
    $('#button4').removeClass('icon-sound-off').addClass('icon-sound-on');
    $('#tap-target-4').attr('data-action', 'sound-on');
  }

  function showSoundOffButton() {
    $('#button4').removeClass('icon-sound-on').addClass('icon-sound-off');
    $('#tap-target-4').attr('data-action', 'sound-off');
  }

  function showMusicOnButton() {
    $('#button5').removeClass('icon-music-off').addClass('icon-music-on');
    $('#tap-target-5').attr('data-action', 'music-on');
  }

  function showMusicOffButton() {
    $('#button5').removeClass('icon-music-on').addClass('icon-music-off');
    $('#tap-target-5').attr('data-action', 'music-off');
  }

  function clickRetry(event) {
    Utils.eat(event);
    Game.doAction('retry');
    return event;
  }

  function doAction(action) {
    switch(action) {
      // pressed the sound-on icon means you turn it off!
      case 'sound-on':
        Sound.disableSound();
        showSoundOffButton();
        break;
      // pressed the sound-off icon means you enable it again
      case 'sound-off':
        Sound.enableSound();
        showSoundOnButton();
        Sound.playExplosion();
        Effects.shake();
        break;
      // pressed the music-on icon means you turn it off!
      case 'music-on':
        Sound.disableMusic();
        showMusicOffButton();
        break;
      // pressed the music-off icon means you enable it again
      case 'music-off':
        Sound.enableMusic();
        showMusicOnButton();
        break;
      case 'back':
        Sound.play('track1');
        hide();
        Game.doAction(action);
        break;
      case 'play':
        hide(true);
        Game.doAction(action);
        break;
      case 'retry':
        hide();
        Game.doAction(action);
        break;
      default:
        hide();
        Game.doAction(action);
    }
  }

  function hideButton() {
    _toggleEnabled = false;
    $('#level > .pause-toggle').hide();
    $('#level > .retry-toggle').hide();
  }

  function showButton() {
    _toggleEnabled = true;
    $('#level > .pause-toggle').show();
    $('#level > .retry-toggle').show();
  }

  // the pause button should be disabled for the short time between the last explosion and the new buttons (next/retry...)
  function disableButton() {
    _toggleEnabled = false;
  }

  this.init = init;
  this.show = show;
  this.hide = hide;
  this.toggle = toggle;
  this.doAction = doAction;
  this.hideButton = hideButton;
  this.showButton = showButton;
  this.disableButton = disableButton;
  this.showSoundOnButton = showSoundOnButton;
  this.showSoundOffButton = showSoundOffButton;
  this.__defineGetter__('enabled', function() { return _shown; });

})();