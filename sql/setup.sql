-- Use this file to define your SQL tables
-- The SQL in this file will be executed when you run `npm run setup-db`

DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS list_items CASCADE;
DROP TABLE IF EXISTS users_lists CASCADE;
DROP TABLE IF EXISTS lists CASCADE;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS list_shares;

CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email VARCHAR,
  password_hash VARCHAR,
  username VARCHAR
);

CREATE TABLE lists (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title VARCHAR(63),
  owner_id BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE list_shares (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL,
  list_id BIGINT NOT NULL,
  editable BOOLEAN NOT NULL,
  FOREIGN KEY (list_id) REFERENCES lists(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE categories (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(31),
  user_id BIGINT DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE list_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  list_id BIGINT NOT NULL,
  item VARCHAR NOT NULL,
  bought BOOLEAN NOT NULL DEFAULT FALSE,
  quantity INT,
  category_id BIGINT,
  FOREIGN KEY (list_id) REFERENCES lists(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

INSERT INTO categories (name) VALUES
('Fruit'), ('Vegetables'), ('Protein'), 
('Dairy'), ('Dry Goods'), ('Canned Goods'),
('Beverages'), ('Snacks');
