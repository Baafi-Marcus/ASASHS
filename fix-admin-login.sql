-- SQL commands to fix the admin login issue

-- First, delete the existing admin user (if any)
DELETE FROM users WHERE user_id = 'ADMIN001';

-- Insert the admin user with the correct password hash
INSERT INTO users (user_id, user_type, password_hash, must_change_password, temp_password) VALUES 
('ADMIN001', 'admin', '$2b$10$eXqfszx/nIZ.a3QUesk31e1ZMJLxNparJazxP2EVQz/LgJTGURYlO', false, 'admin123');

-- Verify the admin user was created
SELECT user_id, user_type, must_change_password, temp_password FROM users WHERE user_id = 'ADMIN001';