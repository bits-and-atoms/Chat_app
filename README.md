# Basic Socket.io Chat App

This is a basic real-time chat application built using Socket.io, Express, and PostgreSQL. The app provides a simple interface for users to send and receive messages in real time.

## Features
- Real-time messaging using Socket.io.
- Backend powered by Node.js and Express.
- PostgreSQL database integration for storing chat data.
- Environment variable configuration using dotenv.

# Prerequisites
Make sure you have the following installed on your system:

Node.js (v14 or above), 
npm (Node Package Manager), 
A PostgreSQL database (e.g., on Supabase)

## Installation
Clone the repository:
```bash
git clone https://github.com/bits-and-atoms/Chat_app
cd Chat_app
```
Install dependencies: Run the following command to install required npm packages:
```bash
npm install express path http dotenv pg socket.io
```

## Set up environment variables:

Create a .env file in the root directory.
Add the following variables:
```bash
PGUSER= your value
PGPASSWORD= your value
PGDATABASE= your value
PGHOST= your value
PGPORT= your value
PORT= your value
```
Run the app: Start the server using:

```bash
node index.js
```
## Usage
Open your web browser and navigate to http://localhost:PORT (the port your app is configured to use).
Start chatting in real time!

## Project Structure
``` bash
Copy code
Chat_app/
├── index.js          # Entry point for the application
├── public/           # Static files (e.g., HTML, CSS, JS for frontend)
├── .env              # Environment variable file (not included in the repo)
└── package.json      # npm configuration and dependencies
```