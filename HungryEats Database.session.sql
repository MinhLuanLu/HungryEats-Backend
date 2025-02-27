INSERT INTO Discounts (User_id, Discount_code, Discount_type, Discount_value, Purchase_count )
            VALUES(
                1,
                'SOTA10',
                'percentage',
                10,
                10
            )

SELECT * FROM Discounts
DELETE FROM Discounts WHERE User_id = 5

CREATE TABLE Discoints VALUES(
    
)
SELECT User_id FROM Users WHERE Email = ${Email}
SELECT * FROM Purchase_log
SELECT * FROM Discounts
SELECT * from Stores
DELETE FROM Orders WHERE Store_id = 1
SELECT EXISTS (SELECT 1 FROM Users WHERE User_id = 12 AND Username = "minhlu142");


SELECT * 
    FROM Discounts 
    INNER JOIN Stores ON Discounts.Store_id = Stores.Store_id 
    WHERE Discounts.Store_id = 1

ALTER TABLE Purchase_log ADD COLUMN Type VARCHAR(255) NOT NULL

SELECT Stores.Store_id, Stores.Store_name, Stores.Address, Stores.Phone_number, Menu.Menu_description, Menu.Menu_name , Menu.Menu_image, Menu.Menu_id
                FROM Stores INNER JOIN Menu
                ON Stores.Store_id = Menu.Store_id  
                WHERE Stores.Store_id = 1 AND Stores.Store_name = ''

SELECT * FROM Menu