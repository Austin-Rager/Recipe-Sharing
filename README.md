# Recipe API – Route Documentation

## Authentication & Session Handling

Most endpoints that modify or reveal user‑specific data require an active **session cookie**. After a successful `POST /login`, the server sets `connect.sid` (or a similarly named cookie) that must be included with subsequent requests.

---

## Endpoints

### 1. **Register** – `POST /register`

Creates a new user account.

| Requirement     | Details                                   |
| --------------- | ----------------------------------------- |
| **Auth**        | Not required (must be *logged out*)       |
| **Body (JSON)** | `{ name?, username*, email?, password* }` |

#### Responses

* **201 Created** – "Registration successful"
* **400 Bad Request** – Missing `username` or `password`
* **403 Forbidden** – Username already exists *or* user is already logged in
* **500 Internal Server Error** – Registration failed due to server issue

---

### 2. **Login** – `POST /login`

Authenticates a user and starts a session.

| Requirement     | Details                    |
| --------------- | -------------------------- |
| **Auth**        | Not required               |
| **Body (JSON)** | `{ username*, password* }` |

#### Responses

* **200 OK** – `{ "username": "<your‑username>" }`
* **400 Bad Request** – Missing credentials
* **403 Forbidden** – Invalid credentials
* **500 Internal Server Error** – Login failed

---

### 3. **Logout** – `GET /logout`

Destroys the current session.

| Requirement | Details      |
| ----------- | ------------ |
| **Auth**    | **Required** |

#### Responses

* **200 OK** – "Successful logout"
* **403 Forbidden** – No user logged in

---

### 4. **Create Recipe** – `POST /recipe`

Creates a new recipe (optionally with images) and uploads any image files to AWS S3.

| Requirement      | Details                                                       |
| ---------------- | ------------------------------------------------------------- |
| **Auth**         | **Required**                                                  |
| **Content‑Type** | `multipart/form-data`                                         |
| **Fields**       |                                                               |
| `name*`          | Recipe title (string)                                         |
| `description`    | Optional description (string)                                 |
| `ingredients*`   | **JSON string** – array of ingredients                        |
| `instructions*`  | **JSON string** – array of instruction steps                  |
| `rating`         | Optional numeric rating                                       |
| `time`           | Optional prep/cook time (string \| number)                    |
| `difficulty`     | Optional difficulty (string)                                  |
| `images`         | Up to **5** image files (JPEG, PNG, GIF, or WEBP ≤ 5 MB each) |

#### Responses

* **201 Created** – `{ message, recipe, imagesUploaded }`
* **400 Bad Request** – Invalid data (missing fields, bad JSON, file too large, invalid file type, etc.)
* **401 Unauthorized** – Not logged in
* **500 Internal Server Error** – Failed to create recipe

---

### 5. **Like Recipe** – `POST /recipe/:id/like`

Adds a like to the specified recipe.

| Requirement | Details                           |
| ----------- | --------------------------------- |
| **Auth**    | **Required**                      |
| **Params**  | `id` – Recipe ID (Mongo ObjectId) |

#### Responses

* **200 OK** – `{ message: "Recipe liked", likes: <totalLikes> }`
* **400 Bad Request** – Already liked
* **401 Unauthorized** – Not logged in
* **404 Not Found** – Recipe not found
* **500 Internal Server Error** – Failure while liking

---

### 6. **Unlike Recipe** – `DELETE /recipe/:id/like`

Removes a like that the current user previously added.

| Requirement | Details          |
| ----------- | ---------------- |
| **Auth**    | **Required**     |
| **Params**  | `id` – Recipe ID |

#### Responses

* **200 OK** – `{ message: "Recipe unliked", likes: <totalLikes> }`
* **401 Unauthorized** – Not logged in
* **500 Internal Server Error** – Failure while unliking

---

### 7. **Get Liked Recipes** – `GET /user/liked-recipes`

Returns full recipe objects the user has liked.

| Requirement | Details      |
| ----------- | ------------ |
| **Auth**    | **Required** |

#### Responses

* **200 OK** – `{ likedRecipes: [ … ] }`
* **401 Unauthorized** – Not logged in
* **500 Internal Server Error** – Retrieval failed

---

### 8. **Update Recipe** – `PUT /recipe/:id`

Updates fields of a recipe that you created.

| Requirement     | Details                                                                                             |
| --------------- | --------------------------------------------------------------------------------------------------- |
| **Auth**        | **Required** (must be creator)                                                                      |
| **Params**      | `id` – Recipe ID                                                                                    |
| **Body (JSON)** | Any subset of: `name`, `description`, `ingredients`, `instructions`, `rating`, `time`, `difficulty` |

#### Responses

* **200 OK** – `{ message: "Recipe updated successfully", recipe }`
* **400 Bad Request** – Validation errors or malformed ID
* **401 Unauthorized** – Not logged in
* **403 Forbidden** – Attempt to edit someone else’s recipe
* **404 Not Found** – Recipe not found
* **500 Internal Server Error** – Update failed

---

### 9. **Get My Recipes** – `GET /users-recipes`

Lists recipes created by the currently logged‑in user.

| Requirement | Details      |
| ----------- | ------------ |
| **Auth**    | **Required** |

#### Responses

* **200 OK** – `{ message, count, recipes }`
* **401 Unauthorized** – Not logged in
* **500 Internal Server Error** – Retrieval failed

---

### 10. **Get All Recipes** – `GET /recipes`

Returns all recipes in the database (public endpoint).

| Requirement | Details      |
| ----------- | ------------ |
| **Auth**    | Not required |

#### Responses

* **200 OK** – `{ message, count, recipes }`
* **500 Internal Server Error** – Retrieval failed

---

## Error Handling

If an error originates from image uploads, the API returns specific messages:

* `File too large. Maximum size is 5MB.` – 400
* `Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.` – 400

All other unexpected errors return

```json
{ "error": "<description>" }
```

with an appropriate status code.

---

