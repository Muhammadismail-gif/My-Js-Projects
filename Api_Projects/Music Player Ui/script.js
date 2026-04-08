/**
 * Flow Music Player - Real Audio Implementation
 * Uses HTML5 Audio API for reliable streaming playback
 */

// Music Library with real audio URLs (using free sample MP3s)
const musicLibrary = [
    {
        id: 1,
        title: "Blinding Lights",
        artist: "The Weeknd",
        album: "After Hours",
        cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop",
        // Free royalty-free music sample
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        duration: "3:20"
    },
    {
        id: 2,
        title: "Levitating",
        artist: "Dua Lipa",
        album: "Future Nostalgia",
        cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        duration: "3:23"
    },
    {
        id: 3,
        title: "Peaches",
        artist: "Justin Bieber",
        album: "Justice",
        cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        duration: "3:18"
    },
    {
        id: 4,
        title: "Good 4 U",
        artist: "Olivia Rodrigo",
        album: "SOUR",
        cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        duration: "2:58"
    },
    {
        id: 5,
        title: "Montero",
        artist: "Lil Nas X",
        album: "Montero",
        cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        duration: "2:17"
    },
    {
        id: 6,
        title: "As It Was",
        artist: "Harry Styles",
        album: "Harry's House",
        cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        duration: "2:47"
    },
    {
        id: 7,
        title: "Heat Waves",
        artist: "Glass Animals",
        album: "Dreamland",
        cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
        duration: "3:58"
    },
    {
        id: 8,
        title: "Stay",
        artist: "Kid LAROI & Justin Bieber",
        album: "F*CK LOVE 3",
        cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        duration: "2:21"
    },
    {
        id: 9,
        title: "Shivers",
        artist: "Ed Sheeran",
        album: "=",
        cover: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&h=300&fit=crop",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
        duration: "3:27"
    },
    {
        id: 10,
        title: "My Universe",
        artist: "Coldplay",
        album: "Music of the Spheres",
        cover: "https://images.unsplash.com/photo-1501612780327-45045538702b?w=300&h=300&fit=crop",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
        duration: "3:48"
    }
];

// Player State
const playerState = {
    currentTrackIndex: 0,
    isPlaying: false,
    isShuffled: false,
    isRepeating: false,
    isMuted: false,
    volume: 0.7,
    currentTime: 0,
    duration: 0,
    isSeeking: false,
    queue: []
};

// DOM Elements
const elements = {
    audio: document.getElementById('audioPlayer'),
    playPauseBtn: document.getElementById('playPauseBtn'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    repeatBtn: document.getElementById('repeatBtn'),
    likeBtn: document.getElementById('likeBtn'),
    muteBtn: document.getElementById('muteBtn'),
    progressBar: document.getElementById('progressBar'),
    progressFill: document.getElementById('progressFill'),
    progressHandle: document.getElementById('progressHandle'),
    currentTime: document.getElementById('currentTime'),
    totalTime: document.getElementById('totalTime'),
    volumeSlider: document.getElementById('volumeSlider'),
    volumeFill: document.getElementById('volumeFill'),
    volumeIcon: document.getElementById('volumeIcon'),
    playerThumb: document.getElementById('playerThumb'),
    playerTitle: document.getElementById('playerTitle'),
    playerArtist: document.getElementById('playerArtist'),
    recentGrid: document.getElementById('recentGrid'),
    trendingGrid: document.getElementById('trendingGrid'),
    heroPlayBtn: document.getElementById('heroPlayBtn'),
    loadingOverlay: document.getElementById('loadingOverlay')
};

// Initialize Application
function init() {
    // Initialize queue
    playerState.queue = [...musicLibrary];
    
    // Setup audio element
    setupAudioElement();
    
    // Setup UI
    renderCards();
    setupEventListeners();
    setupProgressBar();
    setupVolumeControl();
    
    // Load first track (but don't play)
    loadTrack(0, false);
    
    console.log('Flow Music Player initialized with real audio support');
}

// Setup HTML5 Audio Element
function setupAudioElement() {
    const audio = elements.audio;
    
    // Set initial volume
    audio.volume = playerState.volume;
    
    // Audio Event Listeners
    audio.addEventListener('loadedmetadata', () => {
        playerState.duration = audio.duration;
        elements.totalTime.textContent = formatTime(audio.duration);
        elements.loadingOverlay.classList.add('hidden');
    });
    
    audio.addEventListener('timeupdate', () => {
        if (!playerState.isSeeking) {
            playerState.currentTime = audio.currentTime;
            updateProgressUI();
        }
    });
    
    audio.addEventListener('ended', () => {
        handleTrackEnd();
    });
    
    audio.addEventListener('play', () => {
        playerState.isPlaying = true;
        updatePlayPauseUI();
        elements.playerThumb.classList.add('playing');
    });
    
    audio.addEventListener('pause', () => {
        playerState.isPlaying = false;
        updatePlayPauseUI();
        elements.playerThumb.classList.remove('playing');
    });
    
    audio.addEventListener('waiting', () => {
        elements.loadingOverlay.classList.remove('hidden');
        elements.progressBar.classList.add('buffering');
    });
    
    audio.addEventListener('canplay', () => {
        elements.loadingOverlay.classList.add('hidden');
        elements.progressBar.classList.remove('buffering');
    });
    
    audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        showToast('Error loading audio. Please try again.');
        elements.loadingOverlay.classList.add('hidden');
    });
}

// Load Track
function loadTrack(index, autoPlay = true) {
    if (index < 0 || index >= playerState.queue.length) return;
    
    playerState.currentTrackIndex = index;
    const track = playerState.queue[index];
    
    // Update audio source
    elements.audio.src = track.src;
    elements.audio.load();
    
    // Update UI
    elements.playerThumb.src = track.cover;
    elements.playerTitle.textContent = track.title;
    elements.playerArtist.textContent = track.artist;
    
    // Update active card in grid
    document.querySelectorAll('.music-card').forEach(card => {
        card.classList.remove('active');
        if (parseInt(card.dataset.id) === track.id) {
            card.classList.add('active');
        }
    });
    
    // Reset progress
    playerState.currentTime = 0;
    updateProgressUI();
    
    // Show loading
    elements.loadingOverlay.classList.remove('hidden');
    
    // Auto play if requested
    if (autoPlay) {
        playAudio();
    }
}

// Play Audio
async function playAudio() {
    try {
        // Resume audio context if suspended (browser autoplay policy)
        if (elements.audio.paused) {
            await elements.audio.play();
        }
    } catch (error) {
        console.error('Playback failed:', error);
        showToast('Click play to start audio (browser policy)');
    }
}

// Pause Audio
function pauseAudio() {
    elements.audio.pause();
}

// Toggle Play/Pause
function togglePlayPause() {
    if (playerState.isPlaying) {
        pauseAudio();
    } else {
        playAudio();
    }
}

// Handle Track End
function handleTrackEnd() {
    if (playerState.isRepeating) {
        elements.audio.currentTime = 0;
        playAudio();
    } else {
        nextTrack();
    }
}

// Previous Track
function prevTrack() {
    let newIndex;
    if (playerState.isShuffled) {
        newIndex = Math.floor(Math.random() * playerState.queue.length);
    } else {
        newIndex = playerState.currentTrackIndex - 1;
        if (newIndex < 0) newIndex = playerState.queue.length - 1;
    }
    loadTrack(newIndex);
}

// Next Track
function nextTrack() {
    let newIndex;
    if (playerState.isShuffled) {
        newIndex = Math.floor(Math.random() * playerState.queue.length);
    } else {
        newIndex = playerState.currentTrackIndex + 1;
        if (newIndex >= playerState.queue.length) newIndex = 0;
    }
    loadTrack(newIndex);
}

// Play Specific Track (from card click)
function playTrack(id) {
    const index = playerState.queue.findIndex(track => track.id === id);
    if (index !== -1) {
        loadTrack(index);
    }
}

// Update Progress UI
function updateProgressUI() {
    const percent = playerState.duration > 0 
        ? (playerState.currentTime / playerState.duration) * 100 
        : 0;
    
    elements.progressFill.style.width = `${percent}%`;
    elements.progressHandle.style.left = `${percent}%`;
    elements.currentTime.textContent = formatTime(playerState.currentTime);
}

// Update Play/Pause Button UI
function updatePlayPauseUI() {
    const playIcon = elements.playPauseBtn.querySelector('.play-icon');
    const pauseIcon = elements.playPauseBtn.querySelector('.pause-icon');
    
    if (playerState.isPlaying) {
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
    } else {
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
    }
}

// Setup Progress Bar
function setupProgressBar() {
    let isDragging = false;
    
    // Click to seek
    elements.progressBar.addEventListener('click', (e) => {
        if (isDragging) return;
        const rect = elements.progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        seekToPercent(percent);
    });
    
    // Drag to seek
    elements.progressHandle.addEventListener('mousedown', (e) => {
        isDragging = true;
        playerState.isSeeking = true;
        elements.progressBar.classList.add('seeking');
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const rect = elements.progressBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        
        // Update visual only
        elements.progressFill.style.width = `${percent * 100}%`;
        elements.progressHandle.style.left = `${percent * 100}%`;
        elements.currentTime.textContent = formatTime(percent * playerState.duration);
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            const rect = elements.progressBar.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
            seekToPercent(percent);
            
            isDragging = false;
            playerState.isSeeking = false;
            elements.progressBar.classList.remove('seeking');
        }
    });
}

// Seek to percentage
function seekToPercent(percent) {
    if (playerState.duration > 0) {
        elements.audio.currentTime = percent * playerState.duration;
        playerState.currentTime = elements.audio.currentTime;
        updateProgressUI();
    }
}

// Setup Volume Control
function setupVolumeControl() {
    // Click on volume slider
    elements.volumeSlider.addEventListener('click', (e) => {
        const rect = elements.volumeSlider.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        setVolume(percent);
    });
    
    // Mute toggle
    elements.muteBtn.addEventListener('click', () => {
        toggleMute();
    });
}

// Set Volume
function setVolume(percent) {
    playerState.volume = Math.max(0, Math.min(1, percent));
    elements.audio.volume = playerState.volume;
    elements.volumeFill.style.width = `${playerState.volume * 100}%`;
    
    // Update icon based on volume level
    updateVolumeIcon();
    
    // Unmute if volume is set
    if (playerState.volume > 0 && playerState.isMuted) {
        playerState.isMuted = false;
        elements.audio.muted = false;
    }
}

// Toggle Mute
function toggleMute() {
    playerState.isMuted = !playerState.isMuted;
    elements.audio.muted = playerState.isMuted;
    
    if (playerState.isMuted) {
        elements.volumeFill.style.width = '0%';
        elements.volumeSlider.parentElement.classList.add('muted');
    } else {
        elements.volumeFill.style.width = `${playerState.volume * 100}%`;
        elements.volumeSlider.parentElement.classList.remove('muted');
    }
    
    updateVolumeIcon();
}

// Update Volume Icon
function updateVolumeIcon() {
    const volume = playerState.isMuted ? 0 : playerState.volume;
    
    if (volume === 0) {
        elements.volumeIcon.innerHTML = `
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <line x1="23" y1="9" x2="17" y2="15"/>
            <line x1="17" y1="9" x2="23" y2="15"/>
        `;
    } else if (volume < 0.5) {
        elements.volumeIcon.innerHTML = `
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
        `;
    } else {
        elements.volumeIcon.innerHTML = `
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
        `;
    }
}

// Toggle Shuffle
function toggleShuffle() {
    playerState.isShuffled = !playerState.isShuffled;
    elements.shuffleBtn.classList.toggle('active', playerState.isShuffled);
}

// Toggle Repeat
function toggleRepeat() {
    playerState.isRepeating = !playerState.isRepeating;
    elements.repeatBtn.classList.toggle('active', playerState.isRepeating);
}

// Toggle Like
function toggleLike() {
    elements.likeBtn.classList.toggle('active');
}

// Format Time (seconds to mm:ss)
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Show Toast Notification
function showToast(message) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    // Show
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Render Music Cards
function renderCards() {
    const createCard = (track, index) => `
        <div class="music-card" data-id="${track.id}" onclick="playTrack(${track.id})">
            <div class="card-image">
                <img src="${track.cover}" alt="${track.title}" loading="lazy">
                <div class="play-overlay">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                </div>
            </div>
            <h3 class="card-title">${track.title}</h3>
            <p class="card-artist">${track.artist}</p>
        </div>
    `;
    
    // Split into recent (first 5) and trending (next 5)
    const recent = musicLibrary.slice(0, 5);
    const trending = musicLibrary.slice(5, 10);
    
    elements.recentGrid.innerHTML = recent.map((track, i) => createCard(track, i)).join('');
    elements.trendingGrid.innerHTML = trending.map((track, i) => createCard(track, i + 5)).join('');
}

// Setup Event Listeners
function setupEventListeners() {
    // Play/Pause
    elements.playPauseBtn.addEventListener('click', togglePlayPause);
    
    // Previous/Next
    elements.prevBtn.addEventListener('click', prevTrack);
    elements.nextBtn.addEventListener('click', nextTrack);
    
    // Shuffle/Repeat
    elements.shuffleBtn.addEventListener('click', toggleShuffle);
    elements.repeatBtn.addEventListener('click', toggleRepeat);
    
    // Like
    elements.likeBtn.addEventListener('click', toggleLike);
    
    // Hero Play Button
    elements.heroPlayBtn.addEventListener('click', () => {
        if (!playerState.isPlaying) {
            playAudio();
        } else {
            // If already playing, restart current track
            elements.audio.currentTime = 0;
        }
    });
    
    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Space to toggle play/pause (unless typing in input)
        if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            togglePlayPause();
        }
        
        // Arrow keys for seeking
        if (e.code === 'ArrowRight') {
            e.preventDefault();
            elements.audio.currentTime = Math.min(elements.audio.duration || 0, elements.audio.currentTime + 5);
        }
        if (e.code === 'ArrowLeft') {
            e.preventDefault();
            elements.audio.currentTime = Math.max(0, elements.audio.currentTime - 5);
        }
        
        // Volume with up/down
        if (e.code === 'ArrowUp') {
            e.preventDefault();
            setVolume(Math.min(1, playerState.volume + 0.1));
        }
        if (e.code === 'ArrowDown') {
            e.preventDefault();
            setVolume(Math.max(0, playerState.volume - 0.1));
        }
        
        // M with 'm'
        if (e.code === 'KeyM') {
            e.preventDefault();
            toggleMute();
        }
    });
    
    // Navigation items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Make playTrack available globally for card clicks
window.playTrack = playTrack;