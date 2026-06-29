-- ==========================================
-- SEED FILE: CATEGORIES & MENU ITEMS
-- ==========================================

-- 1. Insert Categories
INSERT INTO categories (id, name, icon, sort_order) VALUES
  ('c1b11111-1111-1111-1111-111111111111', 'Coffee', '☕', 1),
  ('c2b22222-2222-2222-2222-222222222222', 'Tea', '🍵', 2),
  ('c3b33333-3333-3333-3333-333333333333', 'Cold Coffee', '🧊', 3),
  ('c4b44444-4444-4444-4444-444444444444', 'Smoothies', '🥤', 4),
  ('c5b55555-5555-5555-5555-555555555555', 'Sandwiches', '🥪', 5),
  ('c6b66666-6666-6666-6666-666666666666', 'Desserts', '🍮', 6)
ON CONFLICT (name) DO UPDATE SET icon = EXCLUDED.icon, sort_order = EXCLUDED.sort_order;

-- 2. Insert Menu Items
INSERT INTO menu_items (category_id, name, description, ingredients, price, image_url, rating, prep_time, is_vegetarian, is_bestseller, is_todays_special, is_available, sort_order) VALUES
  -- Coffee
  ('c1b11111-1111-1111-1111-111111111111', 'Espresso Single', 'A rich, concentrated shot of single-origin Coorg coffee beans, extracted to perfection.', '100% Arabica Coffee beans', 99.00, 'https://images.unsplash.com/photo-1510707513156-46545c9428c0?auto=format&fit=crop&q=80&w=600', 4.80, 3, true, false, false, true, 1),
  ('c1b11111-1111-1111-1111-111111111111', 'Classic Cappuccino', 'A warm, balanced cup of espresso, steamed milk, and a thick layer of velvety foam.', 'Espresso, steamed milk, foam, cocoa powder', 149.00, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=600', 4.70, 5, true, true, false, true, 2),
  ('c1b11111-1111-1111-1111-111111111111', 'Vanilla Latte', 'Espresso combined with sweet vanilla syrup, creamy steamed milk, and a light foam layer.', 'Espresso, vanilla syrup, steamed milk', 169.00, 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=600', 4.60, 5, true, false, true, true, 3),
  ('c1b11111-1111-1111-1111-111111111111', 'Cafe Mocha', 'A decadent espresso drink layered with rich dark chocolate syrup and steamed milk.', 'Espresso, dark chocolate sauce, steamed milk', 179.00, 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&q=80&w=600', 4.75, 6, true, false, false, true, 4),

  -- Tea
  ('c2b22222-2222-2222-2222-222222222222', 'Masala Chai', 'An authentic Indian spiced tea brewed with ginger, cardamom, cinnamon, and fresh milk.', 'Assam CTC tea, milk, ginger, cardamom, cinnamon, cloves', 89.00, 'https://images.unsplash.com/photo-1563889362-58222750e09b?auto=format&fit=crop&q=80&w=600', 4.90, 8, true, true, false, true, 1),
  ('c2b22222-2222-2222-2222-222222222222', 'Premium Matcha Latte', 'Ceremonial grade Japanese green tea powder whisked with milk and lightly sweetened.', 'Matcha powder, water, milk, organic honey', 199.00, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=600', 4.50, 4, true, false, true, true, 2),
  ('c2b22222-2222-2222-2222-222222222222', 'Chamomile Herbal Tea', 'A soothing, caffeine-free herbal infusion made from whole chamomile flowers.', 'Dry chamomile flowers, hot water, lemon slice', 119.00, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600', 4.65, 3, true, false, false, true, 3),

  -- Cold Coffee
  ('c3b33333-3333-3333-3333-333333333333', 'Classic Cold Coffee', 'Creamy, chilled milk blended with espresso and a scoop of vanilla ice cream.', 'Espresso, chilled milk, vanilla ice cream, sugar', 159.00, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=600', 4.70, 4, true, true, false, true, 1),
  ('c3b33333-3333-3333-3333-333333333333', 'Hazelnut Cold Brew', '24-hour slow-steeped cold brew coffee infused with rich toasted hazelnut syrup.', 'Cold brew coffee concentrate, ice, hazelnut syrup, milk splash', 189.00, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=600', 4.85, 2, true, true, true, true, 2),

  -- Smoothies
  ('c4b44444-4444-4444-4444-444444444444', 'Triple Berry Blast', 'A thick, delicious blend of frozen strawberries, blueberries, raspberries, and Greek yogurt.', 'Strawberries, blueberries, raspberries, honey, greek yogurt', 199.00, 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=600', 4.60, 5, true, false, false, true, 1),
  ('c4b44444-4444-4444-4444-444444444444', 'Mango Avocado Greens', 'A superfood powerhouse smoothie combining sweet Alphonso mango, avocado, and fresh spinach.', 'Mango pulp, ripe avocado, baby spinach, almond milk, chia seeds', 219.00, 'https://images.unsplash.com/photo-1610970881699-44a5587caaec?auto=format&fit=crop&q=80&w=600', 4.45, 5, true, false, false, true, 2),

  -- Sandwiches
  ('c5b55555-5555-5555-5555-555555555555', 'Pesto Tomato Mozzarella', 'Toasted sourdough loaded with fresh house-made basil pesto, juicy tomatoes, and melted mozzarella.', 'Sourdough bread, fresh basil pesto, tomato slices, fresh buffalo mozzarella', 229.00, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=600', 4.80, 10, true, true, false, true, 1),
  ('c5b55555-5555-5555-5555-555555555555', 'Smoked Chicken & Cheese', 'Tender shredded chicken smoked with hickory wood, paired with cheddar cheese and honey mustard.', 'Multi-grain bread, smoked chicken breast, cheddar, honey mustard, lettuce', 259.00, 'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&q=80&w=600', 4.70, 12, false, false, true, true, 2),

  -- Desserts
  ('c6b66666-6666-6666-6666-666666666666', 'New York Cheesecake', 'Rich and velvety baked cheesecake on a buttery graham cracker crust, topped with strawberry compote.', 'Cream cheese, sugar, graham crackers, butter, strawberry compote', 249.00, 'https://images.unsplash.com/photo-1524351199679-46cddf530c04?auto=format&fit=crop&q=80&w=600', 4.90, 3, true, true, false, true, 1),
  ('c6b66666-6666-6666-6666-666666666666', 'Warm Fudge Brownie', 'Double chocolate fudge brownie served warm, perfect with an espresso shot.', 'Cocoa powder, chocolate chunks, butter, flour, sugar, vanilla extract', 129.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=600', 4.80, 2, true, false, false, true, 2),
  ('c6b66666-6666-6666-6666-666666666666', 'Artisanal Croissant', 'Flaky, buttery French pastry baked fresh every morning with traditional layering.', 'Unbleached flour, premium butter, yeast, sugar, salt', 139.00, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600', 4.75, 2, true, true, false, true, 3);

-- 3. Insert Reviews / Testimonials
INSERT INTO reviews (customer_name, customer_avatar, rating, comment, is_featured) VALUES
  ('Aryan Sharma', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', 5, 'The hazelnut cold brew is life-changing! Cozy ambience and extremely high-speed WiFi make it my go-to work-from-cafe spot in Indiranagar.', true),
  ('Sneha Reddy', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', 5, 'Absolutely love their New York Cheesecake and Masala Chai. The table booking system is so easy and seamless, and my table was ready when I arrived!', true),
  ('Michael Dias', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', 4, 'Very friendly staff and excellent single-origin espresso. The outdoor seating is pet-friendly which is amazing for my weekend visits with my dog.', true),
  ('Priya Patel', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150', 5, 'A premium cafe experience. The pesto sandwich is grilled to perfection, and their baristas really know their craft. Highly recommended.', true);

-- 4. Insert Gallery Images
INSERT INTO gallery (image_url, caption, sort_order) VALUES
  ('https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800', 'Our main dining hall showing the warm rustic interiors.', 1),
  ('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800', 'Perfect morning brews crafted with love by our baristas.', 2),
  ('https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80&w=800', 'A quiet cozy corner for remote work or reading.', 3),
  ('https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800', 'Freshly baked artisanal croissants and pastries daily.', 4),
  ('https://images.unsplash.com/photo-1525648199074-cee30be7b119?auto=format&fit=crop&q=80&w=800', 'Our lush green outdoor seating area.', 5),
  ('https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=800', 'Our collection of premium single-origin coffee beans.', 6);

-- ====================================================================================
-- NOTE FOR ADMIN ROLE ASSIGNMENT:
-- To make any signed-up user an Admin, run this query in your Supabase SQL Editor:
--
-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'
-- WHERE email = 'your-admin-email@example.com';
-- ====================================================================================
