var bundleName = (function () {
  'use strict';

  function sum$1(a, b) {
    return a + b;
  }
  const a = 101;
  console.log(a);

  function styleInject(css, ref) {
    if ( ref === void 0 ) ref = {};
    var insertAt = ref.insertAt;

    if (!css || typeof document === 'undefined') { return; }

    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';

    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css_248z = "#body{\r\n  background-color: aqua;\r\n}";
  styleInject(css_248z);

  var sum = function (a, b) { return a + b; };
  console.log(sum(1, 2), sum$1(1, 2));
  var main = "main.js";

  return main;

})();
