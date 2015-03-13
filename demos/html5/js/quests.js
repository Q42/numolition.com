// user object that stores the entire state of the user's progress
window.Quests = new (function(){
  var that = this,
      _shown = false,
      _toggleEnabled = true,
      _level = 0,
      $toggles = $('#quests-toggles');

  function init() {
    $('#quests-title').html(Texts.questsTitle);
    $('#quests-caption-speech').html(Texts.questsSpeech);
    $('#quests-caption-objectives').html(Texts.questsObjectives);
    $(document).on(Utils.touchStart(), '#quests-toggles', toggle);
  }

  function toggle(event) {
    Utils.eat(event);
    if (!_toggleEnabled) return false;
    if (_shown)
      hide(true);
    else
      show();
  }

  function show() {
    Sound.play('swipe1');
    _shown = true;
    $('#level').addClass('speedupTransitions');
    $('html').addClass('quest-screen-enabled');
    $(document).on(Utils.touchStart(), 'html.quest-screen-enabled', tapWhileQuestScreenIsUp);
  }

  function hide(playSound) {
    if (playSound)
      Sound.play('swipe1');

    _shown = false;
    $('html').removeClass('quest-screen-enabled quest-screen-objectives-enabled');
    $(document).off(Utils.touchStart(), 'html.quest-screen-enabled');
  }

  function tapWhileQuestScreenIsUp(event) {
    if (!_toggleEnabled) return;
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

  // returns the star nr (1,2 or 3) for this level's quest
  function getStarNrForQuestNr(level, questNr) {
    var quests = Levels.levels[level].quests;
    for (var i=0; i<quests.length; i++) {
      var quest = quests[i];      
      if (quest == questNr)
        return i + 1;
    }
    return 0;
  }

  function updateQuestsForLevel(level) {
    if (!level)
      _level = level;
    var quests = Levels.levels[level].quests,
        html = [],
        isAvailableForThisLevel,
        hasCompleted;
    
    // update the text
    $('#quests-caption-objectives').html(quests.length == 1? 
      Texts.questsObjective : Texts.questsObjectives);

    // enable or disable specific quest stars
    for (var i=0; i<quests.length; i++) {
      var quest = quests[i],
          starNr = i + 1;
      var completed = User.hasCompletedQuest(level, quest);
      if (completed)
        $('#star' + starNr).addClass('completed')
      else
        $('#star' + starNr).removeClass('completed')
    }

    if (User.hasCompletedAllQuestsForLevel(level))
      $toggles.addClass('completed');
    else
      $toggles.removeClass('completed');
        
    var questCount = 0;
    for (var i=1; i<10; i++) {
      isAvailableForThisLevel = Utils.contains(quests, i);
      if (isAvailableForThisLevel) {
        hasCompleted = User.hasCompletedQuest(level, i);
        html.push('<div class="quest-tile quest-tile-' + i + (hasCompleted? ' completed' : '') + '"></div>');
        questCount++;
      }
    }
    html = html.join(questCount <= 6? '<div class="or">' + Texts.or + '</div>' : '');
    $('#quest-objectives').html(html);
  }

  // when the toggle button is shown, tell it for what level
  // use forceFace when a level starts from scratch, not when retried
  function showToggleButton(level, forceFade) {
    var questCount = Levels.getQuestCount(level);
    if (!questCount) return;

    if (forceFade)
      $toggles.hide().removeClass('show');

    $toggles.removeClass('stars-1 stars-2 stars-3').addClass('stars-' + Math.min(3, questCount));

    $('#level').addClass('mode-quests');
    if (level > 0 && level != _level)
      updateQuestsForLevel(level);

    $toggles.show();

    setTimeout(function(){
      $toggles.addClass('show');
    }, 0);
  }

  function hideToggleButton() {
    $('#level').removeClass('mode-quests');
    $toggles.hide().removeClass('show stars-1 stars-2 stars-3');
  }

  function disableToggleButton() {
    _toggleEnabled = false;
  }
  
  function enableToggleButton() {
    _toggleEnabled = true;
  }


  function peek() {
    _shown = true;
    $('#level').addClass('speedupTransitions');
    $('html').addClass('quest-screen-objectives-enabled');
    _toggleEnabled = false;
  }

  function lightUpQuestTile(nr, hasCompletedAllQuests) {
    var $el = $('#quest-objectives .quest-tile-' + nr);
    if (!$el.length) return;

    var offset = $el.offset(),
        left = offset.left + $el.width() / 2 + 6,
        top = 9 + offset.top + $el.height() / 2 - 6,
        starNr = getStarNrForQuestNr(Game.level * 1, nr);

    //_toggleEnabled = true;
    Effects.shineXY(left, top, 0, true);
    $el.addClass('completed');
    $('#star' + starNr).addClass('completed');
    setTimeout(function(){
      shineStar(starNr);
    }, 150);
  }

  function shineStar(starNr, playSound) {
    var $star = $('#star' + starNr);
    if (!$star.length) return;
    var left = $star.offset().left + 23,
        top = $star.offset().top + 17;
    Effects.shineXY(left, top, 0, true);    
  }

  this.init = init;
  this.toggle = toggle;
  this.show = show;
  this.peek = peek;
  this.hide = hide;
  this.showToggleButton = showToggleButton;
  this.hideToggleButton = hideToggleButton;
  this.disableToggleButton = disableToggleButton;
  this.enableToggleButton = enableToggleButton;
  this.updateQuestsForLevel = updateQuestsForLevel;
  this.lightUpQuestTile = lightUpQuestTile;  
  this.shineStar = shineStar;
})();