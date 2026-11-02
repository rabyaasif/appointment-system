USE appointment_system;

-- Kya user ki email verify ho chuki hai
ALTER TABLE users
  ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0 AFTER role;

-- Email verification ke OTP (hash karke save honge)
CREATE TABLE email_otps (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_otp_user (user_id)
);