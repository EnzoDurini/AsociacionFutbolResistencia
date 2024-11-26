import { Router } from 'express';
import sql from 'mssql';
import { createEquipo, deleteEquipo, getEquipos, updateEquipo } from '../controllers/equipoController.js';
import {createJugador,deleteJugador,getJugadores,updateJugador} from '../controllers/jugadorController.js';
import { createArbitro, deleteArbitro, getArbitros, updateArbitro } from '../controllers/arbitroController.js';
import { createTorneo, deleteTorneo, getTorneos, updateTorneo } from '../controllers/torneoController.js';
import { createPartido, deletePartido, getPartidos, updatePartido } from '../controllers/partidoController.js';
import {createFecha, deleteFecha, getFechas, updateFecha} from '../controllers/fechaController.js';
import { createRueda, deleteRueda, getRuedas, updateRueda} from '../controllers/ruedaController.js';
import { getConnection } from '../controllers/dbController.js';

const router = Router()

router.get('/', (req, res) => {
  res.render('index');
});

//INSCRIPCION
router.get('/inscripcion', async (req, res) => {
  try {
      const pool = await getConnection();
      const divisionesResult = await pool.request().query('SELECT * FROM Division');
      const categoriasResult = await pool.request().query('SELECT * FROM Categoria');
      const equiposResult = await pool.request().query('SELECT * FROM Equipo');
      const siguienteNumeroEquipo = (await pool.request().query(
          'SELECT MAX(NROEQUIPO) + 1 AS Siguiente FROM Equipo'
      )).recordset[0].Siguiente;

      res.render('inscripcion', {
          divisiones: divisionesResult.recordset,
          categorias: categoriasResult.recordset,
          equipos: equiposResult.recordset,
          siguienteNumEquipo: siguienteNumeroEquipo,
      });
  } catch (error) {
      console.error('Error al cargar la vista de inscripción:', error.message);
      res.status(500).send('Error interno');
  }
});


//Trae los equipos por ID de cateogira
router.get('/equipos/categoria/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    const equiposResult = await pool.request()
      .input('idCategoria', sql.Int, id)
      .query('SELECT NROEQUIPO, NombreEquipo FROM Equipo WHERE IDCATEGORIAFK = @idCategoria');

    res.json(equiposResult.recordset);
  } catch (error) {
    console.error('Error al obtener equipos por categoría:', error.message);
    res.status(500).json({ message: 'Error al obtener equipos por categoría' });
  }
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
router.get('/equipos', getEquipos)

router.post('/equipos',createEquipo)

router.put('/equipos/:id', updateEquipo)

router.delete('/equipos/:id', deleteEquipo)


//JUGADOR
router.get('/jugadores', getJugadores)

router.post('/jugadores',createJugador)

router.put('/jugadores/:dni', updateJugador)

router.delete('/jugadores/:dni', deleteJugador)

//ARBITRO
router.get('/arbitros', getArbitros)

router.post('/arbitros',createArbitro)

router.put('/arbitros/:id', updateArbitro)

router.delete('/arbitros/:id', deleteArbitro)

//TORNEO
router.get('/torneos', getTorneos)
router.post('/torneos', createTorneo)
router.put('/torneos/:id', updateTorneo)
router.delete('/torneos/:id', deleteTorneo)

//FECHA
router.get('/fechas', getFechas)
router.post('/fechas', createFecha)
router.put('/fechas/:id', updateFecha)
router.delete('/fechas/:id', deleteFecha)

//RUEDA

router.get('/ruedas', getRuedas)
router.post('/ruedas', createRueda)
router.put('/ruedas/:id', updateRueda)
router.delete('/ruedas/:id', deleteRueda)

//PARTIDO
router.get('/partidos', getPartidos)
router.post('/partidos', createPartido)
router.put('/partidos/:id', updatePartido)
router.delete('/partidos/:id', deletePartido)


export default router;
