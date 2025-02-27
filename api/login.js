import { Make_Query } from "../database/databaseConnection.js";

async function Login(request, response) {
    try{
        const{   
            Email, 
            Password
        } = request.body;
        if(Email && Password){
            const check_email = await Make_Query(`SELECT COUNT (*) FROM Users WHERE Email = '${Email}'`)
            let check_email_result = (check_email[0]['COUNT (*)'])
            if(check_email_result === 1){
                const [check_authentication] = await Make_Query(`SELECT Password, Role FROM Users WHERE Email = '${Email}'`)

                const  get_password = check_authentication?.Password;
                const get_user_role = check_authentication?.Role;
                if (Password == get_password){
                    if(get_user_role == "Seller"){
                        const get_seller_info = await Make_Query(`SELECT * FROM Users INNER JOIN Stores ON Users.User_id =  Stores.User_id WHERE Email = '${Email}'`);
                        response.status(200).send({
                            success: true,
                            message: "Login Successfully..",
                            data : get_seller_info,
                        })
                        return{
                            success: true,
                            message: "Login Successfully..",
                            data: Email
                        }
                    }
                    if(get_user_role == "User"){
                        const get_user_info = await Make_Query(`SELECT * FROM Users WHERE Email = '${Email}'`)
                        response.status(200).send({
                            success: true,
                            message: "Login Successfully..",
                            data: get_user_info
                        })
                    }
                }
                else{
                    response.status(404).send({
                        success: false,
                        message: "Password incorrect!"
                    });
                }
            }
            else{
                response.status(404).send({
                    success: false,
                    message: "Email doesn't exits in system..",
                    data: Email
                })
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

export default Login;