import 'dotenv/config' //Permite utilizar variables de entorno
import express from 'express';
import cartRouter from "./routes/cart.routes.js"; 
import { engine } from 'express-handlebars';
import Handlebars from 'handlebars';
import __dirname from "./utils.js";
import path from 'path';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import {productModel} from './models/products.models.js';
import productRouter from './routes/products.routes.js';
import userRouter from './routes/users.routes.js';
import sessionRouter from './routes/session.routes.js';
import {allowInsecurePrototypeAccess} from '@handlebars/allow-prototype-access';
import cookieParser from 'cookie-parser'
import session from 'express-session'
import MongoStore from 'connect-mongo' 
import Swal from "sweetalert2";

const app = express();
const PORT = 4000;

//DB
mongoose.connect(process.env.MONGO_URL)
    .then(async () => {console.log('Base de datos conectada')
        //await cartModel.create({})
    })
    .catch((error) => console.log("Error en conexion con MongoDB ATLAS: ", error))

// Middlewares

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(`${__dirname}/public`));
app.use(session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        mongoOptions: {useNewUrlParser: true, useUnifiedTopology: true},
        ttl: 90
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}))

app.engine('handlebars', engine({
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}));

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '/views'));

//Main

app.get('/', (req, res) => {
    if(req.session.login){
        req.session.counter++;
        res.render("home",{
            logged: true,
            user: req.session.user,
            counter: req.session.counter > 1 ? false : true,
            logout: "/api/session/logout",
            rutaJs: "home",
            rutaCss: "style"
        }
        );}
    else{
        req.session.counter = 0;
        res.redirect('/login')
    }
});


//Sessions

app.get('/login', (req, res) => {
    res.render("login",{
        logged: req.session.login,
        rutaJs: "script",
        rutaCss: "login"
    });
})

app.get('/signup', (req, res) => {
    res.render("createUser",{
        rutaJs: "script",
        rutaCss: "signup"
    });
})


//Routes

app.use('/api/products', productRouter)
app.use('/api/carts', cartRouter)
app.use('/api/users', userRouter)
app.use('/api/session', sessionRouter)


app.get('/realtimeproducts', async (req, res) => {
    let { limit } = req.query;
    let products = await productModel.find().limit(parseInt(limit));
    res.render("realTimeProducts", {
        logged: req.session.login,
        user: req.session.user,
        products: products,
        rutaJs: "realTimeProducts",
        rutaCss: "realTimeProducts",
        logout: "/api/session/logout",
    });
}); 

//Server
const server = app.listen(PORT, () => {console.log(`\nServidor escuchando en http://localhost:${PORT}`);});
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado');

    socket.on('agregarProducto', async (product) => {
        console.log(product);
        try{
            await productModel.create(product);
            let products = await productModel.find()
            io.emit('productos', products);
        }catch(e){
            console.log(e);
        }
    });
});

app.set('io', io);