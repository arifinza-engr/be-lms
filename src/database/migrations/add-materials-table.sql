-- Migration: Add subchapter_materials table
-- Created: 2024-12-19

-- Create subchapter_materials table
CREATE TABLE IF NOT EXISTS subchapter_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subchapter_id UUID NOT NULL REFERENCES subchapters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'video', 'pdf', 'image', 'document'
    file_size INTEGER,
    mime_type VARCHAR(100),
    thumbnail_url TEXT,
    duration INTEGER, -- for videos in seconds
    uploaded_by UUID NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS materials_subchapter_idx ON subchapter_materials(subchapter_id);
CREATE INDEX IF NOT EXISTS materials_type_idx ON subchapter_materials(file_type);
CREATE INDEX IF NOT EXISTS materials_active_idx ON subchapter_materials(is_active);
CREATE INDEX IF NOT EXISTS materials_uploaded_by_idx ON subchapter_materials(uploaded_by);
CREATE INDEX IF NOT EXISTS materials_created_at_idx ON subchapter_materials(created_at);

-- Add comments for documentation
COMMENT ON TABLE subchapter_materials IS 'Stores uploaded materials (videos, PDFs, images) for subchapters';
COMMENT ON COLUMN subchapter_materials.file_type IS 'Type of file: video, pdf, image, document';
COMMENT ON COLUMN subchapter_materials.duration IS 'Duration in seconds for video files';
COMMENT ON COLUMN subchapter_materials.thumbnail_url IS 'Thumbnail URL for video files';