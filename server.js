const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 5000;

// Return a static HTML file with the Audio Tag
app.get("/", (request, response) => {
    response.sendFile(__dirname + '/index.html');
});

// Return the song
app.get("/audio", (request, response) => {
    const path = "songs/bensound-epic.mp3";
    const stat = fs.statSync(path);

    const fileSize = stat.size;
    const range = request.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/,"").split("-");
        const start = parseInt(parts[0]);
        const end = parts[1] ? parseInt(parts[1]) : fileSize-1;

        const chunkSize = (end-start)+1;
        const file = fs.createReadStream(path, {start, end});
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Lenght': chunkSize,
            'Content-Type': 'audio/mp3'
        }

        response.writeHead(206, head);
        file.pipe(response);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'audio/mp3'
        }

        response.writeHead(200, head);
        fs.createReadStream(path).pipe(response);
    }
});

app.listen(port, () => console.log("Server is running"));