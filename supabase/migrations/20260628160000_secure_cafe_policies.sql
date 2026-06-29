-- ====================================================================
-- SECURE POLICIES & TABLE AVAILABILITY FUNCTION
-- ====================================================================

-- 1. Drop existing insecure policies
DROP POLICY IF EXISTS "anon_select_categories" ON categories;
DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
DROP POLICY IF EXISTS "anon_update_categories" ON categories;
DROP POLICY IF EXISTS "anon_delete_categories" ON categories;

DROP POLICY IF EXISTS "anon_select_menu_items" ON menu_items;
DROP POLICY IF EXISTS "anon_insert_menu_items" ON menu_items;
DROP POLICY IF EXISTS "anon_update_menu_items" ON menu_items;
DROP POLICY IF EXISTS "anon_delete_menu_items" ON menu_items;

DROP POLICY IF EXISTS "anon_select_gallery" ON gallery;
DROP POLICY IF EXISTS "anon_insert_gallery" ON gallery;
DROP POLICY IF EXISTS "anon_update_gallery" ON gallery;
DROP POLICY IF EXISTS "anon_delete_gallery" ON gallery;

DROP POLICY IF EXISTS "anon_select_reviews" ON reviews;
DROP POLICY IF EXISTS "anon_insert_reviews" ON reviews;
DROP POLICY IF EXISTS "anon_update_reviews" ON reviews;
DROP POLICY IF EXISTS "anon_delete_reviews" ON reviews;

DROP POLICY IF EXISTS "anon_select_contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "anon_insert_contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "anon_update_contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "anon_delete_contact_messages" ON contact_messages;

DROP POLICY IF EXISTS "anon_select_reservations" ON reservations;
DROP POLICY IF EXISTS "anon_insert_reservations" ON reservations;
DROP POLICY IF EXISTS "anon_update_reservations" ON reservations;
DROP POLICY IF EXISTS "anon_delete_reservations" ON reservations;


-- 2. Create Secure Policies

-- CATEGORIES: Anyone can view. Only Admins can modify.
CREATE POLICY "allow_select_categories" ON categories
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "allow_all_admin_categories" ON categories
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- MENU ITEMS: Anyone can view. Only Admins can modify.
CREATE POLICY "allow_select_menu_items" ON menu_items
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "allow_all_admin_menu_items" ON menu_items
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- GALLERY: Anyone can view. Only Admins can modify.
CREATE POLICY "allow_select_gallery" ON gallery
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "allow_all_admin_gallery" ON gallery
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- REVIEWS: Anyone can view and insert. Only Admins can update/delete.
CREATE POLICY "allow_select_reviews" ON reviews
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "allow_insert_reviews" ON reviews
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "allow_modify_admin_reviews" ON reviews
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- CONTACT MESSAGES: Anyone can insert. Only Admins can view/update/delete.
CREATE POLICY "allow_insert_contact_messages" ON contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "allow_all_admin_contact_messages" ON contact_messages
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- RESERVATIONS:
-- - Anyone can insert.
-- - Select is allowed for Admins, OR for the guest who just inserted the reservation (within 2 minutes of creation).
-- - Update/delete is Admin only.
CREATE POLICY "allow_insert_reservations" ON reservations
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "allow_select_reservations" ON reservations
  FOR SELECT TO anon, authenticated
  USING (
    ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    OR (created_at > now() - interval '2 minutes')
  );

CREATE POLICY "allow_modify_admin_reservations" ON reservations
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- 3. Create Security Definer RPC Function for Table Availability Queries
-- This allows anonymous users to see table bookings for their slot,
-- without exposing customer names, phone numbers, or emails.
CREATE OR REPLACE FUNCTION public.get_booked_tables(res_date date, res_time text)
RETURNS TABLE (table_number int)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT table_number
  FROM public.reservations
  WHERE reservation_date = res_date
    AND reservation_time = res_time
    AND status != 'cancelled'
    AND table_number IS NOT NULL;
$$;

-- Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_booked_tables(date, text) TO anon, authenticated;
