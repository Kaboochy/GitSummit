# GitHub Commit Tracker Database Schema

## Overview
This document defines the database structure for the GitHub Commit Tracker system.
The system tracks users, their projects, daily commit activity, notifications, and score history.

---

## Users

| Column | Type | Description |
|---|---|---|
| user_id | INT (PK, AUTO_INCREMENT) | Unique user identifier |
| github_username | VARCHAR(100) UNIQUE NOT NULL | GitHub handle |
| github_email | VARCHAR(255) | GitHub email |
| timezone | VARCHAR(50) | User timezone (e.g., America/New_York) |
| reminder_time | TIME | Time of day to send notification |
| score | INT DEFAULT 0 | Cumulative score |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update time |

---

## Projects

| Column | Type | Description |
|---|---|---|
| project_id | INT (PK, AUTO_INCREMENT) | Unique project identifier |
| user_id | INT (FK) NOT NULL | References Users.user_id |
| repo_name | VARCHAR(255) NOT NULL | Repository name |
| github_repo_id | BIGINT | GitHub repo ID |
| webhook_url | VARCHAR(255) | Webhook URL for updates |
| score_per_commit | INT DEFAULT 1 | Points per commit |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Foreign Key**
- user_id → Users(user_id) ON DELETE CASCADE

---

## DailyCommits

| Column | Type | Description |
|---|---|---|
| daily_id | INT (PK, AUTO_INCREMENT) | Unique daily record |
| user_id | INT (FK) NOT NULL | References Users.user_id |
| project_id | INT (FK) NOT NULL | References Projects.project_id |
| date | DATE NOT NULL | Commit date |
| commit_count | INT DEFAULT 0 | Number of commits that day |

**Foreign Keys**
- user_id → Users(user_id) ON DELETE CASCADE  
- project_id → Projects(project_id) ON DELETE CASCADE  

---

## Notifications

| Column | Type | Description |
|---|---|---|
| notification_id | INT (PK, AUTO_INCREMENT) | Notification identifier |
| user_id | INT (FK) NOT NULL | References Users.user_id |
| project_id | INT (FK, NULL) | Optional project reference |
| type | VARCHAR(50) | e.g., daily_reminder, score_update |
| status | VARCHAR(20) DEFAULT 'pending' | pending, sent, failed |
| sent_at | TIMESTAMP NULL | When notification was sent |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | Creation time |

**Foreign Keys**
- user_id → Users(user_id) ON DELETE CASCADE  
- project_id → Projects(project_id) ON DELETE SET NULL  

---

## ScoreHistory

| Column | Type | Description |
|---|---|---|
| history_id | INT (PK, AUTO_INCREMENT) | History record ID |
| user_id | INT (FK) NOT NULL | References Users.user_id |
| project_id | INT (FK, NULL) | Related project |
| score_change | INT NOT NULL | Score change amount |
| reason | VARCHAR(255) | e.g., commit, manual adjustment |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | Record creation time |

**Foreign Keys**
- user_id → Users(user_id)  
- project_id → Projects(project_id)  

---

## Notes
- All timestamps use server time unless otherwise configured.
- Cascade rules ensure cleanup when users or projects are deleted.
- Score tracking is separated into ScoreHistory for auditability.
