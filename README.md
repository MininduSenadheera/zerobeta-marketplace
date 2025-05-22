## Instructions

### Frontend (Web)
- Navigate to the apps/web directory.
- Run npm install to install dependencies.
- Create a .env file based on the provided .env.example.
- Start the development server with npm run dev.

### Backend Services
- Create a .env file in the root directory based on the provided .env.example.
- Run docker compose up --build to build and start the services.
- when on first run server will automatically seed some data
- u can access the swagger docs by visiting localhost:8000/api/products/docs, localhost:8000/api/orders/docs, localhost:8000/api/users/docs
- if you can see this on docker ✅ All services are up. you are good to go.

## Architecture diagram
![architecture](https://github.com/user-attachments/assets/df25a706-4b83-4c8a-b5d0-3aae97270506)

## ER Diagram
![er](https://github.com/user-attachments/assets/6df5a377-5ad0-41ca-a0f2-2b526952f91f)