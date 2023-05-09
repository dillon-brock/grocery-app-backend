-- Use this file to define your SQL tables
-- The SQL in this file will be executed when you run `npm run setup-db`

DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS list_items CASCADE;
DROP TABLE IF EXISTS users_lists CASCADE;
DROP TABLE IF EXISTS lists CASCADE;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS list_shares;
DROP TABLE IF EXISTS lists_categories;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS recipe_shares CASCADE;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS recipe_steps;

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
  name VARCHAR(31) NOT NULL,
  list_id BIGINT NOT NULL,
  FOREIGN KEY (list_id) REFERENCES lists(id)
);

CREATE TABLE list_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  list_id BIGINT NOT NULL,
  item VARCHAR NOT NULL,
  bought BOOLEAN NOT NULL DEFAULT FALSE,
  quantity VARCHAR(15),
  category_id BIGINT,
  FOREIGN KEY (list_id) REFERENCES lists(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE recipes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_id BIGINT NOT NULL,
  name VARCHAR NOT NULL,
  description VARCHAR,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE ingredients (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  recipe_id BIGINT NOT NULL,
  name VARCHAR NOT NULL,
  amount VARCHAR,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);

CREATE TABLE recipe_steps (
  id BIGINT GENERATED ALWAYS AS IDENTITY,
  num INT NOT NULL,
  recipe_id BIGINT NOT NULL,
  description VARCHAR NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);

CREATE TABLE recipe_shares (
  id BIGINT GENERATED ALWAYS AS IDENTITY,
  recipe_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  editable BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);