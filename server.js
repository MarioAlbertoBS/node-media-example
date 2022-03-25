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
    // Getting the song path
    const path = "songs/bensound-epic.mp3";
    // Get file size info
    const stat = fs.statSync(path);
    const fileSize = stat.size;

    // Getting range from the headers, it comes from the audio tag
    const range = request.headers.range;

    // If we have a range, we are calculating the chunks to load the file
    if (range) {
        // We are getting the starting byte and the final byte of the section
        const parts = range.replace(/bytes=/,"").split("-");
        const start = parseInt(parts[0]);
        const end = parts[1] ? parseInt(parts[1]) : fileSize-1;

        // Load the file on this range
        const chunkSize = (end-start)+1;
        const file = fs.createReadStream(path, {start, end});
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Lenght': chunkSize,
            'Content-Type': 'audio/mp3'
        }

        //Sending the partial file to the response
        response.writeHead(206, head);
        file.pipe(response);
    } 
    // If not, we send the complete file
    else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'audio/mp3'
        }

        response.writeHead(200, head);
        // We are opening the file and sending it to the response
        fs.createReadStream(path).pipe(response);
    }
});

app.listen(port, () => console.log("Server is running"));