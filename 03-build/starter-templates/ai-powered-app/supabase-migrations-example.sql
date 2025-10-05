-- =====================================================
-- AI-Powered App - Database Schema
-- Supabase + pgvector for RAG implementation
-- =====================================================

-- =====================================================
-- EXTENSIONS
-- =====================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- CONVERSATIONS TABLE
-- Stores chat conversations
-- =====================================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  model TEXT DEFAULT 'gpt-3.5-turbo',
  system_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived BOOLEAN DEFAULT false
);

-- Indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);

-- Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- MESSAGES TABLE
-- Stores individual messages in conversations
-- =====================================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'function')),
  content TEXT NOT NULL,
  function_call JSONB,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  cost DECIMAL(10, 6) DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);

-- Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- =====================================================
-- DOCUMENTS TABLE
-- Stores uploaded documents for RAG
-- =====================================================

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  chunk_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);

-- Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- EMBEDDINGS TABLE
-- Stores vector embeddings for semantic search
-- =====================================================

CREATE TABLE IF NOT EXISTS embeddings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small dimension
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for vector search
-- HNSW index for fast approximate nearest neighbor search
CREATE INDEX idx_embeddings_embedding_hnsw ON embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Alternative: IVFFlat index (faster inserts, slightly slower search)
-- CREATE INDEX idx_embeddings_embedding_ivf ON embeddings
--   USING ivfflat (embedding vector_cosine_ops)
--   WITH (lists = 100);

-- Regular indexes
CREATE INDEX idx_embeddings_user_id ON embeddings(user_id);
CREATE INDEX idx_embeddings_document_id ON embeddings(document_id);
CREATE INDEX idx_embeddings_metadata ON embeddings USING GIN (metadata);

-- Row Level Security
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own embeddings"
  ON embeddings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own embeddings"
  ON embeddings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own embeddings"
  ON embeddings FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- USAGE LOGS TABLE
-- Tracks AI API usage and costs
-- =====================================================

CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  model TEXT NOT NULL,
  provider TEXT DEFAULT 'openai',
  operation_type TEXT DEFAULT 'completion' CHECK (operation_type IN ('completion', 'embedding', 'moderation')),
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
  cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
  latency_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_timestamp ON usage_logs(timestamp DESC);
CREATE INDEX idx_usage_logs_model ON usage_logs(model);
CREATE INDEX idx_usage_logs_user_timestamp ON usage_logs(user_id, timestamp DESC);

-- Row Level Security
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage logs"
  ON usage_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert usage logs
CREATE POLICY "Service role can insert usage logs"
  ON usage_logs FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- USER PREFERENCES TABLE
-- Stores user settings for AI features
-- =====================================================

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_model TEXT DEFAULT 'gpt-3.5-turbo',
  default_temperature DECIMAL(3, 2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 2000,
  ai_features_enabled BOOLEAN DEFAULT true,
  data_anonymization BOOLEAN DEFAULT true,
  usage_alerts BOOLEAN DEFAULT true,
  usage_alert_threshold INTEGER DEFAULT 80, -- Percentage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Match documents by vector similarity
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  document_id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    embeddings.id,
    embeddings.document_id,
    embeddings.content,
    embeddings.metadata,
    1 - (embeddings.embedding <=> query_embedding) AS similarity
  FROM embeddings
  WHERE
    (filter_user_id IS NULL OR embeddings.user_id = filter_user_id)
    AND 1 - (embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function: Get user usage statistics
CREATE OR REPLACE FUNCTION get_user_usage_stats(
  target_user_id UUID,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days'
)
RETURNS TABLE (
  total_requests BIGINT,
  total_tokens BIGINT,
  total_cost DECIMAL,
  avg_latency_ms INTEGER,
  success_rate DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_requests,
    SUM(total_tokens)::BIGINT AS total_tokens,
    SUM(cost)::DECIMAL AS total_cost,
    AVG(latency_ms)::INTEGER AS avg_latency_ms,
    (COUNT(*) FILTER (WHERE success = true)::DECIMAL / COUNT(*)::DECIMAL * 100) AS success_rate
  FROM usage_logs
  WHERE
    user_id = target_user_id
    AND timestamp >= start_date;
END;
$$;

-- Function: Clean up old data (for GDPR compliance)
CREATE OR REPLACE FUNCTION cleanup_old_data(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM usage_logs
    WHERE timestamp < NOW() - (days_to_keep || ' days')::INTERVAL
    RETURNING *
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Update conversations.updated_at on message insert
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_timestamp
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Trigger: Update user_preferences.updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_preferences_timestamp
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS
-- =====================================================

-- View: Recent conversations with message counts
CREATE OR REPLACE VIEW recent_conversations AS
SELECT
  c.id,
  c.user_id,
  c.title,
  c.model,
  c.created_at,
  c.updated_at,
  COUNT(m.id) AS message_count,
  SUM(m.input_tokens + m.output_tokens) AS total_tokens,
  SUM(m.cost) AS total_cost
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
WHERE c.archived = false
GROUP BY c.id
ORDER BY c.updated_at DESC;

-- View: Daily usage statistics
CREATE OR REPLACE VIEW daily_usage_stats AS
SELECT
  user_id,
  DATE(timestamp) AS usage_date,
  COUNT(*) AS request_count,
  SUM(total_tokens) AS total_tokens,
  SUM(cost) AS total_cost,
  AVG(latency_ms) AS avg_latency_ms,
  COUNT(*) FILTER (WHERE success = true) AS successful_requests,
  COUNT(*) FILTER (WHERE success = false) AS failed_requests
FROM usage_logs
GROUP BY user_id, DATE(timestamp)
ORDER BY usage_date DESC;

-- =====================================================
-- SEED DATA (Optional - for development)
-- =====================================================

-- Insert default user preferences for new users
-- This can be done via a trigger on auth.users or manually

-- =====================================================
-- PERFORMANCE OPTIMIZATION
-- =====================================================

-- Analyze tables for query optimization
ANALYZE conversations;
ANALYZE messages;
ANALYZE documents;
ANALYZE embeddings;
ANALYZE usage_logs;

-- Vacuum to reclaim storage
VACUUM ANALYZE;

-- =====================================================
-- NOTES
-- =====================================================

/*
1. Vector Index Strategies:
   - HNSW: Faster search, slower inserts, better for read-heavy workloads
   - IVFFlat: Faster inserts, slightly slower search, better for write-heavy

2. Embedding Dimensions:
   - OpenAI text-embedding-3-small: 1536 (default)
   - OpenAI text-embedding-3-large: 3072
   - Cohere embed-v3: 1024
   - Adjust VECTOR(N) accordingly

3. Cost Tracking:
   - Update pricing.ts when model prices change
   - Review usage_logs regularly
   - Set up alerts for unusual usage

4. Performance:
   - Monitor query performance with EXPLAIN ANALYZE
   - Adjust vector index parameters (m, ef_construction) based on dataset size
   - Consider partitioning large tables by date

5. Security:
   - RLS policies enforce user data isolation
   - Never expose service role key to client
   - Regularly audit policies and permissions

6. Maintenance:
   - Run cleanup_old_data() regularly (cronjob)
   - Vacuum embeddings table after bulk deletes
   - Monitor table sizes and index bloat

7. Scaling:
   - For >1M embeddings, consider sharding by user_id
   - Use connection pooling (PgBouncer)
   - Enable read replicas for analytics queries
*/
