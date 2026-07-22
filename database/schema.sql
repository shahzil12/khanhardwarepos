-- Khan Hardware & Oxygen Cylinder Tracking POS System
-- Database Schema (PostgreSQL / Supabase compatible)

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CYLINDER LIFE-CYCLE STATUS ENUM
CREATE TYPE cylinder_status_type AS ENUM (
    'Filled (In Stock)', 
    'Issued to Customer', 
    'Returned (Empty)', 
    'Under Refill'
);

-- 2. WORKERS / DRIVERS REGISTRY TABLE
CREATE TABLE workers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Driver', -- 'Driver' or 'Loader'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. OXYGEN CYLINDER INVENTORY TABLE
CREATE TABLE cylinders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    serial_number VARCHAR(100) UNIQUE NOT NULL, -- Barcode / NFC / Tag ID
    capacity VARCHAR(50) NOT NULL,              -- e.g., '240 cu ft', '40L', '10L'
    gas_type VARCHAR(100) NOT NULL,             -- e.g., 'Medical Oxygen', 'Industrial Oxygen', 'Nitrous Oxide'
    status cylinder_status_type NOT NULL DEFAULT 'Filled (In Stock)',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast cylinder searching by Serial Number
CREATE INDEX idx_cylinders_serial ON cylinders(serial_number);

-- 4. CYLINDER ISSUES & RETURNS TRACKING (LIFECYCLE RECORDS)
CREATE TABLE cylinder_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cylinder_id UUID NOT NULL REFERENCES cylinders(id) ON DELETE CASCADE,
    
    -- Customer Information
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_cnic VARCHAR(20) NOT NULL,       -- National ID (CNIC in Pakistan)
    
    -- Transaction Details
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expected_return_date TIMESTAMP WITH TIME ZONE NOT NULL,
    returned_date TIMESTAMP WITH TIME ZONE,
    
    -- Financial Tracking
    security_deposit DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    refill_charges DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    
    -- Delivery and Worker Logistics
    delivery_type VARCHAR(50) NOT NULL DEFAULT 'Pickup', -- 'Pickup' or 'Delivery'
    assigned_worker_id UUID REFERENCES workers(id) ON DELETE SET NULL,
    delivery_status VARCHAR(50) NOT NULL DEFAULT 'N/A', -- 'N/A', 'Assigned', 'Out for Delivery', 'Delivered', 'Failed'
    cash_collected_by_driver DECIMAL(10, 2) DEFAULT 0.00, -- Collected from customer
    is_cash_returned_to_shop BOOLEAN NOT NULL DEFAULT FALSE,
    cash_amount_returned_to_shop DECIMAL(10, 2) DEFAULT 0.00, -- Actual cash handed to cash drawer
    cash_returned_at TIMESTAMP WITH TIME ZONE,

    -- Settle status
    is_returned BOOLEAN NOT NULL DEFAULT FALSE,
    deposit_returned DECIMAL(10, 2) DEFAULT 0.00,
    settlement_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance and quick overdue alerts
CREATE INDEX idx_issues_cylinder ON cylinder_issues(cylinder_id);
CREATE INDEX idx_issues_unreturned ON cylinder_issues(is_returned) WHERE is_returned = FALSE;
CREATE INDEX idx_issues_overdue ON cylinder_issues(expected_return_date) WHERE is_returned = FALSE;
CREATE INDEX idx_issues_delivery_cash ON cylinder_issues(is_cash_returned_to_shop) WHERE delivery_type = 'Delivery';

-- 5. HARDWARE STORE INVENTORY TABLE
CREATE TABLE hardware_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barcode VARCHAR(100) UNIQUE,              -- Scanner input
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),                     -- e.g., 'Pipes', 'Screws', 'Tools', 'Electrical'
    cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    retail_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stock_quantity INT NOT NULL DEFAULT 0,
    min_threshold INT NOT NULL DEFAULT 10,     -- Visual alerts for restocking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for searching hardware items by barcode or name
CREATE INDEX idx_products_barcode ON hardware_products(barcode);
CREATE INDEX idx_products_name ON hardware_products(name);

-- 6. RETAIL SALES TRANSACTIONS (HARDWARE SALES)
CREATE TABLE sales_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number VARCHAR(100) UNIQUE NOT NULL, -- e.g., KH-2026-0001
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,        -- 'Cash', 'Card', 'Mobile Wallet'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. SALES TRANSACTION ITEMS (LINE ITEMS)
CREATE TABLE sales_transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES sales_transactions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES hardware_products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,        -- Snapshot name in case product gets deleted
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL
);

-- Index for transaction lookup
CREATE INDEX idx_transaction_items ON sales_transaction_items(transaction_id);


-- 8. TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cylinders_modtime 
    BEFORE UPDATE ON cylinders 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_cylinder_issues_modtime 
    BEFORE UPDATE ON cylinder_issues 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_hardware_products_modtime 
    BEFORE UPDATE ON hardware_products 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();
