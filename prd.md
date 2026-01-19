# UIU Social Network - Product Requirements Document (PRD)

> **Project Name:** UIU Social Network  
> **Version:** 1.0  
> **Last Updated:** 2026-01-07  
> **Status:** Planning Phase

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Epic 1: Authentication & User Management](#epic-1-authentication--user-management)
5. [Epic 2: Lost & Found Module](#epic-2-lost--found-module)
6. [Epic 3: Marketplace Module](#epic-3-marketplace-module)
7. [Epic 4: ResourceHub Module](#epic-4-resourcehub-module)
8. [Epic 5: Section Issue Module](#epic-5-section-issue-module)
9. [Epic 6: Feedback & Reviews Module](#epic-6-feedback--reviews-module)
10. [Epic 7: Messaging System](#epic-7-messaging-system)
11. [Epic 8: Notification System](#epic-8-notification-system)
12. [Epic 9: Admin Panel](#epic-9-admin-panel)
13. [Database Schema Overview](#database-schema-overview)
14. [UI/UX Guidelines](#uiux-guidelines)

---

## Project Overview

### Description
UIU Social Network is a dedicated social networking platform exclusively for United International University (UIU) students. The platform provides features like Lost & Found item tracking, a student marketplace, resource sharing hub, section exchange management, and feedback systems.

### Key Features
- **Lost & Found**: Track and recover lost ID cards and items
- **Marketplace**: Buy, sell, and exchange items among students
- **ResourceHub**: Access course materials (PDFs) organized by department/course/trimester
- **Section Issue**: Exchange sections or request new sections (admin-controlled visibility)
- **Feedback & Reviews**: General issues and canteen/food feedback with moderation

### Access Control
- Only students with `@uiu.ac.bd` email domain can register
- Runs on localhost (local MySQL server)

---

## Tech Stack

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Vanilla CSS (no Tailwind)
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Routing**: React Router DOM

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **File Upload**: Multer

### Database
- **DBMS**: MySQL (local server)
- **ORM**: None (raw SQL queries for learning/control)

### File Storage
- **Type**: Local file system
- **Location**: `/uploads` directory within project

---

## User Roles & Permissions

### Role Hierarchy
1. **Admin** - Full system access (you)
2. **Moderator** - Content moderation capabilities (selected students)
3. **Student** - Regular user access

### Permission Matrix

| Feature | Admin | Moderator | Student |
|---------|-------|-----------|---------|
| Manage Users | Yes | No | No |
| Approve Posts | Yes | Yes | No |
| Delete Any Post | Yes | Yes | No |
| Upload Resources | Yes | No | No |
| Toggle Section Issue | Yes | No | No |
| Assign Moderators | Yes | No | No |
| Create Posts | Yes | Yes | Yes |
| Send Messages | Yes | Yes | Yes |
| View All Content | Yes | Yes | Yes |
| Respond to Feedback | Yes | No | No |
| Manage Courses List | Yes | No | No |

---

## Epic 1: Authentication & User Management

### Description
Complete user authentication system with university email validation, profile management, and role-based access control.

---

### Story 1.1: User Registration
**As a** UIU student  
**I want to** register on the platform using my university email  
**So that** I can access the social network features

#### Acceptance Criteria
- User can only register with `@uiu.ac.bd` email domain
- Registration form collects: full name, student ID, email, password, department, batch/year
- Password must be at least 8 characters with letters and numbers
- Email verification is sent before account activation
- Student ID must be unique in the system

#### Tasks
- [ ] Task 1.1.1: Create registration API endpoint (`POST /api/auth/register`)
- [ ] Task 1.1.2: Implement email domain validation (must end with @uiu.ac.bd)
- [ ] Task 1.1.3: Create email verification token system
- [ ] Task 1.1.4: Design and build registration form UI
- [ ] Task 1.1.5: Add client-side form validation
- [ ] Task 1.1.6: Create email sending service for verification
- [ ] Task 1.1.7: Create users table in database

---

### Story 1.2: User Login
**As a** registered user  
**I want to** log in to my account  
**So that** I can access the platform features

#### Acceptance Criteria
- User can log in with email and password
- JWT token is issued upon successful login
- Invalid credentials show appropriate error message
- Session persists across page refreshes

#### Tasks
- [ ] Task 1.2.1: Create login API endpoint (`POST /api/auth/login`)
- [ ] Task 1.2.2: Implement JWT token generation and validation
- [ ] Task 1.2.3: Design and build login form UI
- [/] Task 1.2.4: Implement protected routes on frontend
- [x] Task 1.2.5: Store and manage JWT in localStorage/cookies

---

### Story 1.3: Password Recovery
**As a** user who forgot my password
**I want to** reset my password via email
**So that** I can regain access to my account

#### Acceptance Criteria
- User can request password reset by entering email
- Reset link is sent to registered email
- Reset link expires after 1 hour
- User can set new password using the link

#### Tasks
- [x] Task 1.3.1: Create forgot password API (`POST /api/auth/forgot-password`)
- [x] Task 1.3.2: Create reset password API (`POST /api/auth/reset-password`)
- [x] Task 1.3.3: Generate secure reset tokens with expiration
- [x] Task 1.3.4: Build forgot password UI form
- [x] Task 1.3.5: Build reset password UI form

---

### Story 1.4: User Profile Management
**As a** registered user  
**I want to** view and edit my profile  
**So that** I can keep my information up to date

#### Acceptance Criteria
- User can view their profile with all information
- User can edit: name, department, batch, contact info, profile picture
- User cannot edit: email, student ID (immutable)
- Profile picture upload (max 2MB, jpg/png only)

#### Tasks
- [x] Task 1.4.1: Create get profile API (`GET /api/users/profile`)
- [x] Task 1.4.2: Create update profile API (`PUT /api/users/profile`)
- [x] Task 1.4.3: Implement profile picture upload with Multer
- [x] Task 1.4.4: Build profile view page UI
- [x] Task 1.4.5: Build profile edit form UI
- [x] Task 1.4.6: Add image preview before upload

---

### Story 1.5: User Logout
**As a** logged-in user  
**I want to** log out of my account  
**So that** I can secure my session

#### Acceptance Criteria
- Logout clears JWT from storage
- User is redirected to login page
- All protected routes become inaccessible

#### Tasks
- [/] Task 1.5.1: Implement logout functionality on frontend
- [/] Task 1.5.2: Clear auth tokens and user state
- [/] Task 1.5.3: Add logout button to navigation

---

## Epic 2: Lost & Found Module

### Description
System for posting, tracking, and claiming lost items including ID cards and general items with status tracking and direct messaging for claims.

---

### Story 2.1: Post Lost Item
**As a** student  
**I want to** post about an item I lost  
**So that** someone who finds it can contact me

#### Acceptance Criteria
- User can select category: "ID Card" or "Item"
- For ID Card: capture name on card, student ID, department, location lost, date
- For Item: capture item name, description, subcategory, location lost, date, image(optional)
- Post status defaults to "Lost"
- Post has expiration date (30 days)

#### Tasks
- [ ] Task 2.1.1: Create lost_found_posts table in database
- [ ] Task 2.1.2: Create lost_found_categories table (ID Card, Items with subcategories)
- [ ] Task 2.1.3: Create post lost item API (`POST /api/lost-found`)
- [ ] Task 2.1.4: Build post lost item form UI
- [ ] Task 2.1.5: Implement image upload for items
- [ ] Task 2.1.6: Add form validation

---

### Story 2.2: Post Found Item
**As a** student  
**I want to** post about an item I found  
**So that** the owner can contact me to claim it

#### Acceptance Criteria
- Same fields as lost item but status is "Found"
- User specifies where item can be collected
- Contact information shown to potential owners

#### Tasks
- [ ] Task 2.2.1: Extend post API to handle found items
- [ ] Task 2.2.2: Build post found item form UI
- [ ] Task 2.2.3: Add collection location field

---

### Story 2.3: Lost & Found Feed
**As a** student  
**I want to** browse lost and found items  
**So that** I can find my lost items or help others find theirs

#### Acceptance Criteria
- Feed shows all active lost/found posts
- Filter by category (ID Card/Items), status (Lost/Found), date
- Search by item name or description
- Pagination for large number of posts
- Show post age (e.g., "2 hours ago")

#### Tasks
- [ ] Task 2.3.1: Create get all posts API (`GET /api/lost-found`)
- [ ] Task 2.3.2: Implement filtering and search on API
- [ ] Task 2.3.3: Build lost & found feed page UI
- [ ] Task 2.3.4: Add filter/search UI components
- [ ] Task 2.3.5: Implement pagination
- [ ] Task 2.3.6: Add relative time display

---

### Story 2.4: Item Details Page
**As a** student  
**I want to** view details of a specific lost/found item  
**So that** I can determine if it's mine or help identify the owner

#### Acceptance Criteria
- Show all item details including images
- Show poster's contact info and profile
- Button to send direct message to poster
- If owner: show edit and delete options
- Show current status

#### Tasks
- [ ] Task 2.4.1: Create get single post API (`GET /api/lost-found/:id`)
- [ ] Task 2.4.2: Build item details page UI
- [ ] Task 2.4.3: Add messaging integration button
- [ ] Task 2.4.4: Add edit/delete buttons for owner

---

### Story 2.5: Claim/Update Item Status
**As a** post owner  
**I want to** update the status of my post  
**So that** others know the item has been claimed/returned

#### Acceptance Criteria
- Owner can change status: Lost → Found → Claimed → Returned
- Status change reflects immediately in feed
- Claimed/Returned items can be hidden from main feed

#### Tasks
- [ ] Task 2.5.1: Create update status API (`PATCH /api/lost-found/:id/status`)
- [ ] Task 2.5.2: Add status update UI on item details page
- [ ] Task 2.5.3: Update feed to handle status filtering

---

### Story 2.6: My Lost & Found Posts
**As a** student  
**I want to** view all my lost/found posts  
**So that** I can manage them

#### Acceptance Criteria
- See list of all my posts with status
- Edit any of my posts
- Delete any of my posts
- Filter by status

#### Tasks
- [ ] Task 2.6.1: Create my posts API (`GET /api/lost-found/my-posts`)
- [ ] Task 2.6.2: Create delete post API (`DELETE /api/lost-found/:id`)
- [ ] Task 2.6.3: Create update post API (`PUT /api/lost-found/:id`)
- [ ] Task 2.6.4: Build my posts management page UI

---

### Story 2.7: Post Expiration System
**As a** system  
**I want to** automatically expire old posts  
**So that** the feed remains relevant

#### Acceptance Criteria
- Posts expire after 30 days by default
- Expired posts are hidden from main feed
- Owner can renew expired posts
- Notification sent before expiration (3 days)

#### Tasks
- [ ] Task 2.7.1: Add expiration_date field to posts table
- [ ] Task 2.7.2: Create scheduled job to check expiration
- [ ] Task 2.7.3: Create renew post API (`PATCH /api/lost-found/:id/renew`)
- [ ] Task 2.7.4: Integrate with notification system

---

## Epic 3: Marketplace Module

### Description
A platform for students to buy, sell, and exchange items with pricing, categorization, and status management.

---

### Story 3.1: Create Marketplace Listing
**As a** student  
**I want to** list an item for sale or exchange  
**So that** other students can buy or exchange with me

#### Acceptance Criteria
- Listing includes: title, description, category, price, condition, images (up to 5)
- Option to mark as "For Sale", "For Exchange", or "Both"
- For exchange: specify what items are wanted in exchange
- Price can be set or marked as "Negotiable"

#### Tasks
- [ ] Task 3.1.1: Create marketplace_listings table
- [ ] Task 3.1.2: Create marketplace_categories table
- [ ] Task 3.1.3: Create listing images table
- [ ] Task 3.1.4: Create post listing API (`POST /api/marketplace`)
- [ ] Task 3.1.5: Build create listing form UI with multi-image upload
- [ ] Task 3.1.6: Add condition selector (New, Like New, Good, Fair)

---

### Story 3.2: Browse Marketplace
**As a** student  
**I want to** browse marketplace listings  
**So that** I can find items to buy or exchange

#### Acceptance Criteria
- Grid/list view of listings with thumbnail, title, price
- Filter by category, price range, condition, listing type
- Search by title or description
- Sort by date, price (low-high, high-low)
- Pagination

#### Tasks
- [ ] Task 3.2.1: Create get listings API (`GET /api/marketplace`)
- [ ] Task 3.2.2: Implement search and filter on API
- [ ] Task 3.2.3: Build marketplace browse page UI
- [ ] Task 3.2.4: Add filter sidebar/modal
- [ ] Task 3.2.5: Implement grid/list view toggle
- [ ] Task 3.2.6: Add pagination

---

### Story 3.3: Listing Details Page
**As a** student  
**I want to** view full details of a listing  
**So that** I can decide whether to buy/exchange

#### Acceptance Criteria
- Show all images in carousel/gallery
- Show full description, price, seller info
- Show seller's other listings
- Button to message seller
- If owner: edit and delete options

#### Tasks
- [ ] Task 3.3.1: Create get single listing API (`GET /api/marketplace/:id`)
- [ ] Task 3.3.2: Build listing details page UI
- [ ] Task 3.3.3: Implement image carousel
- [ ] Task 3.3.4: Add seller profile section
- [ ] Task 3.3.5: Add contact seller button

---

### Story 3.4: Manage My Listings
**As a** seller  
**I want to** manage my listings  
**So that** I can update or remove them

#### Acceptance Criteria
- View all my listings
- Edit listing details
- Mark as "Sold" or "Exchanged"
- Delete listing
- Renew expired listings

#### Tasks
- [ ] Task 3.4.1: Create my listings API (`GET /api/marketplace/my-listings`)
- [ ] Task 3.4.2: Create update listing API (`PUT /api/marketplace/:id`)
- [ ] Task 3.4.3: Create delete listing API (`DELETE /api/marketplace/:id`)
- [ ] Task 3.4.4: Create mark as sold API (`PATCH /api/marketplace/:id/status`)
- [ ] Task 3.4.5: Build my listings management page UI

---

### Story 3.5: Marketplace Categories
**As an** admin  
**I want to** manage marketplace categories  
**So that** listings are well-organized

#### Acceptance Criteria
- Predefined categories: Books, Electronics, Clothing, Accessories, Stationery, Others
- Admin can add/edit/delete categories
- Categories have icons

#### Tasks
- [ ] Task 3.5.1: Seed initial categories
- [ ] Task 3.5.2: Create category management APIs (admin only)
- [ ] Task 3.5.3: Build category management UI in admin panel

---

## Epic 4: ResourceHub Module

### Description
A centralized repository for course materials (PDFs) organized by department, course, and trimester. Only admin can upload; students can download and request resources.

---

### Story 4.1: Browse Resources
**As a** student  
**I want to** browse available resources  
**So that** I can find study materials for my courses

#### Acceptance Criteria
- Navigate by Department → Course → Trimester
- See list of available PDFs with name, upload date, download count
- Search resources by name or course
- Preview PDF title and size before download

#### Tasks
- [ ] Task 4.1.1: Create departments table
- [ ] Task 4.1.2: Create courses table (with department_id, trimester)
- [ ] Task 4.1.3: Create resources table
- [ ] Task 4.1.4: Create get resources API with filters (`GET /api/resources`)
- [ ] Task 4.1.5: Build resource browser UI with tree navigation
- [ ] Task 4.1.6: Add search functionality

---

### Story 4.2: Download Resource
**As a** student  
**I want to** download a resource  
**So that** I can study offline

#### Acceptance Criteria
- Click to download PDF
- Download count increments
- Track who downloaded (for admin analytics)

#### Tasks
- [ ] Task 4.2.1: Create download API (`GET /api/resources/:id/download`)
- [ ] Task 4.2.2: Create resource_downloads tracking table
- [ ] Task 4.2.3: Implement download tracking
- [ ] Task 4.2.4: Add download button to resource list

---

### Story 4.3: Request Resource
**As a** student  
**I want to** request a resource to be uploaded  
**So that** admin can add materials I need

#### Acceptance Criteria
- Submit formal request with: resource name, course, trimester, description
- See status of my requests (Pending, Approved, Rejected, Uploaded)
- Get notified when request is processed

#### Tasks
- [ ] Task 4.3.1: Create resource_requests table
- [ ] Task 4.3.2: Create submit request API (`POST /api/resources/requests`)
- [ ] Task 4.3.3: Create my requests API (`GET /api/resources/requests/my-requests`)
- [ ] Task 4.3.4: Build request form UI
- [ ] Task 4.3.5: Build my requests page UI

---

### Story 4.4: Admin - Upload Resource
**As an** admin  
**I want to** upload resources  
**So that** students can access study materials

#### Acceptance Criteria
- Select department, course, trimester
- Upload PDF file (max 50MB)
- Add title and description
- Resource immediately available to students

#### Tasks
- [ ] Task 4.4.1: Create upload resource API (`POST /api/resources`) - admin only
- [ ] Task 4.4.2: Configure Multer for PDF uploads
- [ ] Task 4.4.3: Build upload form in admin panel
- [ ] Task 4.4.4: Add progress indicator for large files

---

### Story 4.5: Admin - Manage Requests
**As an** admin  
**I want to** manage resource requests  
**So that** I can fulfill student needs

#### Acceptance Criteria
- View all pending requests
- Approve or reject with reason
- Link uploaded resource to request
- Auto-notify student on status change

#### Tasks
- [ ] Task 4.5.1: Create get all requests API (`GET /api/resources/requests`) - admin only
- [ ] Task 4.5.2: Create update request status API (`PATCH /api/resources/requests/:id`)
- [ ] Task 4.5.3: Build request management UI in admin panel

---

### Story 4.6: Admin - Manage Courses
**As an** admin  
**I want to** manage the course list  
**So that** resources are properly organized

#### Acceptance Criteria
- Add new courses with department and trimester
- Edit course details
- Delete courses (only if no resources linked)
- Import courses from CSV (future enhancement)

#### Tasks
- [ ] Task 4.6.1: Create course CRUD APIs (admin only)
- [ ] Task 4.6.2: Build course management UI in admin panel
- [ ] Task 4.6.3: Seed initial department and course data

---

## Epic 5: Section Issue Module

### Description
Temporary feature (admin-toggleable) for section exchange and new section requests. Students can post exchange offers and communicate with interested parties.

---

### Story 5.1: Admin - Toggle Section Issue Feature
**As an** admin  
**I want to** enable/disable the Section Issue feature  
**So that** it's only available during relevant periods

#### Acceptance Criteria
- Toggle on/off from admin panel
- When off: navigation hidden, existing posts hidden
- When on: feature fully accessible
- Setting persists across server restarts

#### Tasks
- [ ] Task 5.1.1: Create system_settings table
- [ ] Task 5.1.2: Create toggle API (`PATCH /api/admin/settings/section-issue`)
- [ ] Task 5.1.3: Create get settings API (`GET /api/settings`)
- [ ] Task 5.1.4: Add toggle switch in admin panel
- [ ] Task 5.1.5: Implement conditional navigation rendering

---

### Story 5.2: Post Section Exchange Request
**As a** student  
**I want to** post a section exchange request  
**So that** I can find someone to swap sections with

#### Acceptance Criteria
- Select course from predefined list
- Specify current section and desired section
- Add optional note/reason
- Post requires admin/moderator approval
- Get notified when approved/rejected

#### Tasks
- [ ] Task 5.2.1: Create section_exchange_posts table
- [ ] Task 5.2.2: Create post exchange API (`POST /api/section-issue/exchange`)
- [ ] Task 5.2.3: Build exchange post form UI
- [ ] Task 5.2.4: Implement course dropdown from predefined list

---

### Story 5.3: Browse Section Exchange Posts
**As a** student  
**I want to** browse section exchange posts  
**So that** I can find a matching exchange partner

#### Acceptance Criteria
- See approved posts only
- Filter by course
- Search functionality
- See poster contact for messaging

#### Tasks
- [ ] Task 5.3.1: Create get exchange posts API (`GET /api/section-issue/exchange`)
- [ ] Task 5.3.2: Build exchange posts feed UI
- [ ] Task 5.3.3: Add filter by course

---

### Story 5.4: Post New Section Request
**As a** student  
**I want to** request creation of a new section  
**So that** the university can consider it

#### Acceptance Criteria
- Select course from predefined list
- Specify desired section name/number
- Add reason/justification
- Show number of supporters
- Requires approval before visible

#### Tasks
- [ ] Task 5.4.1: Create section_requests table
- [ ] Task 5.4.2: Create post request API (`POST /api/section-issue/new-section`)
- [ ] Task 5.4.3: Build request form UI

---

### Story 5.5: Support New Section Request
**As a** student  
**I want to** support an existing new section request  
**So that** my voice is counted

#### Acceptance Criteria
- "Support" button on each request
- User can only support once per request
- Show total support count
- User can withdraw support

#### Tasks
- [ ] Task 5.5.1: Create section_request_supports table
- [ ] Task 5.5.2: Create toggle support API (`POST /api/section-issue/new-section/:id/support`)
- [ ] Task 5.5.3: Add support button to UI

---

### Story 5.6: Moderator - Approve Section Posts
**As a** moderator  
**I want to** approve or reject section-related posts  
**So that** only valid requests are visible

#### Acceptance Criteria
- See queue of pending posts
- Approve or reject with reason
- Notify poster of decision

#### Tasks
- [ ] Task 5.6.1: Create moderation queue API (`GET /api/section-issue/pending`) - mod only
- [ ] Task 5.6.2: Create approve/reject API (`PATCH /api/section-issue/:type/:id/status`)
- [ ] Task 5.6.3: Build moderation queue UI

---

## Epic 6: Feedback & Reviews Module

### Description
Platform for students to share feedback on general university issues and canteen/food with anonymity option and admin moderation.

---

### Story 6.1: Post General Issue
**As a** student  
**I want to** post about a general university issue  
**So that** it can be discussed and addressed

#### Acceptance Criteria
- Text-only post (no images)
- Option to post anonymously
- Requires moderator approval
- Add title and description

#### Tasks
- [ ] Task 6.1.1: Create feedback_posts table
- [ ] Task 6.1.2: Create post feedback API (`POST /api/feedback/general`)
- [ ] Task 6.1.3: Build general issue form UI
- [ ] Task 6.1.4: Add anonymity toggle

---

### Story 6.2: Post Canteen/Food Feedback
**As a** student  
**I want to** post feedback about canteen/food  
**So that** improvements can be made

#### Acceptance Criteria
- Text + image support
- Option to post anonymously
- Requires moderator approval
- Can upload up to 3 images

#### Tasks
- [ ] Task 6.2.1: Extend feedback_posts table for images
- [ ] Task 6.2.2: Create post API (`POST /api/feedback/canteen`)
- [ ] Task 6.2.3: Build canteen feedback form UI with image upload

---

### Story 6.3: Browse Feedback Posts
**As a** student  
**I want to** browse feedback posts  
**So that** I can see issues others have raised

#### Acceptance Criteria
- Two tabs/sections: General Issues, Canteen/Food
- See approved posts only
- Anonymous posts show "Anonymous" as author
- Pagination

#### Tasks
- [ ] Task 6.3.1: Create get feedback API (`GET /api/feedback`)
- [ ] Task 6.3.2: Build feedback feed UI with tabs
- [ ] Task 6.3.3: Add pagination

---

### Story 6.4: Moderator - Approve Feedback
**As a** moderator  
**I want to** approve or reject feedback posts  
**So that** inappropriate content is filtered

#### Acceptance Criteria
- See pending posts queue
- Approve or reject with reason
- Auto-notify poster

#### Tasks
- [ ] Task 6.4.1: Create pending feedback API (`GET /api/feedback/pending`) - mod only
- [ ] Task 6.4.2: Create approve/reject API (`PATCH /api/feedback/:id/status`)
- [ ] Task 6.4.3: Build moderation UI

---

### Story 6.5: Admin - Respond to Feedback
**As an** admin  
**I want to** officially respond to feedback  
**So that** students know their concerns are heard

#### Acceptance Criteria
- Add official response to any feedback post
- Response marked with "Admin Response" badge
- Poster gets notified
- Response visible to all users

#### Tasks
- [ ] Task 6.5.1: Create admin_responses table
- [ ] Task 6.5.2: Create respond API (`POST /api/feedback/:id/respond`) - admin only
- [ ] Task 6.5.3: Display admin response in feedback detail view

---

## Epic 7: Messaging System

### Description
In-app direct messaging system for users to communicate regarding posts, items, and exchanges.

---

### Story 7.1: Start Conversation
**As a** student  
**I want to** start a conversation with another user  
**So that** we can discuss details privately

#### Acceptance Criteria
- Click "Message" on any post or profile
- Creates new conversation if none exists
- Opens existing conversation if exists
- First message sent with conversation creation

#### Tasks
- [ ] Task 7.1.1: Create conversations table
- [ ] Task 7.1.2: Create messages table
- [ ] Task 7.1.3: Create start conversation API (`POST /api/messages/conversations`)
- [ ] Task 7.1.4: Add "Message" button to relevant pages

---

### Story 7.2: View Conversations
**As a** student  
**I want to** see all my conversations  
**So that** I can manage my communications

#### Acceptance Criteria
- List of conversations with other user's name/pic
- Show last message preview
- Show unread count
- Sort by most recent

#### Tasks
- [ ] Task 7.2.1: Create get conversations API (`GET /api/messages/conversations`)
- [ ] Task 7.2.2: Build conversations list UI
- [ ] Task 7.2.3: Show unread badges

---

### Story 7.3: Send/Receive Messages
**As a** student  
**I want to** send and receive messages in a conversation  
**So that** I can communicate in real-time

#### Acceptance Criteria
- See message history in conversation
- Send new messages
- Messages show timestamp
- Mark messages as read when viewed
- Poll for new messages (real-time can be future enhancement)

#### Tasks
- [ ] Task 7.3.1: Create send message API (`POST /api/messages/:conversationId`)
- [ ] Task 7.3.2: Create get messages API (`GET /api/messages/:conversationId`)
- [ ] Task 7.3.3: Create mark as read API (`PATCH /api/messages/:conversationId/read`)
- [ ] Task 7.3.4: Build conversation view UI
- [ ] Task 7.3.5: Implement message polling (or WebSocket later)

---

## Epic 8: Notification System

### Description
In-app notification system to keep users informed about relevant activities.

---

### Story 8.1: Receive Notifications
**As a** user  
**I want to** receive notifications about relevant activities  
**So that** I stay informed

#### Notification Types:
- Message received
- Post approved/rejected
- Item claimed (for Lost & Found owner)
- Request status update (ResourceHub)
- Feedback response (from admin)
- Post expiring soon
- Section exchange interest

#### Tasks
- [ ] Task 8.1.1: Create notifications table
- [ ] Task 8.1.2: Create notification service/helper
- [ ] Task 8.1.3: Integrate notifications into relevant features

---

### Story 8.2: View Notifications
**As a** user  
**I want to** view my notifications  
**So that** I can see what I've missed

#### Acceptance Criteria
- Bell icon with unread count
- Dropdown/page with notification list
- Click notification to go to relevant page
- Mark as read on view

#### Tasks
- [ ] Task 8.2.1: Create get notifications API (`GET /api/notifications`)
- [ ] Task 8.2.2: Build notification dropdown UI
- [ ] Task 8.2.3: Build notifications page UI
- [ ] Task 8.2.4: Implement unread count badge

---

### Story 8.3: Mark Notifications as Read
**As a** user  
**I want to** mark notifications as read  
**So that** I know which I've seen

#### Acceptance Criteria
- Mark individual as read
- Mark all as read
- Read notifications visually distinct

#### Tasks
- [ ] Task 8.3.1: Create mark read API (`PATCH /api/notifications/:id/read`)
- [ ] Task 8.3.2: Create mark all read API (`PATCH /api/notifications/read-all`)
- [ ] Task 8.3.3: Update UI to show read/unread states

---

## Epic 9: Admin Panel

### Description
Comprehensive admin dashboard for managing users, content, settings, and analytics.

---

### Story 9.1: Admin Dashboard
**As an** admin  
**I want to** see an overview dashboard  
**So that** I can monitor platform activity

#### Acceptance Criteria
- Total users, posts, downloads stats
- Recent activity feed
- Pending approvals count
- Quick links to common actions

#### Tasks
- [ ] Task 9.1.1: Create dashboard stats API (`GET /api/admin/dashboard`)
- [ ] Task 9.1.2: Build admin dashboard UI
- [ ] Task 9.1.3: Add stat cards and quick links

---

### Story 9.2: User Management
**As an** admin  
**I want to** manage users  
**So that** I can maintain the community

#### Acceptance Criteria
- View all users with search/filter
- Assign/remove moderator role
- Suspend/unsuspend users
- View user activity

#### Tasks
- [ ] Task 9.2.1: Create get users API (`GET /api/admin/users`)
- [ ] Task 9.2.2: Create update user role API (`PATCH /api/admin/users/:id/role`)
- [ ] Task 9.2.3: Create suspend user API (`PATCH /api/admin/users/:id/suspend`)
- [ ] Task 9.2.4: Build user management UI

---

### Story 9.3: Content Moderation
**As an** admin  
**I want to** moderate all content  
**So that** the platform stays safe and relevant

#### Acceptance Criteria
- View all posts across modules
- Delete any post
- See reported content (future)
- Audit log of actions

#### Tasks
- [ ] Task 9.3.1: Create get all content API (`GET /api/admin/content`)
- [ ] Task 9.3.2: Create delete content API (`DELETE /api/admin/content/:type/:id`)
- [ ] Task 9.3.3: Build content moderation UI

---

### Story 9.4: Analytics
**As an** admin  
**I want to** view platform analytics  
**So that** I understand usage patterns

#### Acceptance Criteria
- User registration trends
- Active users count
- Popular resources (downloads)
- Post counts by category

#### Tasks
- [ ] Task 9.4.1: Create analytics APIs
- [ ] Task 9.4.2: Build analytics dashboard with charts

---

## Database Schema Overview

### Core Tables (to be detailed in schema.md)
1. **users** - User accounts with roles
2. **departments** - University departments
3. **courses** - Course list per department/trimester
4. **lost_found_posts** - Lost and found items
5. **lost_found_categories** - Categories for lost/found
6. **marketplace_listings** - Marketplace items
7. **marketplace_categories** - Marketplace categories
8. **listing_images** - Images for listings
9. **resources** - PDF resources
10. **resource_requests** - Resource upload requests
11. **resource_downloads** - Download tracking
12. **section_exchange_posts** - Section exchange posts
13. **section_requests** - New section requests
14. **section_request_supports** - Support for section requests
15. **feedback_posts** - General and canteen feedback
16. **feedback_images** - Images for food feedback
17. **admin_responses** - Admin responses to feedback
18. **conversations** - Message conversations
19. **messages** - Individual messages
20. **notifications** - User notifications
21. **system_settings** - System configuration

---

## UI/UX Guidelines

### Theme
- **Mode**: Light and Dark mode toggle
- **Colors**: Clean, professional palette - no gradients, no emojis
- **Typography**: Modern, readable fonts (Inter or similar)

### Layout
- **Responsive**: Mobile-first design, works on desktop too
- **Navigation**: Sidebar on desktop, bottom nav on mobile
- **Consistency**: Same component styles across modules

### Accessibility
- Proper contrast ratios
- Keyboard navigation
- Screen reader friendly labels

---

## Implementation Order (Recommended)

### Phase 1: Foundation
1. Database setup and schema creation
2. Authentication system (Epic 1)
3. Basic navigation and layout

### Phase 2: Core Features
4. Lost & Found module (Epic 2)
5. Messaging system (Epic 7)
6. Notification system (Epic 8)

### Phase 3: Extended Features
7. Marketplace module (Epic 3)
8. ResourceHub module (Epic 4)

### Phase 4: Advanced Features
9. Section Issue module (Epic 5)
10. Feedback & Reviews module (Epic 6)

### Phase 5: Admin & Polish
11. Admin Panel (Epic 9)
12. Final testing and polish

---

## Appendix A: API Endpoints Summary

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | User login |
| POST | /api/auth/forgot-password | Request password reset |
| POST | /api/auth/reset-password | Reset password |
| GET | /api/auth/verify/:token | Verify email |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users/profile | Get current user profile |
| PUT | /api/users/profile | Update profile |
| GET | /api/users/:id | Get user by ID |

### Lost & Found
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/lost-found | Get all posts |
| POST | /api/lost-found | Create post |
| GET | /api/lost-found/:id | Get single post |
| PUT | /api/lost-found/:id | Update post |
| DELETE | /api/lost-found/:id | Delete post |
| PATCH | /api/lost-found/:id/status | Update status |
| PATCH | /api/lost-found/:id/renew | Renew post |
| GET | /api/lost-found/my-posts | Get user's posts |

### Marketplace
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/marketplace | Get all listings |
| POST | /api/marketplace | Create listing |
| GET | /api/marketplace/:id | Get single listing |
| PUT | /api/marketplace/:id | Update listing |
| DELETE | /api/marketplace/:id | Delete listing |
| PATCH | /api/marketplace/:id/status | Mark as sold |
| GET | /api/marketplace/my-listings | Get user's listings |

### ResourceHub
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/resources | Get resources |
| POST | /api/resources | Upload resource (admin) |
| GET | /api/resources/:id/download | Download resource |
| POST | /api/resources/requests | Submit request |
| GET | /api/resources/requests | Get all requests (admin) |
| GET | /api/resources/requests/my-requests | Get user's requests |
| PATCH | /api/resources/requests/:id | Update request status (admin) |

### Section Issue
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/section-issue/exchange | Get exchange posts |
| POST | /api/section-issue/exchange | Create exchange post |
| GET | /api/section-issue/new-section | Get section requests |
| POST | /api/section-issue/new-section | Create section request |
| POST | /api/section-issue/new-section/:id/support | Toggle support |
| GET | /api/section-issue/pending | Get pending posts (mod) |
| PATCH | /api/section-issue/:type/:id/status | Approve/reject |

### Feedback
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/feedback | Get feedback posts |
| POST | /api/feedback/general | Post general issue |
| POST | /api/feedback/canteen | Post canteen feedback |
| GET | /api/feedback/pending | Get pending (mod) |
| PATCH | /api/feedback/:id/status | Approve/reject |
| POST | /api/feedback/:id/respond | Admin response |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/messages/conversations | Get conversations |
| POST | /api/messages/conversations | Start conversation |
| GET | /api/messages/:conversationId | Get messages |
| POST | /api/messages/:conversationId | Send message |
| PATCH | /api/messages/:conversationId/read | Mark as read |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notifications | Get notifications |
| PATCH | /api/notifications/:id/read | Mark as read |
| PATCH | /api/notifications/read-all | Mark all read |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/dashboard | Dashboard stats |
| GET | /api/admin/users | Get all users |
| PATCH | /api/admin/users/:id/role | Update user role |
| PATCH | /api/admin/users/:id/suspend | Suspend user |
| GET | /api/admin/content | Get all content |
| DELETE | /api/admin/content/:type/:id | Delete content |
| PATCH | /api/admin/settings/section-issue | Toggle feature |
| GET | /api/settings | Get public settings |

---

*This PRD serves as the single source of truth for the UIU Social Network project. Each epic can be implemented independently following the tasks outlined in each story.*
