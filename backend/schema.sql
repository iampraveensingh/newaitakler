-- ============================================================
-- Expressive Voice — MySQL Database Schema
-- Generated for Express + MySQL2 migration from Base44
-- ============================================================

CREATE DATABASE IF NOT EXISTS `expressive_voice`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `expressive_voice`;

-- ─────────────────────────────────────────────────────────────
-- PLANS (Base plan definitions with priority)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `plans` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`        VARCHAR(50)  NOT NULL UNIQUE,
  `priority`    INT          NOT NULL DEFAULT 0,
  `description` VARCHAR(255) NULL,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_plans_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default plans
INSERT IGNORE INTO `plans` (`name`, `priority`, `description`) VALUES
  ('FE',     10, 'Front End / Starter'),
  ('XTREME', 20, 'Extreme / Top Tier'),
  ('PRO',    30, 'Pro Upgrade');


-- ─────────────────────────────────────────────────────────────
-- PLAN_LIMITS (Per-plan feature limits)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `plan_limits` (
  `id`              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `plan_id`         VARCHAR(50)  NOT NULL,
  `credits`         INT          NOT NULL DEFAULT 1000  COMMENT 'Voiceover credits per month',
  `clones`          INT          NOT NULL DEFAULT 3     COMMENT 'Voice clones per month',
  `vsl`             INT          NOT NULL DEFAULT 10    COMMENT 'VSL scripts per month',
  `ad`              INT          NOT NULL DEFAULT 15    COMMENT 'Ad copies per month',
  `custom`          INT          NOT NULL DEFAULT 2     COMMENT 'Custom voices per month',
  `transcriptions`  INT          NOT NULL DEFAULT 10    COMMENT 'Transcriptions per month',
  `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_plan_limits_plan_id` (`plan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `plan_limits` (`plan_id`, `credits`, `clones`, `vsl`, `ad`, `custom`, `transcriptions`) VALUES
  ('FE',     1000, 3,   10,  15, 2,  10),
  ('PRO',    5000, 10,  50,  50, 10, 50),
  ('XTREME', 9999, 99, 999, 999, 99, 999);


-- ─────────────────────────────────────────────────────────────
-- PRODUCT_ENTITLEMENTS (Maps product IDs from ProWebVentures)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `product_entitlements` (
  `id`               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_id`       VARCHAR(100) NOT NULL UNIQUE,
  `entitlement_type` ENUM('LOGIN_PLAN','ADDON') NOT NULL,
  `code`             VARCHAR(100) NOT NULL COMMENT 'Plan name or addon key e.g. FE, unlimited, agency',
  `description`      VARCHAR(255) NULL,
  `created_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_pe_product_id` (`product_id`),
  INDEX `idx_pe_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─────────────────────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id`                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username`             VARCHAR(100) NOT NULL UNIQUE,
  `email`                VARCHAR(255) NULL,
  `full_name`            VARCHAR(255) NULL,
  `password_hash`        VARCHAR(255) NULL COMMENT 'Bcrypt hash (optional if external auth only)',
  `role`                 ENUM('admin','user') NOT NULL DEFAULT 'user',
  `base_plan`            VARCHAR(50)  NOT NULL DEFAULT 'FE',
  `addons`               JSON         NULL     COMMENT '{"unlimited": true, "agency": true, ...}',
  `billing_product_ids`  JSON         NULL     COMMENT '["prod_123", "prod_456"]',
  `plan_updated_at`      DATETIME     NULL,
  `last_login_at`        DATETIME     NULL,
  `auth_last_status`     VARCHAR(50)  NULL,
  `auth_last_code`       VARCHAR(50)  NULL,
  `auth_last_message`    TEXT         NULL,
  `is_active`            TINYINT(1)   NOT NULL DEFAULT 1,
  -- Agency fields
  `agency_owner_id`      INT UNSIGNED NULL     COMMENT 'NULL for main accounts; set to parent user ID for agency sub-users',
  `credits_balance`      INT          NOT NULL DEFAULT 0 COMMENT 'Credits allocated by agency owner to this sub-user',
  `created_at`           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email`          (`email`),
  INDEX `idx_users_username`       (`username`),
  INDEX `idx_users_role`           (`role`),
  INDEX `idx_users_agency_owner`   (`agency_owner_id`),
  CONSTRAINT `fk_users_agency_owner` FOREIGN KEY (`agency_owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─────────────────────────────────────────────────────────────
-- USER_USAGE_MONTHLY (Tracks usage per user per month)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `user_usage_monthly` (
  `id`                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`              INT UNSIGNED NOT NULL,
  `month_year`           CHAR(7)      NOT NULL COMMENT 'Format: YYYY-MM',
  `credits_used`         INT          NOT NULL DEFAULT 0,
  `clones_used`          INT          NOT NULL DEFAULT 0,
  `vsl_used`             INT          NOT NULL DEFAULT 0,
  `ad_used`              INT          NOT NULL DEFAULT 0,
  `custom_used`          INT          NOT NULL DEFAULT 0,
  `transcriptions_used`  INT          NOT NULL DEFAULT 0,
  `created_at`           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_usage_user_month` (`user_id`, `month_year`),
  CONSTRAINT `fk_usage_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─────────────────────────────────────────────────────────────
-- VOICEOVERS (CRUD only — generation via CRON)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `voiceovers` (
  `id`               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`          INT UNSIGNED NOT NULL,
  `title`            VARCHAR(255) NULL,
  `keywords`         TEXT         NULL,
  `script`           LONGTEXT     NULL,
  `script_source`    ENUM('manual','ai_generated','vsl','ad','youtube') NOT NULL DEFAULT 'manual',
  `voice_type`       ENUM('studio','cloned','custom') NOT NULL DEFAULT 'studio',
  `voice_id`         VARCHAR(255) NULL,
  `voice_name`       VARCHAR(255) NULL,
  `emotion`          VARCHAR(50)  NULL DEFAULT 'neutral',
  `emotion_strength` ENUM('soft','medium','strong') NOT NULL DEFAULT 'medium',
  `scene_mode`       VARCHAR(50)  NULL DEFAULT 'casual',
  `voice_consistency` TINYINT(1)  NOT NULL DEFAULT 1,
  `background_music` VARCHAR(255) NULL,
  `audio_url`        TEXT         NULL,
  `duration_seconds` DECIMAL(8,2) NULL,
  `status`           ENUM('draft','processing','completed','failed') NOT NULL DEFAULT 'draft',
  `is_favorite`      TINYINT(1)   NOT NULL DEFAULT 0,
  `tags`             JSON         NULL,
  `created_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_vo_user_id`    (`user_id`),
  INDEX `idx_vo_status`     (`status`),
  INDEX `idx_vo_created_at` (`created_at`),
  CONSTRAINT `fk_vo_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─────────────────────────────────────────────────────────────
-- BACKGROUND_MUSIC_TRACKS (shared library, admin-managed)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `background_music_tracks` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`       VARCHAR(255) NOT NULL,
  `category`   VARCHAR(50)  NOT NULL DEFAULT 'other',
  `mood`       VARCHAR(50)  NULL,
  `duration`   VARCHAR(20)  NULL,
  `audio_url`  TEXT         NOT NULL,
  `is_active`  TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_bmt_category`  (`category`),
  INDEX `idx_bmt_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─────────────────────────────────────────────────────────────
-- VOICE_CLONES (CRUD only — training via CRON)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `voice_clones` (
  `id`            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`       INT UNSIGNED NOT NULL,
  `name`          VARCHAR(255) NOT NULL,
  `description`   TEXT         NULL,
  `language`      VARCHAR(50)  NULL,
  `gender`        ENUM('male','female','neutral') NULL,
  `clone_mode`    ENUM('quick','standard','studio') NOT NULL DEFAULT 'standard',
  `sample_url`    TEXT         NULL,
  `source_type`   VARCHAR(50)  NULL,
  `status`        ENUM('processing','ready','failed') NOT NULL DEFAULT 'processing',
  `quality_score` DECIMAL(5,2) NULL,
  `is_favorite`   TINYINT(1)   NOT NULL DEFAULT 0,
  `is_public`     TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_vc_user_id` (`user_id`),
  INDEX `idx_vc_status`  (`status`),
  CONSTRAINT `fk_vc_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─────────────────────────────────────────────────────────────
-- CUSTOM_VOICES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `custom_voices` (
  `id`                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`            INT UNSIGNED NOT NULL,
  `name`               VARCHAR(255) NOT NULL,
  `description`        TEXT         NULL,
  `tone`               VARCHAR(100) NULL,
  `style`              VARCHAR(100) NULL,
  `use_case`           VARCHAR(255) NULL,
  `test_script`        TEXT         NULL,
  `category`           ENUM('professional','casual','dramatic','friendly','authoritative') NOT NULL DEFAULT 'professional',
  `status`             ENUM('pending','ready','failed') NOT NULL DEFAULT 'pending',
  `is_favorite`        TINYINT(1)   NOT NULL DEFAULT 0,
  `is_brand_voice`     TINYINT(1)   NOT NULL DEFAULT 0,
  `generation_version` INT          NOT NULL DEFAULT 1,
  `created_at`         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_cv_user_id` (`user_id`),
  CONSTRAINT `fk_cv_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─────────────────────────────────────────────────────────────
-- AUDIO_MIXES (CRUD only — mixing via CRON)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `audio_mixes` (
  `id`             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`        INT UNSIGNED NOT NULL,
  `name`           VARCHAR(255) NULL,
  `voiceover_ids`  JSON         NULL COMMENT 'Array of voiceover IDs',
  `music_url`      TEXT         NULL,
  `music_source`   ENUM('library','upload') NOT NULL DEFAULT 'library',
  `voice_volume`   TINYINT UNSIGNED NOT NULL DEFAULT 100,
  `music_volume`   TINYINT UNSIGNED NOT NULL DEFAULT 30,
  `auto_ducking`   TINYINT(1)   NOT NULL DEFAULT 1,
  `preset`         VARCHAR(50)  NOT NULL DEFAULT 'custom',
  `status`         ENUM('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
  `output_url`     TEXT         NULL,
  `created_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_am_user_id` (`user_id`),
  INDEX `idx_am_status`  (`status`),
  CONSTRAINT `fk_am_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─────────────────────────────────────────────────────────────
-- VSL_COPIES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `vsl_copies` (
  `id`             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`        INT UNSIGNED NOT NULL,
  `product_name`   VARCHAR(255) NOT NULL,
  `sales_page_url` TEXT         NULL,
  `framework`      VARCHAR(50)  NOT NULL DEFAULT 'pas',
  `emotion`        VARCHAR(50)  NOT NULL DEFAULT 'excited',
  `tone`           VARCHAR(50)  NOT NULL DEFAULT 'friendly',
  `keywords`       TEXT         NULL,
  `script`         LONGTEXT     NULL,
  `hook`           TEXT         NULL,
  `variations`     JSON         NULL COMMENT 'Array of script variation strings',
  `status`         ENUM('draft','completed') NOT NULL DEFAULT 'draft',
  `created_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_vsl_user_id`    (`user_id`),
  INDEX `idx_vsl_created_at` (`created_at`),
  CONSTRAINT `fk_vsl_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─────────────────────────────────────────────────────────────
-- AD_COPIES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `ad_copies` (
  `id`           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`      INT UNSIGNED NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `product_url`  TEXT         NULL,
  `platform`     ENUM('facebook','google','instagram','email','linkedin','twitter') NOT NULL DEFAULT 'facebook',
  `style`        VARCHAR(50)  NOT NULL DEFAULT 'direct',
  `headline`     TEXT         NULL,
  `copy_text`    LONGTEXT     NULL,
  `variations`   JSON         NULL COMMENT 'Array of ad copy variation strings',
  `status`       ENUM('draft','completed') NOT NULL DEFAULT 'draft',
  `created_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_ac_user_id`    (`user_id`),
  INDEX `idx_ac_platform`   (`platform`),
  INDEX `idx_ac_created_at` (`created_at`),
  CONSTRAINT `fk_ac_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─────────────────────────────────────────────────────────────
-- TRANSCRIPTIONS (CRUD only — actual transcription via CRON)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `transcriptions` (
  `id`            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`       INT UNSIGNED NOT NULL,
  `title`         VARCHAR(255) NOT NULL,
  `source_url`    TEXT         NULL,
  `source_type`   ENUM('youtube','upload') NOT NULL DEFAULT 'youtube',
  `output_format` ENUM('text','srt','vtt','json') NOT NULL DEFAULT 'text',
  `language`      VARCHAR(10)  NOT NULL DEFAULT 'en',
  `transcript`    LONGTEXT     NULL,
  `duration`      INT          NULL COMMENT 'Duration in seconds',
  `word_count`    INT          NULL,
  `status`        ENUM('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_tr_user_id`    (`user_id`),
  INDEX `idx_tr_status`     (`status`),
  INDEX `idx_tr_created_at` (`created_at`),
  CONSTRAINT `fk_tr_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─────────────────────────────────────────────────────────────
-- CONVERSATIONAL_VOICES (Multi-speaker AI conversations)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `conversational_voices` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`     INT UNSIGNED NOT NULL,
  `title`       VARCHAR(255) NULL,
  `full_script` LONGTEXT     NULL    COMMENT 'Raw script entered by user',
  `speakers`    JSON         NULL    COMMENT 'Array of speaker objects: [{label, voice_id, voice_name, voice_type}]',
  `segments`    JSON         NULL    COMMENT 'Array of dialogue segments: [{text, speaker_label, voice_id, voice_name, voice_type}]',
  `audio_url`   TEXT         NULL    COMMENT 'URL of the final generated mixed audio',
  `duration`    DECIMAL(8,2) NULL    COMMENT 'Duration of generated audio in seconds',
  `status`      ENUM('draft','processing','completed','failed') NOT NULL DEFAULT 'draft',
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_conv_user_id`    (`user_id`),
  INDEX `idx_conv_status`     (`status`),
  INDEX `idx_conv_created_at` (`created_at`),
  CONSTRAINT `fk_conv_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration: run this if the table already exists and needs to be added
-- CREATE TABLE IF NOT EXISTS `conversational_voices` ... (same as above)


-- ─────────────────────────────────────────────────────────────
-- DFY_OFFERS (Admin-managed, read-only for users)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `dfy_offers` (
  `id`             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_name`   VARCHAR(255) NOT NULL,
  `description`    TEXT         NULL,
  `image_url`      TEXT         NULL,
  `affiliate_link` TEXT         NULL,
  `commission`     VARCHAR(50)  NULL,
  `category`       VARCHAR(100) NULL,
  `is_featured`    TINYINT(1)   NOT NULL DEFAULT 0,
  `is_active`      TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_dfy_is_active`   (`is_active`),
  INDEX `idx_dfy_is_featured` (`is_featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─────────────────────────────────────────────────────────────
-- FILE_UPLOADS (Tracks all uploaded files)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `file_uploads` (
  `id`           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`      INT UNSIGNED NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `stored_name`  VARCHAR(255) NOT NULL,
  `file_url`     TEXT         NOT NULL,
  `mime_type`    VARCHAR(100) NULL,
  `file_size`    BIGINT       NULL COMMENT 'Bytes',
  `created_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_fu_user_id` (`user_id`),
  CONSTRAINT `fk_fu_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─────────────────────────────────────────────────────────────
-- MIGRATION: Fix plan priorities — PRO must be highest so FE/XTREME+PRO users
-- get PRO plan. Priority order: PRO(30) > XTREME(20) > FE(10)
-- ─────────────────────────────────────────────────────────────
UPDATE `plans` SET `priority` = 20 WHERE `name` = 'XTREME';
UPDATE `plans` SET `priority` = 30 WHERE `name` = 'PRO';


-- ─────────────────────────────────────────────────────────────
-- MIGRATION: Add agency columns to existing `users` table
-- Run these ALTER statements if the table already exists
-- ─────────────────────────────────────────────────────────────
-- ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `agency_owner_id` INT UNSIGNED NULL AFTER `is_active`;
-- ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `credits_balance` INT NOT NULL DEFAULT 0 AFTER `agency_owner_id`;
-- ALTER TABLE `users` ADD INDEX IF NOT EXISTS `idx_users_agency_owner` (`agency_owner_id`);
-- ALTER TABLE `users` ADD CONSTRAINT IF NOT EXISTS `fk_users_agency_owner` FOREIGN KEY (`agency_owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE;
-- voice_clones: store the generated audio output produced from the clone
ALTER TABLE `voice_clones`
  ADD COLUMN `audio_url` TEXT NULL
  COMMENT 'URL of the generated audio output for this voice clone'
  AFTER `sample_url`;

-- custom_voices: store the generated audio preview/output
ALTER TABLE `custom_voices`
  ADD COLUMN `audio_url` TEXT NULL
  COMMENT 'URL of the generated audio output for this custom voice'
  AFTER `test_script`;