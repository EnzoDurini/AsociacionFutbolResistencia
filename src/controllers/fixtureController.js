import { getConnection } from './dbController.js';
import sql from 'mssql';

// Generar fixture automáticamente
export const generateFixture = async (req, res) => {
  try {
    const { idTorneo, nroRuedas } = req.body;

    const pool = await getConnection();

    // Obtener equipos inscritos en el torneo
    const resultEquipos = await pool.request()
      .input('IdTorneoFK', sql.Int, idTorneo)
      .query(`
        SELECT E.NROEQUIPO, E.NombreEquipo
        FROM EquipoParticipaTorneo EP
        JOIN Equipo E ON EP.NroEquipoFK = E.NROEQUIPO
        WHERE EP.IdTorneoFK = @IdTorneoFK
      `);

    const equipos = resultEquipos.recordset;

    if (equipos.length < 2) {
      return res.status(400).send('Se necesitan al menos 2 equipos para generar un fixture.');
    }

    // Crear el fixture asociado al torneo
    const resultFixture = await pool.request()
      .input('IdTorneoFK', sql.Int, idTorneo)
      .query(`
        INSERT INTO Fixture (IdTorneoFK, NombreFixture)
        OUTPUT INSERTED.IdFixture
        VALUES (@IdTorneoFK, 'Fixture Torneo ' + (SELECT NOMBRETORNEO FROM TORNEO WHERE IDTORNEO = @IdTorneoFK))
      `);

    const idFixture = resultFixture.recordset[0].IdFixture;

    for (let ronda = 1; ronda <= nroRuedas; ronda++) {
      // Crear una nueva ronda
      const resultRueda = await pool.request()
        .input('IdFixtureFK', sql.Int, idFixture)
        .input('NroRueda', sql.Int, ronda)
        .input('NombreRueda', sql.VarChar, `Ronda ${ronda}`)
        .query(`
          INSERT INTO Rueda (IdFixtureFK, NroRueda, NombreRueda)
          OUTPUT INSERTED.IdRueda
          VALUES (@IdFixtureFK, @NroRueda, @NombreRueda)
        `);

      const idRueda = resultRueda.recordset[0].IdRueda;

      let equiposRotables = [...equipos]; // Copia de los equipos para rotar

      const numFechas = equipos.length - 1; // Número de fechas necesarias para enfrentamientos únicos

      for (let fecha = 1; fecha <= numFechas; fecha++) {
        // Crear fecha
        const resultFecha = await pool.request()
          .input('NroFecha', sql.Int, fecha)
          .input('IdRuedaFK', sql.Int, idRueda)
          .query(`
            INSERT INTO Fecha (NroFecha, IdRuedaFK)
            OUTPUT INSERTED.IdFecha
            VALUES (@NroFecha, @IdRuedaFK)
          `);

        const idFecha = resultFecha.recordset[0].IdFecha;

        // Generar partidos para esta fecha
        const partidos = [];
        const mitad = Math.floor(equiposRotables.length / 2);

        for (let i = 0; i < mitad; i++) {
          const equipoLocal = equiposRotables[i];
          const equipoVisitante = equiposRotables[equiposRotables.length - 1 - i];
          partidos.push({ local: equipoLocal.NROEQUIPO, visitante: equipoVisitante.NROEQUIPO });
        }

        for (const partido of partidos) {
          await pool.request()
            .input('FechaHoraEncuentro', sql.DateTime, new Date()) // Horario predeterminado
            .input('DNIARBITROFK', sql.Int, null) // Árbitro no asignado inicialmente
            .input('IdEquipoLocal', sql.Int, partido.local)
            .input('IdEquipoVisitante', sql.Int, partido.visitante)
            .input('NombreCancha', sql.VarChar, null)
            .input('UbicCancha', sql.VarChar, null)
            .input('NroFechaFK', sql.Int, idFecha)
            .query(`
              INSERT INTO Partido (FechaHoraEncuentro, DNIARBITROFK, IdEquipoLocal, IdEquipoVisitante, NombreCancha, UbicCancha, NroFechaFK)
              VALUES (@FechaHoraEncuentro, @DNIARBITROFK, @IdEquipoLocal, @IdEquipoVisitante, @NombreCancha, @UbicCancha, @NroFechaFK)
            `);
        }

        // Rotar equipos (excepto el primero)
        const [fijo, ...resto] = equiposRotables;
        equiposRotables = [fijo, resto.pop(), ...resto];
      }
    }

    res.status(201).send('Fixture generado con éxito.');
  } catch (error) {
    console.error('Error al generar el fixture:', error.message);
    res.status(500).send('Error interno del servidor.');
  }
};



// Obtener detalles de un fixture
// Obtener detalles de un fixture
export const getFixture = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    // Obtener los detalles del fixture
    const detalles = await pool.request()
      .input('IdFixture', sql.Int, id)
      .query(`
    SELECT
      R.IdFixtureFK,
      R.IdRueda,
      R.NombreRueda,
      F.NroFecha,
      P.IDPARTIDO, 
      P.FechaHoraEncuentro, 
      P.NombreCancha, 
      P.UbicCancha, 
      CONCAT(Pe.Nombre, ' ', Pe.Apellido) AS NombreArbitro, 
      EL.NombreEquipo AS EquipoLocal, 
      EV.NombreEquipo AS EquipoVisitante
    FROM Partido P
    LEFT JOIN Arbitro A ON P.DNIARBITROFK = A.DNIFK
    LEFT JOIN Persona Pe ON A.DNIFK = Pe.DNI
    LEFT JOIN Equipo EL ON P.IdEquipoLocal = EL.NROEQUIPO
    LEFT JOIN Equipo EV ON P.IdEquipoVisitante = EV.NROEQUIPO
    LEFT JOIN Fecha F ON P.NroFechaFK = F.IdFecha
    LEFT JOIN Rueda R ON F.IdRuedaFK = R.IdRueda
    WHERE R.IdFixtureFK = @IdFixture;
  `);

    // Obtener todos los árbitros disponibles
    const arbitros = await pool.request().query(`
      SELECT 
        A.DNIFK, 
        CONCAT(Pe.Nombre, ' ', Pe.Apellido) AS NombreArbitro
      FROM Arbitro A
      INNER JOIN Persona Pe ON A.DNIFK = Pe.DNI
    `);

    // Renderizar la vista con los detalles del fixture y los árbitros
    res.render('detalleFixture', {
      fixtureDetalles: detalles.recordset,
      arbitros: arbitros.recordset,
    });
  } catch (error) {
    console.error('Error al obtener detalles del fixture:', error.message);
    res.status(500).send('Error al obtener detalles del fixture.');
  }
};



export const renderFixturePage = async (req, res) => {
  try {
    const pool = await getConnection();

    // Obtener todos los fixtures
    const fixturesResult = await pool.request().query(`
      SELECT 
        F.IdFixture, 
        F.NombreFixture, 
        T.NOMBRETORNEO, 
        C.Categoria, 
        D.Division
      FROM Fixture F
      INNER JOIN Torneo T ON F.IdTorneoFK = T.IDTORNEO
      INNER JOIN Categoria C ON T.CategoriaFK = C.Categoria
      INNER JOIN Division D ON T.DivisionFK = D.Division
    `);

    // Obtener todos los torneos
    const torneosResult = await pool.request().query(`
      SELECT T.IDTORNEO, T.NOMBRETORNEO FROM Torneo T
    `);

    res.render('fixture', {
      fixtures: fixturesResult.recordset || [],
      torneos: torneosResult.recordset || [],
    });
  } catch (error) {
    console.error('Error al obtener fixtures y torneos:', error.message);

    // En caso de error, enviamos arreglos vacíos
    res.render('fixture', { fixtures: [], torneos: [] });
  }
};

