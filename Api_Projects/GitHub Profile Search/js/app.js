// GitHub Explorer Application
class GitHubExplorer {
    constructor() {
        this.apiUrl = 'https://api.github.com';
        this.currentUser = null;
        this.repositories = [];
        this.savedUsers = JSON.parse(localStorage.getItem('savedUsers')) || [];
        this.charts = {};
        
        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.updateRateLimit();
        this.renderSavedUsers();
        
        // Load default user
        this.searchUser('facebook');
    }

    cacheDOM() {
        // Search elements
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.suggestionChips = document.querySelectorAll('.suggestion-chip');
        
        // State elements
        this.loading = document.getElementById('loading');
        this.error = document.getElementById('error');
        this.results = document.getElementById('results');
        
        // Profile elements
        this.avatar = document.getElementById('avatar');
        this.name = document.getElementById('name');
        this.username = document.getElementById('username');
        this.bio = document.getElementById('bio');
        this.location = document.getElementById('location');
        this.company = document.getElementById('company');
        this.blog = document.getElementById('blog');
        this.twitter = document.getElementById('twitter');
        this.created = document.getElementById('created');
        this.updated = document.getElementById('updated');
        this.hireableBadge = document.getElementById('hireable-badge');
        this.profileLink = document.getElementById('profile-link');
        
        // Stats elements
        this.reposCount = document.getElementById('repos-count');
        this.followersCount = document.getElementById('followers-count');
        this.followingCount = document.getElementById('following-count');
        this.starsCount = document.getElementById('stars-count');
        
        // Lists
        this.reposList = document.getElementById('repos-list');
        this.topLanguages = document.getElementById('top-languages');
        this.recentActivity = document.getElementById('recent-activity');
        this.savedUsersContainer = document.getElementById('saved-users');
        
        // Filters
        this.sortRepos = document.getElementById('sort-repos');
        this.filterRepos = document.getElementById('filter-repos');
        this.loadMoreBtn = document.getElementById('load-more');
        
        // Buttons
        this.saveUserBtn = document.getElementById('save-user');
    }

    bindEvents() {
        // Search
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        
        // Suggestions
        this.suggestionChips.forEach(chip => {
            chip.addEventListener('click', () => {
                this.searchInput.value = chip.dataset.user;
                this.handleSearch();
            });
        });
        
        // Filters
        this.sortRepos.addEventListener('change', () => this.renderRepositories());
        this.filterRepos.addEventListener('input', () => this.renderRepositories());
        
        // Load more
        this.loadMoreBtn.addEventListener('click', () => this.loadMoreRepos());
        
        // Save user
        this.saveUserBtn.addEventListener('click', () => this.toggleSaveUser());
    }

    async handleSearch() {
        const username = this.searchInput.value.trim();
        if (!username) return;
        
        await this.searchUser(username);
    }

    async searchUser(username) {
        this.showLoading();
        
        try {
            // Fetch user data
            const userResponse = await fetch(`${this.apiUrl}/users/${username}`);
            
            if (!userResponse.ok) {
                throw new Error('User not found');
            }
            
            this.currentUser = await userResponse.json();
            
            // Fetch repos
            const reposResponse = await fetch(`${this.apiUrl}/users/${username}/repos?per_page=100&sort=updated`);
            this.repositories = await reposResponse.json();
            
            // Fetch events for activity
            const eventsResponse = await fetch(`${this.apiUrl}/users/${username}/events/public?per_page=10`);
            const events = await eventsResponse.json();
            
            // Calculate total stars
            const totalStars = this.repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
            this.currentUser.totalStars = totalStars;
            
            // Update UI
            this.renderProfile();
            this.renderStats();
            this.renderRepositories();
            this.renderCharts();
            this.renderLanguages();
            this.renderActivity(events);
            this.renderContributionGraph();
            this.updateSaveButton();
            
            this.showResults();
            this.updateRateLimit();
            
        } catch (error) {
            console.error('Error:', error);
            this.showError();
        }
    }

    renderProfile() {
        const user = this.currentUser;
        
        this.avatar.src = user.avatar_url;
        this.name.textContent = user.name || user.login;
        this.username.textContent = `@${user.login}`;
        this.bio.textContent = user.bio || 'No bio available';
        this.profileLink.href = user.html_url;
        
        // Meta info
        this.location.textContent = user.location || '📍 Not specified';
        this.location.style.display = user.location ? 'flex' : 'none';
        
        this.company.textContent = user.company || '🏢 No company';
        this.company.style.display = user.company ? 'flex' : 'none';
        
        this.blog.textContent = user.blog ? '🔗 ' + user.blog : '🔗 No website';
        this.blog.style.display = user.blog ? 'flex' : 'none';
        
        this.twitter.textContent = user.twitter_username ? `🐦 @${user.twitter_username}` : '🐦 No Twitter';
        this.twitter.style.display = user.twitter_username ? 'flex' : 'none';
        
        // Dates
        this.created.textContent = `Joined: ${this.formatDate(user.created_at)}`;
        this.updated.textContent = `Updated: ${this.formatDate(user.updated_at)}`;
        
        // Hireable badge
        this.hireableBadge.classList.toggle('visible', user.hireable);
    }

    renderStats() {
        const user = this.currentUser;
        
        this.animateNumber(this.reposCount, user.public_repos);
        this.animateNumber(this.followersCount, user.followers);
        this.animateNumber(this.followingCount, user.following);
        this.animateNumber(this.starsCount, user.totalStars || 0);
    }

    renderRepositories() {
        const sortType = this.sortRepos.value;
        const filterText = this.filterRepos.value.toLowerCase();
        
        // Sort repos
        let sorted = [...this.repositories];
        
        switch(sortType) {
            case 'stars':
                sorted.sort((a, b) => b.stargazers_count - a.stargazers_count);
                break;
            case 'forks':
                sorted.sort((a, b) => b.forks_count - a.forks_count);
                break;
            case 'name':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default: // updated
                sorted.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        }
        
        // Filter repos
        const filtered = sorted.filter(repo => 
            repo.name.toLowerCase().includes(filterText) ||
            (repo.description && repo.description.toLowerCase().includes(filterText))
        );
        
        // Show first 10
        const displayRepos = filtered.slice(0, 10);
        
        this.reposList.innerHTML = displayRepos.map(repo => `
            <div class="repo-card">
                <div class="repo-header">
                    <a href="${repo.html_url}" target="_blank" class="repo-name">${repo.name}</a>
                    <span class="repo-visibility">${repo.private ? 'Private' : 'Public'}</span>
                </div>
                <p class="repo-description">${repo.description || 'No description available'}</p>
                <div class="repo-meta">
                    ${repo.language ? `
                        <span>
                            <span class="language-dot" style="background: ${this.getLanguageColor(repo.language)}"></span>
                            ${repo.language}
                        </span>
                    ` : ''}
                    <span>⭐ ${repo.stargazers_count}</span>
                    <span>🍴 ${repo.forks_count}</span>
                    <span>📅 ${this.formatDate(repo.updated_at)}</span>
                </div>
            </div>
        `).join('');
        
        // Show/hide load more button
        this.loadMoreBtn.style.display = filtered.length > 10 ? 'block' : 'none';
    }

    loadMoreRepos() {
        // Implementation for pagination
        this.showToast('Loading more repositories...', 'info');
    }

    renderCharts() {
        // Language distribution chart
        const languages = {};
        this.repositories.forEach(repo => {
            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
            }
        });
        
        const langLabels = Object.keys(languages);
        const langData = Object.values(languages);
        
        // Destroy existing chart
        if (this.charts.language) {
            this.charts.language.destroy();
        }
        
        const langCtx = document.getElementById('languageChart').getContext('2d');
        this.charts.language = new Chart(langCtx, {
            type: 'doughnut',
            data: {
                labels: langLabels,
                datasets: [{
                    data: langData,
                    backgroundColor: [
                        '#6366f1', '#8b5cf6', '#ec4899', '#10b981',
                        '#f59e0b', '#3b82f6', '#ef4444', '#14b8a6'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: '#94a3b8', font: { size: 12 } }
                    }
                }
            }
        });
        
        // Repository stats chart
        const repoStats = {
            labels: ['Stars', 'Forks', 'Watchers', 'Open Issues'],
            data: [
                this.repositories.reduce((sum, r) => sum + r.stargazers_count, 0),
                this.repositories.reduce((sum, r) => sum + r.forks_count, 0),
                this.repositories.reduce((sum, r) => sum + r.watchers_count, 0),
                this.repositories.reduce((sum, r) => sum + r.open_issues_count, 0)
            ]
        };
        
        if (this.charts.repo) {
            this.charts.repo.destroy();
        }
        
        const repoCtx = document.getElementById('repoChart').getContext('2d');
        this.charts.repo = new Chart(repoCtx, {
            type: 'bar',
            data: {
                labels: repoStats.labels,
                datasets: [{
                    label: 'Count',
                    data: repoStats.data,
                    backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981'],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#94a3b8' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    renderLanguages() {
        // Calculate language statistics
        const langStats = {};
        let totalBytes = 0;
        
        this.repositories.forEach(repo => {
            if (repo.language) {
                // Estimate based on repo size
                const bytes = repo.size;
                langStats[repo.language] = (langStats[repo.language] || 0) + bytes;
                totalBytes += bytes;
            }
        });
        
        const sortedLangs = Object.entries(langStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        this.topLanguages.innerHTML = sortedLangs.map(([lang, bytes]) => {
            const percent = ((bytes / totalBytes) * 100).toFixed(1);
            const color = this.getLanguageColor(lang);
            
            return `
                <li class="lang-item">
                    <div>
                        <div class="lang-info">
                            <span class="lang-color" style="background: ${color}"></span>
                            <span class="lang-name">${lang}</span>
                        </div>
                        <div class="lang-bar">
                            <div class="lang-bar-fill" style="width: ${percent}%; background: ${color}"></div>
                        </div>
                    </div>
                    <span class="lang-percent">${percent}%</span>
                </li>
            `;
        }).join('');
    }

    renderActivity(events) {
        const activityTypes = {
            PushEvent: { icon: '📝', text: 'Pushed to' },
            CreateEvent: { icon: '✨', text: 'Created' },
            ForkEvent: { icon: '🍴', text: 'Forked' },
            WatchEvent: { icon: '⭐', text: 'Starred' },
            IssuesEvent: { icon: '🐛', text: 'Interacted with issue in' },
            PullRequestEvent: { icon: '🔀', text: 'Pull request in' }
        };
        
        this.recentActivity.innerHTML = events.slice(0, 5).map(event => {
            const type = activityTypes[event.type] || { icon: '📌', text: 'Activity in' };
            const repoName = event.repo ? event.repo.name : 'unknown';
            
            return `
                <div class="activity-item">
                    <span class="activity-icon">${type.icon}</span>
                    <div class="activity-content">
                        <p>${type.text} <strong>${repoName}</strong></p>
                        <span class="activity-time">${this.timeAgo(event.created_at)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderContributionGraph() {
        // Generate mock contribution data (GitHub API doesn't provide this directly without auth)
        const graph = document.getElementById('contribution-graph');
        const weeks = 52;
        const days = 7;
        
        let html = '';
        for (let i = 0; i < weeks * days; i++) {
            const level = Math.floor(Math.random() * 5); // 0-4
            html += `<div class="contribution-cell level-${level}"></div>`;
        }
        
        graph.innerHTML = html;
    }

    toggleSaveUser() {
        const user = this.currentUser;
        const index = this.savedUsers.findIndex(u => u.id === user.id);
        
        if (index === -1) {
            this.savedUsers.push({
                id: user.id,
                login: user.login,
                name: user.name,
                avatar_url: user.avatar_url
            });
            this.showToast('User saved!', 'success');
        } else {
            this.savedUsers.splice(index, 1);
            this.showToast('User removed from saved', 'info');
        }
        
        localStorage.setItem('savedUsers', JSON.stringify(this.savedUsers));
        this.renderSavedUsers();
        this.updateSaveButton();
    }

    renderSavedUsers() {
        if (this.savedUsers.length === 0) {
            this.savedUsersContainer.innerHTML = '<p class="empty">No saved profiles yet</p>';
            return;
        }
        
        this.savedUsersContainer.innerHTML = this.savedUsers.map(user => `
            <div class="saved-user" onclick="app.searchUser('${user.login}')">
                <img src="${user.avatar_url}" alt="${user.login}">
                <div class="saved-user-info">
                    <div class="saved-user-name">${user.name || user.login}</div>
                    <div class="saved-user-username">@${user.login}</div>
                </div>
                <button class="remove-saved" onclick="event.stopPropagation(); app.removeSavedUser(${user.id})">×</button>
            </div>
        `).join('');
    }

    removeSavedUser(userId) {
        this.savedUsers = this.savedUsers.filter(u => u.id !== userId);
        localStorage.setItem('savedUsers', JSON.stringify(this.savedUsers));
        this.renderSavedUsers();
        this.updateSaveButton();
    }

    updateSaveButton() {
        if (!this.currentUser) return;
        
        const isSaved = this.savedUsers.some(u => u.id === this.currentUser.id);
        this.saveUserBtn.innerHTML = isSaved ? '⭐ Saved' : '⭐ Save';
        this.saveUserBtn.classList.toggle('btn-primary', isSaved);
        this.saveUserBtn.classList.toggle('btn-secondary', !isSaved);
    }

    async updateRateLimit() {
        try {
            const response = await fetch(`${this.apiUrl}/rate_limit`);
            const data = await response.json();
            const remaining = data.resources.core.remaining;
            document.getElementById('rate-limit').textContent = remaining;
        } catch (error) {
            console.error('Rate limit check failed:', error);
        }
    }

    showLoading() {
        this.loading.classList.remove('hidden');
        this.error.classList.add('hidden');
        this.results.classList.add('hidden');
    }

    showResults() {
        this.loading.classList.add('hidden');
        this.error.classList.add('hidden');
        this.results.classList.remove('hidden');
    }

    showError() {
        this.loading.classList.add('hidden');
        this.error.classList.remove('hidden');
        this.results.classList.add('hidden');
    }

    animateNumber(element, target) {
        const duration = 1000;
        const start = parseInt(element.textContent) || 0;
        const increment = (target - start) / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
                element.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    timeAgo(dateString) {
        const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + ' years ago';
        
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + ' months ago';
        
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + ' days ago';
        
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + ' hours ago';
        
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + ' minutes ago';
        
        return 'Just now';
    }

    getLanguageColor(language) {
        const colors = {
            JavaScript: '#f1e05a',
            TypeScript: '#2b7489',
            Python: '#3572A5',
            Java: '#b07219',
            'C++': '#f34b7d',
            C: '#555555',
            'C#': '#178600',
            Go: '#00ADD8',
            Rust: '#dea584',
            Ruby: '#701516',
            PHP: '#4F5D95',
            Swift: '#ffac45',
            Kotlin: '#A97BFF',
            HTML: '#e34c26',
            CSS: '#563d7c',
            Shell: '#89e051',
            Vue: '#41b883',
            React: '#61dafb'
        };
        
        return colors[language] || '#6366f1';
    }

    showToast(message, type = 'info') {
        // Simple toast implementation
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary)'};
            color: white;
            border-radius: var(--radius-sm);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            font-weight: 500;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize
const app = new GitHubExplorer();