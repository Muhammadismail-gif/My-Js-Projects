// Chat Application Client-Side Logic
class ChatApp {
    constructor() {
        this.socket = io();
        this.username = '';
        this.room = '';
        this.typingTimer = null;
        this.isTyping = false;
        
        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.bindSocketEvents();
    }

    cacheDOM() {
        // Screens
        this.loginScreen = document.getElementById('login-screen');
        this.chatScreen = document.getElementById('chat-screen');
        
        // Login form
        this.loginForm = document.getElementById('login-form');
        this.usernameInput = document.getElementById('username');
        this.roomInput = document.getElementById('room');
        this.roomChips = document.querySelectorAll('.room-chip');
        
        // Chat elements
        this.messagesContainer = document.getElementById('messages');
        this.messageForm = document.getElementById('message-form');
        this.messageInput = document.getElementById('message-input');
        this.usersList = document.getElementById('users-list');
        this.roomName = document.getElementById('room-name');
        this.headerRoom = document.getElementById('header-room');
        this.userCount = document.getElementById('user-count');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.charCount = document.getElementById('char-count');
        
        // Buttons
        this.leaveRoomBtn = document.getElementById('leave-room');
        this.clearChatBtn = document.getElementById('clear-chat');
        this.emojiBtn = document.getElementById('emoji-btn');
        this.emojiModal = document.getElementById('emoji-modal');
        this.menuToggle = document.getElementById('menu-toggle');
        this.toggleSidebar = document.getElementById('toggle-sidebar');
        this.sidebar = document.getElementById('sidebar');
        this.themeToggle = document.getElementById('theme-toggle');
        
        // Emojis
        this.emojis = document.querySelectorAll('.emoji');
    }

    bindEvents() {
        // Login form submission
        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.joinRoom();
        });

        // Room chips
        this.roomChips.forEach(chip => {
            chip.addEventListener('click', () => {
                this.roomInput.value = chip.dataset.room;
            });
        });

        // Message submission
        this.messageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        // Typing indicator
        this.messageInput.addEventListener('input', () => {
            this.handleTyping();
            this.updateCharCount();
        });

        // Leave room
        this.leaveRoomBtn.addEventListener('click', () => this.leaveRoom());

        // Clear chat
        this.clearChatBtn.addEventListener('click', () => this.clearChat());

        // Emoji picker
        this.emojiBtn.addEventListener('click', () => {
            this.emojiModal.classList.toggle('hidden');
        });

        this.emojis.forEach(emoji => {
            emoji.addEventListener('click', () => {
                this.messageInput.value += emoji.textContent;
                this.emojiModal.classList.add('hidden');
                this.messageInput.focus();
            });
        });

        // Close emoji modal when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#emoji-btn') && !e.target.closest('#emoji-modal')) {
                this.emojiModal.classList.add('hidden');
            }
        });

        // Mobile menu toggle
        this.menuToggle.addEventListener('click', () => {
            this.sidebar.classList.toggle('open');
        });

        this.toggleSidebar.addEventListener('click', () => {
            this.sidebar.classList.remove('open');
        });

        // Theme toggle
        this.themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            this.themeToggle.textContent = document.body.classList.contains('light-theme') ? '☀️' : '🌙';
        });

        // Enter key to send (already handled by form)
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    bindSocketEvents() {
        // Connection events
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.showToast('Connected to chat server', 'success');
        });

        this.socket.on('disconnect', () => {
            this.showToast('Disconnected from server', 'error');
        });

        // Message events
        this.socket.on('message', (message) => {
            this.displayMessage(message);
        });

        this.socket.on('privateMessage', (message) => {
            this.displayMessage({ ...message, isPrivate: true });
        });

        this.socket.on('messageHistory', (messages) => {
            messages.forEach(msg => this.displayMessage(msg));
        });

        // Room data
        this.socket.on('roomData', ({ room, users }) => {
            this.updateRoomInfo(room, users);
        });

        // Typing indicator
        this.socket.on('userTyping', ({ username, isTyping }) => {
            this.updateTypingIndicator(username, isTyping);
        });

        // Errors
        this.socket.on('error', (error) => {
            this.showToast(error, 'error');
        });
    }

    joinRoom() {
        this.username = this.usernameInput.value.trim();
        this.room = this.roomInput.value.trim().toLowerCase();

        if (!this.username || !this.room) {
            this.showToast('Please enter both username and room', 'error');
            return;
        }

        this.socket.emit('join', { username: this.username, room: this.room }, (error) => {
            if (error) {
                this.showToast(error, 'error');
                return;
            }

            // Switch screens
            this.loginScreen.classList.add('hidden');
            this.chatScreen.classList.remove('hidden');
            
            // Update UI
            this.roomName.textContent = this.room;
            this.headerRoom.textContent = this.room;
            
            // Focus input
            setTimeout(() => this.messageInput.focus(), 100);
            
            this.showToast(`Welcome to #${this.room}!`, 'success');
        });
    }

    leaveRoom() {
        if (confirm('Are you sure you want to leave this room?')) {
            this.socket.disconnect();
            location.reload();
        }
    }

    sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message) return;

        // Check for private message command: /pm @username message
        const privateMatch = message.match(/^\/pm\s+@?(\w+)\s+(.+)$/i);
        
        if (privateMatch) {
            const [, toUser, text] = privateMatch;
            this.socket.emit('privateMessage', { toUserId: toUser, text }, (error) => {
                if (error) {
                    this.showToast(error, 'error');
                } else {
                    this.messageInput.value = '';
                    this.updateCharCount();
                    this.socket.emit('typing', false);
                }
            });
        } else {
            this.socket.emit('chatMessage', message, (error) => {
                if (error) {
                    this.showToast(error, 'error');
                } else {
                    this.messageInput.value = '';
                    this.updateCharCount();
                    this.socket.emit('typing', false);
                }
            });
        }
    }

    handleTyping() {
        if (!this.isTyping) {
            this.isTyping = true;
            this.socket.emit('typing', true);
        }

        clearTimeout(this.typingTimer);
        this.typingTimer = setTimeout(() => {
            this.isTyping = false;
            this.socket.emit('typing', false);
        }, 1000);
    }

    updateCharCount() {
        const count = this.messageInput.value.length;
        this.charCount.textContent = `${count}/500`;
        this.charCount.style.color = count > 450 ? '#ef4444' : '#64748b';
    }

    updateTypingIndicator(username, isTyping) {
        if (isTyping) {
            this.typingIndicator.textContent = `${username} is typing...`;
        } else {
            this.typingIndicator.textContent = '';
        }
    }

    displayMessage(message) {
        const div = document.createElement('div');
        
        const isOwn = message.username === this.username;
        const isSystem = message.username === 'ChatBot';
        
        div.className = `message ${isOwn ? 'own' : ''} ${isSystem ? 'system' : ''} ${message.isPrivate ? 'private' : ''}`;
        
        const avatar = isSystem ? '🤖' : (message.username[0] || '?').toUpperCase();
        const time = message.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        div.innerHTML = `
            ${!isSystem ? `<div class="message-avatar">${avatar}</div>` : ''}
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author">${this.escapeHtml(message.username)}</span>
                    <span class="message-time">${time}</span>
                </div>
                <div class="message-text">${this.formatMessage(this.escapeHtml(message.text))}</div>
            </div>
        `;

        this.messagesContainer.appendChild(div);
        this.scrollToBottom();

        // Remove welcome message if exists
        const welcome = this.messagesContainer.querySelector('.welcome-message');
        if (welcome) welcome.remove();
    }

    updateRoomInfo(room, users) {
        this.userCount.textContent = users.length;
        
        this.usersList.innerHTML = users.map(user => `
            <li class="user-item" data-username="${user.username}">
                <div class="user-avatar">${user.username[0].toUpperCase()}</div>
                <div class="user-info">
                    <div class="user-name">${this.escapeHtml(user.username)} ${user.username === this.username ? '(You)' : ''}</div>
                    <div class="user-status">
                        <span>●</span> online
                    </div>
                </div>
            </li>
        `).join('');

        // Add click handlers for private messaging
        document.querySelectorAll('.user-item').forEach(item => {
            if (item.dataset.username !== this.username) {
                item.addEventListener('click', () => {
                    const username = item.dataset.username;
                    this.messageInput.value = `/pm @${username} `;
                    this.messageInput.focus();
                });
                item.style.cursor = 'pointer';
                item.title = 'Click to send private message';
            }
        });
    }

    clearChat() {
        if (confirm('Clear all messages?')) {
            this.messagesContainer.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-icon">👋</div>
                    <h3>Chat cleared!</h3>
                    <p>Start fresh with new messages.</p>
                </div>
            `;
        }
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatMessage(text) {
        // Convert URLs to links
        return text.replace(
            /(https?:\/\/[^\s]+)/g, 
            '<a href="$1" target="_blank" style="color: inherit; text-decoration: underline;">$1</a>'
        );
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastSlide 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new ChatApp();
});