document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const conversionType = document.getElementById('conversion-type');
    const inputValue = document.getElementById('input-value');
    const fromUnit = document.getElementById('from-unit');
    const toUnit = document.getElementById('to-unit');
    const swapBtn = document.getElementById('swap-units');
    const convertBtn = document.getElementById('convert-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultDisplay = document.getElementById('result');

    // Conversion data
    const conversionData = {
        weight: {
            units: ['Kilograms (kg)', 'Pounds (lb)'],
            values: ['kg', 'lb'],
            conversions: {
                'kg': { 'lb': val => val * 2.20462 },
                'lb': { 'kg': val => val / 2.20462 }
            }
        },
        distance: {
            units: ['Kilometers (km)', 'Miles (mi)'],
            values: ['km', 'mi'],
            conversions: {
                'km': { 'mi': val => val * 0.621371 },
                'mi': { 'km': val => val / 0.621371 }
            }
        },
        temperature: {
            units: ['Celsius (°C)', 'Fahrenheit (°F)'],
            values: ['°C', '°F'],
            conversions: {
                '°C': { '°F': val => (val * 9/5) + 32 },
                '°F': { '°C': val => (val - 32) * 5/9 }
            }
        }
    };

    // Initialize the converter
    function initConverter() {
        updateUnitOptions();
        conversionType.addEventListener('change', updateUnitOptions);
        convertBtn.addEventListener('click', performConversion);
        resetBtn.addEventListener('click', resetConverter);
        swapBtn.addEventListener('click', swapUnits);
    }

    // Update unit options based on selected conversion type
    function updateUnitOptions() {
        const type = conversionType.value;
        const data = conversionData[type];
        
        // Clear existing options
        fromUnit.innerHTML = '';
        toUnit.innerHTML = '';
        
        // Add new options
        data.units.forEach((unit, index) => {
            const fromOption = document.createElement('option');
            fromOption.value = data.values[index];
            fromOption.textContent = unit;
            fromUnit.appendChild(fromOption);
            
            // For 'to' unit, skip the first one to have different defaults
            if (index > 0) {
                const toOption = document.createElement('option');
                toOption.value = data.values[index];
                toOption.textContent = unit;
                toUnit.appendChild(toOption);
            }
        });
        
        // Reset result display
        resultDisplay.textContent = 'Result will appear here';
    }

    // Perform the conversion
    function performConversion() {
        const type = conversionType.value;
        const from = fromUnit.value;
        const to = toUnit.value;
        const value = parseFloat(inputValue.value);
        
        // Validate input
        if (isNaN(value)) {
            resultDisplay.textContent = '⚠️ Please enter a valid number';
            resultDisplay.style.color = 'var(--secondary-color)';
            return;
        }
        
        if (type !== 'temperature' && value < 0) {
            resultDisplay.textContent = '⚠️ Please enter a positive value';
            resultDisplay.style.color = 'var(--secondary-color)';
            return;
        }
        
        // Get conversion function
        const conversionFn = conversionData[type].conversions[from][to];
        const result = conversionFn(value);
        
        // Display result
        const fromUnitText = conversionData[type].units[conversionData[type].values.indexOf(from)];
        const toUnitText = conversionData[type].units[conversionData[type].values.indexOf(to)];
        
        resultDisplay.innerHTML = `
            <span class="result-value">${value.toLocaleString()} ${fromUnitText}</span>
            <i class="fas fa-arrow-right"></i>
            <span class="result-value">${result.toFixed(4)} ${toUnitText}</span>
        `;
        resultDisplay.style.color = 'var(--primary-color)';
    }

    // Swap the from and to units
    function swapUnits() {
        const temp = fromUnit.value;
        fromUnit.value = toUnit.value;
        toUnit.value = temp;
        
        // If there's a result, convert immediately after swapping
        if (inputValue.value && !isNaN(parseFloat(inputValue.value))) {
            performConversion();
        }
    }

    // Reset the converter
    function resetConverter() {
        inputValue.value = '';
        resultDisplay.textContent = 'Result will appear here';
        resultDisplay.style.color = 'var(--primary-color)';
        updateUnitOptions();
    }

    // Initialize the converter
    initConverter();
});