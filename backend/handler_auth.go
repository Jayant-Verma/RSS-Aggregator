package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/Jayant-Verma/rssagg/internal/auth"
	"github.com/Jayant-Verma/rssagg/internal/database"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// parameters for user registration
type registerParams struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// parameters for user login
type loginParams struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Handler for user registration
func (apiCfg *apiConfig) handlerRegisterUser(w http.ResponseWriter, r *http.Request) {
	var params registerParams
	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate required fields
	if params.Name == "" || params.Email == "" || params.Password == "" {
		respondWithError(w, http.StatusBadRequest, "All fields (name, email, password) are required")
		return
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(params.Password), bcrypt.DefaultCost)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to hash password")
		return
	}

	user, err := apiCfg.DB.CreateUser(r.Context(), database.CreateUserParams{
		ID:           uuid.New(),
		CreatedAt:    time.Now().UTC(),
		UpdatedAt:    time.Now().UTC(),
		Name:         params.Name,
		Email:        params.Email,
		PasswordHash: string(hashedPassword),
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to create user: %v", err))
		return
	}

	respondWithJSON(w, http.StatusCreated, databaseUserToUser(user))
}

// Handler for user login
func (apiCfg *apiConfig) handlerLoginUser(w http.ResponseWriter, r *http.Request) {
	var params loginParams
	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if params.Email == "" || params.Password == "" {
		respondWithError(w, http.StatusBadRequest, "Email and password are required")
		return
	}

	user, err := apiCfg.DB.GetUserByEmail(r.Context(), params.Email)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	// Compare hashed password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(params.Password)); err != nil {
		respondWithError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	token, err := auth.GetJWT(user.ID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"token": token})
}
