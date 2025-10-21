-- Add totalPrice column to bookings table
ALTER TABLE bookings
ADD COLUMN total_price DECIMAL(12, 2);

-- Update existing bookings to calculate totalPrice
-- (This will set NULL for now, next bookings will have the price)
UPDATE bookings b
JOIN ticket_types tt ON b.ticket_type_id = tt.id
SET b.total_price = tt.price * b.quantity;

-- Make the column NOT NULL after updating existing records
ALTER TABLE bookings
MODIFY COLUMN total_price DECIMAL(12, 2) NOT NULL;
