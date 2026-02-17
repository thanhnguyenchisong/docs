-- Minh hoạ PostgreSQL — tài liệu postgresSQL
CREATE TABLE IF NOT EXISTS users (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE
);

INSERT INTO users (name, email) VALUES
    ('An', 'an@example.com'),
    ('Bình', 'binh@example.com');

CREATE INDEX idx_users_email ON users(email);
