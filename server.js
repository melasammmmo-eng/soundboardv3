const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

const soundFileHandler = (req, res) => {
  const soundDir = path.join(__dirname, 'sound');
  fs.readdir(soundDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to list sound files' });
    }
    const audioFiles = files.filter(file => /\.(mp3|wav|ogg|m4a)$/i.test(file));
    res.json(audioFiles);
  });
};

app.get(['/sound-files', '/api/sound-files'], soundFileHandler);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/debug', (req, res) => {
  res.json({
    cwd: process.cwd(),
    dirname: __dirname,
    styleFile: path.join(__dirname, 'style.css'),
    styleExists: fs.existsSync(path.join(__dirname, 'style.css'))
  });
});

app.listen(PORT, () => {
  console.log(`🎵 Soundboard is running!`);
  console.log(`Open your browser and go to: http://localhost:${PORT}`);
});