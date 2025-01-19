SELECT * FROM Store_Drink
SELECT * FROM Drink
SELECT * FROM Stores
SELECT * FROM Store_Drink
SELECT * FROM Menu



SELECT * FROM Drink INNER JOIN Store_Drink
ON Drink.Drink_id = Store_Drink.Drink_id
WHERE Store_Drink.Store_id = 2


SELECT Stores.Store_id
FROM Food
INNER JOIN Menu ON Food.Menu_id = Menu.Menu_id
INNER JOIN Stores ON Menu.Store_id = Stores.Store_id
WHERE Food.Food_id = 2;
