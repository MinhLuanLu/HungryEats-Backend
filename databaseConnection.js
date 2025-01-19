import mysql from 'mysql2'


const pool = mysql.createPool({
    host: 'localhost',
    port:3306,
    user: 'root',
    password: '2001002023713385201',
    database:'HungryEats'
}).promise();


export async function Make_Query(query) {
    const [result] = await pool.query(query)
    return result
}

