import { getConnection } from './dbController.js';
import sql from 'mssql';

// Crear torneo y fixture asociado
export const createTorneo = async (req, res) => {
  try {
    const { NOMBRETORNEO, FechaInicioTorneo, FechaFinTorneo, FechaInicioInscripcion, FechaFinInscripcion, Division, Categoria } = req.body;
    console.log(req.body)
    const pool = await getConnection();

    const siguienteTorneoID = (await pool.request().query(`
      SELECT ISNULL(MAX(IDTORNEO), 0) + 10 AS SiguienteTorneoID FROM Torneo
    `)).recordset[0].SiguienteTorneoID;

    const siguienteFixtureID = (await pool.request().query(`
      SELECT ISNULL(MAX(IdFixture), 0) + 100 AS SiguienteFixtureID FROM Fixture
    `)).recordset[0].SiguienteFixtureID;

    // Crear el torneo
    await pool.request()
      .input('IDTORNEO', sql.Int, siguienteTorneoID)
      .input('NOMBRETORNEO', sql.VarChar, NOMBRETORNEO)
      .input('FechaInicioTorneo', sql.Date, FechaInicioTorneo)
      .input('FechaFinTorneo', sql.Date, FechaFinTorneo)
      .input('FechaInicioInscripcion', sql.Date, FechaInicioInscripcion)
      .input('FechaFinInscripcion', sql.Date, FechaFinInscripcion)
      .query(`
        INSERT INTO Torneo (IDTORNEO, NOMBRETORNEO, FechaInicioTorneo, FechaFinTorneo, FechaInicioInscripcion, FechaFinInscripcion)
        VALUES (@IDTORNEO, @NOMBRETORNEO, @FechaInicioTorneo, @FechaFinTorneo, @FechaInicioInscripcion, @FechaFinInscripcion)
      `);

    // Crear el fixture asociado
    await pool.request()
      .input('IdFixture', sql.Int, siguienteFixtureID)
      .input('IdTorneoFK', sql.Int, siguienteTorneoID)
      .input('Division', sql.VarChar, Division)
      .input('Categoria', sql.VarChar, Categoria)
      .query(`
        INSERT INTO Fixture (IdFixture, IdTorneoFK, Division, Categoria)
        VALUES (@IdFixture, @IdTorneoFK, @Division, @Categoria)
      `);

    res.status(201).send('Torneo y fixture creados exitosamente');
  } catch (error) {
    console.error('Error al crear torneo y fixture:', error.message);
    res.status(500).send('Error al crear torneo y fixture');
  }
};


export const deleteTorneo = async (req, res) => {
  try {
    const { id } = req.params; // ID del torneo a eliminar
    const pool = await getConnection();

    // Eliminar fixtures asociados al torneo
    await pool
      .request()
      .input('IDTORNEO', sql.Int, id)
      .query('DELETE FROM Fixture WHERE IdTorneoFK = @IDTORNEO');

    // Eliminar el torneo
    await pool
      .request()
      .input('IDTORNEO', sql.Int, id)
      .query('DELETE FROM Torneo WHERE IDTORNEO = @IDTORNEO');

    res.status(200).send('Torneo y sus fixtures asociados eliminados exitosamente');
  } catch (error) {
    console.error('Error al eliminar torneo:', error.message);
    res.status(500).send('Error al eliminar torneo');
  }
};

export const getTorneos = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query('SELECT * FROM Torneo');

    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener torneos:', error.message);
    res.status(500).send('Error al obtener torneos');
  }
};

export const getTorneosPorCategoriaYDivision = async (req, res) => {
  try {
    const { categoria, division } = req.query; // Recibe parámetros de consulta

    const pool = await getConnection();
    const result = await pool
      .request()
      .input('Categoria', sql.VarChar, categoria)
      .input('Division', sql.VarChar, division)
      .query(`
        SELECT T.*
        FROM Torneo T
        JOIN Fixture F ON T.IDTORNEO = F.IdTorneoFK
        WHERE F.IdCategoriaFK = @Categoria AND F.IdDivisionFK = @Division
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener torneos por categoría y división:', error.message);
    res.status(500).send('Error al obtener torneos por categoría y división');
  }
};

export const updateTorneo = async (req, res) => {
  try {
    const { id } = req.params; // ID del torneo a actualizar
    const {
      NOMBRETORNEO,
      FechaInicioTorneo,
      FechaFinTorneo,
      FechaInicioInscripcion,
      FechaFinInscripcion,
    } = req.body;

    const pool = await getConnection();

    await pool
      .request()
      .input('IDTORNEO', sql.Int, id)
      .input('NOMBRETORNEO', sql.VarChar, NOMBRETORNEO)
      .input('FechaInicioTorneo', sql.Date, FechaInicioTorneo)
      .input('FechaFinTorneo', sql.Date, FechaFinTorneo)
      .input('FechaInicioInscripcion', sql.Date, FechaInicioInscripcion)
      .input('FechaFinInscripcion', sql.Date, FechaFinInscripcion)
      .query(`
        UPDATE Torneo
        SET
          NOMBRETORNEO = @NOMBRETORNEO,
          FechaInicioTorneo = @FechaInicioTorneo,
          FechaFinTorneo = @FechaFinTorneo,
          FechaInicioInscripcion = @FechaInicioInscripcion,
          FechaFinInscripcion = @FechaFinInscripcion
        WHERE IDTORNEO = @IDTORNEO
      `);

    res.status(200).send('Torneo actualizado exitosamente');
  } catch (error) {
    console.error('Error al actualizar torneo:', error.message);
    res.status(500).send('Error al actualizar torneo');
  }
};
