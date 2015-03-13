// user object that stores the entire state of the user's progress
window.PreLoadImages = new (function(){
  var that = this,
      _images = [

'cover.jpg',
'explosion.png',
'hand.png',
'kapow.png',
'shine.png',
'stellage1.png',
'stellage2.png',
'tile__1.png',
'tile__2.png',
'tile__3.png',
'tile__4.png',
'tile__5.png',
'tile__6.png',
'tile__7.png',
'tile__8.png',
'tile__9.png',
'tile__99_2.png',
'tile__bomb.png',
'bgs/sky1.jpg',
'bgs/sky2.jpg',
'bgs/sky3.jpg',
'bgs/testlab.jpg',
'bgs/testlab2.jpg',
'bgs/testlab3.jpg',
'bgs/testlab4.jpg',
'bgs/testlab5.jpg',
'characters/bubble.png',
'characters/bubbles.png',
'characters/girlhint.png',
'characters/girlsad.png',
'characters/girlsmile.png',
'characters/guyhint.png',
'characters/guysmile.png',
'characters/robothint.png',
'characters/robotsad.png',
'characters/robotsmile.png',
'comic/comic-border-1.png',
'comic/comic-border-2.png',
'comic/comic-border-3.png',
'comic/comic-box2.png',
'comic/comic_box1.png',
'comic/pause_bg.png',
'levelselect/back.png',
'levelselect/back_grey.png',
'levelselect/levels-page-1.jpg',
'levelselect/levels-page-2.jpg',
'levelselect/levels-page-3.png',
'levelselect/levels-page-4.png',
'levelselect/levels-page-5.png',
'levelselect/levels-page-6.png',
'levelselect/levels-page-7.png',
'levelselect/next.png',
'levelselect/next_grey.png',
'levelselect/page1',
'levelselect/prev.png',
'levelselect/prev_grey.png',
'levelselect/progress.png',
'levelselect/progress_grey.png',
'levelselect/page1/1.png',
'levelselect/page1/2.png',
'levelselect/page1/3.png',
'levelselect/page1/4.png',
'levelselect/page1/5.png',
'levelselect/page1/6.png',
'levelselect/page1/7.png',
'modes/bg_modes.jpg',
'modes/numolish.png',
'modes/random-locked.png',
'modes/random.png',
'modes/settings.png',
'modes/towers-locked.png',
'modes/towers.png',
'pause/bomb.png',
'pause/bomb_lit.png',
'pause/icon-levels.png',
'pause/icon-music-off.png',
'pause/icon-music-on.png',
'pause/icon-next.png',
'pause/icon-play.png',
'pause/icon-retry.png',
'pause/icon-sound-off.png',
'pause/icon-sound-on.png',
'pause/pause-button.png',
'pause/pause-icon.png',
'pause/pause_bg.jpg',
'pause/pause_bg2.jpg',
'pause/retry-button.png',
'quests/droid-head.png',
'quests/quests-bg.jpg',
'quests/star.png',
'quests/star_white.png',
'quests/tile_greyed_1.png',
'quests/tile_greyed_2.png',
'quests/tile_greyed_3.png',
'quests/tile_greyed_4.png',
'quests/tile_greyed_5.png',
'quests/tile_greyed_6.png',
'quests/tile_greyed_7.png',
'quests/tile_greyed_8.png',
'quests/tile_greyed_9.png',
'settings/audio_happy.png',
'settings/audio_sad.png',
'settings/credits.png',
'settings/flag_dutch.png',
'settings/flag_english.png',
'settings/quento.png',
'settings/settingsbg.jpg',
'towers/bg_tower_1.jpg',
'towers/bg_tower_2.jpg',
'towers/bg_tower_3.jpg',
'towers/bg_tower_4.jpg',
'towers/tower1_locked.png',
'towers/tower2_locked.png',
'towers/tower3_locked.png',
'towers/tower4_locked.png',
'towers/towerselect.jpg',

      ''];

  function go(callback) {
    var count = _images.length;
  	for (var i=0; i<_images.length; i++) {
  		if (!_images[i].length) {
        count--;
  			continue;
      }
  		var url = 'img/' + _images[i],
          img = new Image();
      img.onload = function() {
        count--;
        if (!count && callback)
          callback();
      }
      img.onerror = function() {
        count--;
        console.error('!!! COULD NOT PRELOAD IMAGE ', this.src, count);
        if (!count && callback)
          callback();
      }
      img.src = url;
  	}
  }

  this.go = go;
})();