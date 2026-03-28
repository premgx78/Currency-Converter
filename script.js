/* Conversion Logic and UI Handling */

// Currency rates from currencyrates.txt
const rates = {
    "AUD": 1.52,
    "CAD": 1.37,
    "CNY": 7.18,
    "EUR": 0.857,
    "INR": 85.86,
    "JPY": 147.33,
    "NPR": 137.13,
    "KRW": 1382.45,
    "AED": 3.67,
    "USD": 1.00
};

// DOM Elements
const amountInput = document.getElementById('amount');
const fromSelect = document.getElementById('from');
const toSelect = document.getElementById('to');
const convertBtn = document.getElementById('convert-btn');
const resultText = document.getElementById('result-text');
const swapIcon = document.querySelector('.swap-icon');

// Function to perform conversion
function convert() {
    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromSelect.value;
    const toCurrency = toSelect.value;

    if (isNaN(amount) || amount <= 0) {
        resultText.innerText = "Please enter a valid amount";
        return;
    }

    // Logic: (Target Rate / Source Rate) * Amount
    // This matches your C++ logic: (targetCurrencyValue / sourceCurrencyValue) * Amount
    const sourceRate = rates[fromCurrency];
    const targetRate = rates[toCurrency];
    
    const convertedAmount = (targetRate / sourceRate) * amount;

    // Display result formatted to 2 decimal places
    resultText.innerText = `${amount.toLocaleString()} ${fromCurrency} = ${convertedAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ${toCurrency}`;
}

// Function to swap currencies
function swapCurrencies() {
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
    convert(); // Auto-convert after swap
}

// Event Listeners
convertBtn.addEventListener('click', convert);

swapIcon.addEventListener('click', swapCurrencies);

// Optional: Convert on 'Enter' key press
amountInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') convert();
});

// Initial conversion on load
window.addEventListener('load', convert);
