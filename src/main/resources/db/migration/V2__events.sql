-- Events table
CREATE TABLE IF NOT EXISTS events (
                                      id           BIGINT PRIMARY KEY AUTO_INCREMENT,
                                      name         VARCHAR(150)      NOT NULL,
    description  TEXT              NULL,
    location     VARCHAR(200)      NOT NULL,
    start_time   TIMESTAMP         NOT NULL,
    end_time     TIMESTAMP         NOT NULL,
    status       VARCHAR(30)       NOT NULL DEFAULT 'DRAFT',
    active       BOOLEAN           NOT NULL DEFAULT TRUE,
    organizer_id BIGINT            NOT NULL,
    created_at   TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP         NULL     DEFAULT NULL,

    CONSTRAINT fk_events_organizer
    FOREIGN KEY (organizer_id) REFERENCES users(id),

    INDEX idx_events_name (name),
    INDEX idx_events_start_time (start_time),
    INDEX idx_events_status (status)
    );
