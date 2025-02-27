import { Make_Query } from "../database/databaseConnection.js";


async function Register(request, response) {
    try{
        const 
        {   Email,
            Password,
            Username,
            Role
        } = request.body
        console.log(`Register as a ${Role}`)
        if(Email && Password && Role && Username){
            try{
                const create_user = await Make_Query(`INSERT INTO Users(Email, Username, Phone_number, Password, Role) VALUES ('${Email}', '${Username}', 'none', '${Password}', '${Role}')`);
                console.info('New user has created..');
                response.status(200).json({
                    success: true,
                    message: `New user (${Email}) with Role: ${Role} has created..`,
                    data: {Username: Username, Password: "*****************"}
                })
            }
            catch(error){
                return{
                    success: false,
                    message: error
                }
            }
        }
    }
    catch(error){
        return{
            success: false,
            message: error
        }
    }
}


export default Register;