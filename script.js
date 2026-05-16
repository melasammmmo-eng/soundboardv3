const soundboard = document.getElementById('soundboard');
const overlapToggle = document.getElementById('overlap-toggle');
const stopAllButton = document.getElementById('stop-all');
const statusText = document.getElementById('status-text');

let preventOverlap = false;
const activeAudios = new Set();

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
  if (!files.length) {
    soundboard.innerHTML = '<p class="empty-state">No sound files found in the sound folder. Add MP3/WAV/OGG files and refresh.</p>';
    return;
  }

  files.forEach(file => {
    soundboard.appendChild(createSoundButton(file));
  });
}

fetch('/sound-files')
  .then(response => response.json())
  .then(files => renderSounds(files))
  .catch(error => {
    soundboard.innerHTML = '<p class="empty-state">Unable to load sound files.</p>';
    console.error(error);
  });

overlapToggle.addEventListener('click', () => {
  preventOverlap = !preventOverlap;
  overlapToggle.textContent = `Prevent overlap: ${preventOverlap ? 'On' : 'Off'}`;
});

stopAllButton.addEventListener('click', stopAllSounds);
updateStatus();