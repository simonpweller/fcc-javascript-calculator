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

    if (operator === "-" && !nextCalcStr.endsWith("-")) {
      return { curr: operator, calcStr: nextCalcStr + operator };
    }

    return {
      curr: operator,
      calcStr: trimToValidCalculation(nextCalcStr) + operator,
    };
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
    } else if (curr === "0") {
      return { curr: num, calcStr: calcStr.slice(0, -1) + num };
    } else if (endsWithOperator(calcStr)) {
      return { curr: num, calcStr: calcStr + num };
    } else {
      return { curr: curr + num, calcStr: calcStr + num };
    }
  }

  function processDecimal({ curr, calcStr }) {
    if (isCalculationResult(calcStr)) {
      return { curr: curr + ".", calcStr: curr + "." };
    } else if (curr.includes(".")) {
      return { curr, calcStr };
    } else if (endsWithOperator(calcStr)) {
      return { curr: "0.", calcStr: calcStr + "0." };
    } else {
      return { curr: curr + ".", calcStr: calcStr + "." };
    }
  }

  function processAC() {
    return { ...initialState };
  }

  function processCE({ calcStr }) {
    if (isCalculationResult(calcStr)) {
      return { ...initialState };
    }

    const nums = calcStr.split(/[/*\-+]/).filter(Boolean);
    const lastNum = nums.slice(-1)[0];

    if (endsWithOperator(calcStr)) {
      return { curr: lastNum, calcStr: trimToValidCalculation(calcStr) };
    } else if (nums.length > 1) {
      const calcStrWithoutLastNum = calcStr.slice(0, -lastNum.length);
      return {
        curr: calcStrWithoutLastNum.slice(-1),
        calcStr: calcStrWithoutLastNum,
      };
    } else {
      return { ...initialState };
    }
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

  function isCalculationResult(calcStr) {
    return calcStr.indexOf("=") > -1;
  }

  function cutDecimals(value, precision) {
    const exponentialForm = Number(value + "e" + precision);
    const rounded = Math.round(exponentialForm);
    return Number(rounded + "e-" + precision).toString();
  }
})();
