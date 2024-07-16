import express, { raw } from 'express';
import jwt from 'jsonwebtoken';
import fileUpload from 'express-fileupload';
import agentes from './data/agentes.js'

import * as path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const secretPassword = "Aj45W52H";
const PORT = 3000;

const app = express();

app.listen(3000, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

const validarToken = (req, res, next) => {
    try {
        let { token } = req.query;

        if (!token) {
            return res.status(401).sendFile(path.resolve(__dirname, "./401.html"));
        }

        let decoded = jwt.verify(token, secretPassword);

        req.usuario = decoded;
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error al verificar las credenciales."
        })
    }

};


//Vistas
app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "./index.html"));
});

app.get("/home", validarToken, (req, res) => {
    res.sendFile(path.resolve(__dirname, "./home.html"));
})

//Endpoints
app.post("/api/v1/login", (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Debe ingresar email y contraseña."
            })
        };

        let usuario = agentes.find(agente => agente.email == email && agente.password == password)

        if (!usuario) {
            return res.status(404).json({
                message: "Credenciales inválidas, intente nuevamente."
            })
        }

        const token = jwt.sign(usuario, secretPassword, { expiresIn: '2m' });

        res.status(200).json({
            message: "Inicio de sesión exitoso.",
            token,
            usuario
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error al intentar iniciar sesión, intente mas tarde."
        })
    }
})

app.get("/*", (req, res) => {
    res.status(404).sendFile(path.resolve(__dirname, "./404.html"));
})