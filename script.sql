-- Crear usuario y base de datos (ejecutar esto como superusuario: postgres)
CREATE USER eventadmin WITH PASSWORD 'claveSegura123';
CREATE DATABASE eventdb OWNER eventadmin;
GRANT ALL PRIVILEGES ON DATABASE eventdb TO eventadmin;

-- Conectarse a la base de datos
\c eventdb;

-- Crear tablas

-- Tabla: users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Tabla: provinces
CREATE TABLE provinces (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(150),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    display_order INTEGER
);

-- Tabla: locations
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    id_province INTEGER REFERENCES provinces(id),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6)
);

-- Tabla: event_locations
CREATE TABLE event_locations (
    id SERIAL PRIMARY KEY,
    id_location INTEGER REFERENCES locations(id),
    name VARCHAR(100),
    full_address TEXT,
    max_capacity INTEGER,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    id_creator_user INTEGER REFERENCES users(id)
);

-- Tabla: events
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    id_event_category INTEGER,
    id_event_location INTEGER REFERENCES event_locations(id),
    start_date TIMESTAMP,
    duration_in_minutes INTEGER,
    price DECIMAL(10,2),
    enabled_for_enrollment BOOLEAN,
    max_assistance INTEGER,
    id_creator_user INTEGER REFERENCES users(id)
);

-- Tabla: event_enrollments
CREATE TABLE event_enrollments (
    id SERIAL PRIMARY KEY,
    id_event INTEGER REFERENCES events(id),
    id_user INTEGER REFERENCES users(id),
    description TEXT,
    registration_date_time TIMESTAMP,
    attended BOOLEAN,
    observations TEXT,
    rating INTEGER
);
