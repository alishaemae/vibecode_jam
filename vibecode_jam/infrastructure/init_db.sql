-- Create tables for VibeCode Interview Platform
-- Database: vibecode_db
-- Created: 2025-11-27

-- Table: interviews
CREATE TABLE IF NOT EXISTS interviews (
    id SERIAL PRIMARY KEY,
    candidate_email VARCHAR(255) NOT NULL,
    level VARCHAR(50),
    domain VARCHAR(100),
    status VARCHAR(50) DEFAULT 'in_progress',
    final_score INTEGER,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: tasks
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    level VARCHAR(50),
    domain VARCHAR(100),
    task_data JSONB DEFAULT '{}',
    times_used INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: solutions (code submissions)
CREATE TABLE IF NOT EXISTS solutions (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    execution_time_ms INTEGER,
    visible_tests_passed INTEGER,
    hidden_tests_passed INTEGER,
    evaluation JSONB DEFAULT '{}',
    suspicious_score INTEGER,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    evaluation JSONB DEFAULT '{}'
);

-- Table: metrics
CREATE TABLE IF NOT EXISTS metrics (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER REFERENCES interviews(id) ON DELETE CASCADE,
    solution_id INTEGER REFERENCES solutions(id) ON DELETE CASCADE,
    metric_name VARCHAR(255) NOT NULL,
    metric_value FLOAT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: embeddings
CREATE TABLE IF NOT EXISTS embeddings (
    id SERIAL PRIMARY KEY,
    solution_id INTEGER NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
    embedding JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_interviews_candidate_email ON interviews(candidate_email);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
CREATE INDEX IF NOT EXISTS idx_tasks_interview_id ON tasks(interview_id);
CREATE INDEX IF NOT EXISTS idx_solutions_interview_id ON solutions(interview_id);
CREATE INDEX IF NOT EXISTS idx_solutions_task_id ON solutions(task_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_interview_id ON chat_messages(interview_id);
CREATE INDEX IF NOT EXISTS idx_metrics_interview_id ON metrics(interview_id);
CREATE INDEX IF NOT EXISTS idx_metrics_solution_id ON metrics(solution_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_solution_id ON embeddings(solution_id);
