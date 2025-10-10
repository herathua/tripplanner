-- Add currency column to trips table
-- This migration adds currency support to existing trips

-- Add currency column with default value 'USD'
ALTER TABLE trips ADD COLUMN currency VARCHAR(3) NOT NULL DEFAULT 'USD';

-- Update existing trips to use USD as default currency
-- (This is already handled by the DEFAULT 'USD' above)

-- Add index on currency column for better query performance
CREATE INDEX idx_trips_currency ON trips(currency);

-- Verify the migration
SELECT 
    COUNT(*) as total_trips,
    COUNT(CASE WHEN currency = 'USD' THEN 1 END) as usd_trips,
    COUNT(CASE WHEN currency != 'USD' THEN 1 END) as other_currency_trips
FROM trips;
