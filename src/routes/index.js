import express from 'express';
import { registrarEquipo } from '../controllers/equiposController.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.render('index');
});

router.post('/equipos', registrarEquipo);

export default router;
