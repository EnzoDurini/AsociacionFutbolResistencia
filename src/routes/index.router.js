import { Router } from 'express';
import { createEquipo, deleteEquipo, getEquipos, updateEquipo } from '../controllers/equipoController.js';
import {createJugador,deleteJugador,getJugadores,updateJugador} from '../controllers/jugadorController.js';
import { createArbitro, deleteArbitro, getArbitros, updateArbitro } from '../controllers/arbitroController.js';
import { createTorneo, deleteTorneo, getTorneos, updateTorneo } from '../controllers/torneoController.js';
import { createPartido, deletePartido, getPartidos, updatePartido } from '../controllers/partidoController.js';
import {createFecha, deletePartido, getPartidos, updatePartido} from '../controllers/partidoController.js';
import { createRueda, deleteRueda, getPartidos, updatePartido} from '../controllers/ruedaController.js';

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

//EQUIPO
router.get('/equipos', getEquipos())

router.post('/equipos',createEquipo())

router.put('/equipos/:id', updateEquipo())

router.delete('/equipos/:id', deleteEquipo())

//JUGADOR
router.get('/jugadores', getJugadores())

router.post('/jugadores',createJugador())

router.put('/jugadores/:id', updateJugador())

router.delete('/jugadores/:id', deleteJugador())

//ARBITRO
router.get('/arbitros', getArbitros())

router.post('/arbitros',createArbitro())

router.put('/arbitros/:id', updateArbitro())

router.delete('/arbitros/:id', deleteArbitro())

//TORNEO
router.get('/torneos', getTorneos())
router.post('/torneos', createTorneo())
router.put('/torneos/:id', updateTorneo())
router.delete('/torneos/:id', deleteTorneo())

//FECHA
router.get('/fechas', getFechas())
router.post('/fechas', createFecha())
router.put('/fechas/:id', updateFecha())
router.delete('/fechas /:id', deleteFecha())

//RUEDA

router.get('/ruedas', getRuedas())
router.post('/ruedas', createRueda())
router.put('/ruedas/:id', updateRueda())
router.delete('/ruedas/:id', deleteRueda())

//PARTIDO
router.get('/partidos', getPartidos())
router.post('/partidos', createPartido())
router.put('/partidos/:id', updatePartido())
router.delete('/partidos/:id', deletePartido())
export default router;
