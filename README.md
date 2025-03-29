
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/e8e71bf7-c30e-4193-ae34-aba8b5dca0d3

## How to run with Docker (Recommended)

You can easily run the entire application (frontend and backend) using Docker Compose:

```sh
# Build and start the containers
docker-compose up

# The application will be available at:
# - Frontend: http://localhost:8080
# - Backend API: http://localhost:5000
```

To stop the application:

```sh
docker-compose down
```

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/e8e71bf7-c30e-4193-ae34-aba8b5dca0d3) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

### Running the Backend Separately

To run just the backend:

```sh
cd backend
pip install -r requirements.txt
python app.py
```

The Flask server will be available at http://localhost:5000.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- **Frontend**: 
  - Vite
  - TypeScript
  - React
  - shadcn-ui
  - Tailwind CSS
  - React Query for API data fetching

- **Backend**:
  - Flask (Python)
  - SQLite for database storage

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/e8e71bf7-c30e-4193-ae34-aba8b5dca0d3) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
