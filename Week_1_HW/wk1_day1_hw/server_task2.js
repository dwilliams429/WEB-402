// server_task2.js

// Import the 'http' module for creating web servers.
const http = require('http');
// Import the 'fs' (file system) module for reading files.
const fs = require('fs');
// Import the 'path' module to handle and transform file paths.
const path = require('path');

// Define the port number for the server.
const port = 5001;

// Create the HTTP server.
const server = http.createServer((req, res) => {
    console.log(`Request received for URL: ${req.url}`);

    let filePath; // Variable to store the path to the HTML file.
    let statusCode = 200; // Default status code.
    let contentType = 'text/html'; // Default content type for HTML files.

    // Determine which HTML file to serve based on the request URL.
    if (req.url === '/home') {
        filePath = path.join(__dirname, 'home.html'); // Construct the full path to home.html.
    } else if (req.url === '/about') {
        filePath = path.join(__dirname, 'about.html'); // Construct the full path to about.html.
    } else if (req.url === '/contact') {
        filePath = path.join(__dirname, 'contact.html'); // Construct the full path to contact.html.
    } else {
        // If the URL doesn't match any known paths, set status to 404 and prepare a simple text response.
        statusCode = 404;
        contentType = 'text/plain';
        filePath = null; // No file to read for 404.
    }

    // Handle the request based on whether a file path was determined.
    if (filePath) {
        // Read the specified HTML file asynchronously.
        fs.readFile(filePath, (err, data) => {
            if (err) {
                // If there's an error reading the file (e.g., file not found),
                // send a 500 Internal Server Error response.
                console.error(`Error reading file ${filePath}:`, err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                // If the file is read successfully, send the HTML content.
                res.writeHead(statusCode, { 'Content-Type': contentType });
                res.end(data); // 'data' contains the content of the HTML file as a Buffer.
            }
        });
    } else {
        // For unmatched URLs, send the "Invalid Request!" message.
        res.writeHead(statusCode, { 'Content-Type': contentType });
        res.end('Invalid Request!');
    }
});

// Start the server.
server.listen(port, () => {
    console.log(`The NodeJS server on port ${port} is now running....`);
});
