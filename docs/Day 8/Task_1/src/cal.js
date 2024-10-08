var SimpleCalculator = /** @class */ (function () {
    function SimpleCalculator() {
        this.display = document.getElementById('display');
        this.currentInput = '0';
        this.currentOperation = null;
        this.justCalculated = false;
        this.setupEventListeners();
    }
    SimpleCalculator.prototype.setupEventListeners = function () {
        var _this = this;
        document.querySelectorAll('button').forEach(function (button) {
            button.addEventListener('click', function () {
                var value = button.getAttribute('data-value');
                if (value)
                    _this.handleButtonClick(value);
            });
        });
    };
    SimpleCalculator.prototype.handleButtonClick = function (value) {
        if (this.isNumber(value) || value === '.') {
            this.appendInput(value);
        }
        else if (this.isOperation(value)) {
            this.setOperation(value);
        }
        else if (value === '=') {
            this.calculate();
        }
        else if (value === 'C') {
            this.clear();
        }
        this.updateDisplay();
    };
    SimpleCalculator.prototype.appendInput = function (value) {
        if (this.currentInput === '0' && value !== '.') {
            this.currentInput = value;
        }
        else {
            if (value === '.' && this.currentInput.includes('.'))
                return;
            this.currentInput += value;
        }
        this.justCalculated = false;
    };
    SimpleCalculator.prototype.setOperation = function (operation) {
        if (!this.justCalculated) {
            this.currentInput += " ".concat(operation, " ");
            this.currentOperation = operation;
        }
        this.justCalculated = false;
    };
    SimpleCalculator.prototype.isNumber = function (value) {
        return !isNaN(parseFloat(value)) && isFinite(Number(value));
    };
    SimpleCalculator.prototype.isOperation = function (value) {
        return ['+', '-', '*', '/'].includes(value);
    };
    SimpleCalculator.prototype.calculate = function () {
        try {
            if (this.currentInput.includes('/ 0')) {
                throw new Error("Cannot divide by zero");
            }
            var result = eval(this.currentInput);
            if (!isFinite(result)) {
                throw new Error("Cannot divide by zero");
            }
            this.currentInput = result.toString();
        }
        catch (e) {
            this.currentInput = e instanceof Error ? e.message : 'Error';
        }
        this.currentOperation = null;
        this.justCalculated = true;
    };
    SimpleCalculator.prototype.clear = function () {
        this.currentInput = '0';
        this.currentOperation = null;
        this.justCalculated = false;
    };
    SimpleCalculator.prototype.updateDisplay = function () {
        this.display.value = this.currentInput;
    };
    return SimpleCalculator;
}());
new SimpleCalculator();
