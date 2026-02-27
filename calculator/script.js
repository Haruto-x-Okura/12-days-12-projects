let displayValue = '';

function updateDisplay() {
    document.getElementById('display').value = displayValue;
}

function appendNumber(number) {
    if (number === '.' && displayValue.includes('.')) return;
    displayValue += number;
    updateDisplay();
}

function appendOperator(operator) {
    if (displayValue === '') return;
    const lastChar = displayValue.slice(-1);
    if (['+', '-', '*', '/', '%'].includes(lastChar)) {
        displayValue = displayValue.slice(0, -1) + operator;
    } else {
        displayValue += operator;
    }
    updateDisplay();
}

function clearDisplay() {
    displayValue = '';
    updateDisplay();
}

function deleteLast() {
    displayValue = displayValue.toString().slice(0, -1);
    updateDisplay();
}

function calculate() {
    try {
        if (displayValue === '') return;
        const result = eval(displayValue);
        displayValue = result.toString();
        updateDisplay();
    } catch (error) {
        displayValue = 'Error';
        updateDisplay();
        setTimeout(() => {
            displayValue = '';
            updateDisplay();
        }, 1500);
    }
}
