# database_feature_mapping.md

## Introduction
This document provides a comprehensive "feature mapping" of the UIU Social Network database. It explains **why** every table exists, **how** it connects to others, and the reasoning behind specific technical choices (like `ENUM`s, Foreign Keys, and `CASCADE` rules). Use this to explain the project's data architecture confidently.

---

## 1. Foundation: Departments
The university structure starts here.

### Table: `departments`
```sql
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    created_at DATETIME ...
);
```
*   **Why it exists**: To group users and courses. We cannot just have users type "CSE" because someone might type "C.S.E." or "Computer Science". A dedicated table enforces consistency.
*   **Key Design Choices**:
    *   `code VARCHAR(10) UNIQUE`: Stores short codes like "CSE" or "EEE". `UNIQUE` prevents duplicates (we can't have two CSE departments).
    *   `id`: The central reference point. Other tables (Users, Courses) will store just this number (e.g., `1`), not the text "CSE".

---

## 2. Core Entity: Users
The central hub of the application.

### Table: `users`
```sql
CREATE TABLE users (
    id INT PRIMARY KEY ...,
    role ENUM('admin', 'moderator', 'student') ...,
    department_id INT NOT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);
```
*   **Why it exists**: Stores everyone who logs in.
*   **Relationships**:
    *   `department_id` -> `departments(id)`: **Why?** Every student belongs to a department.
    *   **Note**: We use a **Foreign Key (FK)** here. If you try to create a user with `department_id = 999` and that department doesn't exist, the database throws an error. This guarantees data integrity.
*   **Columns**:
    *   `role ENUM(...)`: **Why ENUM?** It restricts values to *only* 'admin', 'moderator', or 'student'. No one can accidentally be assigned 'super-admin' or 'teacher' if the code doesn't support it.
    *   `is_verified`: Prevents fake accounts. You only implement this if you send a verification email.
    *   `is_suspended`: Allows admins to ban a user without deleting their data history.

---

## 3. Academic Structure: Courses
### Table: `courses`
```sql
CREATE TABLE courses (
    ...
    department_id INT NOT NULL,
    trimester VARCHAR(20) NOT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);
```
*   **Why it exists**: Used in **ResourceHub** (uploading notes for a course) and **Section Exchange** (swapping sections for a course).
*   **Relationships**:
    *   Links to `departments`. A course like "Data Structures" belongs to "CSE".

---

## 4. Feature: Lost & Found
Tracks lost items. This module needs two tables: one for the *categories* and one for the *posts*.

### Table: `lost_found_categories`
*   **Why it exists**: To organize posts. Instead of users typing "Electronics", they select from a list.
*   **Self-Referencing Relationship**:
    *   `parent_id` -> `lost_found_categories(id)`: **Why?** This allows subcategories.
    *   *Example*: "Electronics" (ID 1) is a parent. "Mobile" (ID 5) has `parent_id = 1`. This creates a hierarchy tree.

### Table: `lost_found_posts`
```sql
CREATE TABLE lost_found_posts (
    ...
    user_id INT NOT NULL,
    status ENUM('lost', 'found', 'claimed', 'returned'),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```
*   **Why it exists**: The actual "I lost my ID card" post.
*   **Critical Relationship**: `ON DELETE CASCADE`
    *   **What it means**: If a User (e.g., "John") is deleted from the `users` table, the database *automatically* deletes all of John's `lost_found_posts`.
    *   **Why?** Prevents "orphan" data. We don't want posts in the system belonging to a user ID that no longer exists.
*   **Columns**:
    *   `type`: Distinguishes "I Lost something" vs "I Found something".
    *   `status`: Tracks the lifecycle. A post starts as 'lost', becomes 'claimed' when found, and 'returned' when done.

---

## 5. Feature: Marketplace
Buying and selling.

### Table: `marketplace_listings`
*   **Why it exists**: The product page.
*   **Why `decimal(10, 2)` for price?**: Never use `float` or `double` for money (rounding errors occur). `DECIMAL` is exact.
*   **Columns**:
    *   `listing_type`: 'sale', 'exchange', 'both'. This supports the unique Project Requirement of "barter" (trading items).

### Table: `listing_images`
```sql
CREATE TABLE listing_images (
    ...
    listing_id INT NOT NULL,
    FOREIGN KEY (listing_id) REFERENCES marketplace_listings(id) ON DELETE CASCADE
);
```
*   **Why it exists**: We want to allow **multiple** photos (up to 5) for one item.
*   **Why a separate table?** You cannot store 5 image paths in one database cell cleanly.
*   **One-to-Many Relationship**: One Listing -> Many Images.
*   **Cascade**: If the Listing is deleted, its images are also deleted.

---

## 6. Feature: ResourceHub
Sharing study materials.

### Table: `resources`
*   **Why it exists**: Stores metadata about the PDF files (we store the actual file in a folder, and the *path* here).
*   **Links**: Connects to `courses` (Data Structures) and `users` (Who uploaded it? usually Admin).

### Table: `resource_downloads`
*   **Why it exists**: Analytics.
*   **How**: Every time a user clicks "Download", we insert a row here pairnig `user_id` and `resource_id`.
*   **Benefit**: We can count rows to see "Most Popular Resources" or "Most Active Students".

### Table: `resource_requests`
*   **Why it exists**: Students asking "Please upload PHY 101 notes".
*   **Status Workflow**: `pending` -> `approved` -> `uploaded`.

---

## 7. Feature: Section Issue (Exchange)
The unique UIU feature.

### Table: `section_exchange_posts`
*   **Why it exists**: "I have Section A, I want Section B".
*   **Columns**:
    *   `current_section` & `desired_section`: Text fields (e.g., "A", "B").
    *   `approved_by`: Links to `users` table (specifically an Admin/Mod). This audit trail shows *who* approved the post.

### Table: `section_requests` (New Section)
*   **Why it exists**: Petitioning for a brand new section if all are full.
*   **Unique Feature: Supports**:
    *   We have a separate table `section_request_supports` (Many-to-Many).
    *   **Why?** A user can only vote *once* per request.
    *   `UNIQUE KEY (request_id, user_id)`: The database enforces that User X cannot support Request Y twice.

---

## 8. Feature: Feedback
### Table: `feedback_posts`
*   **Columns**:
    *   `is_anonymous`: Boolean. If TRUE, the frontend hides the user's name, but the database *still stores the `user_id`*.
    *   **Why store ID if anonymous?** To ban users if they abuse anonymity (e.g., hate speech). System knows who they are; other users don't.

### Table: `admin_responses`
*   **Why it exists**: Allows admins to reply officially.
*   **Separation**: We didn't just add a "reply" column to `feedback_posts` because an admin might want to edit their response or add multiple notes later (extensible design).

---

## 9. Communication: Messaging
Direct chat system.

### Table: `conversations`
*   **Why it exists**: Represents the "room" between two people.
*   **Constraint**: `UNIQUE KEY (user1_id, user2_id)`.
    *   **Why?** Ensures there is only **one** distinct chat thread between John and Jane. They cannot have 5 different conversation threads; they just keep adding messages to the existing one.

### Table: `messages`
*   **Why it exists**: The individual text bubbles.
*   **Links**: Belongs to a `conversation`.

---

## 10. System: Notifications & Settings
### Table: `notifications`
*   **Why it exists**: To alert users.
*   **Polymorphic-like behavior**:
    *   `link`: A generic text field (e.g., `/marketplace/item/5`).
    *   **Why?** A notification can lead to a Post, a Message, or a Resource. We store the URL so the frontend knows where to redirect the user on click.

### Table: `system_settings`
```sql
CREATE TABLE system_settings (
    setting_key VARCHAR(50) UNIQUE,
    setting_value TEXT
);
```
*   **Why it exists**: To toggle features without changing code.
*   **Example**: `section_issue_enabled = 'false'`. The Admin Panel reads this. If false, it hides the "Section Exchange" button from the menu.

---

## Summary of Key Concepts
1.  **Normalization**: We separated repetitive data (Departments, Categories) into their own tables to avoid typos and make updates easy (cleaner data).
2.  **Foreign Keys**: We heavily use `FOREIGN KEY` to ensure **Referential Integrity**. (You can't sell an item for a "Ghost" user).
3.  **Cascading Deletes**: We use `ON DELETE CASCADE` for child content (Images, Messages, Posts) so that deleting a parent (User, Listing) automatically cleans up the mess.
4.  **Indexes**: You'll see `CREATE INDEX` at the bottom of the SQL. These make searching (by email, by status, by category) fast, even with thousands of users.
