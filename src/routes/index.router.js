import { Router } from 'express';
import sql from 'mssql';
import { createEquipo, deleteEquipo, getEquipos, updateEquipo } from '../controllers/equipoController.js';
import {createJugador,deleteJugador,getJugadores,updateJugador} from '../controllers/jugadorController.js';
import { createArbitro, deleteArbitro, getArbitros, updateArbitro, getArbitrosNombre } from '../controllers/arbitroController.js';
import { createupdatePartido, getPartidosyJugadores, updatePartido, guardarResultadosEncuentro,marcarAusencia} from '../controllers/partidoController.js';
import {createFecha, deleteFecha, getFechas, updateFecha} from '../controllers/fechaController.js';
import { createRueda, deleteRueda, getRuedas, updateRueda} from '../controllers/ruedaController.js';
import { createTorneo, getTorneos, updateTorneo, deleteTorneo, getTorneosPorCategoriaYDivision } from '../controllers/torneoController.js';
import { generateFixture, getFixture, renderFixturePage} from '../controllers/fixtureController.js';
import { getEquipoByName, verificarInscripcion, inscribirEquipoEnTorneo} from '../controllers/equipoParticipaTorneoController.js';
import { getResultados } from '../controllers/resultadosController.js';

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


router.get('/encuentros', async (req, res) => {
  try {
    // Obtener partidos y árbitros
    const pool = await getConnection();

    // Obtener los partidos
    const resultPartidos = await pool.request().query(`
      SELECT 
    P.IDPARTIDO, 
    P.FechaHoraEncuentro, 
    P.NombreCancha, 
    P.UbicCancha,
    P.DNIARBITROFK,
    EL.NombreEquipo AS EquipoLocal, 
    EV.NombreEquipo AS EquipoVisitante,
    CONCAT(PER.Nombre, ' ', PER.Apellido) AS NombreArbitro,
    T.NOMBRETORNEO AS NombreTorneo,
    R.NombreRueda AS NombreRueda,
    F.NroFecha AS NumeroFecha
FROM Partido P
LEFT JOIN Equipo EL ON P.IdEquipoLocal = EL.NROEQUIPO
LEFT JOIN Equipo EV ON P.IdEquipoVisitante = EV.NROEQUIPO
LEFT JOIN Arbitro A ON P.DNIARBITROFK = A.DNIFK
LEFT JOIN Persona PER ON A.DNIFK = PER.DNI
LEFT JOIN Fecha F ON P.NroFechaFK = F.IdFecha
LEFT JOIN Rueda R ON F.IdRuedaFK = R.IdRueda
LEFT JOIN Fixture Fi ON R.IdFixtureFK = Fi.IdFixture
LEFT JOIN Torneo T ON Fi.IdTorneoFK = T.IDTORNEO
      
    `);

    const partidos = resultPartidos.recordset;

    // Obtener los árbitros
    const resultArbitros = await pool.request().query(`
      SELECT A.DNIFK, CONCAT(P.Nombre, ' ', P.Apellido) AS NombreArbitro
      FROM Arbitro A
      INNER JOIN Persona P ON A.DNIFK = P.DNI
    `);

    const arbitros = resultArbitros.recordset;

    // Renderizar la vista
    res.render('encuentros', {
      partidos,
      arbitros,
    });
  } catch (error) {
    console.error('Error al cargar la vista de encuentros:', error.message);
    res.status(500).send('Error interno al cargar la vista de encuentros.');
  }
});




//EQUIPO
router.get('/equipos', getEquipos)
router.post('/equipos',createEquipo)
router.put('/equipos/:id', updateEquipo)
router.post('/partido/update', updatePartido);
router.delete('/equipos/:id', deleteEquipo)
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
});//Trae los equipos por ID de cateogira
router.get('/equipos/nombre/:nombre', getEquipoByName);

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
router.get('/arbitros/nombre', getArbitrosNombre)

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
});//Inscripcion de equipos en torneo

router.post('/torneos/verificarInscripcion', verificarInscripcion);
router.post('/torneos/inscribirEquipo', inscribirEquipoEnTorneo);


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
router.get('/encuentro/:id', getPartidosyJugadores);
router.post('/encuentro/guardar', guardarResultadosEncuentro)
router.post('/encuentro/ausencia', marcarAusencia);
// FIXTURES

router.get('/fixture', renderFixturePage);
router.post('/fixtures/generate', generateFixture);
router.get('/fixtures/detalle/:id', getFixture);

router.get('/resultados', getResultados);

export default router;
