import express from 'express';
import dotenv from 'dotenv';
import sql from 'mssql';
import indexRouter from './routes/index.js';

dotenv.config();

const app = express();



sql.connect(dbConfig, (err) => {
  if (err) console.error("Error de conexión con SQL Server:", err);
  else console.log("Conectado a SQL Server.");
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/', indexRouter);

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});