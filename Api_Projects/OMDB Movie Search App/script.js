const CONFIG = {
  API_KEY: 'a76b66e1',
  BASE_URL: 'https://www.omdbapi.com',
  DEBOUNCE_DELAY: 400,
  RESULTS_PER_PAGE: 10
};

const state = {
  query: '',
  page: 1,
  totalResults: 0,
  isLoading: false,
  currentResults: [],
  selectedMovie: null
};

const elements = {
  searchInput: document.getElementById('searchInput'),
  searchBtn: document.getElementById('searchBtn'),
  btnText: document.querySelector('.btn-text'),
  btnLoader: document.querySelector('.btn-loader'),
  statusBar: document.getElementById('statusBar'),
  statusText: document.getElementById('statusText'),
  resultCount: document.getElementById('resultCount'),
  errorAlert: document.getElementById('errorAlert'),
  errorTitle: document.getElementById('errorTitle'),
  errorMessage: document.getElementById('errorMessage'),
  errorClose: document.getElementById('errorClose'),
  skeletonLoader: document.getElementById('skeletonLoader'),
  resultsGrid: document.getElementById('resultsGrid'),
  emptyState: document.getElementById('emptyState'),
  pagination: document.getElementById('pagination'),
  prevBtn: document.getElementById('prevBtn'),
  nextBtn: document.getElementById('nextBtn'),
  currentPage: document.getElementById('currentPage'),
  totalPages: document.getElementById('totalPages'),
  movieModal: document.getElementById('movieModal'),
  closeModal: document.getElementById('closeModal'),
  modalPoster: document.getElementById('modalPoster'),
  modalTitle: document.getElementById('modalTitle'),
  modalMeta: document.getElementById('modalMeta'),
  modalRating: document.getElementById('modalRating'),
  modalPlot: document.getElementById('modalPlot'),
  modalDetails: document.getElementById('modalDetails'),
  imdbLink: document.getElementById('imdbLink'),
  toastContainer: document.getElementById('toastContainer')
};

const debounce = (fn, delay) => {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

const formatYear = (dateStr) => {
  if (!dateStr || dateStr === 'N/A') return 'N/A';
  return dateStr.split(' ').pop();
};

// FIXED: createElement now properly handles non-array children
const createElement = (tag, attributes = {}, children = []) => {
  const element = document.createElement(tag);
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // FIX: Ensure children is always an array
  let childArray = children;
  if (!Array.isArray(children)) {
    childArray = children ? [children] : [];
  }
  
  childArray.forEach(child => {
    if (child === null || child === undefined) {
      return;
    }
    if (typeof child === 'string' || typeof child === 'number') {
      element.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Element) {
      element.appendChild(child);
    }
  });
  
  return element;
};

class MovieAPIService {
  static async fetchData(params) {
    const queryString = new URLSearchParams({
      apikey: CONFIG.API_KEY,
      ...params
    }).toString();
    
    const url = `${CONFIG.BASE_URL}/?${queryString}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.Response === 'False') {
        throw new Error(data.Error || 'Unknown API error');
      }
      
      return data;
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw error;
    }
  }
  
  static async searchMovies(query, page = 1) {
    return this.fetchData({
      s: query,
      page: page,
      type: ''
    });
  }
  
  static async getMovieDetails(imdbID) {
    return this.fetchData({
      i: imdbID,
      plot: 'full'
    });
  }
}

class UIComponents {
  static setLoading(loading) {
    state.isLoading = loading;
    
    if (elements.btnText && elements.btnLoader) {
      elements.btnText.classList.toggle('hidden', loading);
      elements.btnLoader.classList.toggle('hidden', !loading);
    }
    if (elements.searchBtn) {
      elements.searchBtn.disabled = loading;
    }
    
    if (elements.skeletonLoader) {
      elements.skeletonLoader.classList.toggle('hidden', !loading);
      if (loading) {
        this.generateSkeletons();
        if (elements.resultsGrid) elements.resultsGrid.classList.add('hidden');
        if (elements.emptyState) elements.emptyState.classList.add('hidden');
      }
    }
  }
  
  static generateSkeletons() {
    if (!elements.skeletonLoader) return;
    
    elements.skeletonLoader.innerHTML = '';
    for (let i = 0; i < 8; i++) {
      const skeleton = createElement('div', { className: 'skeleton-card' }, [
        createElement('div', { className: 'skeleton-poster' }),
        createElement('div', { className: 'skeleton-text' }, [
          createElement('div', { className: 'skeleton-line' }),
          createElement('div', { className: 'skeleton-line short' })
        ])
      ]);
      elements.skeletonLoader.appendChild(skeleton);
    }
  }
  
  static showError(title, message) {
    if (elements.errorTitle) elements.errorTitle.textContent = title;
    if (elements.errorMessage) elements.errorMessage.textContent = message;
    if (elements.errorAlert) {
      elements.errorAlert.classList.remove('hidden');
      setTimeout(() => this.hideError(), 5000);
    }
  }
  
  static hideError() {
    if (elements.errorAlert) elements.errorAlert.classList.add('hidden');
  }
  
  static updateStatus(text, count = null) {
    if (elements.statusText) elements.statusText.textContent = text;
    if (elements.resultCount) {
      if (count !== null) {
        elements.resultCount.textContent = `${count} results found`;
        elements.resultCount.classList.remove('hidden');
      } else {
        elements.resultCount.classList.add('hidden');
      }
    }
  }
  
  static showToast(message, type = 'success') {
    if (!elements.toastContainer) return;
    
    const icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
    };
    
    const toast = createElement('div', { 
      className: `toast toast-${type}` 
    }, [
      createElement('div', { className: 'toast-icon' }),
      createElement('span', { className: 'toast-message' }, message)
    ]);
    
    const iconDiv = toast.querySelector('.toast-icon');
    if (iconDiv) iconDiv.innerHTML = icons[type] || icons.success;
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

class MovieCard {
  static create(movie) {
    const card = createElement('article', {
      className: 'movie-card',
      tabIndex: 0,
      role: 'button',
      'aria-label': `View details for ${movie.Title || 'Unknown'}`,
      onClick: () => MovieModal.open(movie.imdbID),
      onKeydown: (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          MovieModal.open(movie.imdbID);
        }
      }
    });
    
    const poster = this.createPoster(movie);
    card.appendChild(poster);
    
    const info = createElement('div', { className: 'card-info' }, [
      createElement('h3', { className: 'card-title' }, movie.Title || 'Unknown Title'),
      createElement('div', { className: 'card-meta' }, [
        createElement('span', {}, formatYear(movie.Year)),
        createElement('span', {}, movie.Type === 'movie' ? 'Movie' : 
          movie.Type === 'series' ? 'Series' : 
          movie.Type === 'episode' ? 'Episode' : (movie.Type || 'Unknown'))
      ])
    ]);
    card.appendChild(info);
    
    return card;
  }
  
  static createPoster(movie) {
    const posterContainer = createElement('div', { className: 'card-poster' });
    
    if (movie.Poster && movie.Poster !== 'N/A') {
      const img = createElement('img', {
        src: movie.Poster,
        alt: `${movie.Title || 'Movie'} poster`,
        loading: 'lazy',
        onError: function() {
          this.style.display = 'none';
          const placeholder = MovieCard.createPlaceholder();
          if (this.parentElement) {
            this.parentElement.appendChild(placeholder);
          }
        }
      });
      posterContainer.appendChild(img);
    } else {
      posterContainer.appendChild(this.createPlaceholder());
    }
    
    if (movie.Type && movie.Type !== 'movie') {
      const badgeText = movie.Type === 'series' ? 'TV' : 'EP';
      const badge = createElement('span', { 
        className: 'card-badge' 
      }, badgeText);
      posterContainer.appendChild(badge);
    }
    
    return posterContainer;
  }
  
  static createPlaceholder() {
    return createElement('div', { className: 'card-placeholder' }, [
      createElement('svg', { 
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '1.5'
      }, [
        createElement('rect', { x: '2', y: '2', width: '20', height: '20', rx: '2.18', ry: '2.18' }),
        createElement('line', { x1: '7', y1: '2', x2: '7', y2: '22' }),
        createElement('line', { x1: '17', y1: '2', x2: '17', y2: '22' }),
        createElement('line', { x1: '2', y1: '12', x2: '22', y2: '12' })
      ])
    ]);
  }
}

class MovieModal {
  static async open(imdbID) {
    if (!elements.movieModal) return;
    
    elements.movieModal.classList.add('open');
    elements.movieModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    if (elements.modalPoster) {
      elements.modalPoster.style.backgroundImage = '';
      elements.modalPoster.innerHTML = '<div class="poster-loader"></div>';
    }
    if (elements.modalTitle) elements.modalTitle.textContent = 'Loading...';
    if (elements.modalMeta) elements.modalMeta.innerHTML = '';
    if (elements.modalRating) elements.modalRating.innerHTML = '';
    if (elements.modalPlot) elements.modalPlot.textContent = '';
    if (elements.modalDetails) elements.modalDetails.innerHTML = '';
    if (elements.imdbLink) elements.imdbLink.href = '#';
    
    try {
      const movie = await MovieAPIService.getMovieDetails(imdbID);
      this.render(movie);
    } catch (error) {
      if (elements.modalTitle) elements.modalTitle.textContent = 'Error Loading Details';
      if (elements.modalPlot) elements.modalPlot.textContent = error.message;
      UIComponents.showToast('Failed to load movie details', 'error');
    }
  }
  
  static close() {
    if (!elements.movieModal) return;
    
    elements.movieModal.classList.remove('open');
    elements.movieModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  
  static render(movie) {
    if (elements.modalPoster) {
      if (movie.Poster && movie.Poster !== 'N/A') {
        elements.modalPoster.style.backgroundImage = `url(${movie.Poster})`;
        elements.modalPoster.innerHTML = '';
      } else {
        elements.modalPoster.style.backgroundImage = '';
        elements.modalPoster.innerHTML = '';
        elements.modalPoster.appendChild(MovieCard.createPlaceholder());
      }
    }
    
    if (elements.modalTitle) elements.modalTitle.textContent = movie.Title || 'Unknown Title';
    if (elements.modalMeta) {
      elements.modalMeta.innerHTML = `
        <span>${movie.Year || 'N/A'}</span>
        <span>${movie.Rated || 'N/A'}</span>
        <span>${movie.Runtime || 'N/A'}</span>
        <span>${movie.Genre || 'N/A'}</span>
      `;
    }
    
    if (elements.modalRating) {
      if (movie.imdbRating && movie.imdbRating !== 'N/A') {
        elements.modalRating.innerHTML = `
          <div class="rating-badge">
            <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            ${movie.imdbRating}/10
          </div>
          <span style="color: var(--color-text-muted); font-size: 0.875rem;">
            ${movie.imdbVotes || '0'} votes
          </span>
        `;
      } else {
        elements.modalRating.innerHTML = '';
      }
    }
    
    if (elements.modalPlot) {
      elements.modalPlot.textContent = movie.Plot !== 'N/A' ? movie.Plot : 'No plot available.';
    }
    
    if (elements.modalDetails) {
      const details = [
        { label: 'Director', value: movie.Director },
        { label: 'Writers', value: movie.Writer },
        { label: 'Actors', value: movie.Actors },
        { label: 'Released', value: movie.Released },
        { label: 'Language', value: movie.Language },
        { label: 'Country', value: movie.Country },
        { label: 'Awards', value: movie.Awards },
        { label: 'Box Office', value: movie.BoxOffice }
      ].filter(item => item.value && item.value !== 'N/A');
      
      elements.modalDetails.innerHTML = details.map(item => `
        <div class="detail-item">
          <span class="detail-label">${item.label}</span>
          <span class="detail-value">${item.value}</span>
        </div>
      `).join('');
    }
    
    if (elements.imdbLink && movie.imdbID) {
      elements.imdbLink.href = `https://www.imdb.com/title/${movie.imdbID}`;
    }
  }
}

class Pagination {
  static update() {
    const totalPages = Math.ceil(state.totalResults / CONFIG.RESULTS_PER_PAGE);
    
    if (elements.currentPage) elements.currentPage.textContent = state.page;
    if (elements.totalPages) elements.totalPages.textContent = totalPages || 1;
    
    if (elements.prevBtn) elements.prevBtn.disabled = state.page <= 1;
    if (elements.nextBtn) elements.nextBtn.disabled = state.page >= totalPages;
    
    if (elements.pagination) {
      elements.pagination.classList.toggle('hidden', totalPages <= 1);
    }
  }
  
  static prev() {
    if (state.page > 1) {
      App.search(state.query, state.page - 1);
    }
  }
  
  static next() {
    const totalPages = Math.ceil(state.totalResults / CONFIG.RESULTS_PER_PAGE);
    if (state.page < totalPages) {
      App.search(state.query, state.page + 1);
    }
  }
}

class App {
  static init() {
    this.bindEvents();
    
    if (elements.searchInput) {
      elements.searchInput.focus();
    }
    
    UIComponents.showToast('Welcome! Enter a movie title to start searching.', 'success');
  }
  
  static bindEvents() {
    if (elements.searchBtn) {
      elements.searchBtn.addEventListener('click', () => this.handleSearch());
    }
    
    if (elements.searchInput) {
      elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleSearch();
      });
      
      elements.searchInput.addEventListener('input', debounce((e) => {
        const query = e.target.value.trim();
        if (query.length >= 3) {
          this.search(query, 1);
        }
      }, CONFIG.DEBOUNCE_DELAY));
    }
    
    if (elements.prevBtn) {
      elements.prevBtn.addEventListener('click', () => Pagination.prev());
    }
    if (elements.nextBtn) {
      elements.nextBtn.addEventListener('click', () => Pagination.next());
    }
    
    if (elements.closeModal) {
      elements.closeModal.addEventListener('click', () => MovieModal.close());
    }
    
    if (elements.movieModal) {
      elements.movieModal.addEventListener('click', (e) => {
        if (e.target === elements.movieModal || e.target.classList.contains('modal-backdrop')) {
          MovieModal.close();
        }
      });
    }
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') MovieModal.close();
    });
    
    if (elements.errorClose) {
      elements.errorClose.addEventListener('click', () => UIComponents.hideError());
    }
    
    document.querySelectorAll('.tag').forEach(tag => {
      tag.addEventListener('click', () => {
        if (elements.searchInput) {
          elements.searchInput.value = tag.dataset.query;
          this.search(tag.dataset.query, 1);
        }
      });
    });
  }
  
  static handleSearch() {
    const query = elements.searchInput ? elements.searchInput.value.trim() : '';
    if (!query) {
      UIComponents.showError('Empty Search', 'Please enter a movie title to search.');
      return;
    }
    this.search(query, 1);
  }
  
  static async search(query, page = 1) {
    if (state.isLoading) return;
    
    state.query = query;
    state.page = page;
    
    UIComponents.setLoading(true);
    UIComponents.hideError();
    UIComponents.updateStatus('Searching...');
    
    try {
      const data = await MovieAPIService.searchMovies(query, page);
      
      state.totalResults = parseInt(data.totalResults, 10) || 0;
      state.currentResults = data.Search || [];
      
      this.renderResults();
      
      UIComponents.updateStatus(
        `Found results for "${query}"`,
        state.totalResults
      );
      
      Pagination.update();
      
      if (page === 1) {
        UIComponents.showToast(`Found ${state.totalResults} results`, 'success');
      }
      
    } catch (error) {
      console.error('Search error:', error);
      
      state.currentResults = [];
      state.totalResults = 0;
      
      if (elements.resultsGrid) {
        elements.resultsGrid.innerHTML = '';
        elements.resultsGrid.classList.add('hidden');
      }
      if (elements.emptyState) elements.emptyState.classList.remove('hidden');
      if (elements.pagination) elements.pagination.classList.add('hidden');
      
      UIComponents.showError('Search Failed', error.message);
      UIComponents.updateStatus('Search failed');
      
    } finally {
      UIComponents.setLoading(false);
    }
  }
  
  static renderResults() {
    if (elements.skeletonLoader) {
      elements.skeletonLoader.classList.add('hidden');
    }
    
    if (elements.resultsGrid) {
      elements.resultsGrid.innerHTML = '';
    }
    
    if (state.currentResults.length === 0) {
      if (elements.resultsGrid) elements.resultsGrid.classList.add('hidden');
      if (elements.emptyState) elements.emptyState.classList.remove('hidden');
      if (elements.pagination) elements.pagination.classList.add('hidden');
      return;
    }
    
    if (elements.emptyState) elements.emptyState.classList.add('hidden');
    if (elements.resultsGrid) elements.resultsGrid.classList.remove('hidden');
    
    const fragment = document.createDocumentFragment();
    
    state.currentResults.forEach(movie => {
      if (movie && movie.imdbID) {
        fragment.appendChild(MovieCard.create(movie));
      }
    });
    
    if (elements.resultsGrid) {
      elements.resultsGrid.appendChild(fragment);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

window.MovieApp = { App, state, CONFIG };