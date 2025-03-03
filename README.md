# RSS Aggregator 📡

A fast and efficient **RSS feed aggregator** built with **Golang**, designed to fetch, store, and serve RSS feed updates via a REST API.

## 🚀 Features

✅ Fetches and aggregates RSS feeds efficiently

✅ Uses Golang for high performance

✅ PostgreSQL for persistent storage

✅ Concurrent worker pools for parallel feed fetching

✅ RESTful API built with Gin/Fiber/Echo (mention framework used)

✅ Follows clean architecture principles

## 📦 Installation & Setup

1️⃣ Clone the Repository

```sh
git clone https://github.com/yourusername/rss-aggregator.git
cd rss-aggregator
```

2️⃣ Configure Environment

Rename .env.example to .env and update database credentials:

```sh
DB_HOST=localhost
DB_USER=youruser
DB_PASS=yourpassword
DB_NAME=rss_db
PORT=8080
```

3️⃣ Install Dependencies

```sh
go mod tidy
```

4️⃣ Run Database Migrations (if applicable)

```sh
go run migrate.go
```

5️⃣ Start the Server

```sh
go run main.go
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /users | Register a new user |
| GET | /users/me | Get user details |
| POST | /feeds | Add a new RSS feed for the user |
| GET | /feeds | Get all feeds for the user |
| POST | /feed_follows | Add a new feed follow for the user |
| GET | /feed_follows | Get all feed follows for the user |
| DELETE | /feed_follows/:id | Remove a feed follow for the user |
| GET | /posts | Get all posts for the user |

## 🛠 Tech Stack
-	**Language**: Golang
-	**Framework**: Gin/Fiber/Echo (whichever you used)
-	**Database**: PostgreSQL
-	**ORM (if used)**: GORM/SQLX
-	**Authentication (if added)**: JWT/OAuth

## 🤝 Contributing
1)	Fork the repo
2)	Create a new branch (feature-branch)
3)	Commit changes and push
4)	Open a PR 🎉

## 📄 License

This project is licensed under the MIT License.
