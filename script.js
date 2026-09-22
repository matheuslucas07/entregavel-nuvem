const expressionEl = document.getElementById('expression');
const valueEl = document.getElementById('value');
const keys = document.querySelectorAll('.key');

let current = '0';
let previous = null;
let operator = null;
let overwrite = true;

function formatNumber(numStr) {
  if (numStr === '' || numStr === '-') return numStr;
  const [intPart, decPart] = numStr.split(',');
  const intFormatted = Number(intPart).toLocaleString('pt-BR');
  return decPart !== undefined ? `${intFormatted},${decPart}` : intFormatted;
}

function render() {
  valueEl.textContent = formatNumber(current);
  expressionEl.textContent =
    previous !== null && operator
      ? `${formatNumber(previous)} ${operator}`
      : '';
}

function inputDigit(digit) {
  if (overwrite) {
    current = digit === '0' ? '0' : digit;
    overwrite = false;
  } else {
    if (current === '0') current = digit;
    else if (current.replace('-', '').replace(',', '').length < 12) {
      current += digit;
    }
  }
  render();
}

function inputDecimal() {
  if (overwrite) {
    current = '0,';
    overwrite = false;
    return render();
  }
  if (!current.includes(',')) current += ',';
  render();
}

function clearAll() {
  current = '0';
  previous = null;
  operator = null;
  overwrite = true;
  render();
}

function backspace() {
  if (overwrite) return;
  current = current.slice(0, -1);
  if (current === '' || current === '-') current = '0';
  render();
}

function toPercent() {
  const num = parseFloat(current.replace(',', '.'));
  if (Number.isNaN(num)) return;
  current = String(num / 100).replace('.', ',');
  render();
}

function toNumber(str) {
  return parseFloat(str.replace(',', '.'));
}

function compute(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? NaN : a / b;
    default: return b;
  }
}

function setOperator(op) {
  if (operator && !overwrite) {
    equals();
  }
  previous = toNumber(current);
  operator = op;
  overwrite = true;
  highlightOperator(op);
  render();
}

function equals() {
  if (operator === null || previous === null) return;
  const result = compute(previous, toNumber(current), operator);
  current = Number.isNaN(result)
    ? 'Erro'
    : String(Math.round(result * 1e10) / 1e10).replace('.', ',');
  previous = null;
  operator = null;
  overwrite = true;
  highlightOperator(null);
  render();
}

function highlightOperator(op) {
  keys.forEach((key) => {
    key.classList.toggle(
      'is-active',
      key.dataset.action === 'operator' && key.dataset.op === op
    );
  });
}

keys.forEach((key) => {
  key.addEventListener('click', () => {
    const { action, digit, op } = key.dataset;
    if (action === 'digit') inputDigit(digit);
    else if (action === 'decimal') inputDecimal();
    else if (action === 'clear') clearAll();
    else if (action === 'backspace') backspace();
    else if (action === 'percent') toPercent();
    else if (action === 'operator') setOperator(op);
    else if (action === 'equals') equals();
  });
});

const keyMap = {
  '+': '+', '-': '−', '*': '×', '/': '÷',
};

window.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') inputDigit(e.key);
  else if (e.key === '.' || e.key === ',') inputDecimal();
  else if (e.key === 'Backspace') backspace();
  else if (e.key === 'Escape') clearAll();
  else if (e.key === '%') toPercent();
  else if (e.key === 'Enter' || e.key === '=') equals();
  else if (keyMap[e.key]) setOperator(keyMap[e.key]);
});

render();