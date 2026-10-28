-- =====================================================
-- Smart Appointment Management System - Database Schema
-- MySQL 8.0+
-- Run karne ka tareeqa:  mysql -u root -p < database/schema.sql
-- =====================================================

CREATE DATABASE IF NOT EXISTS appointment_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE appointment_system;

-- -----------------------------------------------------
-- 1. users
-- Teeno roles (admin, staff, customer) isi table mein hongay
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL,
  password    VARCHAR(255) NOT NULL,            -- hashed password (plain text kabhi nahi)
  role        ENUM('admin', 'staff', 'customer') NOT NULL DEFAULT 'customer',
  phone       VARCHAR(20) NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 2. services
-- Jaise: Haircut, Check-up, Consultation
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name                 VARCHAR(100) NOT NULL,
  description          TEXT NULL,
  price                DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  duration_in_minutes  SMALLINT UNSIGNED NOT NULL,
  created_by           INT UNSIGNED NULL,
  created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_services_created_by
    FOREIGN KEY (created_by) REFERENCES users (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT chk_services_duration CHECK (duration_in_minutes > 0)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 3. staff_availability
-- Staff kis din, kis time se kis time tak available hai
-- day_of_week: 0 = Sunday, 1 = Monday ... 6 = Saturday
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS staff_availability (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  staff_id     INT UNSIGNED NOT NULL,
  day_of_week  TINYINT UNSIGNED NOT NULL,
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_availability_staff_day (staff_id, day_of_week),
  CONSTRAINT fk_availability_staff
    FOREIGN KEY (staff_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT chk_availability_day CHECK (day_of_week BETWEEN 0 AND 6),
  CONSTRAINT chk_availability_time CHECK (end_time > start_time)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 4. appointments
-- Asli booking yahan save hoti hai
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id       INT UNSIGNED NOT NULL,
  staff_id          INT UNSIGNED NOT NULL,
  service_id        INT UNSIGNED NOT NULL,
  appointment_date  DATE NOT NULL,
  start_time        TIME NOT NULL,
  end_time          TIME NOT NULL,
  status            ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  -- Conflict check (overlap dhoondna) tez karne ke liye index
  KEY idx_appointments_staff_slot (staff_id, appointment_date, start_time, end_time),
  KEY idx_appointments_customer (customer_id),
  CONSTRAINT fk_appointments_customer
    FOREIGN KEY (customer_id) REFERENCES users (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_appointments_staff
    FOREIGN KEY (staff_id) REFERENCES users (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_appointments_service
    FOREIGN KEY (service_id) REFERENCES services (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT chk_appointments_time CHECK (end_time > start_time)
) ENGINE=InnoDB;
