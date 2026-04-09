// CONFIGURATION & STATE

const AppState = {
    theme: localStorage.getItem('theme') || 'light',
    isCalculating: false
};

// DOM ELEMENTS

const elements = {
    // Inputs
    dobInput: document.getElementById('dob'),
    dobError: document.getElementById('dob-error'),
    
    // Buttons
    calculateBtn: document.getElementById('calculateBtn'),
    resetBtn: document.getElementById('resetBtn'),
    themeToggle: document.getElementById('themeToggle'),
    
    // Results
    results: document.getElementById('results'),
    yearsEl: document.getElementById('years'),
    monthsEl: document.getElementById('months'),
    daysEl: document.getElementById('days'),
    totalDaysEl: document.getElementById('totalDays'),
    nextBirthdayEl: document.getElementById('nextBirthday'),
    funFact: document.getElementById('funFact'),
    funFactText: document.querySelector('.fact-text'),
    
    // UI elements
    btnText: document.querySelector('#calculateBtn .btn-text'),
    btnIcon: document.querySelector('#calculateBtn .btn-icon'),
    spinner: document.querySelector('.spinner')
};

// UTILITY FUNCTIONS

/**
 * Format number with commas (e.g., 1,000)
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
const formatNumber = (num) => {
    return num.toLocaleString('en-US');
};

/**
 * Check if a year is a leap year
 * @param {number} year - Year to check
 * @returns {boolean} True if leap year
 */
const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

/**
 * Get days in a specific month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {number} Days in month
 */
const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
};

/**
 * Calculate exact age difference between two dates
 * @param {Date} birthDate - Birth date
 * @param {Date} currentDate - Current date
 * @returns {Object} Age in years, months, days
 */
const calculateExactAge = (birthDate, currentDate) => {
    let years = currentDate.getFullYear() - birthDate.getFullYear();
    let months = currentDate.getMonth() - birthDate.getMonth();
    let days = currentDate.getDate() - birthDate.getDate();

    // Adjust if days are negative
    if (days < 0) {
        months--;
        const prevMonth = currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
        const prevYear = currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
        days += getDaysInMonth(prevYear, prevMonth);
    }

    // Adjust if months are negative
    if (months < 0) {
        years--;
        months += 12;
    }

    return { years, months, days };
};

/**
 * Calculate days until next birthday
 * @param {Date} birthDate - Birth date
 * @param {Date} currentDate - Current date
 * @returns {number} Days until next birthday
 */
const calculateNextBirthday = (birthDate, currentDate) => {
    const currentYear = currentDate.getFullYear();
    let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
    
    // If birthday has passed this year, set to next year
    if (nextBirthday < currentDate) {
        nextBirthday.setFullYear(currentYear + 1);
    }
    
    const diffTime = nextBirthday - currentDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculate total days lived
 * @param {Date} birthDate - Birth date
 * @param {Date} currentDate - Current date
 * @returns {number} Total days
 */
const calculateTotalDays = (birthDate, currentDate) => {
    const diffTime = currentDate - birthDate;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Generate a fun fact based on age
 * @param {number} years - Age in years
 * @param {number} totalDays - Total days lived
 * @returns {string} Fun fact text
 */
const generateFunFact = (years, totalDays) => {
    const facts = [
        `You've experienced approximately ${Math.floor(totalDays / 365.25 * 4)} seasons!`,
        `Your heart has beaten roughly ${formatNumber(totalDays * 24 * 60 * 80)} times!`,
        `You've taken about ${formatNumber(totalDays * 20000)} steps in your lifetime!`,
        `The moon has orbited Earth ${Math.floor(totalDays / 27.3)} times since you were born!`,
        `You've lived through ${Math.floor(totalDays / 365.25)} years of technological changes!`,
        `Earth has traveled ${formatNumber(Math.floor(totalDays * 2340000))} miles around the sun since your birth!`
    ];
    
    // Return fact based on age or random
    return facts[years % facts.length] || facts[0];
};

// UI FUNCTIONS

/**
 * Show error message
 * @param {string} message - Error message
 */
const showError = (message) => {
    elements.dobInput.classList.add('error');
    elements.dobError.textContent = message;
    elements.dobError.classList.add('show');
    
    // Announce error to screen readers
    elements.dobError.setAttribute('aria-live', 'polite');
};

/**
 * Clear error message
 */
const clearError = () => {
    elements.dobInput.classList.remove('error');
    elements.dobError.textContent = '';
    elements.dobError.classList.remove('show');
};

/**
 * Set loading state
 * @param {boolean} loading - Whether loading
 */
const setLoading = (loading) => {
    AppState.isCalculating = loading;
    
    if (loading) {
        elements.btnText.textContent = 'Calculating...';
        elements.btnIcon.classList.add('hidden');
        elements.spinner.classList.remove('hidden');
        elements.calculateBtn.disabled = true;
    } else {
        elements.btnText.textContent = 'Calculate Age';
        elements.btnIcon.classList.remove('hidden');
        elements.spinner.classList.add('hidden');
        elements.calculateBtn.disabled = false;
    }
};

/**
 * Animate number counting
 * @param {HTMLElement} element - Element to update
 * @param {number} target - Target number
 * @param {number} duration - Animation duration in ms
 */
const animateNumber = (element, target, duration = 1000) => {
    const start = 0;
    const startTime = performance.now();
    
    const updateNumber = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * easeOut);
        
        element.textContent = formatNumber(current);
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = formatNumber(target);
        }
    };
    
    requestAnimationFrame(updateNumber);
};

/**
 * Display results with animation
 * @param {Object} age - Age object
 * @param {number} totalDays - Total days
 * @param {number} nextBirthday - Days until birthday
 */
const displayResults = (age, totalDays, nextBirthday) => {
    // Show results container
    elements.results.classList.remove('hidden');
    elements.resetBtn.classList.remove('hidden');
    
    // Animate numbers
    animateNumber(elements.yearsEl, age.years);
    animateNumber(elements.monthsEl, age.months);
    animateNumber(elements.daysEl, age.days);
    
    // Update stats with slight delay
    setTimeout(() => {
        elements.totalDaysEl.textContent = formatNumber(totalDays);
        elements.nextBirthdayEl.textContent = nextBirthday;
        
        // Fun fact
        elements.funFactText.textContent = generateFunFact(age.years, totalDays);
    }, 300);
};

/**
 * Reset the calculator
 */
const resetCalculator = () => {
    // Clear input
    elements.dobInput.value = '';
    clearError();
    
    // Hide results
    elements.results.classList.add('hidden');
    elements.resetBtn.classList.add('hidden');
    
    // Reset button state
    elements.yearsEl.textContent = '0';
    elements.monthsEl.textContent = '0';
    elements.daysEl.textContent = '0';
    
    // Focus back on input
    elements.dobInput.focus();
};

// THEME MANAGEMENT

/**
 * Toggle between light and dark theme
 */
const toggleTheme = () => {
    const newTheme = AppState.theme === 'light' ? 'dark' : 'light';
    AppState.theme = newTheme;
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
};

/**
 * Initialize theme on load
 */
const initTheme = () => {
    document.documentElement.setAttribute('data-theme', AppState.theme);
};

// VALIDATION

/**
 * Validate date input
 * @param {string} dateString - Date string from input
 * @returns {Object} Validation result
 */
const validateDate = (dateString) => {
    if (!dateString) {
        return { valid: false, message: 'Please select your date of birth' };
    }
    
    const birthDate = new Date(dateString);
    const today = new Date();
    
    // Check for valid date
    if (isNaN(birthDate.getTime())) {
        return { valid: false, message: 'Please enter a valid date' };
    }
    
    // Check if date is in the future
    if (birthDate > today) {
        return { valid: false, message: 'Birth date cannot be in the future' };
    }
    
    // Check if date is too old (before 1900)
    if (birthDate.getFullYear() < 1900) {
        return { valid: false, message: 'Please enter a date after 1900' };
    }
    
    return { valid: true, date: birthDate };
};

// MAIN CALCULATION

/**
 * Main calculation handler
 */
const handleCalculate = async () => {
    // Prevent double submission
    if (AppState.isCalculating) return;
    
    const dateString = elements.dobInput.value;
    const validation = validateDate(dateString);
    
    if (!validation.valid) {
        showError(validation.message);
        return;
    }
    
    clearError();
    setLoading(true);
    
    // Simulate calculation delay for UX
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const birthDate = validation.date;
    const today = new Date();
    
    // Calculate all metrics
    const age = calculateExactAge(birthDate, today);
    const totalDays = calculateTotalDays(birthDate, today);
    const nextBirthday = calculateNextBirthday(birthDate, today);
    
    // Display results
    displayResults(age, totalDays, nextBirthday);
    
    setLoading(false);
};

// EVENT LISTENERS

/**
 * Initialize all event listeners
 */
const initEventListeners = () => {
    // Calculate button
    elements.calculateBtn.addEventListener('click', handleCalculate);
    
    // Reset button
    elements.resetBtn.addEventListener('click', resetCalculator);
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Input validation on change
    elements.dobInput.addEventListener('change', clearError);
    elements.dobInput.addEventListener('input', clearError);
    
    // Enter key support
    elements.dobInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleCalculate();
        }
    });
    
    // Set max date to today (prevents future dates in date picker)
    elements.dobInput.max = new Date().toISOString().split('T')[0];
};

// INITIALIZATION

/**
 * Initialize the application
 */
const init = () => {
    initTheme();
    initEventListeners();
    
    // Focus input on load
    elements.dobInput.focus();
    
    console.log('🎉 Age Calculator Pro initialized!');
};

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}