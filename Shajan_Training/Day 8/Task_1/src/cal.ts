class SimpleCalculator {
    display: HTMLInputElement;
    currentInput: string;
    currentOperation: string | null;
    justCalculated: boolean;

    constructor() {
        this.display = document.getElementById('display') as HTMLInputElement;
        this.currentInput = '0';
        this.currentOperation = null;
        this.justCalculated = false;
        this.setupEventListeners();
    }

    setupEventListeners(): void {
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                const value = button.getAttribute('data-value');
                if (value) this.handleButtonClick(value);
            });
        });
    }

    handleButtonClick(value: string): void {
        if (this.isNumber(value) || value === '.') {
            this.appendInput(value);
        } else if (this.isOperation(value)) {
            this.setOperation(value);
        } else if (value === '=') {
            this.calculate();
        } else if (value === 'C') {
            this.clear();
        }
        this.updateDisplay();
    }

    appendInput(value: string): void {
        if (this.currentInput === '0' && value !== '.') {
            this.currentInput = value;
        } else {
            if (value === '.' && this.currentInput.includes('.')) return;
            this.currentInput += value;
        }

        this.justCalculated = false;
    }

    setOperation(operation: string): void {
        if (!this.justCalculated) {
            this.currentInput += ` ${operation} `;
            this.currentOperation = operation;
        }
        this.justCalculated = false;
    }

    isNumber(value: string): boolean {
        return !isNaN(parseFloat(value)) && isFinite(Number(value));
    }

    isOperation(value: string): boolean {
        return ['+', '-', '*', '/'].includes(value);
    }

    calculate(): void {
        try {
            this.currentInput = eval(this.currentInput).toString();
        } catch (e) {
            this.currentInput = 'Error';
        }

        this.currentOperation = null;
        this.justCalculated = true;
    }

    clear(): void {
        this.currentInput = '0';
        this.currentOperation = null;
        this.justCalculated = false;
    }

    updateDisplay(): void {
        this.display.value = this.currentInput;
    }
}

new SimpleCalculator();
