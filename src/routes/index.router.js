import { Router } from 'express';
import sql from 'mssql';
import { createEquipo, deleteEquipo, getEquipos, updateEquipo } from '../controllers/equipoController.js';
import {createJugador,deleteJugador,getJugadores,updateJugador} from '../controllers/jugadorController.js';
import { createArbitro, deleteArbitro, getArbitros, updateArbitro } from '../controllers/arbitroController.js';
import { createupdatePartido, updatePartido} from '../controllers/partidoController.js';
import {createFecha, deleteFecha, getFechas, updateFecha} from '../controllers/fechaController.js';
import { createRueda, deleteRueda, getRuedas, updateRueda} from '../controllers/ruedaController.js';
import { createTorneo, getTorneos, updateTorneo, deleteTorneo, getTorneosPorCategoriaYDivision } from '../controllers/torneoController.js';
import { generateFixture, getFixture, renderFixturePage} from '../controllers/fixtureController.js';
import { getEquipoByName, verificarInscripcion, inscribirEquipoEnTorneo} from '../controllers/equipoParticipaTorneoController.js';

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


//vista torneo



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
//Trae los equipos por ID de cateogira
router.get('/equipos/categoria/:categoriaFK', async (req, res) => {
  try {
    const { categoriaFK } = req.params;
    const pool = await getConnection();

    const equiposResult = await pool.request()
      .input('categoriaFK', sql.VarChar, categoriaFK)
      .query(`
        SELECT NROEQUIPO, NombreEquipo 
        FROM Equipo 
        WHERE CATEGORIAFK = @categoriaFK
      `);

    res.json(equiposResult.recordset);
  } catch (error) {
    console.error('Error al obtener equipos por categoría:', error.message);
    res.status(500).json({ message: 'Error al obtener equipos por categoría' });
  }
});


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
router.get('/torneos/filtrar', getTorneosPorCategoriaYDivision)
router.get('/torneo', async (req, res) => {
  try {
    const pool = await getConnection();
    const categoriasResult = await pool.request().query('SELECT * FROM Categoria');
    const divisionesResult = await pool.request().query('SELECT * FROM Division');
    const torneosResult = await pool.request().query('SELECT * FROM Torneo');

    res.render('torneo', {
      categorias: categoriasResult.recordset,
      divisiones: divisionesResult.recordset,
      torneos: torneosResult.recordset, // Agregar torneos si es necesario
    });
  } catch (error) {
    console.error('Error al cargar la vista de torneo:', error.message);
    res.status(500).send('Error interno al cargar la vista de torneo');
  }
});
//Inscripcion de equipos en torneo
router.post('/torneos/:id/inscribirEquipo', async (req, res) => {
  try {
    const { id } = req.params; // ID del torneo
    const { NROEQUIPO, Division, Categoria } = req.body;

    const pool = await getConnection();

    // Verificar si el equipo cumple con la categoría y división
    const equipoValido = await pool.request()
      .input('NROEQUIPO', sql.Int, NROEQUIPO)
      .input('Division', sql.VarChar, Division)
      .input('Categoria', sql.VarChar, Categoria)
      .query(`
        SELECT 1 
        FROM Equipo 
        WHERE NROEQUIPO = @NROEQUIPO 
          AND DivisionFK = @Division 
          AND CategoriaFK = @Categoria
      `);

    if (equipoValido.recordset.length === 0) {
      return res.status(400).json({ message: 'El equipo no cumple con la categoría o división del torneo.' });
    }

    // Inscribir al equipo en el torneo
    await pool.request()
      .input('IDTORNEO', sql.Int, id)
      .input('NROEQUIPO', sql.Int, NROEQUIPO)
      .query(`
        INSERT INTO InscripcionTorneo (IDTORNEO, NROEQUIPO)
        VALUES (@IDTORNEO, @NROEQUIPO)
      `);

    res.status(201).json({ message: 'Equipo inscrito exitosamente.' });
  } catch (error) {
    console.error('Error al inscribir equipo en torneo:', error.message);
    res.status(500).json({ message: 'Error al inscribir equipo en el torneo.' });
  }
});

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
router.post('/partidos', createupdatePartido)
router.post('/partido/update', updatePartido);


// FIXTURES

router.get('/fixture', renderFixturePage);
router.post('/fixtures/generate', generateFixture);
router.get('/fixtures/detalle/:id', getFixture);




router.get('/equipos/nombre/:nombre', getEquipoByName);
router.post('/torneos/verificarInscripcion', verificarInscripcion);
router.post('/torneos/inscribirEquipo', inscribirEquipoEnTorneo);







export default router;
