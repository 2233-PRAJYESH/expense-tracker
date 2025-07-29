// Initialize expenses array
let expenses = [];

// Authentication handling
let currentUser = null;

function checkAuthState() {
    const user = JSON.parse(localStorage.getItem('spendlyUser'));
    currentUser = user;
    updateAuthUI(user?.isAuthenticated);
}

function updateAuthUI(isAuthenticated) {
    const loginBtn = document.getElementById('loginBtn');
    if (isAuthenticated) {
        loginBtn.textContent = 'Logout';
        loginBtn.removeAttribute('data-bs-toggle');
        loginBtn.removeAttribute('data-bs-target');
        loginBtn.onclick = handleLogout;
    } else {
        loginBtn.textContent = 'Login / Register';
        loginBtn.setAttribute('data-bs-toggle', 'modal');
        loginBtn.setAttribute('data-bs-target', '#loginModal');
        loginBtn.onclick = null;
    }
}

function handleLogout() {
    localStorage.removeItem('spendlyUser');
    currentUser = null;
    updateAuthUI(false);
    expenses = []; // Clear expenses when logging out
    updateExpensesUI();
}

function isValidMobile(mobile) {
    return /^[0-9]{10}$/.test(mobile);
}

// Theme handling
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const icon = document.querySelector('#themeToggle i');
    icon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
}

// Initialize theme and auth
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    checkAuthState();

    // Set up authentication forms
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const mobile = document.getElementById('loginMobile').value;

        if (!isValidMobile(mobile)) {
            alert('Please enter a valid 10-digit mobile number');
            return;
        }

        // For demo purposes, we'll just store in localStorage
        const user = {
            email: email,
            mobile: mobile,
            isAuthenticated: true
        };

        localStorage.setItem('spendlyUser', JSON.stringify(user));
        currentUser = user;
        loginModal.hide();
        updateAuthUI(true);
    });

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const mobile = document.getElementById('registerMobile').value;

        if (!isValidMobile(mobile)) {
            alert('Please enter a valid 10-digit mobile number');
            return;
        }

        // For demo purposes, we'll just store in localStorage
        const user = {
            name: name,
            email: email,
            mobile: mobile,
            isAuthenticated: true
        };

        localStorage.setItem('spendlyUser', JSON.stringify(user));
        currentUser = user;
        loginModal.hide();
        updateAuthUI(true);
    });
});

// Theme toggle
document.getElementById('themeToggle').addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

// Set today's date as the default value for the date picker
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('expenseDate').value = today;
});

// Get the form and container elements
const expenseForm = document.getElementById('expense-form');
const expensesContainer = document.getElementById('expenses-container');
const noExpensesPlaceholder = document.querySelector('.no-expenses-placeholder');

// Handle form submission
expenseForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!currentUser) {
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
        return;
    }
    
    // Get form values
    const amount = document.getElementById('expenseAmount').value;
    const category = document.getElementById('expenseCategory').value;
    const date = document.getElementById('expenseDate').value;
    
    // Create expense object
    const expense = {
        id: Date.now(),
        amount: parseFloat(amount),
        category: category,
        date: new Date(date),
        createdAt: new Date(),
    };
    
    // Add to expenses array
    expenses.push(expense);
    
    // Update the UI
    updateExpensesUI();
    
    // Reset form
    expenseForm.reset();
    
    // Set today's date again after form reset
    document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
});

// Update the expenses display
function updateExpensesUI() {
    // Hide/show placeholder based on expenses
    if (expenses.length > 0) {
        noExpensesPlaceholder.style.display = 'none';
    } else {
        noExpensesPlaceholder.style.display = 'block';
    }
    
    // Clear existing expense cards (except placeholder)
    const existingCards = expensesContainer.querySelectorAll('.expense-card');
    existingCards.forEach(card => card.remove());
    
    // Add expense cards
    expenses.forEach(expense => {
        const card = createExpenseCard(expense);
        expensesContainer.appendChild(card);
    });
}

// Create an expense card element
function createExpenseCard(expense) {
    const card = document.createElement('div');
    card.className = 'expense-card card p-3 d-flex flex-row align-items-center';
    
    // Format the date
    const formattedDate = expense.date.toLocaleDateString();
    const formattedTime = expense.createdAt.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
    });
    
      card.innerHTML = `
        <div class="category-icon">
          <i class="bi bi-cart"></i>
        </div>
        <div class="flex-grow-1">
          <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
          <div class="expense-category">${expense.category}</div>
          <div class="expense-date">${formattedDate} at ${formattedTime}</div>
        </div>
        <div class="delete-expense ms-3" onclick="deleteExpense(${expense.id})">
          <i class="bi bi-x-circle"></i>
        </div>
      `;    return card;
}

// Delete an expense
function deleteExpense(id) {
    expenses = expenses.filter(expense => expense.id !== id);
    updateExpensesUI();
}

// Export functions
document.getElementById('exportCSV').addEventListener('click', function() {
    if (expenses.length === 0) {
        alert('No expenses to export!');
        return;
    }
    
    const csvContent = 'Date,Time Created,Category,Amount\n' + 
        expenses.map(exp => `${exp.date.toLocaleDateString()},${exp.createdAt.toLocaleTimeString()},${exp.category},${exp.amount}`).join('\n');
    
    downloadFile(csvContent, 'expenses.csv', 'text/csv');
});

document.getElementById('exportExcel').addEventListener('click', function() {
    if (expenses.length === 0) {
        alert('No expenses to export!');
        return;
    }
    
    // Create Excel-compatible CSV
    const excelContent = '\uFEFF' + 'Date,Time Created,Category,Amount\n' + 
        expenses.map(exp => `${exp.date.toLocaleDateString()},${exp.createdAt.toLocaleTimeString()},${exp.category},${exp.amount}`).join('\n');
    
    downloadFile(excelContent, 'expenses.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});

document.getElementById('exportPDF').addEventListener('click', async function() {
    if (expenses.length === 0) {
        alert('No expenses to export!');
        return;
    }

    const content = `
        <h2>Expense Report</h2>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Time Created</th>
                    <th>Category</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${expenses.map(exp => `
                    <tr>
                        <td>${exp.date.toLocaleDateString()}</td>
                        <td>${exp.createdAt.toLocaleTimeString()}</td>
                        <td>${exp.category}</td>
                        <td>₹${exp.amount.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    // Convert HTML to PDF-like format (since we can't generate actual PDFs in browser)
    const style = `
        <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            h2 { text-align: center; }
        </style>
    `;

    const fullContent = style + content;
    const blob = new Blob([fullContent], { type: 'text/html' });
    downloadFile(blob, 'expenses.pdf', 'application/pdf');
});

function downloadFile(content, filename, mimeType) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}