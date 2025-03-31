-- +goose Up
ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE NOT NULL DEFAULT 'temp@example.com';
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NOT NULL;

-- +goose Down
ALTER TABLE users DROP COLUMN email;
ALTER TABLE users DROP COLUMN password_hash;