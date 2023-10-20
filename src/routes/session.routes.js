import {Router} from 'express';
import { userModel } from '../models/users.models.js';

const sessionRouter = Router()

sessionRouter.post('/login', async (req, res) => {
    const {email, password} = req.body
    try{
        if(req.session.login) {
            return res.redirect('../../')
        }
        const user = await userModel.findOne({email:email})
        if(user) {
            if(user.password === password) {
                req.session.login = true
                req.session.user={
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    role: user.role,
                    age: user.age
                }
                res.redirect('../../')
            }
            else {
                res.status(401).send({mensage:"Contraseña incorrecta"})
            }
        }
        else {
            res.status(404).send({mensage:"No existe el usuario"})
        }
    }
    catch {
        res.status(400).send({mensage:"Error en la consulta"})
    }
})

sessionRouter.get('/logout', (req, res) => {
    req.session.destroy(() => {
    })
    res.redirect('../../')
})

export default sessionRouter
    