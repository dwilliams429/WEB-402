// server_task1.js

// Import the 'http' module, which is essential for creating web servers in Node.js.
const http = require('http');

// Define the port number on which the server will listen for incoming requests.
const port = 5001;

// Create an HTTP server. The callback function is executed whenever a request is received.
// 'req' (request) object contains information about the incoming request (e.g., URL, headers).
// 'res' (response) object is used to send data back to the client.
const server = http.createServer((req, res) => {
    // Log the URL of the incoming request to the console for debugging purposes.
    console.log(`Request received for URL: ${req.url}`);

    // Check the URL of the current request using if-else if-else statements.

    // If the URL is exactly '/', respond with "Home Page."
    if (req.url === '/') {
        // Set the HTTP header for the response.
        // 'Content-Type': 'text/plain' tells the browser that the response body is plain text.
        // '200' is the HTTP status code for "OK" (successful request).
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        // Send the response body and end the response.
        res.end('Home Page.');
    }
    // If the URL is exactly '/about', respond with "About Page."
    else if (req.url === '/about') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('About Page.');
    }
    // If the URL is exactly '/contact', respond with "Contact Page."
    else if (req.url === '/contact') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Contact Page.');
    }
    // If none of the above URLs match, respond with "Invalid Request!"
    else {
        // Set the status code to 404 (Not Found) for unknown URLs.
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Invalid Request!');
    }
});

// Start the server and make it listen on the specified port.
server.listen(port, () => {
    // This callback function is executed once the server starts successfully.
    console.log(`The NodeJS server on port ${port} is now running....`);
});
