import {Router} from 'express';
import { userModel } from '../models/users.models.js';

const userRouter = Router()

userRouter.post('/', async (req, res) => {
    const { first_name, last_name, email, password, confirmation_password, role, age } = req.body
    try{
        if(password !== confirmation_password) throw new Error("Las contraseñas no coinciden")
        else{
            try{
                const user= await userModel.findOne({email})
                if(user) throw new Error("Ya existe un usuario con ese email")
                else{
                    const response= await userModel.create({first_name, last_name, email, password, role, age})
                    res.status(201).send({mensage:"Usuario creado"})}
                    
                }
            catch(e){
                res.status(400).send({mensage:`Error al crear usuario: ${e}`})
            
            }
        }
    }
    catch (e) {
        res.status(400).send({mensage:`Error al crear usuario: ${e}`})
    }
})

/* userRouter.get('/logout', (req, res) => {
    if(req.session.login) {
        req.session.destroy(() => {
            res.status(200).send({mensage:"Sesion cerrada"})
        })
    }
    else {
        res.status(400).send({mensage:"No has iniciado sesion"})
    }
}) */

export default userRouter
    