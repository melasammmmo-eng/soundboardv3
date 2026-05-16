const soundboard = document.getElementById('soundboard');
const overlapToggle = document.getElementById('overlap-toggle');
const stopAllButton = document.getElementById('stop-all');
const statusText = document.getElementById('status-text');
const searchInput = document.getElementById('search-input');

let preventOverlap = false;
const activeAudios = new Set();
let allSoundFiles = [];

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
    soundboard.innerHTML = '<p class="empty-state">No matching sounds found. Try a different search term.</p>';
    return;
  }

  files.forEach(file => {
    soundboard.appendChild(createSoundButton(file));
  });
}

function filterSounds(query) {
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? allSoundFiles.filter(file => formatName(file).toLowerCase().includes(normalizedQuery))
    : allSoundFiles;

  renderSounds(filtered);
}

fetch('/sound-files')
  .then(response => response.json())
  .then(files => {
    allSoundFiles = files;
    filterSounds('');
  })
  .catch(error => {
    soundboard.innerHTML = '<p class="empty-state">Unable to load sound files.</p>';
    console.error(error);
  });

if (searchInput) {
  searchInput.addEventListener('input', event => {
    filterSounds(event.target.value);
  });
}

overlapToggle.addEventListener('click', () => {
  preventOverlap = !preventOverlap;
  overlapToggle.textContent = `Prevent overlap: ${preventOverlap ? 'On' : 'Off'}`;
});

stopAllButton.addEventListener('click', stopAllSounds);
updateStatus();