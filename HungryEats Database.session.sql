INSERT INTO Discounts (User_id, Discount_code, Discount_type, Discount_value, Purchase_count )
            VALUES(
                1,
                'SOTA10',
                'percentage',
                10,
                10
            )

SELECT * FROM Socketio
DELETE FROM Purchase_log WHERE Purchase_log_id  > 5
SHOW TABLES

CREATE TABLE Discoints VALUES(
    
)
SELECT User_id FROM Users WHERE Email = ${Email}
SELECT * FROM Purchase_log
SELECT * FROM Discounts
SELECT * from Stores
DELETE FROM Orders WHERE Store_id = 1
SELECT EXISTS (SELECT 1 FROM Users WHERE User_id = 12 AND Username = "minhlu142");

SELECT * FROM Orders
DESCRIBE Orders
SELECT Socket_id FROM Socketio WHERE User_id = 12

UPDATE Orders SET Order_status = 'failed' WHERE Store_id = 1 AND Order_id > 785
SELECT * 
    FROM Discounts 
    INNER JOIN Stores ON Discounts.Store_id = Stores.Store_id 
    WHERE Discounts.Store_id = 1

ALTER TABLE Purchase_log ADD COLUMN Type VARCHAR(255) NOT NULL

SELECT Stores.Store_id, Stores.Store_name, Stores.Address, Stores.Phone_number, Menu.Menu_description, Menu.Menu_name , Menu.Menu_image, Menu.Menu_id
                FROM Stores INNER JOIN Menu
                ON Stores.Store_id = Menu.Store_id  
                WHERE Stores.Store_id = 1 AND Stores.Store_name = ''

SELECT * FROM purchase_log

SHOW TABLES

SELECT *
FROM Orders 
INNER JOIN Users ON Orders.User_id = Users.User_id
WHERE Orders.store_id = 1 AND Orders.Order_status = 'pending';



DESCRIBE Orders
SELECT * FROM Orders WHERE Order_number = d7561e24-d7a5-4924-96a2-ab957d639063

DELETE FROM Discounts WHERE Discounts_id = 3

ALTER TABLE Orders MODIFY COLUMN Food_item JSON;
ALTER TABLE Orders MODIFY COLUMN Drink_item JSON;


INSERT INTO Orders (Store_id, User_id, Food_item, Drink_item, Total_price, Pickup_time, Order_number, Order_status)
            VALUES
            (
                1, 12,
                "JSON.stringify(Food_item)" , "JSON.stringify(Food_item)",
                120 , "none",
                "888888" , "${orderStatus.pending}"
            )
SELECT * FROM Orders

SHOW TABLES

UPDATE Discounts SET Purchase_count = 1 WHERE Discounts_id = 4


ALTER TABLE Orders
DROP COLUMN Favorite;

ALTER TABLE Store_favorite
ADD COLUMN Favorite BOOL DEFAULT 0;


SELECT * FROM Purchase_log

DELETE FROM Orders WHERE User_id = 12

ALTER TABLE Payments
ADD COLUMN Payment_intents VARCHAR(255)

DESCRIBE Orders




CREATE TABLE Payments (
    Payment_id INT PRIMARY KEY,
    user JSON,
    `Order` JSON,
    Payment_intent JSON,
    Status VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM Menu
SELECT * FROM Food