(function () {
  let state = { calcStr: "0", curr: "0" };

  setUpHandlers();

  function setUpHandlers() {
    document.querySelector("#keys").addEventListener("click", function (e) {
      if (e.target.nodeName !== "BUTTON") return;

      const key = e.target.getAttribute("data-key");
      state = keyEventReducer(state, key);

      updateDisplay(state);
    });
  }

  function keyEventReducer(display, key) {
    switch (key) {
      case "+":
      case "-":
      case "*":
      case "/":
        return processOperator(display.curr, display.calcStr, key);
      case "=":
        return processEqual(display.curr, display.calcStr);
      case "AC":
        return processAC();
      case "CE":
        return processCE(display.calcStr);
      case ".":
        return processDecimal(display.curr, display.calcStr);
      default:
        return processNum(display.curr, display.calcStr, key);
    }
  }

  function updateDisplay({ calcStr, curr }) {
    if (curr.length >= 9 || calcStr.length >= 23) {
      document.querySelector("#summaryDisplay").textContent = "Digit Limit Met";
      document.querySelector("#display").textContent = "0";
    } else {
      document.querySelector("#summaryDisplay").textContent = calcStr;
      document.querySelector("#display").textContent = curr;
    }
  }

  function processOperator(curr, calcStr, operator) {
    var length = calcStr.length;
    if ((length === 0 || calcStr === "-") && operator !== "subtract") {
      // invalid - do nothing;
    } else {
      // if current state is calculation result - reset calcStr to curr
      if (calcStr.indexOf("=") > -1) {
        calcStr = curr;
      }

      var lastEntry = calcStr[length - 1];
      if (isOperator(lastEntry) || lastEntry === ".") {
        if (isOperator(calcStr[length - 2])) {
          calcStr = calcStr.substring(0, calcStr.length - 1);
        }
        if (operator !== "-") {
          calcStr = calcStr.substring(0, calcStr.length - 1);
        }
      }
      // append
      calcStr += operator;
      curr = operator;
    }
    return {
      curr: curr,
      calcStr: calcStr,
    };
  }

  function processEqual(curr, calcStr) {
    var length = calcStr.length;
    var lastEntry = calcStr[length - 1];
    if (length === 0 || isOperator(lastEntry) || calcStr.indexOf("=") > -1) {
      // invalid - do nothing;
    } else {
      if (lastEntry === ".") {
        // slice of decimal;
        calcStr = calcStr.substring(0, length - 1);
      }
      curr = cutDecimals(eval(calcStr), 4);
      calcStr = calcStr + "=" + curr;
    }
    return {
      curr: curr,
      calcStr: calcStr,
    };
  }

  function processNum(curr, calcStr, key) {
    // if current state is calculation result - reset calcStr and curr
    if (calcStr.indexOf("=") > -1) {
      calcStr = "";
      curr = "";
    }

    var length = calcStr.length;
    var lastEntry = calcStr[length - 1];

    // if lastEntry is operator, reset curr;
    if (isOperator(lastEntry)) {
      curr = "";
    }

    // if curr is 0 reset curr and slice of the 0;
    if (curr === "0") {
      curr = "";
      calcStr = calcStr.substring(0, calcStr.length - 1);
    }

    calcStr += key;
    curr += key;

    return {
      curr: curr,
      calcStr: calcStr,
    };
  }

  function processDecimal(curr, calcStr) {
    // if current state is calculation result - reset calcStr and curr
    if (calcStr.indexOf("=") > -1) {
      calcStr = "";
      curr = "";
    }

    var length = calcStr.length;
    var lastEntry = calcStr[length - 1];
    // if there is already a decimal, do nothing
    if (curr.includes(".")) {
    } else if (isOperator(lastEntry) || calcStr.length === 0) {
      curr = "0.";
      calcStr += "0.";
    } else {
      curr += ".";
      calcStr += ".";
    }
    return {
      curr: curr,
      calcStr: calcStr,
    };
  }

  function processAC() {
    return { calcStr: "0", curr: "0" };
  }

  function processCE(calcStr) {
    // if current state is calculation result - reset calcStr and curr
    if (calcStr.indexOf("=") > -1) {
      return {
        calcStr: "0",
        curr: "0",
      };
    }

    var curr = "";
    var match = calcStr.match(/[\/\*\-\+]/gi);
    if (match === null) {
      // no operators found;
      calcStr = "";
    } else {
      // operators found
      var lastIndex = calcStr.lastIndexOf(match[match.length - 1]);
      if (lastIndex < calcStr.length - 1) {
        // doesn't end with operator;
        curr = calcStr[lastIndex]; // set curr to last operator;
        lastIndex++; // increment to preserve operator;
      }
      calcStr = calcStr.substring(0, lastIndex);
    }

    if (calcStr === "") {
      curr = "0";
      calcStr = "0";
    }

    return {
      curr: curr,
      calcStr: calcStr,
    };
  }

  function isOperator(key) {
    return "/*-+".includes(key);
  }

  function cutDecimals(value, precision) {
    var exponentialForm = Number(value + "e" + precision);
    var rounded = Math.round(exponentialForm);
    var finalResult = Number(rounded + "e-" + precision);
    return finalResult;
  }
})();
