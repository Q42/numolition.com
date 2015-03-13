// used for special effects and mobile optimization
window.Effects = new (function(){
  var that = this,
      _tilesOffsetTop,
      _tilesOffsetLeft,
      _shine,
      _explosion,
      _gameOffsetLeft,
      _gameOffsetTop,
      _kapows = [],
      _currentKapow = 0;


  function init() {
    _shine = new $bw.effects.sprite('shine', 'img/shine.png', 196, 206, 980, 20, 0.06);
    _explosion = new $bw.effects.sprite('explosion', 'img/explosion.png', 135, 135, 675, 10, .08);
    onResize();
    $(window).on('resize', onResize);
    for (var i=0; i<5;i++) {
      var $kapow = $('<div class="kapow kapow-' + ((i % 4)+1) + ' obj"></div>');
      $('#level').append($kapow);
      _kapows.push($kapow);
    }
  }

  function onResize() {
    _gameOffsetLeft = $('#game').offset().left;
    _gameOffsetTop = $('#game').offset().top;
  }

  // allows for doing stuff right before an actual game begins
  function gameStarts() {
    // update the actual tiles offset for properly positioning the explosions
    _tilesOffsetTop = $('#game').height() - grid.tileSize * grid.tilesY;
    _tilesOffsetLeft = Math.round(($('#game').width() - $('#tiles').width()) / 2);
  }

  function explode(x, y, i) {
    if (!Config.explode) return;
    var left = x * grid.tileSize + _tilesOffsetLeft + (grid.tileSize / 2) + _gameOffsetLeft,
        top = y * grid.tileSize + _tilesOffsetTop + (grid.tileSize / 2) - 10 + _gameOffsetTop,
        delay = (i * 80) / 1000;
    _explosion.play(left, top, delay);
  }

  function shine(x, y) {
    if (!Config.shine) return;
    var left = x * grid.tileSize + _tilesOffsetLeft + (grid.tileSize / 2) + 8 + _gameOffsetLeft,
        top = y * grid.tileSize + _tilesOffsetTop + (grid.tileSize / 2) - 12 + _gameOffsetTop;
    _shine.play(left, top);
  }

  function shineXY(left, top) {
    if (!Config.shine) return;
    _shine.play(left, top);
  }

  function shake(tileCount) {
    if (!Config.shake) return;
    $bw.effects.shake();
  }

  function shakeLite() {
    if (!Config.shake) return;
    $bw.effects.shake(3, .3, 20);
  }

  function kapow(tilesArr) {
    if (!Config.kapow) return;
    if (!tilesArr) return;

    var $tiles = $(tilesArr);
    if (!$tiles.length) return;
    if ($tiles.length <= 3) return;

    var centerX = 0, centerY = 0, len = $tiles.length;
    $tiles.each(function(){
      var x = $(this).attr('data-x') * 1,
          y = $(this).attr('data-y') * 1;
      centerX += x;
      centerY += y;
    });
    centerX = (centerX / len).toFixed(1);
    centerY = (centerY / len).toFixed(1);

    var left = centerX * grid.tileSize + _tilesOffsetLeft + (grid.tileSize / 2),
        top = centerY * grid.tileSize + _tilesOffsetTop + (grid.tileSize / 2);

    left = Math.min(Math.max(50, left), 180);

    _currentKapow = (_currentKapow + 1) % _kapows.length;
    $kapow = _kapows[_currentKapow];

    $kapow.hide().css({
      '-webkit-transition': 'none',
      '-webkit-transform': 'none',
      'opacity': 1,
      'left':left + 'px',
      'top':top + 'px'});
    
    dx = Utils.between(0,1)==0? -10 : 10;
    dy = Utils.between(0,1)==0? -5 : 5;

    setTimeout(function(){
      $kapow.show();
      setTimeout(function(){
        $kapow.css({
          '-webkit-transition': '-webkit-transform 1s ease-out, opacity .5s ease-out .5s',
          '-webkit-transform': 'translate3d(' + dx + 'px,' + dy + 'px, 0) scale(1.1)',
          'opacity': 0
        });
      },0);
    },0);
    //setTimeout(function(){
      //$('.kapow').addClass('move')
    //},0)
  }


  this.init = init;
  this.shake = shake;
  this.shakeLite = shakeLite;
  this.explode = explode;
  this.shine = shine;
  this.shineXY = shineXY;
  this.gameStarts = gameStarts;
  this.kapow = kapow;
})();