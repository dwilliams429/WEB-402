# AI Recipe Planner Backend (Weeks 1–3)
This folder is a ready-to-run backend for Authentication + Ingredients + Recipes CRUD.

## 0) Requirements
- Node.js LTS installed
- MongoDB running locally on `mongodb://127.0.0.1:27017`
- Postman for testing

## 1) Setup
```bash
cd <this-folder>
cp .env.example .env
npm install
npm run dev   # or: npx nodemon server.js
```
You should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

## 2) Test in Postman
Set `baseUrl = http://localhost:5000`

### A) Register
POST {{baseUrl}}/api/auth/register
Body (JSON):
{
  "username": "john",
  "email": "john@example.com",
  "password": "Password123"
}

### B) Login
POST {{baseUrl}}/api/auth/login
Body (JSON):
{
  "email": "john@example.com",
  "password": "Password123"
}
Response contains: { "token": "..." }

### C) Use the token
Add a header to every protected request:
Authorization: Bearer <token>

### D) Ingredients
- POST {{baseUrl}}/api/ingredients  (JSON: { "name": "chicken", "quantity":"2", "unit":"pieces" })
- GET  {{baseUrl}}/api/ingredients
- PUT  {{baseUrl}}/api/ingredients/:id
- DELETE {{baseUrl}}/api/ingredients/:id

### E) Recipes
- POST {{baseUrl}}/api/recipes
  JSON example:
  {
    "title":"Garlic Chicken",
    "ingredients":[{"name":"chicken breast","quantity":"2","unit":"pieces"}],
    "instructions":"1) season 2) bake 3) rest"
  }
- GET  {{baseUrl}}/api/recipes
- GET  {{baseUrl}}/api/recipes/:id
- PUT  {{baseUrl}}/api/recipes/:id
- DELETE {{baseUrl}}/api/recipes/:id

## 3) Common Fixes
- If `nodemon` not found: `npm i -D nodemon` then `npm run dev`
- If `MODULE_NOT_FOUND` for `./config/db`: ensure `config/db.js` exists and path is correct
- If 403 on protected routes: include `Authorization: Bearer <token>`
- If `req.body` is `{}`: in Postman set `Content-Type: application/json` and Body -> raw -> JSON
