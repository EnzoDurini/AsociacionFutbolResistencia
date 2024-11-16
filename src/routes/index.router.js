import { Router } from 'express';
import { registrarEquipo } from '../controllers/equiposController.js';

const router = Router()

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/inscripcion', (req, res) => {
  res.render('inscripcion');
});

router.get('/torneo', (req, res) => {
  res.render('torneo');
});


router.get('/fixture', (req, res) => {
  res.render('fixture');
});



router.get('/encuentros', (req, res) => {
  res.render('encuentros');
});


router.get('/resultados', (req, res) => {
  res.render('resultados');
});
// router.post('/equipos', registrarEquipo);

export default router;
