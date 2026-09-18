INSERT INTO products (id, vendor_id, name, category, sku, description, price, active, created_at)
VALUES
('11111111-1111-1111-1111-111111111101', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Apple MacBook Pro M3', 'Electronics', 'TECH-MBP-01', '14-inch Liquid Retina XDR display, 16GB Unified Memory, 512GB SSD storage.', 199990.00, true, NOW()),
('11111111-1111-1111-1111-111111111102', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sony WH-1000XM5 Wireless Headphones', 'Audio', 'TECH-SNY-02', 'Industry-leading noise canceling with Auto NC Optimizer and 30-hour battery life.', 29990.00, true, NOW()),
('11111111-1111-1111-1111-111111111103', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Keychron Q1 Pro Mechanical Keyboard', 'Accessories', 'TECH-KEY-03', 'Wireless custom mechanical keyboard, QMK/VIA programmable with hot-swappable switches.', 17499.00, true, NOW()),
('11111111-1111-1111-1111-111111111104', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Patagonia Nano Puff Jacket', 'Apparel', 'APP-PAT-04', 'Warm, windproof, water-resistant insulated lightweight technical jacket.', 18500.00, true, NOW()),
('11111111-1111-1111-1111-111111111105', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Fellow Ode Gen 2 Coffee Grinder', 'Home & Kitchen', 'HOM-FEL-05', 'Precision burr grinder with 31 grind settings and anti-static technology.', 28990.00, true, NOW()),
('11111111-1111-1111-1111-111111111106', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Garmin Forerunner 965 GPS Watch', 'Fitness', 'FIT-GAR-06', 'Premium running & triathlon smartwatch with brilliant AMOLED touchscreen display.', 61990.00, true, NOW()),
('11111111-1111-1111-1111-111111111107', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Herman Miller Aeron Ergonomic Chair', 'Furniture', 'FURN-HM-07', 'Pioneering ergonomic design with breathable Pellicle mesh and PostureFit SL back support.', 115000.00, true, NOW()),
('11111111-1111-1111-1111-111111111108', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Kindle Scribe Digital Notebook', 'Electronics', 'TECH-KND-08', '10.2-inch 300 ppi Paperwhite display with Basic Pen for reading and writing.', 34990.00, true, NOW())
ON CONFLICT (sku) DO NOTHING;
