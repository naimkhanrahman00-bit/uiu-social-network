-- UIU Social Network Database Schema
-- Version: 1.0
-- Generated from schema.md

DROP DATABASE IF EXISTS uiu_social_network;
CREATE DATABASE uiu_social_network;
USE uiu_social_network;

-- ==========================================
-- 1. Departments
-- ==========================================
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO departments (name, code) VALUES
('Computer Science & Engineering', 'CSE'),
('Electrical & Electronic Engineering', 'EEE'),
('Business Administration', 'BBA'),
('Civil Engineering', 'CE'),
('Economics', 'ECO'),
('English', 'ENG');

-- ==========================================
-- 2. Users
-- ==========================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    student_id VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    department_id INT NOT NULL,
    batch VARCHAR(20),
    contact_info VARCHAR(100),
    profile_picture VARCHAR(255),
    role ENUM('admin', 'moderator', 'student') NOT NULL DEFAULT 'student',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_role ON users(role);

-- ==========================================
-- 3. Courses
-- ==========================================
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    department_id INT NOT NULL,
    trimester VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE INDEX idx_courses_department ON courses(department_id);
CREATE INDEX idx_courses_trimester ON courses(trimester);

-- ==========================================
-- 4. Lost & Found Categories
-- ==========================================
CREATE TABLE lost_found_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    parent_id INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES lost_found_categories(id)
);

INSERT INTO lost_found_categories (name, parent_id) VALUES
('ID Card', NULL),
('Items', NULL);

-- Insert Subcategories (assuming IDs 1 and 2 are generated above)
INSERT INTO lost_found_categories (name, parent_id) VALUES
('Electronics', 2),
('Books', 2),
('Accessories', 2),
('Bags', 2),
('Documents', 2),
('Other', 2);

-- ==========================================
-- 5. Lost & Found Posts
-- ==========================================
CREATE TABLE lost_found_posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    type ENUM('lost', 'found') NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    -- ID Card specific fields
    name_on_card VARCHAR(100),
    card_student_id VARCHAR(20),
    card_department VARCHAR(100),
    -- Common fields
    location VARCHAR(200) NOT NULL,
    date_lost_found DATE NOT NULL,
    image_path VARCHAR(255),
    status ENUM('lost', 'found', 'claimed', 'returned') NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES lost_found_categories(id)
);

CREATE INDEX idx_lf_posts_user ON lost_found_posts(user_id);
CREATE INDEX idx_lf_posts_category ON lost_found_posts(category_id);
CREATE INDEX idx_lf_posts_type ON lost_found_posts(type);
CREATE INDEX idx_lf_posts_status ON lost_found_posts(status);
CREATE INDEX idx_lf_posts_expires ON lost_found_posts(expires_at);

-- ==========================================
-- 6. Marketplace Categories
-- ==========================================
CREATE TABLE marketplace_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    icon VARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO marketplace_categories (name, icon) VALUES
('Books', 'book'),
('Electronics', 'laptop'),
('Clothing', 'shirt'),
('Accessories', 'watch'),
('Stationery', 'pencil'),
('Sports', 'football'),
('Others', 'box');

-- ==========================================
-- 7. Marketplace Listings
-- ==========================================
CREATE TABLE marketplace_listings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2),
    is_negotiable BOOLEAN NOT NULL DEFAULT FALSE,
    listing_type ENUM('sale', 'exchange', 'both') NOT NULL DEFAULT 'sale',
    exchange_for TEXT,
    condition_status ENUM('new', 'like_new', 'good', 'fair') NOT NULL,
    status ENUM('active', 'sold', 'exchanged', 'expired', 'deleted') NOT NULL DEFAULT 'active',
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES marketplace_categories(id)
);

CREATE INDEX idx_mp_listings_user ON marketplace_listings(user_id);
CREATE INDEX idx_mp_listings_category ON marketplace_listings(category_id);
CREATE INDEX idx_mp_listings_status ON marketplace_listings(status);
CREATE INDEX idx_mp_listings_type ON marketplace_listings(listing_type);

-- ==========================================
-- 8. Listing Images
-- ==========================================
CREATE TABLE listing_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    listing_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    display_order TINYINT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES marketplace_listings(id) ON DELETE CASCADE
);

CREATE INDEX idx_listing_images_listing ON listing_images(listing_id);

-- ==========================================
-- 9. Resources
-- ==========================================
CREATE TABLE resources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_path VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    download_count INT NOT NULL DEFAULT 0,
    uploaded_by INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE INDEX idx_resources_course ON resources(course_id);
CREATE INDEX idx_resources_downloads ON resources(download_count);

-- ==========================================
-- 10. Resource Requests
-- ==========================================
CREATE TABLE resource_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    resource_name VARCHAR(200) NOT NULL,
    description TEXT,
    status ENUM('pending', 'approved', 'rejected', 'uploaded') NOT NULL DEFAULT 'pending',
    admin_note TEXT,
    fulfilled_resource_id INT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (fulfilled_resource_id) REFERENCES resources(id)
);

CREATE INDEX idx_resource_requests_user ON resource_requests(user_id);
CREATE INDEX idx_resource_requests_status ON resource_requests(status);

-- ==========================================
-- 11. Resource Downloads
-- ==========================================
CREATE TABLE resource_downloads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    resource_id INT NOT NULL,
    user_id INT NOT NULL,
    downloaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_resource_downloads_resource ON resource_downloads(resource_id);
CREATE INDEX idx_resource_downloads_user ON resource_downloads(user_id);

-- ==========================================
-- 12. Section Exchange Posts
-- ==========================================
CREATE TABLE section_exchange_posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    current_section VARCHAR(10) NOT NULL,
    desired_section VARCHAR(10) NOT NULL,
    note TEXT,
    status ENUM('pending', 'approved', 'rejected', 'completed') NOT NULL DEFAULT 'pending',
    approved_by INT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE INDEX idx_section_exchange_user ON section_exchange_posts(user_id);
CREATE INDEX idx_section_exchange_course ON section_exchange_posts(course_id);
CREATE INDEX idx_section_exchange_status ON section_exchange_posts(status);

-- ==========================================
-- 13. Section Requests (New Sections)
-- ==========================================
CREATE TABLE section_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    desired_section VARCHAR(10) NOT NULL,
    reason TEXT NOT NULL,
    support_count INT NOT NULL DEFAULT 0,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    approved_by INT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE INDEX idx_section_requests_user ON section_requests(user_id);
CREATE INDEX idx_section_requests_course ON section_requests(course_id);
CREATE INDEX idx_section_requests_status ON section_requests(status);

-- ==========================================
-- 14. Section Request Supports
-- ==========================================
CREATE TABLE section_request_supports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES section_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_support (request_id, user_id)
);

-- ==========================================
-- 15. Feedback Posts
-- ==========================================
CREATE TABLE feedback_posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    feedback_type ENUM('general', 'canteen') NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    approved_by INT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE INDEX idx_feedback_user ON feedback_posts(user_id);
CREATE INDEX idx_feedback_type ON feedback_posts(feedback_type);
CREATE INDEX idx_feedback_status ON feedback_posts(status);

-- ==========================================
-- 16. Feedback Images
-- ==========================================
CREATE TABLE feedback_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    feedback_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (feedback_id) REFERENCES feedback_posts(id) ON DELETE CASCADE
);

CREATE INDEX idx_feedback_images_feedback ON feedback_images(feedback_id);

-- ==========================================
-- 17. Admin Responses
-- ==========================================
CREATE TABLE admin_responses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    feedback_id INT NOT NULL,
    admin_id INT NOT NULL,
    response TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (feedback_id) REFERENCES feedback_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

CREATE INDEX idx_admin_responses_feedback ON admin_responses(feedback_id);

-- ==========================================
-- 18. Conversations
-- ==========================================
CREATE TABLE conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    last_message_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_conversation (user1_id, user2_id)
);

CREATE INDEX idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at);

-- ==========================================
-- 19. Messages
-- ==========================================
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_unread ON messages(is_read);

-- ==========================================
-- 20. Notifications
-- ==========================================
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM(
        'message_received',
        'post_approved',
        'post_rejected',
        'item_claimed',
        'request_update',
        'feedback_response',
        'post_expiring',
        'exchange_interest',
        'general'
    ) NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- ==========================================
-- 21. System Settings
-- ==========================================
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO system_settings (setting_key, setting_value) VALUES
('section_issue_enabled', 'false'),
('post_expiration_days', '30'),
('max_listing_images', '5'),
('max_feedback_images', '3'),
('max_file_size_mb', '50');

-- ==========================================
-- 22. Verification Tokens
-- ==========================================
CREATE TABLE verification_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    type ENUM('email_verification', 'password_reset') NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_tokens_token ON verification_tokens(token);
CREATE INDEX idx_tokens_user ON verification_tokens(user_id);
CREATE INDEX idx_tokens_expires ON verification_tokens(expires_at);
