// user object that stores the entire state of the user's progress
window.User = new (function(){
  var that = this,
      state;

  var defaultState = {
    'stars': 0,
    'language': 'en',
    'sandboxUnlocked': false,
    'questsUnlocked' : false,
    'soundEnabled': true,
    'musicEnabled': true,
    'towers': {
      '1': { 'score': 0, 'unlocked': false },
      '2': { 'score': 0, 'unlocked': false },
      '3': { 'score': 0, 'unlocked': false },
      '4': { 'score': 0, 'unlocked': false },
    },
    'levels': {}
  };

  // initiate all level progress to nothing
  //for (var nr in Levels.levels)
  for (var nr=1; nr<=50; nr++)
    defaultState.levels[nr] = { 'unlocked': false, 'quests': [] };

  function init() {    
    state = defaultState; // set it to default
    var stateStr = $bw.storage.get('userState');
    if (stateStr && stateStr != '') {
      var tempState = JSON.parse(stateStr);
      if (tempState.towers)
        state = tempState;
    }
    this.state = state;
    
    // if no default value was found in loaded info, use the default
    for (var o in defaultState) {
      if (this.state[o] == undefined)
        state[o] = this.state[o] = defaultState[o];
    }
    updateStarStatus();
  }

  function persistState() {
    var stateStr = JSON.stringify(state);
    $bw.storage.set('userState', stateStr);
  }

  function unlockTower(nr) {
    var obj = state.towers[nr];
    if (obj && !obj.unlocked) {
      obj.unlocked = true;
      persistState();
    }
    return that;
  }

  function unlockSandbox() {
    if (!state.sandboxUnlocked) {
      state.sandboxUnlocked = true;
      persistState();
    }
    return that;
  }

  function unlockQuests() {
    state.questsUnlocked = true;
    LevelSelect.updateLevelProgress();
    persistState();
    updateStarStatus();
    return that;
  }

  // handle when a user completes a certain level
  function completeLevel(nr) {
    var levelObj = Levels.levels[nr],
        userLevelObj = state.levels[nr];

    if (levelObj && userLevelObj) {
      if (userLevelObj.completed) 
        return;
      userLevelObj.completed = true;
      state.stars++;

      var nextUserLevelObj = state.levels[nr * 1 + 1];
      if (nextUserLevelObj) {
        nextUserLevelObj.unlocked = true;
      }

    }
    persistState();
    updateStarStatus();
    LevelSelect.updateLevelProgress();
  }

  function unlockLevel(nr) {
    var obj = state.levels[nr];
    if (obj)
      obj.unlocked = true;
    persistState();
    return that;
  }

  function hasUnlockedLevel(nr) {
    var obj = state.levels[nr];
    return (obj && obj.unlocked);
  }

  function hasUnlockedTower(nr) {
    var obj = state.towers[nr];
    return (obj && obj.unlocked);
  }

  function hasCompletedLevel(nr) {
    var obj = state.levels[nr],
        nextObj = state.levels[(nr * 1 + 1) + ''];
    if (nextObj && nextObj.unlocked)
      return true;
    else if (obj && obj.completed) // for the final level, there is no next level to check
      return;
    return false;
  }

  function completeQuest(level, quest) {
    // if this level doesn't have any quests, forget it
    if (Levels.hasQuests(level)) {
      var obj = state.levels[level],
          userQuestsArr,
          levelQuestsArr = Levels.levels[level].quests;
      // first check if there is a level array for this user and the exact questnr exists for this level
      if (obj) {
        userQuestsArr = obj.quests;
        if (userQuestsArr && Utils.contains(levelQuestsArr, quest)) {
          // make sure the user hasn't completed this level yet
          if (!Utils.contains(userQuestsArr, quest)) {
            // now add the quest to the completed list of this user, in the right order
            userQuestsArr.push(quest)
            obj.quests = userQuestsArr.sort();
            state.stars++;
            LevelSelect.updateLevelProgress();
            persistState();
            updateStarStatus();
            return true;
          }
        }
      }
    }
    return false;
  }

  function countCompletedQuests(level) {
    var count = 0;
    if (level) {
      var obj = state.levels[level];
      if (obj && obj.quests)
        return obj.quests.length;
    }
    else for (var nr in state.levels) {
      var obj = state.levels[nr];
      if (obj && obj.quests)
        count += obj.quests.length;
    }
    return count;
  }

  function hasCompletedQuest(level, quest) {
    // if this level doesn't have any quests, forget it
    if (Levels.hasQuests(level))
      if (Utils.contains(Levels.levels[level].quests, quest))
        if (Utils.contains(state.levels[level].quests, quest))
          return true;
    return false;
  }

  function hasCompletedAllQuestsForLevel(level) {
    var levelInfo = Levels.levels[level],
        userObj = state.levels[level];
    if (userObj && userObj.quests && levelInfo && levelInfo.quests) {
      for (var i=0; i<levelInfo.quests.length; i++) {
        var quest = levelInfo.quests[i];
        if (!Utils.contains(userObj.quests, quest))
          return false;
      }
      return true;
    }
    return false;
  }

  function updateStarStatus() {
    if (state.questsUnlocked)
      $('html').addClass('quests-unlocked');
    var myStars = getStars();
    $('.starsachieved').html(myStars);
    //$('.starstotal').html(Levels.getQuestCount());
  }

  function addStars(amount) {
    amount = amount || 1;
    state.stars+=amount;
    persistState();
    updateStarStatus();
  }

  function removeStars(amount) {
    amount = amount || 1;
    state.stars-=amount;
    persistState();
    updateStarStatus();
  }

  function getStars() {
    return state.stars;
  }

  function getTotalTowerScore() {
    var total = 0;
    for (var size in state.towers) {
      var score = state.towers[size].score;
      total += score;
    }
    return total;
  }

  this.init = init;
  this.unlockLevel = unlockLevel;
  this.unlockTower = unlockTower;
  this.unlockQuests = unlockQuests;
  this.unlockSandbox = unlockSandbox;
  this.completeLevel = completeLevel;
  this.completeQuest = completeQuest;
  this.hasUnlockedLevel = hasUnlockedLevel;
  this.hasUnlockedTower = hasUnlockedTower;
  this.hasCompletedLevel = hasCompletedLevel;
  this.hasCompletedQuest = hasCompletedQuest;
  this.hasCompletedAllQuestsForLevel = hasCompletedAllQuestsForLevel;
  this.countCompletedQuests = countCompletedQuests;
  this.persistState = persistState;
  this.updateStarStatus = updateStarStatus;
  this.getStars = getStars;
  this.addStars = addStars;
  this.removeStars = removeStars;
  this.getTotalTowerScore = getTotalTowerScore;
})();