function appendValue(value) {
    document.getElementById('display').value += value;
}

function clearDisplay() {
    document.getElementById('display').value = '';
}

function calculateResult() {
    try {
        let expression = document.getElementById('display').value;
        let result = new Function('return ' + expression)(); // Using Function constructor
        document.getElementById('display').value = result;
    } catch {
        document.getElementById('display').value = 'Error';
    }
}
