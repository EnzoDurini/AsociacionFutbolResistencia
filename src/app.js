import express from 'express';
import { __dirname } from "./utils.js"
import dotenv from 'dotenv';
import indexRouter from './routes/index.router.js';
import path from "node:path";

const app = express();


app.use(express.json());
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }));
dotenv.config({path: './.env'})
app.use(express.static(__dirname + "/public"));

app.use('/', indexRouter);

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});