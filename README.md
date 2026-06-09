# GameStore

A learning project featuring an ASP.NET Core Minimal API backend and a React frontend.

## Project Structure

*   `GameStore.Api/` - Main ASP.NET Core API project
*   `GameStore.React/` - React frontend project using Vite and JSX
*   `GameStore.slnx` - Solution file

## Technologies Used

### Backend
*   ASP.NET Core Minimal APIs (for lightweight routing and endpoints)
*   Entity Framework Core (with SQLite database provider)
*   Built-in .NET 10.0 Validation (using Data Annotations on DTOs)
*   Cross-Origin Resource Sharing (CORS) configured for frontend communication

### Frontend
*   React (using JSX)
*   Vite (for fast development server and production builds)
*   Vanilla CSS (using custom CSS variables, layouts, and glassmorphic designs)
*   Lucide React (for iconography)

## Getting Started

### Prerequisites
*   .NET 10.0 SDK or later
*   Node.js (LTS version recommended)

### Running the Backend API

1. Navigate to the API directory:
   ```bash
   cd GameStore.Api
   ```

2. Run the application:
   ```bash
   dotnet run
   ```
   The backend API will start and listen on `http://localhost:5062`.

### Running the React Frontend

1. Navigate to the React directory:
   ```bash
   cd GameStore.React
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

## Features
*   Catalog Statistics: Tracks the total number of games and average price of the database dynamically.
*   Catalog Search: Real-time search by title.
*   Category Filter: Filter games by genre.
*   Game Creation: Modal form to add a game with validated input fields.
*   Game Editing: Update game titles, genres, prices, and release dates.
*   Game Deletion: Instantly remove games from the database.
*   Validation Feedback: Maps server-side (ASP.NET Core) errors directly back to the UI form fields.
