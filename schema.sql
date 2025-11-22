CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_reset_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    otp VARCHAR(10) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE product_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE units (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    abbreviation VARCHAR(10) NOT NULL
);

CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    category_id BIGINT,
    unit_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES product_categories(id),
    FOREIGN KEY (unit_id) REFERENCES units(id)
);

CREATE TABLE locations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address VARCHAR(255)
);

CREATE TABLE stock (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    location_id BIGINT NOT NULL,
    quantity DECIMAL(18,2) NOT NULL DEFAULT 0,

    UNIQUE(product_id, location_id),

    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

CREATE TABLE receipts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    reference_no VARCHAR(100) UNIQUE NOT NULL,
    vendor_name VARCHAR(150) NOT NULL,
    status ENUM('Draft','Waiting','Ready','Done','Cancelled') DEFAULT 'Draft',
    receipt_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE receipt_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    receipt_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity DECIMAL(18,2) NOT NULL,
    
    FOREIGN KEY (receipt_id) REFERENCES receipts(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE deliveries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    reference_no VARCHAR(100) UNIQUE NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    status ENUM('Draft','Waiting','Ready','Done','Cancelled') DEFAULT 'Draft',
    delivery_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE delivery_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    delivery_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity DECIMAL(18,2) NOT NULL,
    
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE transfers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    reference_no VARCHAR(100) UNIQUE NOT NULL,
    from_location_id BIGINT NOT NULL,
    to_location_id BIGINT NOT NULL,
    status ENUM('Draft','Waiting','Ready','Done','Cancelled') DEFAULT 'Draft',
    transfer_date DATE NOT NULL,

    FOREIGN KEY (from_location_id) REFERENCES locations(id),
    FOREIGN KEY (to_location_id) REFERENCES locations(id)
);

CREATE TABLE transfer_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    transfer_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity DECIMAL(18,2) NOT NULL,
    
    FOREIGN KEY (transfer_id) REFERENCES transfers(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE adjustments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    reference_no VARCHAR(100) UNIQUE NOT NULL,
    product_id BIGINT NOT NULL,
    location_id BIGINT NOT NULL,
    counted_quantity DECIMAL(18,2) NOT NULL,
    system_quantity DECIMAL(18,2) NOT NULL,
    difference DECIMAL(18,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

CREATE TABLE stock_ledger (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    movement_type ENUM('RECEIPT','DELIVERY','TRANSFER','ADJUSTMENT') NOT NULL,
    reference_no VARCHAR(100) NOT NULL,

    product_id BIGINT NOT NULL,
    from_location_id BIGINT NULL,
    to_location_id BIGINT NULL,

    quantity DECIMAL(18,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (from_location_id) REFERENCES locations(id),
    FOREIGN KEY (to_location_id) REFERENCES locations(id)
);