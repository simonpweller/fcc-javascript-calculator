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
    let nextCalcStr = isCalculationResult(calcStr) ? curr : calcStr;

    if (operator !== "-" || nextCalcStr.endsWith("-")) {
      nextCalcStr = trimToValidCalculation(nextCalcStr);
    }

    return { curr: operator, calcStr: nextCalcStr + operator };
  }

  function processEqual({ curr, calcStr }) {
    if (isCalculationResult(calcStr)) {
      return { curr, calcStr };
    }

    const nextCalcStr = trimToValidCalculation(calcStr);
    const nextCurr = cutDecimals(eval(nextCalcStr), 4);

    return { curr: nextCurr, calcStr: `${nextCalcStr}=${nextCurr}` };
  }

  function processNum({ curr, calcStr }, num) {
    if (isCalculationResult(calcStr)) {
      return { curr: num, calcStr: num };
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

    calcStr += num;
    curr += num;

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

  function trimToValidCalculation(calcStr) {
    if (endsWithDecimal(calcStr) || endsWithOperator(calcStr)) {
      return trimToValidCalculation(calcStr.slice(0, -1));
    }
    return calcStr;
  }

  function endsWithDecimal(calcStr) {
    return calcStr.endsWith(".");
  }

  function endsWithOperator(calcStr) {
    return "/*-+".includes(calcStr.slice(-1));
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
    return Number(rounded + "e-" + precision).toString();
  }
})();
