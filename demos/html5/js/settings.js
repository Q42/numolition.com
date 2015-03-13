window.Settings = new (function(){
  var that = this,
      _defaultLanguage = 'en',
      _languages = {'en': true, 'nl': true };

  function init() {
  	$('#nav #modes .settings').bind(Utils.touchEnd(), toggle);
    var lang = that.language;
    applyLanguage(lang);
    updateSoundAndMusicButtons();
  }

  function toggle(event) {
    if (!Utils.wasClick(event)) return;
    Utils.eat(event);

  	if (LevelSelect.page != 0)
  	  hide();
  	else
  	  show();
  	return false;
  }

  function show() {
    updateSoundAndMusicButtons();
  	$('#settings').show();
    if (!$('#credits-roll').hasClass('roll'))
      $('#credits-roll').addClass('roll');
    $('#nav').removeClass('show-levels show-towers').addClass('show-settings');
    LevelSelect.show().loadPage(1);
  }

  function hide() {
    $('#nav').removeClass('show-settings');
    LevelSelect.show().loadPage(0);
  }

  function toggleLanguage() {
    var curLang = that.language,
        availLang = Utils.toArray(_languages);

    for (var i=0; i<availLang.length; i++)
      if (availLang[i] == curLang)
        break;

    var newLang = availLang[(i + 1) % availLang.length];
    setLanguage(newLang);
    Effects.shake();
    Sound.playExplosion();
  }

  function setLanguage(lang) {
    if (!(lang in _languages)) return;
    User.state.language = lang;
    User.persistState();
    applyLanguage(lang);
  }

  function applyLanguage(lang) {
    var langUpper = lang.toUpperCase();
    if ($('#language-flag').hasClass('lang-' + langUpper))
      return;
    $('#language-flag')[0].className = 'obj flag-' + langUpper;
    $('#language').html(Texts['lang' + langUpper]);
    $('#othergame').html(Texts.quentoTry);
    $('#quentoplayers').html(Texts.quentoPlayers);
    $('#credits-roll').html(Texts.credits.replace(/\|/gi, '<br>'));
  }

  function toggleSound() {
    if (Sound.soundEnabled)
      Sound.disableSound();
    else {
      Sound.enableSound();
      Sound.playExplosion();
      Effects.shake();
    }
    updateSoundAndMusicButtons();
  }

  function toggleMusic() {
    if (Sound.musicEnabled)
      Sound.disableMusic();
    else
      Sound.enableMusic();
    updateSoundAndMusicButtons();
  }

  function updateSoundAndMusicButtons() {
    if (Sound.soundEnabled)
      showSoundOn();
    else
      showSoundOff();
    if (Sound.musicEnabled)
      showMusicOn();
    else
      showMusicOff();
    if (Sound.soundEnabled && Sound.musicEnabled)
      $('#settings-sound-panel').addClass('happy');
    else
      $('#settings-sound-panel').removeClass('happy');
  }

  function showSoundOn() {
    $('#settings-sound').removeClass('sound-off').addClass('sound-on');
  }

  function showSoundOff() {
    $('#settings-sound').removeClass('sound-on').addClass('sound-off');
  }

  function showMusicOn() {
    $('#settings-music').removeClass('music-off').addClass('music-on');
  }

  function showMusicOff() {
    $('#settings-music').removeClass('music-on').addClass('music-off');
  }

  function loadQuento() {
    console.log('loadQuento');
    if (confirm('Clear progress and reload?')) {
      $bw.storage.clear();
      document.location.reload();
    }
  }

  this.init = init;
  this.show = show;
  this.hide = hide;
  this.toggleLanguage = toggleLanguage;
  this.__defineGetter__('language', function() { 
    var lang = User.state.language;
    if (lang in _languages)
      return lang;
    else
      return _defaultLanguage;
  });
  this.setLanguage = setLanguage;
  this.loadQuento = loadQuento;
  this.toggleMusic = toggleMusic;
  this.toggleSound = toggleSound;
})();
