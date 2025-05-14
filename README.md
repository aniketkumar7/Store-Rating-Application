# Store Rating Application

A full-stack web application that allows users to submit ratings for stores registered on the platform.

## Tech Stack

- **Backend**: Express.js
- **Database**: MySQL
- **Frontend**: React.js with Vite

## Features

### User Roles

1. **System Administrator**
   - Add new stores, normal users, and admin users
   - Access dashboard with statistics
   - View and filter lists of stores and users

2. **Normal User**
   - Sign up and log in to the platform
   - Update password
   - View and search for stores
   - Submit and modify ratings for stores

3. **Store Owner**
   - Log in to the platform
   - Update password
   - View users who have submitted ratings for their store
   - See the average rating of their store

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)


### Database Setup

1. Make sure your MySQL server is running and your credentials are correctly set in the `.env` file

2. Run the database initialization script:

```
cd server
npm run init-db
```
This script will create the database, tables, and admin user automatically.

#### Alternative: Manual Setup

If you prefer to set up the database manually, you can:

1. Open MySQL Workbench or MySQL command line client
2. Run the schema.sql file located in the server/db directory:

### Backend Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_HOST=localhost
   DB_PORT=3306
   DB_DATABASE=store_rating_app
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   ```


5. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`


## Form Validations

- **Name**: Min 5 characters, Max 20 characters
- **Address**: Max 400 characters
- **Password**: 8-16 characters, must include at least one uppercase letter and one special character
- **Email**: Standard email validation rules

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `PUT /api/auth/update-password` - Update password (requires authentication)

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `POST /api/users` - Create a new user (admin only)
- `GET /api/users/stats/dashboard` - Get dashboard statistics (admin only)

### Stores
- `GET /api/stores` - Get all stores
- `GET /api/stores/:id` - Get store by ID
- `POST /api/stores` - Create a new store (admin only)
- `GET /api/stores/dashboard/owner` - Get store dashboard (store owner only)

### Ratings
- `POST /api/ratings` - Submit or update a rating (authenticated users only)
- `GET /api/ratings/store/:store_id` - Get ratings for a store
