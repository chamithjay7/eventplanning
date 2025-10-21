-- Drop unique constraint on vendors.owner_user_id to allow multiple vendors per user
ALTER TABLE vendors DROP INDEX UKfcng2c7y6w6jk0ucuiboo9ila;
