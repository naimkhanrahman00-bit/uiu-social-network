# UIU Social Network

## Prerequisites
- Node.js
- MySQL

## Setup Instructions

### 1. Database Setup
1. Open your MySQL client (e.g., MySQL Workbench, phpMyAdmin).
2. Import the `uiu_social_network.sql` file located in the root directory. This will create the database and insert all data.
   - You can also import it via command line:
     ```bash
     mysql -u root -p < uiu_social_network.sql
     ```
   - Enter your password when prompted.

### 2. Backend Server
1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure the `.env` file in the `server` directory has the correct database credentials:
   ```env
   PORT=5000
   NODE_ENV=development
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=iloveallah1234
   DB_NAME=uiu_social_network
   JWT_SECRET=supersecretkey123
   ```
4. Start the server:
   ```bash
   npm start
   ```
   The server will run on port 5000.

### 3. Frontend Application
1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm run dev
   ```
4. Open your browser and go to the URL shown in the terminal (usually http://localhost:5173).

## Project Structure
- `client`: React frontend application.
- `server`: Node.js/Express backend API.
- `uiu_social_network.sql`: Database dump file with structure and data.
