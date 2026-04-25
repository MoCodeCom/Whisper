-- ─────────────────────────────────────────────────────────────────────────
--  WISBER — MySQL Database Schema
--  Messages are NOT stored here. They live on each device only.
-- ─────────────────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS wisber CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wisber;

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  phone         VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(100)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  avatar_url    TEXT          DEFAULT NULL,
  status        VARCHAR(150)  DEFAULT 'Hey, I am using Wisber!',
  language      VARCHAR(10)   DEFAULT 'en',
  language_name VARCHAR(50)   DEFAULT 'English',
  gender        ENUM('male','female','other') DEFAULT 'male',
  role          ENUM('user','admin','superadmin','banned') DEFAULT 'user',
  is_online     TINYINT(1)    DEFAULT 0,
  last_seen     DATETIME      DEFAULT NULL,
  created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Refresh Tokens ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  user_id    CHAR(36)     NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME     NOT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Push Notification Tokens ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS push_tokens (
  id         CHAR(36)  NOT NULL PRIMARY KEY,
  user_id    CHAR(36)  NOT NULL,
  token      TEXT      NOT NULL,
  platform   ENUM('ios','android') NOT NULL,
  created_at DATETIME  DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Contacts (per-user address book) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  owner_id   CHAR(36)     NOT NULL,
  contact_id CHAR(36)     NOT NULL,
  nickname   VARCHAR(100) DEFAULT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_contact (owner_id, contact_id),
  FOREIGN KEY (owner_id)   REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Blocked Users ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blocked_users (
  id         CHAR(36) NOT NULL PRIMARY KEY,
  blocker_id CHAR(36) NOT NULL,
  blocked_id CHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_block (blocker_id, blocked_id),
  FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Ratings (1–5 stars between users) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ratings (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  rater_id   CHAR(36)     NOT NULL,
  rated_id   CHAR(36)     NOT NULL,
  score      TINYINT      NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment    VARCHAR(500) DEFAULT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_rating (rater_id, rated_id),
  FOREIGN KEY (rater_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (rated_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Media Uploads (image URL relay only) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS media (
  id          CHAR(36)     NOT NULL PRIMARY KEY,
  uploader_id CHAR(36)     NOT NULL,
  url         TEXT         NOT NULL,
  mime_type   VARCHAR(100) DEFAULT NULL,
  size_bytes  INT          DEFAULT NULL,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Reports (moderation — no message content stored) ─────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id          CHAR(36)     NOT NULL PRIMARY KEY,
  reporter_id CHAR(36)     NOT NULL,
  reported_id CHAR(36)     NOT NULL,
  reason      VARCHAR(500) NOT NULL,
  status      ENUM('pending','reviewed','dismissed') DEFAULT 'pending',
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Pending Group Messages (offline queue for group chat) ─────────────────────
-- One row per (message × group member). Delivered + deleted when member connects.
-- Encrypted with AES-256-GCM. Expires after 30 days if member never comes back.
CREATE TABLE IF NOT EXISTS pending_group_messages (
  id                CHAR(36)    NOT NULL PRIMARY KEY,
  group_id          CHAR(36)    NOT NULL,
  message_id        CHAR(36)    NOT NULL,
  sender_id         CHAR(36)    NOT NULL,
  receiver_id       CHAR(36)    NOT NULL,
  encrypted_content LONGTEXT    NOT NULL,
  message_type      ENUM('text','image','audio','file') NOT NULL DEFAULT 'text',
  sent_at           DATETIME    NOT NULL,
  expires_at        DATETIME    NOT NULL,
  created_at        DATETIME    DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_pgm_msg_receiver (message_id, receiver_id),
  FOREIGN KEY (group_id)    REFERENCES groups(id)  ON DELETE CASCADE,
  FOREIGN KEY (sender_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_users_phone         ON users(phone);
CREATE INDEX idx_contacts_owner      ON contacts(owner_id);
CREATE INDEX idx_contacts_contact    ON contacts(contact_id);
CREATE INDEX idx_ratings_rated       ON ratings(rated_id);
CREATE INDEX idx_push_tokens_user    ON push_tokens(user_id);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_reports_status      ON reports(status);
CREATE INDEX idx_pgm_receiver        ON pending_group_messages(receiver_id);
CREATE INDEX idx_pgm_expires         ON pending_group_messages(expires_at);
