const inputValue = document.getElementById("inputValue");
const convertBtn = document.getElementById("convertBtn");
const result = document.getElementById("result");

convertBtn.addEventListener("click", () => {
    const value = parseFloat(inputValue.value);

    if (isNaN(value)) {
        result.textContent = "Please enter a valid temperature value.";
        return;
    }

    const from = document.querySelector('input[name="choice"]:checked');
    const to = document.querySelector('input[name="toChoice"]:checked');

    if (!from || !to) {
        result.textContent = "Please select both FROM and TO units.";
        return;
    }

    if (from.value === to.value.replace("to", "").toLowerCase()) {
        result.textContent = `Result: ${value}`;
        return;
    }

    let convertedValue;

    // FROM Celsius
    if (from.value === "celsius") {
        if (to.value === "toFahrenheit") {
            convertedValue = (value * 9/5) + 32;
        } else if (to.value === "toKelvin") {
            convertedValue = value + 273.15;
        }
    }

    // FROM Fahrenheit
    if (from.value === "fahrenheit") {
        if (to.value === "toCelsius") {
            convertedValue = (value - 32) * 5/9;
        } else if (to.value === "toKelvin") {
            convertedValue = (value - 32) * 5/9 + 273.15;
        }
    }

    // FROM Kelvin
    if (from.value === "kelvin") {
        if (to.value === "toCelsius") {
            convertedValue = value - 273.15;
        } else if (to.value === "toFahrenheit") {
            convertedValue = (value - 273.15) * 9/5 + 32;
        }
    }

    result.textContent = `Result: ${convertedValue.toFixed(2)}`;
});
