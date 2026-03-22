// Expense Tracker Application
class ExpenseTracker {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.filter = 'all';
        this.chart = null;
        
        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.setDefaultDate();
        this.updateUI();
        this.initChart();
    }

    cacheDOM() {
        // Form elements
        this.form = document.getElementById('transactionForm');
        this.description = document.getElementById('description');
        this.amount = document.getElementById('amount');
        this.type = document.getElementById('type');
        this.category = document.getElementById('category');
        this.date = document.getElementById('date');

        // Display elements
        this.totalBalance = document.getElementById('totalBalance');
        this.totalIncome = document.getElementById('totalIncome');
        this.totalExpense = document.getElementById('totalExpense');
        this.transactionsList = document.getElementById('transactionsList');
        this.emptyState = document.getElementById('emptyState');

        // Filter buttons
        this.filterBtns = document.querySelectorAll('.filter-btn');

        // Modal elements
        this.modal = document.getElementById('editModal');
        this.editForm = document.getElementById('editForm');
        this.closeModal = document.getElementById('closeModal');
        this.cancelEdit = document.getElementById('cancelEdit');

        // Export button
        this.exportBtn = document.getElementById('exportBtn');
    }

    bindEvents() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction();
        });

        // Filter buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filter = btn.dataset.filter;
                this.renderTransactions();
            });
        });

        // Modal events
        this.closeModal.addEventListener('click', () => this.closeEditModal());
        this.cancelEdit.addEventListener('click', () => this.closeEditModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeEditModal();
        });

        // Edit form submission
        this.editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEdit();
        });

        // Export CSV
        this.exportBtn.addEventListener('click', () => this.exportCSV());

        // Type change affects categories
        this.type.addEventListener('change', () => this.updateCategories());
    }

    setDefaultDate() {
        this.date.valueAsDate = new Date();
    }

    updateCategories() {
        const type = this.type.value;
        const categories = type === 'income' 
            ? [
                { value: 'salary', label: '💼 Salary' },
                { value: 'freelance', label: '💻 Freelance' },
                { value: 'investment', label: '📊 Investment' },
                { value: 'other', label: '📦 Other' }
              ]
            : [
                { value: 'food', label: '🍔 Food & Dining' },
                { value: 'transport', label: '🚗 Transport' },
                { value: 'shopping', label: '🛍️ Shopping' },
                { value: 'entertainment', label: '🎬 Entertainment' },
                { value: 'bills', label: '📋 Bills & Utilities' },
                { value: 'health', label: '🏥 Health' },
                { value: 'other', label: '📦 Other' }
              ];

        this.category.innerHTML = categories.map(cat => 
            `<option value="${cat.value}">${cat.label}</option>`
        ).join('');
    }

    addTransaction() {
        const transaction = {
            id: Date.now(),
            description: this.description.value.trim(),
            amount: parseFloat(this.amount.value),
            type: this.type.value,
            category: this.category.value,
            date: this.date.value,
            createdAt: new Date().toISOString()
        };

        this.transactions.unshift(transaction);
        this.saveTransactions();
        this.updateUI();
        this.form.reset();
        this.setDefaultDate();
        this.updateCategories();

        // Show success animation
        this.showNotification('Transaction added successfully!', 'success');
    }

    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveTransactions();
            this.updateUI();
            this.showNotification('Transaction deleted', 'info');
        }
    }

    openEditModal(id) {
        const transaction = this.transactions.find(t => t.id === id);
        if (!transaction) return;

        document.getElementById('editId').value = transaction.id;
        document.getElementById('editDescription').value = transaction.description;
        document.getElementById('editAmount').value = transaction.amount;
        document.getElementById('editCategory').value = transaction.category;
        document.getElementById('editDate').value = transaction.date;

        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeEditModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    saveEdit() {
        const id = parseInt(document.getElementById('editId').value);
        const index = this.transactions.findIndex(t => t.id === id);
        
        if (index === -1) return;

        this.transactions[index] = {
            ...this.transactions[index],
            description: document.getElementById('editDescription').value.trim(),
            amount: parseFloat(document.getElementById('editAmount').value),
            category: document.getElementById('editCategory').value,
            date: document.getElementById('editDate').value
        };

        this.saveTransactions();
        this.updateUI();
        this.closeEditModal();
        this.showNotification('Transaction updated successfully!', 'success');
    }

    saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }

    updateUI() {
        this.updateSummary();
        this.renderTransactions();
        this.updateChart();
    }

    updateSummary() {
        const income = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expense = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = income - expense;

        this.totalIncome.textContent = this.formatCurrency(income);
        this.totalExpense.textContent = this.formatCurrency(expense);
        this.totalBalance.textContent = this.formatCurrency(balance);
    }

    renderTransactions() {
        let filtered = this.transactions;
        if (this.filter !== 'all') {
            filtered = this.transactions.filter(t => t.type === this.filter);
        }

        if (filtered.length === 0) {
            this.transactionsList.innerHTML = '';
            this.emptyState.classList.add('active');
            return;
        }

        this.emptyState.classList.remove('active');

        const categoryIcons = {
            food: '🍔',
            transport: '🚗',
            shopping: '🛍️',
            entertainment: '🎬',
            bills: '📋',
            health: '🏥',
            salary: '💼',
            freelance: '💻',
            investment: '📊',
            other: '📦'
        };

        const categoryLabels = {
            food: 'Food',
            transport: 'Transport',
            shopping: 'Shopping',
            entertainment: 'Entertainment',
            bills: 'Bills',
            health: 'Health',
            salary: 'Salary',
            freelance: 'Freelance',
            investment: 'Investment',
            other: 'Other'
        };

        this.transactionsList.innerHTML = filtered.map(t => `
            <div class="transaction-item">
                <div class="transaction-icon ${t.type}-bg">
                    ${categoryIcons[t.category] || '📦'}
                </div>
                <div class="transaction-details">
                    <div class="transaction-title">${this.escapeHtml(t.description)}</div>
                    <div class="transaction-meta">
                        <span class="transaction-category">${categoryLabels[t.category]}</span>
                        <span>•</span>
                        <span>${this.formatDate(t.date)}</span>
                    </div>
                </div>
                <div class="transaction-amount ${t.type}">
                    ${t.type === 'income' ? '+' : '-'}${this.formatCurrency(t.amount)}
                </div>
                <div class="transaction-actions">
                    <button class="btn-edit" onclick="app.openEditModal(${t.id})" title="Edit">
                        ✏️
                    </button>
                    <button class="btn-danger" onclick="app.deleteTransaction(${t.id})" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    }

    initChart() {
        const canvas = document.getElementById('expenseChart');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size for retina displays
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        this.chart = { canvas, ctx, centerX: rect.width / 2, centerY: rect.height / 2, radius: Math.min(rect.width, rect.height) / 2 - 40 };
    }

    updateChart() {
        const expenses = this.transactions.filter(t => t.type === 'expense');
        
        if (expenses.length === 0) {
            this.drawEmptyChart();
            return;
        }

        // Group by category
        const categoryTotals = {};
        expenses.forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

        const data = Object.entries(categoryTotals).map(([category, amount]) => ({
            category,
            amount,
            percentage: (amount / Object.values(categoryTotals).reduce((a, b) => a + b, 0)) * 100
        }));

        const colors = {
            food: '#f59e0b',
            transport: '#3b82f6',
            shopping: '#ec4899',
            entertainment: '#8b5cf6',
            bills: '#ef4444',
            health: '#10b981',
            other: '#6b7280'
        };

        // Draw pie chart
        const { ctx, centerX, centerY, radius } = this.chart;
        ctx.clearRect(0, 0, this.chart.canvas.width, this.chart.canvas.height);

        let currentAngle = -Math.PI / 2;

        data.forEach(item => {
            const sliceAngle = (item.percentage / 100) * 2 * Math.PI;
            
            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[item.category] || '#6b7280';
            ctx.fill();

            // Draw border
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 2;
            ctx.stroke();

            currentAngle += sliceAngle;
        });

        // Draw center hole (donut chart)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#1e293b';
        ctx.fill();

        // Update legend
        const legendContainer = document.getElementById('chartLegend');
        const categoryLabels = {
            food: 'Food & Dining',
            transport: 'Transport',
            shopping: 'Shopping',
            entertainment: 'Entertainment',
            bills: 'Bills & Utilities',
            health: 'Health',
            other: 'Other'
        };

        legendContainer.innerHTML = data.map(item => `
            <div class="legend-item">
                <div class="legend-color" style="background: ${colors[item.category] || '#6b7280'}"></div>
                <span>${categoryLabels[item.category] || item.category}: ${item.percentage.toFixed(1)}%</span>
            </div>
        `).join('');
    }

    drawEmptyChart() {
        const { ctx, centerX, centerY, radius } = this.chart;
        ctx.clearRect(0, 0, this.chart.canvas.width, this.chart.canvas.height);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 20;
        ctx.stroke();

        document.getElementById('chartLegend').innerHTML = '<p style="color: var(--gray); text-align: center;">No expenses to display</p>';
    }

    exportCSV() {
        if (this.transactions.length === 0) {
            alert('No transactions to export');
            return;
        }

        const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
        const rows = this.transactions.map(t => [
            t.date,
            `"${t.description.replace(/"/g, '""')}"`,
            t.category,
            t.type,
            t.amount.toFixed(2)
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.showNotification('CSV exported successfully!', 'success');
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Simple notification implementation
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? 'var(--success)' : 'var(--primary)'};
            color: white;
            border-radius: var(--radius-sm);
            box-shadow: var(--shadow-lg);
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
            font-weight: 500;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize app
const app = new ExpenseTracker();