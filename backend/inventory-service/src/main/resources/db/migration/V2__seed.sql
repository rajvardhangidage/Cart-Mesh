INSERT INTO inventory (id, product_id, available, version)
VALUES
(gen_random_uuid(), '11111111-1111-1111-1111-111111111101', 25, 0),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111102', 40, 0),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111103', 15, 0),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111104', 30, 0),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111105', 12, 0),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111106', 18, 0),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111107', 8, 0),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111108', 22, 0)
ON CONFLICT (product_id) DO NOTHING;
