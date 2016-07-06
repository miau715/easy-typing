'use strict';

/* global JSZhuyinClient, JSZhuyin */

// This file is used to run JSZhuyin within a desktop browser,
// interacting with the user with an US Keyboard.

var currentAction = "typing";
var forSafariNum = false;

var D3EKeyboardEventHelper = {
  getKeyPropFromEvent: function(evt) {
    if (evt.key) {
      return evt.key;
    }
    // There will always be a charCode if this event is a printable character,
    // or a keypress event of non-printable key from WebKit/Chrome.
    switch (evt.charCode) {
      case 0x0d:
        return 'Enter';
      default:
        if (evt.charCode >= 0x20 && evt.charCode <= 0x7e) {
          return String.fromCharCode(evt.charCode);
        }
    }

    // If there is an old DOM3 keyIdentifier property, we should use it.
    // ref:
    // http://w3.org/TR/2007/WD-DOM-Level-3-Events-20071221/keyset#KeySet-Set
    // This is not a complete set, it only contains the keys our IME interests.
    if ('keyIdentifier' in evt) {
      switch (evt.keyIdentifier) {
        case 'U+0008':
          return 'Backspace';
        case 'Enter':
          return 'Enter';
        case 'U+001B':
          return 'Escape';
        case 'U+0020':
          return ' ';
        case 'Left':
          return 'ArrowLeft';
        case 'Right':
          return 'ArrowRight';
        default:
          if (evt.keyIdentifier.substr(0, 2) === 'U+') {
            var charCode = parseInt(evt.keyIdentifier.substr(2), 16);
            // Only an U+XXXX code within this range should be trusted.
            if (charCode >= 0x20 && charCode <= 0x7e) {
              return String.fromCharCode(charCode);
            }
          }
      }
    }

    // Some other information extractable from keyCode.
    // XXX: This is not entirely correct since we don't know the state
    // of CapsLock, and we also assuming user is on US Layout, but at least
    // we have someting filled into the |key| value.
    // But the |code| value come up from these values should be correct.
    switch (evt.keyCode) {
      case 0x08:
        return 'Backspace';
      case 0x0d:
        return 'Enter';
      case 0x1b:
        return 'Escape';
      case 0x20:
        return ' ';
      case 0x25:
        return 'ArrowLeft';
      case 0x27:
        return 'ArrowRight';
      case 0xc0:
        return evt.shiftKey ? '~' : '`';
      case 0xbd:
        return evt.shiftKey ? '_' : '-';
      case 0xbb:
        return evt.shiftKey ? '+' : '=';
      case 0xdb:
        return evt.shiftKey ? '{' : '[';
      case 0xdd:
        return evt.shiftKey ? '}' : ']';
      case 0xdc:
        return evt.shiftKey ? '|' : '\\';
      case 0xba:
        return evt.shiftKey ? ':' : ';';
      case 0xde:
        return evt.shiftKey ? '"' : '\'';
      case 0xbc:
        return evt.shiftKey ? '<' : ',';
      case 0xbe:
        return evt.shiftKey ? '>' : '.';
      case 0xbf:
        return evt.shiftKey ? '?' : '/';
      default:
        if (!evt.shiftKey) {
          if (evt.keyCode >= 0x41 && evt.keyCode <= 0x5a) { // A-Z
            return String.fromCharCode(evt.keyCode).toLowerCase();
          }
          if (evt.keyCode >= 0x30 && evt.keyCode <= 0x39) { // 0-9
            return String.fromCharCode(evt.keyCode);
          }
        } else {
          if (evt.keyCode >= 0x41 && evt.keyCode <= 0x5a) { // A-Z
            return String.fromCharCode(evt.keyCode);
          }
          if (evt.keyCode >= 0x30 && evt.keyCode <= 0x39) { // 0-9
            return ')!@#$%^&*('.charAt(evt.keyCode & 0x0f);
          }
        }
    }
  },
  getCodePropFromEvent: function(evt) {
    console.log("evt.keyCode"+ evt.keyCode);
    console.log("evt.code"+ evt.code);
    // safari 抓不到 evt.code
    if (evt.code) {
      return evt.code;
    }

    // 可是 safari 可以抓到 key ， chrome 和 firefox 抓不到
    // Assuming user is on US Keyboard layout, we could get the code value from
    // the key value.
    var key = this.getKeyPropFromEvent(evt);
    console.log("key "+ key);
    if (!key) {
      return;
    }
    // 有 key 的一定不是 chrome 或 firefox （？），再用 evt.keyCode 判斷按鍵
    var keycode = evt.keyCode
    if (keycode == 13 || keycode == 110 || (keycode >= 96) && (keycode <= 105)) {
      forSafariNum = true;
      switch (keycode) {
        case 13:  // enter ！注意此處會有無法與大鍵盤enter分別的問題
          return "NumpadEnter";
        break;
        case 110: // .
          return "NumpadDecimal";
        break;
        case 96:  // 0
          return "Numpad0";
        break;
        case 97:  // 1
          return "Numpad1";
        break;
        case 98:  // 2
          return "Numpad2";
        break;
        case 99:  // 3
          return "Numpad3";
        break;
        case 101: // 5
          return "Numpad5";
        break;
        default:
          return "NumpadOthers"; // 其他完全不理
      }
    }

    switch (key) {
      case 'Backspace':
        return 'Backspace';
      case 'Enter':
        return 'Enter';
      case 'Escape':
        return 'Escape';
      case ' ':
        return 'Space';
      case 'ArrowLeft':
        return 'ArrowLeft';
      case 'ArrowRight':
        return 'ArrowRight';
      case '~':
      case '`':
        return 'Backquote';
      case '_':
      case '-':
        return 'Minus';
      case '+':
      case '=':
        return 'Equal';
      case '{':
      case '[':
        return 'BracketLeft';
      case '}':
      case ']':
        return 'BracketRight';
      case '\\':
      case '|':
        return 'Backslash';
      case ':':
      case ';':
        return 'Semicolon';
      case '"':
      case '\'':
        return 'Quote';
      case '<':
      case ',':
        return 'Comma';
      case '>':
      case '.':
        return 'Period';
      case '?':
      case '/':
        return 'Slash';
      case '!':
        return 'Digit1';
      case '@':
        return 'Digit2';
      case '#':
        return 'Digit3';
      case '$':
        return 'Digit4';
      case '%':
        return 'Digit5';
      case '^':
        return 'Digit6';
      case '&':
        return 'Digit7';
      case '*':
        return 'Digit8';
      case '(':
        return 'Digit9';
      case ')':
        return 'Digit0';
      default:
        if (/^[\d]$/.test(key)) {
          return 'Digit' + key;
        }
        if (/^[a-z]$/i.test(key)) {
          return 'Key' + key.toUpperCase();
        }
    }
  }
};

// Map the characters on the standard keyboard to Bopomofo layout.
var JSZhuyinLayoutMapper = {
  // DOM Level 3 Events code values on PC Keyboard
  // http://www.w3.org/TR/DOM-Level-3-Events-code/#keyboard-key-codes
  codes: ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5',
          'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal',
          'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU',
          'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash',
          'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH',
          'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote',
          'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN',
          'KeyM', 'Comma', 'Period', 'Slash',
          'Space'],

  // DOM Level 3 Events code values on PC Keyboard
  // for select candidate (with shift key)
  selectionCodes: ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5',
    'Digit6', 'Digit7', 'Digit8', 'Digit9'],

  // ... map to 'general' Zhuyin layout characters
  map:  '⋯ㄅㄉˇˋㄓˊ˙ㄚㄞㄢㄦ＝' +
        'ㄆㄊㄍㄐㄔㄗㄧㄛㄟㄣ「」＼' +
        'ㄇㄋㄎㄑㄕㄘㄨㄜㄠㄤ、' +
        'ㄈㄌㄏㄒㄖㄙㄩㄝㄡㄥ' +
        'ˉ',

  // ... and characters when shift is pressed.
  shiftMap: '～！＠＃＄％︿＆＊（）—＋' +
            'qwertyuiop『』|' +
            'asdfghjkl：；' +
            'zxcvbnm，。？' +
            ' ',

  getSymbolFromDOM3Code: function(dom3Code, shiftKey) {
    console.log("dom3Code "+dom3Code);
    var index = this.codes.indexOf(dom3Code);
    console.log("index "+ index);
    // numpad 不在列表中所以index會是-1
    if (index === -1) {
      var level = 0;
      if ($(".input-table__cell.selected").length > 0) {
        level = 2;
      }
      console.log("level "+level);
      var current = $(".input-table__cell.current");
      var cRow = $(".input-table__cell.current").parent().index(".input-table__row");
      var cCol = $(".input-table__cell.current").index();
      var getNumKey = function(dom3Code) {
        switch(dom3Code) {
          case "Numpad5": // moveup
            return "moveup";
          break;

          case "Numpad3": // moveright
            return "moveright";
          break;

          case "Numpad2": // movedown
            return "movedown";
          break;

          case "Numpad1": // moveleft
            return "moveleft";
          break;

          case "NumpadEnter": // select
            return "select";
          break;

          case "NumpadDecimal": // back
            return "back";
          break;

          case "Numpad0": // switch
            return "switch";
          break;

          default: return; // exit this handler for other keys
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
      }
      //用regexp比對是否在numpad中
      //沒用到的數字是否要另外處理？？
      if (dom3Code.match(/^Numpad/)) {
        //return getNumKey(dom3Code);
        var returnVal = "";
        if (getNumKey(dom3Code) == "switch") {
          if ((currentAction == "typing")&&($("#candidates li").length > 0)) {
            $(".input-table").addClass("disabled");
            currentAction = "selecting"
            $("#candidates li").eq(0).addClass("current");
          }
          else {
            currentAction = "typing";
            $(".input-table").removeClass("disabled");
            $("#candidates li").removeClass("current");
          }
        }
        // typing
        if (currentAction == "typing") {
          if (level == 0) {
            $(".input-table__cell").removeClass("current");
            switch(getNumKey(dom3Code)) {
              case "moveup":
                cRow = cRow > 0 ? cRow - 1 : cRow;
              break;

              case "moveright":
                cCol = cCol < 2 ? cCol + 1 : cCol;
              break;

              case "movedown":
                cRow = cRow < 3 ? cRow + 1 : cRow;
              break;

              case "moveleft":
                cCol = cCol > 0 ? cCol - 1 : cCol;
              break;

              case "back":
                // 當 composition 有值時先從 composition 開始刪內容；沒有值時從輸入框最末端開始刪內容
                if ($("#composition").text().length > 0) {
                  $(".input-table__cell").eq(4).addClass("current");
                  return "Backspace";
                }
                else {
                  $("#the-input").val($("#the-input").val().slice(0,-1));
                }
              break;

              case "select":
                level = 1;
              break;
            }
            if ((cRow == 3)&&(cCol == 2)) {
              cCol = 1;
            }
            $(".input-table").find(".input-table__row").eq(cRow)
                             .find(".input-table__cell").eq(cCol).addClass("current");
            if (level == 1) {
              $(".input-table__cell.current").addClass("selected");
            }
            return;
          }
          else if (level == 2) {
            var currentSubMenu = $(".input-table__cell.selected .input-table__sub-cell");
            switch(getNumKey(dom3Code)) {
              case "moveup":
                if ((currentSubMenu.eq(4).length > 0) && ((currentSubMenu.eq(0).hasClass("current")) || (currentSubMenu.eq(4).hasClass("current")))) {
                  $(".input-table__sub-cell").removeClass("current");
                  currentSubMenu.eq(4).addClass("current");
                }
                else {
                  $(".input-table__sub-cell").removeClass("current");
                  currentSubMenu.eq(0).addClass("current");
                }
              break;

              case "moveright":
                $(".input-table__sub-cell").removeClass("current");
                currentSubMenu.eq(1).addClass("current");
              break;

              case "movedown":
                if ((currentSubMenu.eq(4).length > 0) && (currentSubMenu.eq(4).hasClass("current"))) {
                  $(".input-table__sub-cell").removeClass("current");
                  currentSubMenu.eq(0).addClass("current");
                }
                else {
                  $(".input-table__sub-cell").removeClass("current");
                  currentSubMenu.eq(2).addClass("current");
                }
              break;

              case "moveleft":
                $(".input-table__sub-cell").removeClass("current");
                currentSubMenu.eq(3).addClass("current");
              break;

              case "select":
                returnVal = $(".input-table__sub-cell.current").text();
                $(".input-table__sub-cell").removeClass("current");
                $(".input-table__cell").removeClass("selected");
                return returnVal;
              break;

              case "back":
                $(".input-table__cell.selected").removeClass("selected");
              break;
            }
            return;
          }
        }
        // selecting
        else {
          var currentCandidate = $("#candidates li.current").index();
          switch(getNumKey(dom3Code)) {
            case "moveup":
              currentCandidate = currentCandidate > 0 ? currentCandidate - 1 : $("#candidates li").length - 1;
            break;

            case "movedown":
              currentCandidate = currentCandidate < $("#candidates li").length - 1 ? currentCandidate + 1 : 0;
            break;
          }
          $("#candidates li.current").removeClass("current");
          $("#candidates li").eq(currentCandidate).addClass("current");
        }
      }
      else {
        return;
      }
    }
    if (shiftKey) {
      return this.shiftMap.charAt(index);
    } else {
      return this.map.charAt(index);
    }
    return this.map.charAt(index);
  },

  getSelectionIndexFromDOM3Code: function(dom3Code) {
    return this.selectionCodes.indexOf(dom3Code);
  }
};

var JSZhuyinWebIME = function JSZhuyinWebIME(elements, jszhuyin) {
  this.EDITABLE_INPUT_TYPES = ['text', 'search', 'url', 'email'];

  this.elements = elements;
  window.addEventListener('keydown', this, true);
  window.addEventListener('keypress', this, true);

  if (!jszhuyin) {
    jszhuyin = (typeof JSZhuyinClient === 'function') ?
      new JSZhuyinClient() : new JSZhuyin();
    jszhuyin.load();
  }

  this.jszhuyin = jszhuyin;
  jszhuyin.oncompositionupdate = this.updateComposition.bind(this);
  jszhuyin.oncompositionend = this.endComposition.bind(this);
  jszhuyin.onactionhandled = this.updateHandledId.bind(this);
  jszhuyin.oncandidateschange = this.setCandidates.bind(this);

  var candidatesList = this.candidatesList =
    new JSZhuyinWebIME.CandidatesList(elements.candidatesList);

  candidatesList.oncandidateselect = this.selectCandidate.bind(this);

  this.isCompositionStarted = false;
  this.requestId = 0;
  this.handledId = 0;
};
JSZhuyinWebIME.prototype.oncandidateschange = null;
JSZhuyinWebIME.prototype.oncompositionupdate = null;
JSZhuyinWebIME.prototype.oncompositionend = null;
JSZhuyinWebIME.prototype.unload = function() {
  this.jszhuyin.unload();
  this.candidatesList.unload();
  window.removeEventListener('keydown', this, true);
  window.removeEventListener('keypress', this, true);
};
JSZhuyinWebIME.prototype.setCandidates = function(candidates) {
  this.candidatesList.setCandidates(candidates);

  if (typeof this.oncandidateschange === 'function') {
    this.oncandidateschange(candidates);
  }
};
JSZhuyinWebIME.prototype.selectCandidate = function(candidate) {
  this.jszhuyin.selectCandidate(candidate, ++this.requestId);
};
JSZhuyinWebIME.prototype.updateHandledId = function(id) {
  this.handledId = id;
};
JSZhuyinWebIME.prototype.updateComposition = function(composition) {
  if (!this.isCompositionStarted && composition.length) {
    this.isCompositionStarted = true;
    this.sendCompositionEvent('compositionstart');
  }

  this.sendCompositionEvent('compositionupdate', composition);
  this.elements.composition.textContent = composition;

  if (typeof this.oncompositionupdate === 'function') {
    this.oncompositionupdate(composition);
  }
};
JSZhuyinWebIME.prototype.endComposition = function(composition) {
  if (!this.isCompositionStarted) {
    this.isCompositionStarted = true;
    this.sendCompositionEvent('compositionstart');
  }

  this.sendCompositionEvent('compositionend', composition);
  this.isCompositionStarted = false;
  currentAction = "typing";
  $(".input-table").removeClass("disabled");

  if (!this.elements.input) {
    throw 'JSZhuyinWebIME: There are no input focused to commit text to; ' +
      'did the focus being taken by virtual keyboard ' +
      'or the user has never focused to an input box?';
  }

  // Commit the text to cursor position, poor man's way.
  if (!this.isContentEditable) {
    var input = this.elements.input;
    // <input> / <textarea>
    var selStart = input.selectionStart;
    input.value = input.value.substr(0, selStart) + composition +
    input.value.substr(input.selectionEnd, input.value.length);
    input.selectionStart = input.selectionEnd = selStart + composition.length;

    if (typeof this.oncompositionend === 'function') {
      this.oncompositionend(composition);
    }
    return;
  }

  // contenteditable
  var sel = window.getSelection();

  // Remove the selection if there is any.
  if (!sel.isCollapsed) {
    sel.deleteFromDocument();
  }

  // Get the current focused node.
  var node = sel.focusNode;

  var range;

  if (node.nodeName === '#text') {
    // Easy. We could simply update the node content and the cursor position.
    var offset = sel.focusOffset;

    // Update the content of the node.
    node.textContent = node.textContent.substr(0, offset) + composition +
    node.textContent.substr(offset, node.textContent.length);

    // Move it's cursor position.
    range = document.createRange();
    range.setStart(
      (node.nodeName === '#text') ? node : node.firstChild,
      offset + composition.length);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);

    if (typeof this.oncompositionend === 'function') {
      this.oncompositionend(composition);
    }
    return;
  }

  // The current focusNode is an element.

  var textNode = document.createTextNode(composition);

  // Insert the text by insert the text node.
  var currentRange = sel.getRangeAt(0);
  currentRange.insertNode(textNode);

  // Move the cursor position to the text node.
  range = document.createRange();
  range.setStart(textNode, composition.length);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);

  if (typeof this.oncompositionend === 'function') {
    this.oncompositionend(composition);
  }

};
JSZhuyinWebIME.prototype.sendCompositionEvent = function() {
  // XXX
};
JSZhuyinWebIME.prototype.handleKey = function(code) {
  var handled =
    this.jszhuyin.handleKey(code, ++this.requestId);
  if (!handled) {
    this.requestId--;
  }

  return handled;
};
JSZhuyinWebIME.prototype.isElementEditable = function(el) {
  if (el.contentEditable === 'true') {
    return true;
  }

  if ('value' in el &&
    this.EDITABLE_INPUT_TYPES.indexOf(el.type) !== -1) {
    return true;
  }

  return false;
};
JSZhuyinWebIME.prototype.handleEvent = function(evt) {
  var el = evt.target;
  if (el !== this.elements.input) {
    // There is probably a better way to defense against race condition.
    if (this.requestId !== this.handledId) {
      evt.preventDefault();

      return;
    }

    if (!this.isElementEditable(el)) {
      this.elements.input = null;

      return;
    }

    this.elements.input = el;
    this.isContentEditable = !('value' in el);
  }

  if (evt.metaKey || evt.ctrlKey || evt.altKey) {
    return;
  }

  var code = D3EKeyboardEventHelper.getCodePropFromEvent(evt);
  console.log("code "+code);

  var specialKeys = (['Backspace', 'Enter', 'Escape', 'Space',
                      'ArrowLeft', 'ArrowRight'].indexOf(code) !== -1);


  if (forSafariNum) {
    if (evt.type === 'keypress' && !specialKeys) {
      return;
    }
  }
  else {
    // XXX Special quirks handling for Blink/WebKit:
    // For some keys, we must handle it in the keydown event because no
    // keypress event will be dispatched.
    // For other keys, we should handle keypress so we will know the
    // real key value.
    if (evt.type === 'keydown' && !specialKeys) {
      return;
    } else if (evt.type === 'keypress' && specialKeys) {
      return;
    }
  }

  var shiftKey = evt.shiftKey;

  var handled;

  // Number keys: candidate selection
  // 原有的選詞
  var selectionIndex =
    JSZhuyinLayoutMapper.getSelectionIndexFromDOM3Code(code);
  if (evt.type === 'keypress' && shiftKey && selectionIndex !== -1) {
    handled = this.candidatesList.selectCandidate(selectionIndex);

    if (handled) {
      evt.preventDefault();

      return;
    }
  }
  // 選詞模式下選詞
  else if ((currentAction == "selecting")&&(code == "NumpadEnter")) {
    selectionIndex = $("#candidates li.current").index();
    handled = this.candidatesList.selectCandidate(selectionIndex);
    if (handled) {
      evt.preventDefault();

      return;
    }
  }
  // right arrow
  if (code === 'ArrowRight') {
    if (!shiftKey) {
      return;
    }

    this.candidatesList.goForwardPage();

    evt.preventDefault();
    return;
  }

  // left arrow
  if (code === 'ArrowLeft') {
    if (!shiftKey) {
      return;
    }

    this.candidatesList.goBackPage();

    evt.preventDefault();
    return;
  }

  // 不使用 shiftKey 的換頁
  if (code === "Numpad3" && currentAction == "selecting") {
    $("#candidates li").removeClass("current");
    this.candidatesList.goForwardPage();
    $("#candidates li").eq(0).addClass("current");
    evt.preventDefault();
    return;
  }

  if (code === "Numpad1" && currentAction == "selecting") {
    $("#candidates li").removeClass("current");
    this.candidatesList.goBackPage();
    $("#candidates li").eq(0).addClass("current");
    evt.preventDefault();
    return;
  }

  var symbol = JSZhuyinLayoutMapper.getSymbolFromDOM3Code(code, shiftKey);
  console.log("symbol "+symbol);
  // 判斷是使用到的數字鍵盤的數字就一樣 preventDefault
  if (!symbol && code.match(/^Numpad/)) {
    evt.preventDefault();
  }

  // Make sure we don't send any non-handled controls keys to JSZhuyin.
  if (!symbol &&
      code !== 'Enter' &&
      code !== 'Backspace' &&
      code !== 'Escape') {
    // Block these keys ourselves if they are compositions.
    if (this.isCompositionStarted) {
      evt.preventDefault();
    }
    return;
  }

  // For Enter and Backspace keys, ignore them if we have not handled the
  // previous action. This is poor man's way to defense against race condition.
  if (this.requestId !== this.handledId &&
      code === 'Backspace' &&
      code === 'Enter') {
    evt.preventDefault();

    return;
  }

  var key = D3EKeyboardEventHelper.getKeyPropFromEvent(evt);
  if (this.handleKey(symbol || key)) {
    evt.preventDefault();
  } else {
    // We must remove the suggestions ourselves here.

    this.setCandidates([]);

    if (symbol !== key &&
        code !== 'Enter' &&
        code !== 'Backspace' &&
        code !== 'Escape') {
      this.endComposition(symbol || key);
      evt.preventDefault();
    }
  }
};

JSZhuyinWebIME.CandidatesList = function CandidatesList(element) {
  this.element = element;
  this.page = 0;
  this.element.addEventListener('mousedown', this);

  this.candidates = [];
};
JSZhuyinWebIME.CandidatesList.prototype.unload = function() {
  this.element.removeEventListener('mousedown', this);
};
JSZhuyinWebIME.CandidatesList.prototype.oncandidateselect = null;
JSZhuyinWebIME.CandidatesList.prototype.CANDIDATES_PER_PAGE = 9;
JSZhuyinWebIME.CandidatesList.prototype.setCandidates = function(candidates) {
  this.candidates = candidates;
  this.page = 0;
  this.showCandidates();
};
JSZhuyinWebIME.CandidatesList.prototype.goForwardPage = function() {
  if ((this.page + 1) * this.CANDIDATES_PER_PAGE >= this.candidates.length) {
    return;
  }

  this.page += 1;
  this.showCandidates();
};
JSZhuyinWebIME.CandidatesList.prototype.goBackPage = function() {
  if (this.page === 0) {
    return;
  }

  this.page -= 1;
  this.showCandidates();
};
JSZhuyinWebIME.CandidatesList.prototype.showCandidates = function(candidates) {
  var element = this.element;
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
  var CPP = this.CANDIDATES_PER_PAGE;
  var pageBegin = this.page * CPP;
  this.candidates.slice(pageBegin, this.page * CPP + CPP)
    .forEach((function(candidate, i) {
      this.addCandidateItem(candidate, i, pageBegin + i);
    }).bind(this)
  );

  if (pageBegin === 0) {
    this.element.classList.remove('can-go-left');
  } else {
    this.element.classList.add('can-go-left');
  }

  if ((this.page * CPP + CPP) >= this.candidates.length) {
    this.element.classList.remove('can-go-right');
  } else {
    this.element.classList.add('can-go-right');
  }
};
JSZhuyinWebIME.CandidatesList.prototype.addCandidateItem =
  function(candidate, i, index) {
    var element = this.element;
    var li = document.createElement('li');
    li.textContent = candidate[0];
    li.setAttribute('data-index', index);
    element.appendChild(li);
  };
JSZhuyinWebIME.CandidatesList.prototype.selectCandidate =
  function(indexOnList) {

    var index = this.page * this.CANDIDATES_PER_PAGE + indexOnList;
    if (!$("#candidates li").length > 0) {
      currentAction = "typing";
    }

    if (!this.candidates[index]) {
      return false;
    }

    if (typeof this.oncandidateselect === 'function') {
      this.oncandidateselect(this.candidates[index]);
    }
    return true;
  };
JSZhuyinWebIME.CandidatesList.prototype.handleEvent = function(evt) {
  var el = evt.target;
  var index = parseInt(el.getAttribute('data-index'));

  evt.preventDefault();

  if (isNaN(index)) {
    return;
  }

  if (typeof this.oncandidateselect === 'function') {
    this.oncandidateselect(this.candidates[index]);
  }
};
