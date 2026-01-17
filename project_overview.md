# UIU Social Network - Project Overview & ERD Guide

## Project Overview
**UIU Social Network** is a specialized social platform tailored for **United International University (UIU)** students. It bridges the gap between students by providing essential campus services in a unified digital space. The platform is designed to handle lost items, facilitate peer-to-peer marketplaces, share academic resources, manage course section exchanges, and streamline student feedback.

## Key Features

### 1. Authentication & User Management
*   **University-Exclusive Access**: Registration restricts access to users with `@uiu.ac.bd` email addresses, ensuring a secure and trusted community.
*   **Role-Based Access**: Supports **Students** (regular users), **Moderators** (content oversight), and **Admins** (system management).
*   **Profile System**: Students can manage their academic profiles (Batch, Department, ID).

### 2. Lost & Found Module
*   **Digital Lost & Found Box**: Students can post lost or found items.
*   **Specialized ID Card Support**: Dedicated fields for lost ID cards (Name, ID) to make searching easier.
*   **Status Tracking**: Items traverse a lifecycle: `Lost` -> `Found` -> `Claimed` -> `Returned`.

### 3. Marketplace
*   **Student-to-Student Commerce**: Buy, sell, or exchange items (books, electronics, etc.).
*   **Negotiation Friendly**: Listings can be marked as negotiable.
*   **Exchange System**: Specific support for bartering (Item X for Item Y).

### 4. ResourceHub
*   **Academic Repository**: Centralized storage for course materials (PDFs).
*   **Organized Structure**: Resources are categorized by Department -> Course -> Trimester.
*   **Request System**: Students can request specific materials, which Admins fulfill.
*   **Download Tracking**: System tracks popularity of resources.

### 5. Section Exchange (The "Section Issue" Solver)
*   **Course Section Swapping**: Students stuck in unwanted sections can find peers to swap with.
*   **New Section Requests**: Students can petition for new sections; if enough students support a request, it signals demand to the administration.
*   **Admin Control**: This feature can be toggled on/off by admins (e.g., valid only during advising week).

### 6. Feedback & Reviews
*   **Campus Voice**: A safe space for General University Issues or Canteen/Food feedback.
*   **Anonymous Option**: Encourages honest feedback without fear of backlash.
*   **Official Responses**: Admins can officially reply to feedback, closing the loop.

### 7. Communication
*   **Direct Messaging**: Real-time private conversations between students for claiming items or negotiating deals.
*   **Notifications**: Alerts for messages, post approvals, and relevant activities.

---

## Database Entities (For ERD Diagram)

Here is a breakdown of every table in the database and why it exists. Use this to draw your relationships.

### Core Users & Structure
| Table Name | Purpose | Key Relationships |
| :--- | :--- | :--- |
| **`users`** | The central entity. Stores all student/admin data. | Connects to *almost everything* (creating posts, sending messages, etc.). Belongs to a **Department**. |
| **`departments`** | Represents university departments (CSE, BBA, etc.). | Has many **Users** and **Courses**. |
| **`courses`** | List of academic courses (e.g., "Data Structure"). | Belongs to a **Department**. Linked to **Resources**, **Section Requests**, and **Exchanges**. |
| **`system_settings`** | Stores global configs (e.g., "Is Section Exchange enabled?"). | Standalone configuration table. |
| **`verification_tokens`** | Temporary tokens for email verification/password resets. | Belongs to a **User**. |

### Lost & Found Module
| Table Name | Purpose | Key Relationships |
| :--- | :--- | :--- |
| **`lost_found_posts`** | The actual post about a lost or found item. | Created by a **User**. Belongs to a **Category**. |
| **`lost_found_categories`** | Categories like "Electronics", "ID Cards". | Parent categorization for **Lost & Found Posts**. |

### Marketplace Module
| Table Name | Purpose | Key Relationships |
| :--- | :--- | :--- |
| **`marketplace_listings`** | Items for sale or exchange. | Created by a **User**. Belongs to a **Category**. |
| **`marketplace_categories`** | Categories like "Books", "Gadgets". | Categorizes **Listings**. |
| **`listing_images`** | Photos of the items. | Belongs to a **Listing**. (One listing can have multiple images). |

### ResourceHub Module
| Table Name | Purpose | Key Relationships |
| :--- | :--- | :--- |
| **`resources`** | The actual file/PDF uploaded. | Uploaded by **Admin (User)**. Belongs to a **Course**. |
| **`resource_downloads`** | Logs who downloaded what. | Links **User** and **Resource**. |
| **`resource_requests`** | Student requests for missing materials. | Created by **User**. Linked to a **Course**. Can be fulfilled by a **Resource**. |

### Section Issue Module
| Table Name | Purpose | Key Relationships |
| :--- | :--- | :--- |
| **`section_exchange_posts`** | "I have Section A, want Section B". | Created by **User**. Linked to **Course**. |
| **`section_requests`** | "We need a new section for Course X". | Created by **User**. Linked to **Course**. |
| **`section_request_supports`** | "Votes" or support for a section request. | Links **User** and **Section Request**. |

### Feedback Module
| Table Name | Purpose | Key Relationships |
| :--- | :--- | :--- |
| **`feedback_posts`** | The complaint or suggestion. | Created by **User**. Review/Status managed by **Moderator**. |
| **`feedback_images`** | Photos (e.g., bad food in canteen). | Belongs to **Feedback Post**. |
| **`admin_responses`** | Official reply from authority. | link **Admin (User)** to **Feedback Post**. |

### Communication & System
| Table Name | Purpose | Key Relationships |
| :--- | :--- | :--- |
| **`conversations`** | A chat thread between two people. | Links **User 1** and **User 2**. |
| **`messages`** | Individual text bubbles in a chat. | Belongs to a **Conversation**. Sent by a **User**. |
| **`notifications`** | Alerts for a user. | Belongs to a **User**. |

## ERD Drawing Tips
1.  **Central Hub**: Draw `USERS` in the middle; almost everything connects to it.
2.  **Academic Cluster**: Group `DEPARTMENTS` and `COURSES` together.
3.  **Modules**: Group tables by their module (e.g., keep all Marketplace tables together) to avoid a messy spiderweb.
4.  **Connectors**:
    *   **One-to-Many**: A User has many Posts. A Course has many Resources.
    *   **Many-to-Many**: (Often hidden in bridging tables) e.g., Users support Section Requests (via `section_request_supports`).
