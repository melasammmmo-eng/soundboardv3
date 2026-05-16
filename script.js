const soundboard = document.getElementById('soundboard');
const overlapToggle = document.getElementById('overlap-toggle');
const stopAllButton = document.getElementById('stop-all');
const statusText = document.getElementById('status-text');
const searchInput = document.getElementById('search-input');

let preventOverlap = false;
const activeAudios = new Set();
let soundFiles = [];

function formatName(filename) {
  return filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function updateStatus() {
  const count = activeAudios.size;
  statusText.textContent = `${count} sound${count === 1 ? '' : 's'} playing`;
}

function stopAllSounds() {
  activeAudios.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
  activeAudios.clear();
  updateStatus();
}

function createSoundButton(file) {
  const btn = document.createElement('button');
  btn.className = 'sound-btn';
  btn.textContent = formatName(file);
  btn.onclick = () => {
    if (preventOverlap) {
      stopAllSounds();
    }

    const audio = new Audio(`sound/${encodeURIComponent(file)}`);
    activeAudios.add(audio);
    updateStatus();

    audio.play().catch(error => {
      console.warn('Unable to play sound:', error);
      activeAudios.delete(audio);
      updateStatus();
    });

    const removeAudio = () => {
      activeAudios.delete(audio);
      updateStatus();
    };

    audio.addEventListener('ended', removeAudio);
    audio.addEventListener('pause', () => {
      if (audio.currentTime === 0 || audio.ended) {
        removeAudio();
      }
    });
  };
  return btn;
}

function renderSounds(files) {
  soundboard.innerHTML = '';

  if (!files.length) {
    const message = searchInput.value.trim()
      ? 'No sounds match your search.'
      : 'No sound files found in the sound folder. Add MP3/WAV/OGG files and refresh.';

    soundboard.innerHTML = `<p class="empty-state">${message}</p>`;
    return;
  }

  files.forEach(file => {
    soundboard.appendChild(createSoundButton(file));
  });
}

function filterSounds() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = soundFiles.filter(file => {
    const title = formatName(file).toLowerCase();
    return title.includes(query) || file.toLowerCase().includes(query);
  });

  renderSounds(filtered);
}

async function fetchSoundFiles() {
  const endpoints = ['/api/sound-files', '/sound-files'];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.warn(`Failed to fetch from ${endpoint}:`, error);
    }
  }

  throw new Error('Unable to load sound files from any endpoint.');
}

fetchSoundFiles()
  .then(files => {
    soundFiles = files;
    renderSounds(files);
  })
  .catch(error => {
    soundboard.innerHTML = '<p class="empty-state">Unable to load sound files.</p>';
    console.error(error);
  });

if (searchInput) {
  searchInput.addEventListener('input', filterSounds);
}

overlapToggle.addEventListener('click', () => {
  preventOverlap = !preventOverlap;
  overlapToggle.textContent = `Prevent overlap: ${preventOverlap ? 'On' : 'Off'}`;
});

stopAllButton.addEventListener('click', stopAllSounds);
updateStatus();