package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/Jayant-Verma/rssagg/internal/database"
	"github.com/google/uuid"
)

func (apiCfg *apiConfig) handlerCreateFeed(w http.ResponseWriter, r *http.Request, user database.User) {
	type parameters struct {
		Name string `json:"name"`
		URL  string `json:"url"`
	}
	decoder := json.NewDecoder(r.Body)

	params := parameters{}
	err := decoder.Decode(&params)
	if err != nil {
		respondWithError(w, 400, fmt.Sprintf("Failed to decode request body: %v", err))
		return
	}

	feed, err := apiCfg.DB.CreateFeed(r.Context(), database.CreateFeedParams{
		ID:        uuid.New(),
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
		Name:      params.Name,
		UserID:    user.ID,
		Url:       params.URL,
	})
	if err != nil {
		respondWithError(w, 500, fmt.Sprintf("Failed to create feed: %v", err))
		return
	}

	respondWithJSON(w, 201, databaseFeedToFeed(feed))
}

func (apiCfg *apiConfig) handlerGetFeeds(w http.ResponseWriter, r *http.Request) {
	feeds, err := apiCfg.DB.GetFeeds(r.Context())
	if err != nil {
		respondWithError(w, 500, fmt.Sprintf("Couldn't get feeds: %v", err))
		return
	}

	respondWithJSON(w, 201, databaseFeedsToFeeds(feeds))
}
