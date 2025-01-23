SELECT * FROM Store_Drink
SELECT * FROM Drink
SELECT * FROM Stores
SELECT * FROM Store_Drink
SELECT * FROM orders

DESCRIBE orders
DELETE FROM Orders WHERE Store_id = 1
ALTER TABLE Orders
MODIFY COLUMN Pickup_time VARCHAR(255);

SELECT * FROM Drink INNER JOIN Store_Drink
ON Drink.Drink_id = Store_Drink.Drink_id
WHERE Store_Drink.Store_id = 2


SELECT Stores.Store_id
FROM Food
INNER JOIN Menu ON Food.Menu_id = Menu.Menu_id
INNER JOIN Stores ON Menu.Store_id = Stores.Store_id
WHERE Food.Food_id = 2;


DELETE FROM orders WHERE User_id = 12

ALTER TABLE Orders 
CHANGE COLUMN Food_id Food CHAR(255);

DROP TABLE Orders;

Select * from orders
DROP FOREIGN KEY order_status_ibfk_1;

ALTER TABLE order_status
ADD CONSTRAINT fk_user_id
FOREIGN KEY (User_id) REFERENCES Users(User_id)
ON DELETE CASCADE
ON UPDATE CASCADE;


INSERT INTO Orders (Store_id, User_id, Food_item, Drink_item, Total_price, Pickup_time, Order_number, Order_status)
                    VALUES(1, 2, '[{ss:"jsa"}]', 'hashs', 1111, 'hskjuh', 'jaskj', 'Waitting')
                    
SELECT * FROM Stores INNER JOIN Stores.User_id = Users.User_id WHERE Store_id = 1

SELECT * 
FROM Stores
INNER JOIN Users ON Stores.User_id = Users.User_id
WHERE Stores.Store_id = 1;

