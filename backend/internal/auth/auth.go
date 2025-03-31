package auth

import (
	"errors"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
)

// GetAPIKey extracts the API key from the request headers
// Example:
// Authorization: ApiKey {insert apiKey here}
func GetAPIKey(headers http.Header) (string, error) {
	val := headers.Get("Authorization")
	if val == "" {
		return "", errors.New("missing Authorization header")
	}

	vals := strings.Split(val, " ")
	if len(vals) != 2 {
		return "", errors.New("invalid Authorization header")
	}

	if vals[0] != "ApiKey" {
		return "", errors.New("invalid Authorization header")
	}

	return vals[1], nil
}

func GetJWT(userID uuid.UUID) (string, error) {
	godotenv.Load("../.env")

	jwtSecret := []byte(os.Getenv("JWT_SECRET"))
	if jwtSecret == nil {
		return "", errors.New("JWT_SECRET environment variable not set")
	}

	claims := jwt.MapClaims{
		"user_id": userID.String(),
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}
