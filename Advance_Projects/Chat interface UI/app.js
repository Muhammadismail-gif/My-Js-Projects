/* app.js — vanilla JavaScript for the chat UI */
/* Features:
   - multiple conversations stored in localStorage
   - open/create conversation
   - send messages (Enter to send, Shift+Enter for newline)
   - basic simulated bot replies with typing indicator
   - search conversations
   - accessible labels and keyboard shortcut (Ctrl/Cmd+K to focus search)
*/

(() => {
  const STORAGE_KEY = 'chat_ui_v2';

  // state
  const state = {
    conversations: [],
    activeId: null
  };

  // DOM refs
  const convList = document.getElementById('conversations');
  const convTemplate = document.getElementById('convTemplate');
  const msgTemplate = document.getElementById('msgTemplate');
  const messagesEl = document.getElementById('messages');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const newChatBtn = document.getElementById('newChat');
  const searchInput = document.getElementById('searchInput');
  const attachBtn = document.getElementById('attachBtn');

  // helpers
  function nowTime() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.conversations)); } catch (e) { console.warn('save failed', e); }
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) state.conversations = JSON.parse(raw);
    } catch (e) { console.warn('load failed', e); }
    if (!state.conversations.length) {
      // seed with one conversation
      createConversation('Welcome');
    }
    state.activeId = state.conversations[0].id;
    renderConversations();
    openConversation(state.activeId);
  }

  // conversation management
  function createConversation(title = 'New Chat') {
    const id = 'c_' + Math.random().toString(36).slice(2, 9);
    const conv = {
      id,
      title,
      messages: [
        { id: 'm_welcome', role: 'bot', text: 'This is a frontend-only chat UI. Type a message and press Send.', time: nowTime() }
      ],
      created: Date.now()
    };
    state.conversations.unshift(conv);
    save();
    renderConversations();
    return id;
  }

  function renderConversations(filter = '') {
    convList.innerHTML = '';
    const list = state.conversations
      .filter(c => c.title.toLowerCase().includes(filter.toLowerCase()))
      .forEach(c => {
        const node = convTemplate.content.cloneNode(true);
        const convEl = node.querySelector('.conversation');
        convEl.dataset.id = c.id;
        node.querySelector('.conv-avatar').textContent = (c.title || 'Chat').slice(0, 1).toUpperCase();
        node.querySelector('.conv-title').textContent = c.title;
        const last = c.messages && c.messages.length ? c.messages[c.messages.length - 1].text : 'Empty';
        node.querySelector('.conv-snippet').textContent = last.slice(0, 40);
        convEl.addEventListener('click', () => openConversation(c.id));
        convList.appendChild(node);
      });
  }

  function openConversation(id) {
    state.activeId = id;
    const conv = state.conversations.find(x => x.id === id);
    if (!conv) return;
    document.getElementById('panelTitle').textContent = conv.title;
    document.getElementById('panelAvatar').textContent = (conv.title || 'B').slice(0, 1).toUpperCase();
    messagesEl.innerHTML = '';
    if (!conv.messages.length) {
      messagesEl.innerHTML = '<div class="empty">No messages yet. Say hi!</div>';
      return;
    }
    conv.messages.forEach(m => appendMessageToDOM(m));
    scrollToBottom();
    messageInput.focus();
  }

  function appendMessageToDOM(msg) {
    const wrapper = msgTemplate.content.cloneNode(true);
    const el = wrapper.querySelector('.message');
    el.classList.remove('me', 'bot');
    el.classList.add(msg.role === 'me' ? 'me' : 'bot');
    wrapper.querySelector('.content').textContent = msg.text;
    wrapper.querySelector('.meta-time').textContent = msg.time;
    messagesEl.appendChild(wrapper);
  }

  function addMessageToConversation(text, role = 'me') {
    const conv = state.conversations.find(x => x.id === state.activeId);
    if (!conv) return;
    const msg = { id: 'm_' + Math.random().toString(36).slice(2, 9), role, text, time: nowTime() };
    conv.messages.push(msg);
    save();
    appendMessageToDOM(msg);
    scrollToBottom();
  }

  function scrollToBottom() {
    requestAnimationFrame(() => { messagesEl.scrollTop = messagesEl.scrollHeight; });
  }

  // simulated bot reply with typing indicator
  let typingTimeout = null;
  function showTypingThenReply(seed) {
    // add typing element
    const typingWrap = document.createElement('div');
    typingWrap.className = 'message bot';
    typingWrap.innerHTML = '<div class="bubble typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';
    messagesEl.appendChild(typingWrap);
    scrollToBottom();

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      // remove typing
      if (typingWrap.parentNode) typingWrap.parentNode.removeChild(typingWrap);
      const reply = generateReply(seed);
      addMessageToConversation(reply, 'bot');
    }, 800 + Math.random() * 700);
  }

  function generateReply(seed) {
    if (!seed) return "I didn't get that. Try again.";
    const s = seed.toLowerCase();
    if (s.includes('hi') || s.includes('hello')) return 'Hello! How can I help?';
    if (s.includes('time')) return 'Local time: ' + new Date().toLocaleTimeString();
    if (s.includes('help')) return 'This is a demo chat UI. You can create chats, type messages, and they will be saved locally.';
    return `You said: "${seed}" — this reply is simulated by the frontend.`;
  }

  // event wiring
  document.getElementById('composer').addEventListener('submit', (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text) {
      messageInput.focus();
      return;
    }
    addMessageToConversation(text, 'me');
    messageInput.value = '';
    // 85% chance to simulate a bot reply for demo, or if user mentions @bot
    if (text.includes('@bot') || Math.random() < 0.85) showTypingThenReply(text);
  });

  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.getElementById('composer').dispatchEvent(new Event('submit', { cancelable: true }));
    }
  });

  newChatBtn.addEventListener('click', () => {
    const title = prompt('New chat name') || `Chat ${state.conversations.length + 1}`;
    const id = createConversation(title);
    openConversation(id);
  });

  attachBtn.addEventListener('click', () => {
    alert('Attachment simulated. This is frontend-only.');
  });

  searchInput.addEventListener('input', () => {
    // debounce
    clearTimeout(searchInput._timer);
    searchInput._timer = setTimeout(() => renderConversations(searchInput.value.trim()), 160);
  });

  // keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });

  // expose for debugging (optional)
  window.chatUI = {
    getState: () => JSON.parse(JSON.stringify(state)),
    clearAll: () => { localStorage.removeItem(STORAGE_KEY); state.conversations = []; load(); }
  };

  // initialize
  load();

})();
