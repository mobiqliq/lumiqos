-- Ensure UUID extension exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Normalize Demo Class
UPDATE class 
SET class_name = 'CLASS 9' 
WHERE id = '8cd9b059-b323-4295-b7ff-369687a9f9b8' 
  AND school_id = 'f2efb39f-304b-4841-8faf-7bda14454aac';

-- Clean existing syllabus data for this context to avoid duplicates during test
DELETE FROM syllabus_topic WHERE syllabus_id IN (
    SELECT id FROM syllabus 
    WHERE class_id = '8cd9b059-b323-4295-b7ff-369687a9f9b8' 
    AND (subject_id = '131dbb78-c13a-4340-89dd-880975977635' OR subject_id = 'c6526d6b-a854-4f8b-a14f-ce2422dfeb61')
);

DELETE FROM syllabus 
WHERE class_id = '8cd9b059-b323-4295-b7ff-369687a9f9b8' 
AND (subject_id = '131dbb78-c13a-4340-89dd-880975977635' OR subject_id = 'c6526d6b-a854-4f8b-a14f-ce2422dfeb61');

-- SEED MATHEMATICS
WITH math_syllabus AS (
    INSERT INTO syllabus (id, school_id, class_id, subject_id, units, estimated_days, total_topics, created_at, updated_at)
    VALUES (uuid_generate_v4(), 'f2efb39f-304b-4841-8faf-7bda14454aac', '8cd9b059-b323-4295-b7ff-369687a9f9b8', '131dbb78-c13a-4340-89dd-880975977635', 6, 60, 5, NOW(), NOW())
    RETURNING id
)
INSERT INTO syllabus_topic (id, syllabus_id, topic_name, sequence, created_at, updated_at)
SELECT uuid_generate_v4(), id, topic_name, seq, NOW(), NOW()
FROM math_syllabus, (VALUES 
    ('Number Systems', 1),
    ('Polynomials', 2),
    ('Coordinate Geometry', 3),
    ('Linear Equations', 4),
    ('Lines and Angles', 5)
) AS t(topic_name, seq);

-- SEED SCIENCE
WITH science_syllabus AS (
    INSERT INTO syllabus (id, school_id, class_id, subject_id, units, estimated_days, total_topics, created_at, updated_at)
    VALUES (uuid_generate_v4(), 'f2efb39f-304b-4841-8faf-7bda14454aac', '8cd9b059-b323-4295-b7ff-369687a9f9b8', 'c6526d6b-a854-4f8b-a14f-ce2422dfeb61', 5, 55, 4, NOW(), NOW())
    RETURNING id
)
INSERT INTO syllabus_topic (id, syllabus_id, topic_name, sequence, created_at, updated_at)
SELECT uuid_generate_v4(), id, topic_name, seq, NOW(), NOW()
FROM science_syllabus, (VALUES 
    ('Matter in Our Surroundings', 1),
    ('Is Matter Around Us Pure', 2),
    ('The Fundamental Unit of Life', 3),
    ('Tissues', 4)
) AS t(topic_name, seq);
