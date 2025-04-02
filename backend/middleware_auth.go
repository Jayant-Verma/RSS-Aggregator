package main

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/Jayant-Verma/rssagg/internal/database"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
)

type authHandler func(http.ResponseWriter, *http.Request, database.User)

var jwtSecret []byte

func init() {
	err := godotenv.Load("../.env")
	if err != nil {
		fmt.Println("Error loading .env file:", err)
	}

	jwtSecret = []byte(os.Getenv("JWT_SECRET"))
}

func (apiCfg *apiConfig) middlewareAuth(handler authHandler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			respondWithError(w, http.StatusUnauthorized, "Missing Authorization header")
			return
		}

		// Extract token (expecting "Bearer <token>")
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			respondWithError(w, http.StatusUnauthorized, "Invalid token format")
			return
		}

		// Validate JWT token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return jwtSecret, nil
		})

		// Check if token is valid
		if err != nil || !token.Valid {
			respondWithError(w, http.StatusUnauthorized, "Invalid or expired token")
			return
		}

		// Extract user ID from token claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			respondWithError(w, http.StatusUnauthorized, "Invalid token claims")
			return
		}

		userIDStr, ok := claims["user_id"].(string)
		if !ok {
			respondWithError(w, http.StatusUnauthorized, "Invalid user ID in token")
			return
		}

		// Fetch user from database
		userID, err := uuid.Parse(userIDStr)
		if err != nil {
			respondWithError(w, http.StatusUnauthorized, "Invalid user ID format")
			return
		}

		user, err := apiCfg.DB.GetUserByID(r.Context(), userID)
		if err != nil {
			respondWithError(w, http.StatusNotFound, "User not found")
			return
		}

		// Pass user to the handler
		handler(w, r, user)
	}
}
