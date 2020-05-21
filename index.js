(function () {
  const initialState = { calcStr: "0", curr: "0" };
  let state = { ...initialState };
  document.querySelector("#keys").addEventListener("click", handleKeyClick);

  function handleKeyClick(e) {
    if (e.target.nodeName !== "BUTTON") return;

    const key = e.target.getAttribute("data-key");
    state = keyEventReducer(state, key);

    updateDisplay(state);
  }

  function keyEventReducer(state, key) {
    switch (key) {
      case "AC":
        return processAC();
      case "CE":
        return processCE(state);
      case "=":
        return processEqual(state);
      case ".":
        return processDecimal(state);
      case "+":
      case "-":
      case "*":
      case "/":
        return processOperator(state, key);
      default:
        return processNum(state, key);
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

  function processOperator({ curr, calcStr }, operator) {
    const length = calcStr.length;
    if ((length === 0 || calcStr === "-") && operator !== "subtract") {
      // invalid - do nothing;
    } else {
      if (isCalculationResult(calcStr)) {
        calcStr = curr;
      }

      const lastEntry = calcStr[length - 1];
      if (isOperator(lastEntry) || lastEntry === ".") {
        if (isOperator(calcStr[length - 2])) {
          calcStr = calcStr.substring(0, calcStr.length - 1);
        }
        if (operator !== "-") {
          calcStr = calcStr.substring(0, calcStr.length - 1);
        }
      }
      calcStr += operator;
      curr = operator;
    }
    return { curr, calcStr };
  }

  function processEqual({ curr, calcStr }) {
    const length = calcStr.length;
    const lastEntry = calcStr[length - 1];
    if (isOperator(lastEntry) || isCalculationResult(calcStr)) {
      // invalid - do nothing;
    } else {
      if (lastEntry === ".") {
        // slice of decimal;
        calcStr = calcStr.substring(0, length - 1);
      }
      curr = cutDecimals(eval(calcStr), 4);
      calcStr = calcStr + "=" + curr;
    }
    return { curr, calcStr };
  }

  function processNum({ curr, calcStr }, key) {
    if (isCalculationResult(calcStr)) {
      ({ curr, calcStr } = initialState);
    }

    const length = calcStr.length;
    const lastEntry = calcStr[length - 1];

    if (isOperator(lastEntry)) {
      curr = "";
    }

    if (curr === "0") {
      curr = "";
      calcStr = calcStr.substring(0, calcStr.length - 1);
    }

    calcStr += key;
    curr += key;

    return { curr, calcStr };
  }

  function processDecimal({ curr, calcStr }) {
    if (isCalculationResult(calcStr)) {
      ({ curr, calcStr } = initialState);
    }

    const length = calcStr.length;
    const lastEntry = calcStr[length - 1];
    if (curr.includes(".")) {
      // invalid - do nothing;
    } else if (isOperator(lastEntry)) {
      curr = "0.";
      calcStr += "0.";
    } else {
      curr += ".";
      calcStr += ".";
    }
    return { curr, calcStr };
  }

  function processAC() {
    return { calcStr: "0", curr: "0" };
  }

  function processCE({ calcStr }) {
    if (isCalculationResult(calcStr)) {
      return { ...initialState };
    }

    let curr = "";
    const match = calcStr.match(/[\/*\-+]/gi);
    if (match === null) {
      // no operators found;
      calcStr = "";
    } else {
      // operators found
      let lastIndex = calcStr.lastIndexOf(match[match.length - 1]);
      if (lastIndex < calcStr.length - 1) {
        // doesn't end with operator;
        curr = calcStr[lastIndex]; // set curr to last operator;
        lastIndex++; // increment to preserve operator;
      }
      calcStr = calcStr.substring(0, lastIndex);
    }

    if (calcStr === "") {
      ({ curr, calcStr } = initialState);
    }

    return { curr, calcStr };
  }

  function isOperator(key) {
    return "/*-+".includes(key);
  }

  function isCalculationResult(calcStr) {
    return calcStr.indexOf("=") > -1;
  }

  function cutDecimals(value, precision) {
    const exponentialForm = Number(value + "e" + precision);
    const rounded = Math.round(exponentialForm);
    return Number(rounded + "e-" + precision);
  }
})();
