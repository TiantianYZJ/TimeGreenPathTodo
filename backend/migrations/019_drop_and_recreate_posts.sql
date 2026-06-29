-- 先删除可能不完整的 posts 表，再重建（兼容 MySQL 5.5）
DROP TABLE IF EXISTS posts;
CREATE TABLE posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    post_id VARCHAR(64) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT,
    images TEXT,
    todo_ids TEXT,
    share_code VARCHAR(10),
    ip_address VARCHAR(45),
    ip_province VARCHAR(100),
    location TEXT,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    viewer_ids TEXT,
    is_edited TINYINT DEFAULT 0,
    is_deleted TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
