-- ============================================================
-- CAFE PAIX — Complete Supabase Schema
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- 1. ENUM TYPES
CREATE TYPE order_status AS ENUM ('pending','confirmed','preparing','ready','completed','cancelled');
CREATE TYPE payment_status AS ENUM ('pending','paid','failed','refunded');
CREATE TYPE payment_method AS ENUM ('card','cash','online');
CREATE TYPE staff_role AS ENUM ('admin','manager','barista');

-- 2. TABLES

-- Cafe Settings (singleton)
CREATE TABLE cafe_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_name TEXT NOT NULL DEFAULT 'Cafe Paix',
  order_prefix TEXT NOT NULL DEFAULT 'CP',
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  opening_time TIME NOT NULL DEFAULT '07:00',
  closing_time TIME NOT NULL DEFAULT '22:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Staff
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role staff_role NOT NULL DEFAULT 'barista',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  total_orders INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Menu Categories
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Menu Items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  prep_time_minutes INT NOT NULL DEFAULT 5,
  is_available BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Menu Item Options (e.g., Size, Milk Type)
CREATE TABLE menu_item_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Option Values (e.g., Small/Medium/Large)
CREATE TABLE option_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id UUID NOT NULL REFERENCES menu_item_options(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  price_adjustment NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  is_default BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Menu Item Addons (e.g., Extra Shot, Whipped Cream)
CREATE TABLE menu_item_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  is_available BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inventory Items
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'units',
  current_stock NUMERIC(10,2) NOT NULL DEFAULT 0,
  low_stock_threshold NUMERIC(10,2) NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Menu Item ↔ Inventory (Recipe/BOM)
CREATE TABLE menu_item_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity_used_per_unit NUMERIC(10,4) NOT NULL DEFAULT 1,
  UNIQUE(menu_item_id, inventory_item_id)
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  table_number TEXT,
  status order_status NOT NULL DEFAULT 'pending',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  estimated_ready_at TIMESTAMPTZ,
  approved_by UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order Items (snapshot prices)
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  item_name TEXT NOT NULL,
  item_price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  line_total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order Item Customizations (snapshot)
CREATE TABLE order_item_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  option_name TEXT NOT NULL,
  value_label TEXT NOT NULL,
  price_adjustment NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order Item Addons (snapshot)
CREATE TABLE order_item_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  addon_name TEXT NOT NULL,
  addon_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order Status History (audit trail)
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status order_status,
  to_status order_status NOT NULL,
  changed_by UUID REFERENCES staff(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  method payment_method NOT NULL DEFAULT 'online',
  status payment_status NOT NULL DEFAULT 'pending',
  amount NUMERIC(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. INDEXES
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_phone ON orders(customer_phone);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_active ON menu_items(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_status_history_order ON order_status_history(order_id);

-- 4. TRIGGER FUNCTIONS

-- 4a. Generate order number: CP-DDMMYY-NNN
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  prefix TEXT;
  date_part TEXT;
  seq INT;
BEGIN
  SELECT order_prefix INTO prefix FROM cafe_settings LIMIT 1;
  IF prefix IS NULL THEN prefix := 'CP'; END IF;
  
  date_part := to_char(NOW(), 'DDMMYY');
  
  SELECT COUNT(*) + 1 INTO seq
  FROM orders
  WHERE order_number LIKE prefix || '-' || date_part || '-%';
  
  NEW.order_number := prefix || '-' || date_part || '-' || LPAD(seq::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- 4b. Log status changes
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, NEW.approved_by);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_status_change();

-- 4c. Set estimated ready time on confirm
CREATE OR REPLACE FUNCTION set_estimated_ready_time()
RETURNS TRIGGER AS $$
DECLARE
  max_prep INT;
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status = 'pending') THEN
    SELECT COALESCE(MAX(mi.prep_time_minutes), 5) INTO max_prep
    FROM order_items oi
    JOIN menu_items mi ON mi.id = oi.menu_item_id
    WHERE oi.order_id = NEW.id;
    
    NEW.estimated_ready_at := NOW() + ((max_prep + 2) * INTERVAL '1 minute');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_ready_time
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_estimated_ready_time();

-- 4d. Deduct inventory on completion
CREATE OR REPLACE FUNCTION deduct_inventory()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE inventory_items inv
    SET current_stock = inv.current_stock - sub.total_used,
        updated_at = NOW()
    FROM (
      SELECT mii.inventory_item_id, SUM(mii.quantity_used_per_unit * oi.quantity) AS total_used
      FROM order_items oi
      JOIN menu_item_inventory mii ON mii.menu_item_id = oi.menu_item_id
      WHERE oi.order_id = NEW.id
      GROUP BY mii.inventory_item_id
    ) sub
    WHERE inv.id = sub.inventory_item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deduct_inventory
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION deduct_inventory();

-- 4e. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_updated_at_cafe_settings BEFORE UPDATE ON cafe_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at_staff BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at_customers BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at_menu_categories BEFORE UPDATE ON menu_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at_menu_items BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at_inventory_items BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at_orders BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at_payments BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4f. Initial status history on order creation
CREATE OR REPLACE FUNCTION log_initial_status()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO order_status_history (order_id, from_status, to_status)
  VALUES (NEW.id, NULL, NEW.status);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_initial_status
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_initial_status();

-- 5. VIEWS

CREATE OR REPLACE VIEW active_orders AS
SELECT o.*, json_agg(json_build_object(
  'id', oi.id, 'item_name', oi.item_name, 'item_price', oi.item_price,
  'quantity', oi.quantity, 'line_total', oi.line_total
)) AS items
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.status NOT IN ('completed','cancelled')
GROUP BY o.id;

CREATE OR REPLACE VIEW daily_revenue AS
SELECT DATE(created_at) AS order_date,
  COUNT(*) AS total_orders,
  SUM(total_amount) AS revenue
FROM orders
WHERE status = 'completed'
GROUP BY DATE(created_at)
ORDER BY order_date DESC;

CREATE OR REPLACE VIEW low_stock_alerts AS
SELECT * FROM inventory_items
WHERE current_stock <= low_stock_threshold;

-- 6. ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE inventory_items;

-- 7. RLS POLICIES
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Public read for menu
CREATE POLICY "Public can read menu categories" ON menu_categories FOR SELECT USING (true);
CREATE POLICY "Public can read menu items" ON menu_items FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public can read options" ON menu_item_options FOR SELECT USING (true);
CREATE POLICY "Public can read option values" ON option_values FOR SELECT USING (true);
CREATE POLICY "Public can read addons" ON menu_item_addons FOR SELECT USING (true);
CREATE POLICY "Public can read cafe settings" ON cafe_settings FOR SELECT USING (true);

-- Orders: anyone can insert, read own by phone
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Anyone can update orders" ON orders FOR UPDATE USING (true);

-- Order items: linked to orders
CREATE POLICY "Anyone can insert order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read order items" ON order_items FOR SELECT USING (true);

-- Order customizations & addons
CREATE POLICY "Anyone can insert customizations" ON order_item_customizations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read customizations" ON order_item_customizations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert order addons" ON order_item_addons FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read order addons" ON order_item_addons FOR SELECT USING (true);

-- Payments
CREATE POLICY "Anyone can insert payments" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read payments" ON payments FOR SELECT USING (true);
CREATE POLICY "Anyone can update payments" ON payments FOR UPDATE USING (true);

-- Status history
CREATE POLICY "Anyone can read status history" ON order_status_history FOR SELECT USING (true);
CREATE POLICY "Anyone can insert status history" ON order_status_history FOR INSERT WITH CHECK (true);

-- Customers
CREATE POLICY "Anyone can insert customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Anyone can update customers" ON customers FOR UPDATE USING (true);

-- Inventory (read for now)
CREATE POLICY "Anyone can read inventory" ON inventory_items FOR SELECT USING (true);
CREATE POLICY "Anyone can update inventory" ON inventory_items FOR UPDATE USING (true);

-- Staff
CREATE POLICY "Anyone can read staff" ON staff FOR SELECT USING (true);

-- 8. SEED DATA

-- Default settings
INSERT INTO cafe_settings (cafe_name, order_prefix, tax_rate) VALUES ('Cafe Paix', 'CP', 0.00);

-- Categories
INSERT INTO menu_categories (id, name, display_order) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Hot Coffee', 1),
  ('c0000001-0000-0000-0000-000000000002', 'Iced Coffee', 2),
  ('c0000001-0000-0000-0000-000000000003', 'Pastries', 3);

-- Menu Items
INSERT INTO menu_items (id, category_id, name, description, base_price, image_url, prep_time_minutes, display_order) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Oat Latte', 'Smooth espresso with creamy oat milk.', 5.50, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop', 5, 1),
  ('a0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'Cappuccino', 'Equal parts espresso, steamed milk, and foam.', 5.00, 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=800&auto=format&fit=crop', 4, 2),
  ('a0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000001', 'Flat White', 'Velvety microfoam over a double shot of espresso.', 5.25, 'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?q=80&w=800&auto=format&fit=crop', 4, 3),
  ('a0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000002', 'Iced Americano', 'Double shot of espresso over ice with filtered water.', 4.50, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=800&auto=format&fit=crop', 3, 1),
  ('a0000001-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000002', 'Cold Brew', '12-hour steeped single-origin beans.', 5.50, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=800&auto=format&fit=crop', 2, 2),
  ('a0000001-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000003', 'Butter Croissant', 'Flaky, buttery, and baked fresh every morning.', 4.00, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop', 1, 1),
  ('a0000001-0000-0000-0000-000000000007', 'c0000001-0000-0000-0000-000000000003', 'Pain au Chocolat', 'Dark chocolate nestled in layers of pastry.', 4.50, 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?q=80&w=800&auto=format&fit=crop', 1, 2);

-- Options: Size for coffee items
INSERT INTO menu_item_options (id, menu_item_id, name, is_required, display_order)
SELECT gen_random_uuid(), mi.id, 'Size', true, 1
FROM menu_items mi
WHERE mi.category_id IN ('c0000001-0000-0000-0000-000000000001','c0000001-0000-0000-0000-000000000002');

-- Size values
INSERT INTO option_values (option_id, label, price_adjustment, is_default, display_order)
SELECT mio.id, v.label, v.adj, v.def, v.ord
FROM menu_item_options mio
CROSS JOIN (VALUES ('Small', -0.50, false, 1), ('Medium', 0.00, true, 2), ('Large', 0.75, false, 3)) AS v(label, adj, def, ord)
WHERE mio.name = 'Size';

-- Options: Milk for coffee items
INSERT INTO menu_item_options (id, menu_item_id, name, is_required, display_order)
SELECT gen_random_uuid(), mi.id, 'Milk Type', false, 2
FROM menu_items mi
WHERE mi.category_id IN ('c0000001-0000-0000-0000-000000000001','c0000001-0000-0000-0000-000000000002');

-- Milk values
INSERT INTO option_values (option_id, label, price_adjustment, is_default, display_order)
SELECT mio.id, v.label, v.adj, v.def, v.ord
FROM menu_item_options mio
CROSS JOIN (VALUES ('Whole', 0.00, true, 1), ('Oat', 0.50, false, 2), ('Almond', 0.50, false, 3), ('Soy', 0.25, false, 4), ('Coconut', 0.50, false, 5)) AS v(label, adj, def, ord)
WHERE mio.name = 'Milk Type';

-- Addons for coffee items
INSERT INTO menu_item_addons (menu_item_id, name, price, display_order)
SELECT mi.id, v.name, v.price, v.ord
FROM menu_items mi
CROSS JOIN (VALUES ('Extra Shot', 1.00, 1), ('Whipped Cream', 0.75, 2), ('Vanilla Syrup', 0.50, 3), ('Caramel Drizzle', 0.50, 4)) AS v(name, price, ord)
WHERE mi.category_id IN ('c0000001-0000-0000-0000-000000000001','c0000001-0000-0000-0000-000000000002');

-- Inventory Items
INSERT INTO inventory_items (name, unit, current_stock, low_stock_threshold) VALUES
  ('Espresso Beans', 'kg', 50, 5),
  ('Whole Milk', 'liters', 40, 8),
  ('Oat Milk', 'liters', 30, 5),
  ('Almond Milk', 'liters', 20, 5),
  ('Soy Milk', 'liters', 15, 5),
  ('Coconut Milk', 'liters', 15, 5),
  ('Vanilla Syrup', 'bottles', 10, 2),
  ('Caramel Syrup', 'bottles', 10, 2),
  ('Butter Croissants', 'units', 50, 10),
  ('Chocolate Pastries', 'units', 40, 8),
  ('Ice', 'kg', 30, 5),
  ('Cups (Small)', 'units', 200, 50),
  ('Cups (Medium)', 'units', 200, 50),
  ('Cups (Large)', 'units', 200, 50);
