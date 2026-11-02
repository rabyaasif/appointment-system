USE appointment_system;

-- Doctor ki specialty (patients aur admin ke liye khali rehti hai)
ALTER TABLE users
  ADD COLUMN specialty VARCHAR(100) NULL AFTER role;

-- Aik doctor ka aik din ka aik hi schedule
ALTER TABLE doctor_availability
  ADD UNIQUE KEY uq_doctor_day (doctor_id, day_of_week);