window.Story = new (function(){
  var that = this,
      _$character,
      _$retryBalloons,
      _$nextBalloon,
      _modal = false,
      _autoCloseModalTOH,
      _handlerAtAndOfModal;

  function init() {
    _$character = $('#level > .character');
    _$retryBalloons = $('#level > .retry-balloons')
    _$nextBalloon = $('#level > .next-balloon');
    $(document).on(Utils.touchStart(), '.balloon .tap-area', tapBalloon)
  }

  function tapBalloon(event) {
    Utils.eat(event);
    var $el = $(event.target).closest('.tap-area');
    if ($el.length) {
      var action = $el.attr('data-action');
      if (action == 'retry' && $('#level').hasClass('mode-towers'))
        action = 'blow-up-tower';
      doAction(action);
    }
    return false;
  }

  function doAction(action) {
    switch(action) {
      case 'levels':
        Sound.play('track1');
        Game.doAction(action);
        break;
      default:
        Game.doAction(action);
        break;
    }
  }

  function show() {
    _$character.addClass('show');
    return that;
  }

  function hide(noFade) {
    if (noFade)
      _$character.hide();
    _$character.removeClass('show');
    if (noFade)
      setTimeout(function() {
        _$character.show();
      }, 0)
    if (_modal)
      endModal();
    return that;
  }

  function character(charName) {
    if (charName == 'girl' || charName == 'guy' || charName == 'robot') {
      _$character.removeClass('girl guy robot').addClass(charName);
    }
    return that;
  }

  function girl() {
    _$character.removeClass('girl guy robot').addClass('girl');
    return that;
  }

  function guy() {
    _$character.removeClass('girl guy robot').addClass('guy');
    return that;
  }

  function robot() {
    _$character.removeClass('girl guy robot').addClass('robot');
    return that;
  }

  function smile() {
    _$character.removeClass('sad smile hint').addClass('smile').show();
    show();
    return that;
  }

  function sad() {
    _$character.removeClass('sad smile hint').addClass('sad').show();
    show();
    return that;
  }

  function hint() {
    _$character.removeClass('sad smile hint').addClass('hint').show();
    show();
    return that;
  }

  function touchWhileModal(event) {
    Utils.eat(event);
    endModal();
    return false;
  }

  function goModal(modalHandler, autoCloseModalDelay) {
    _modal = true;
    $(document).on('mousedown touchstart', 'html.story-modal', touchWhileModal);
    _handlerAtAndOfModal = modalHandler;
    $('html').addClass('story-modal');
    if (autoCloseModalDelay) {
      _autoCloseModalTOH = setTimeout(endModal, autoCloseModalDelay);
    }
  }

  function endModal() {
    if (_autoCloseModalTOH)
      clearTimeout(_autoCloseModalTOH);
    _modal = false;
    if (_handlerAtAndOfModal)
      _handlerAtAndOfModal();
    _handlerAtAndOfModal = undefined;

    $(document).off('mousedown touchstart', 'html.story-modal');

    $('html').removeClass('story-modal');
    hide();
  }

  function showRetry() {
    _$retryBalloons.show();
  }

  function showNext() {
    _$nextBalloon.show();
  }

  function hideBalloons() {
    _$retryBalloons.hide();
    _$nextBalloon.hide();
  }

  function showLoadingFadeOut() {
    $('#loading').removeClass('fade').addClass('show');
    setTimeout(function(){
      $('#loading').addClass('fade');
    });    
  }

  this.init = init;
  this.show = show;
  this.hide = hide;
  this.goModal = goModal;
  this.endModal = endModal;
  this.smile = smile;
  this.sad = sad;
  this.hint = hint;
  this.girl = girl;
  this.guy = guy;
  this.robot = robot;
  this.character = character;
  this.showRetry = showRetry;
  this.showNext = showNext;
  this.hideBalloons = hideBalloons;
  this.showLoadingFadeOut = showLoadingFadeOut;
  this.__defineGetter__('isModal', function() { return _modal; });
})();
