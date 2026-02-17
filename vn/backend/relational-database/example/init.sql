-- Minh hoạ thiết kế DB: bảng, khóa chính, khóa ngoại, index
CREATE TABLE IF NOT EXISTS users (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total DECIMAL(10,2)
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
INSERT INTO users (name, email) VALUES ('An', 'an@example.com'), ('Bình', 'binh@example.com');
