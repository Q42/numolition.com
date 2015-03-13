var Utils = {

  transitionEndEvent: 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd',

  touchStart: function() {
    return Utils.isTouch()? 'touchstart' : 'mousedown';
  },
  touchMove: function() {
    return Utils.isTouch()? 'touchmove' : 'mousemove';
  },
  touchEnd: function() {
    return Utils.isTouch()? 'touchend' : 'mouseup';
  },

  // sometimes binding on clicks in mobile browsers doesn't work, so we bind on touchend...
  // however, when we do, we want to ensure the touchend happened on the same element as the touchstart
  // so we log every touchstart and check during the touchEnd-listener on Utils.wasClick(event)
  requireClicksOnTouchEnds: function() {
    $(document).on(Utils.touchStart(), function(event) {
      Utils._touchDownTarget = event.target;
    });
  },

  // in the situation mentioned above, we should check in the touchend handler if it was a click...
  wasClick: function(event) {
    return event.target == Utils._touchDownTarget; 
  },

  isTouch: function() {
    return 'ontouchstart' in document.documentElement;
  },
  padLeft: function (nr, n, str) {
    return Array(n - String(nr).length + 1).join(str || '0') + nr;
  },
  trim: function (s) {
    return s.replace(/^\s*|\s*$/gi, '');
  },
  between: function (min, max, decimals) {
    if (decimals)
      return ((Math.random() * (max - min)) + min).toFixed(decimals) * 1;
    return Math.floor((Math.random() * (max - min + 1)) + min);
  },
  index: function (obj, i) {
    var j = 0;
    for (var name in obj) {
      if (j == i)
        return obj[name];
      j++;
    }
  },
  areArraysEqual: function(arr1, arr2) {
    if (!arr1 || !arr2) return false;
    return arr1.join('|') === arr2.join('|'); // dirty but enough
  },
  count: function (obj) {
    var count = 0;
    for (var name in obj)
      count++;
    return count;
  },
  shuffle: function (arr) {
    var tmp = [];
    while (arr.length > 0)
      tmp.push(Utils.draw(arr));
    for (var i = 0; i < tmp.length; i++)
      arr[i] = tmp[i];
    return arr // arr!
  },
  eat: function (e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  },
  pick: function (arr) {
    var drawFromArr = arr;
    if (arr.constructor == Object) {
      drawFromArr = [];
      for (var id in arr)
        drawFromArr.push(id);
    }
    var drawIndex = Utils.between(0, drawFromArr.length - 1);
    if (drawFromArr.length == 0)
      return null;
    return drawFromArr[drawIndex];
  },
  draw: function (arr, optionalValueToMatch) {
    var drawFromArr = arr;
    if (arr.constructor == Object) {
      drawFromArr = [];
      for (var id in arr)
        drawFromArr.push(id);
    }
    if (drawFromArr.length == 0)
      return null;
    var drawIndex = Utils.between(0, drawFromArr.length - 1);
    // if a value was given, find that one
    if (optionalValueToMatch != undefined) {
      var foundMatch = false;
      for (var i = 0; i < drawFromArr.length; i++) {
        if (drawFromArr[i] == optionalValueToMatch) {
          drawIndex = i;
          foundMatch = true;
          break;
        }
      }
      if (!foundMatch)
        return null;
    }
    var value = drawFromArr[drawIndex];
    drawFromArr.splice(drawIndex, 1);
    return value;
  },
  // removes the given value from arr
  removeFromArray: function (arr, val) {
    if (arr.length == 0)
      return null;
    var foundMatch = false, drawIndex = -1;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] == val) {
        drawIndex = i;
        foundMatch = true;
        break;
      }
    }
    if (!foundMatch)
      return null;
    var value = arr[drawIndex];
    arr.splice(drawIndex, 1);
    return value;
  },
  toArray: function (obj) {
    var arr = [];
    for (var id in obj)
      arr.push(id);
    return arr;
  },
  fillArray: function(min, max, repeatEachValue) {
    if (!repeatEachValue)
      repeatEachValue = 1;
    var arr = new Array();
    for (var repeat=0; repeat<repeatEachValue; repeat++)
      for (var i=min; i<=max; i++)
        arr.push(i);
    return arr;
  },
  contains: function(arr, item) {
    for (var i=0; i<arr.length; i++)
      if (arr[i] == item)
        return true;
    return false;
  },
  setCookie: function(name, value, days) {
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      var expires = "; expires=" + date.toGMTString();
    } else
      var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
  },
  getCookie: function(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for ( var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ')
        c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0)
        return c.substring(nameEQ.length, c.length);
    }
    return null;
  },
  clearCookie: function(name) {
    this.setCookie(name, "", -1);
  },
  offsetColor: function(hex, lum) {
    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
      hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    }
    lum = lum || 0;
    // convert to decimal and change luminosity
    var rgb = "#", c, i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i*2,2), 16);
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
      rgb += ("00"+c).substr(c.length);
    }
    return rgb;
  },
  test1: function(color) {
    return 'border-color: ' +
      Utils.offsetColor(color, 0.2) + ' ' +
      Utils.offsetColor(color, -0.2) + ' ' +
      Utils.offsetColor(color, -0.2) + ' ' +
      Utils.offsetColor(color, 0.2);
  },
  getColor: function(forRoundNr) {
    if (!isNaN(forRoundNr)) {
      var colorOrder = ["#FFBF00", "#00A3D9", "#FF00BF", "#80FF00", "#00FFA3", "#BFFF00", "#FF0080"];
      if (forRoundNr < colorOrder.length)
        return colorOrder[forRoundNr];
    }
    var colors = [Utils.draw(['40', '80', 'BF', 'A3']), Utils.draw(['40', '80', 'BF', 'A3']), Utils.draw(['77', 'D9', 'FF'])];
    var colorStr = '#';
    for (var i=0; i<3; i++)
      colorStr += Utils.draw(colors);
    return colorStr;
  },
  setColor: function(themeColor, forRoundNr) {
    var color = themeColor || Utils.getColor(forRoundNr);
    var styleStr = '.themed body,.themed #canvas,.themed #message,.themed #answer,.themed .stars,.themed .box.selected,.themed .subtitle, html.splash.allow-hint .box.hint, html.tutorial.allow-hint .box.hint { background: ' + color + ' }';
    $('#theme').remove();
    $('head').append('<style id="theme">' + styleStr + '</style>');
    $('html').addClass('theming');
    setTimeout(function(){$('html').addClass('themed');}, 0)
    setTimeout(function(){$('html').removeClass('theming');}, 10);
    return color;
  },
  cssVendor: function($el, prop, value) {
    switch (prop) {
      case 'opacity':
        if ($.browser.ie) {
          $el.css('-ms-filter', '"progid:DXImageTransform.Microsoft.Alpha(Opacity=' + Math.round(value * 100) + ')"');
        }
        else
          $el.css(prop, value);
        break;
      default:
        var prefixes = ['', '-webkit-', '-moz-', '-o-', '-ms-'];
        for (var i=0; i<prefixes.length; i++) {
          $el.css(prefixes[i] + prop, value);
        }
        break;
    }
  },
  // similar as String.Format in C#, syntax like Utils.formatText('Hello {1}, how are {0}', 'you', 'world');
  formatText: function(text) {
    var replacements = arguments;
    return text.replace(/\{.*?\}/gi, function(index) {
      index = index.replace(/\D/gi, '') * 1 + 1;
      return replacements[index];
    });
  },
  centerElement: function($el) {
    var top = Math.max(0, Math.round(($(window).height() - $el.height()) / 2));
    var left = Math.max(0, Math.round(($(window).width() - $el.width()) / 2));
    $el.css({'position': 'absolute', 'top': top + 'px', 'left': left + 'px'});
  },
  createCSS: function(cssStr) {
    var style = document.createElement('style');
    style.innerHTML = cssStr;
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(style);
  },
  showTextPerCharacter: function(container) {
    var current = 0,
        queue = [];

    function scan(element) {
      var items = $(element)[0].childNodes;
      for (var i=0; i<items.length; i++) {
        if (items[i].constructor == Text)
          hacknslashText(items[i].nodeValue);
        else
          scan(items[i]);
      }
    }

    function hacknslashText(s) {
      for (var i=0; i<s.length; i++) {
        var chr = s.substr(i,1);
        queue.push(chr);
      }
    }

    scan(container);
    //console.log(queue);

  }
}

$.browser = {};
$.browser.chrome = /chrome/.test(navigator.userAgent.toLowerCase());
$.browser.android = /android/.test(navigator.userAgent.toLowerCase());
$.browser.safari = /safari/.test(navigator.userAgent.toLowerCase());
$.browser.ipad = /ipad/.test(navigator.userAgent.toLowerCase());
$.browser.iphone = /iphone|ipod/.test(navigator.userAgent.toLowerCase());
$.browser.ios = /ipad|iphone|ipod/.test(navigator.userAgent.toLowerCase());
$.browser.ie = /msie/.test(navigator.userAgent.toLowerCase());

if ($.browser.ios) $('html').addClass('ios');
if ($.browser.iphone) $('html').addClass('iphone');
if ($.browser.chrome) $('html').addClass('chrome');
if ($.browser.safari && !$.browser.ios) $('html').addClass('mac');
if ($.browser.android) $('html').addClass('android');

window.requestAnimFrame = (function () {
  return window.requestAnimationFrame
		|| window.webkitRequestAnimationFrame
		|| window.mozRequestAnimationFrame
		|| window.oRequestAnimationFrame
		|| window.msRequestAnimationFrame
		|| function (callback, element) {
		  window.setTimeout(function () {
		    callback(+new Date);
		  }, 10);
		};
})();

function removeSelfOnEnd(event) {
  var el = event.target, parent = el.parentNode;
  parent.removeChild(el);
}