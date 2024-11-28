import { getConnection } from './dbController.js';
import sql from 'mssql';

// Crear torneo
export const createTorneo = async (req, res) => {
  try {
    console.log(req.body)
    const {
      NOMBRETORNEO,
      FechaInicioTorneo,
      FechaFinTorneo,
      FechaInicioInscripcion,
      FechaFinInscripcion,
      DivisionFK,
      CategoriaFK,
    } = req.body;

    // Validación básica
    if (new Date(FechaInicioTorneo) > new Date(FechaFinTorneo)) {
      return res.status(400).send('La fecha de inicio del torneo no puede ser posterior a la fecha de fin.');
    }
    if (new Date(FechaInicioInscripcion) > new Date(FechaFinInscripcion)) {
      return res.status(400).send('La fecha de inicio de inscripción no puede ser posterior a la fecha de fin de inscripción.');
    }

    const pool = await getConnection();

    // Insertar torneo en la base de datos
    await pool.request()
      .input('NOMBRETORNEO', sql.VarChar, NOMBRETORNEO)
      .input('FechaInicioTorneo', sql.Date, FechaInicioTorneo)
      .input('FechaFinTorneo', sql.Date, FechaFinTorneo)
      .input('FechaInicioInscripcion', sql.Date, FechaInicioInscripcion)
      .input('FechaFinInscripcion', sql.Date, FechaFinInscripcion)
      .input('DivisionFK', sql.VarChar, DivisionFK)
      .input('CategoriaFK', sql.VarChar, CategoriaFK)
      .query(`
        INSERT INTO Torneo 
        (NOMBRETORNEO, FechaInicioTorneo, FechaFinTorneo, FechaInicioInscripcion, FechaFinInscripcion, DivisionFK, CategoriaFK)
        VALUES (@NOMBRETORNEO, @FechaInicioTorneo, @FechaFinTorneo, @FechaInicioInscripcion, @FechaFinInscripcion, @DivisionFK, @CategoriaFK)
      `);

    res.status(201).send('Torneo creado exitosamente.');
  } catch (error) {
    console.error('Error al crear torneo:', error.message);
    res.status(500).send('Error al crear torneo.');
  }
};

// Eliminar torneo
export const deleteTorneo = async (req, res) => {
  try {
    const { id } = req.params; // ID del torneo a eliminar

    const pool = await getConnection();

    // Eliminar torneo por ID
    await pool.request()
      .input('IDTORNEO', sql.Int, id)
      .query('DELETE FROM Torneo WHERE IDTORNEO = @IDTORNEO');

    res.status(200).send('Torneo eliminado exitosamente.');
  } catch (error) {
    console.error('Error al eliminar torneo:', error.message);
    res.status(500).send('Error al eliminar torneo.');
  }
};

// Obtener todos los torneos
export const getTorneos = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT 
        IDTORNEO, 
        NOMBRETORNEO, 
        FechaInicioTorneo, 
        FechaFinTorneo, 
        FechaInicioInscripcion, 
        FechaFinInscripcion, 
        DivisionFK, 
        CategoriaFK 
      FROM Torneo
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener torneos:', error.message);
    res.status(500).send('Error al obtener torneos.');
  }
};

// Obtener torneos por categoría y división
export const getTorneosPorCategoriaYDivision = async (req, res) => {
  try {
    const { CategoriaFK, DivisionFK } = req.query;

    const pool = await getConnection();

    const result = await pool.request()
      .input('CategoriaFK', sql.VarChar, CategoriaFK)
      .input('DivisionFK', sql.VarChar, DivisionFK)
      .query(`
        SELECT 
          IDTORNEO, 
          NOMBRETORNEO, 
          FechaInicioTorneo, 
          FechaFinTorneo, 
          FechaInicioInscripcion, 
          FechaFinInscripcion, 
          DivisionFK, 
          CategoriaFK 
        FROM Torneo
        WHERE CategoriaFK = @CategoriaFK AND DivisionFK = @DivisionFK
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Error al filtrar torneos por categoría y división:', error.message);
    res.status(500).send('Error al filtrar torneos.');
  }
};

// Actualizar torneo
export const updateTorneo = async (req, res) => {
  try {
    const { id } = req.params; // ID del torneo a actualizar
    const {
      NOMBRETORNEO,
      FechaInicioTorneo,
      FechaFinTorneo,
      FechaInicioInscripcion,
      FechaFinInscripcion,
      DivisionFK,
      CategoriaFK,
    } = req.body;

    const pool = await getConnection();

    await pool.request()
      .input('IDTORNEO', sql.Int, id)
      .input('NOMBRETORNEO', sql.VarChar, NOMBRETORNEO)
      .input('FechaInicioTorneo', sql.Date, FechaInicioTorneo)
      .input('FechaFinTorneo', sql.Date, FechaFinTorneo)
      .input('FechaInicioInscripcion', sql.Date, FechaInicioInscripcion)
      .input('FechaFinInscripcion', sql.Date, FechaFinInscripcion)
      .input('DivisionFK', sql.VarChar, DivisionFK)
      .input('CategoriaFK', sql.VarChar, CategoriaFK)
      .query(`
        UPDATE Torneo
        SET 
          NOMBRETORNEO = @NOMBRETORNEO,
          FechaInicioTorneo = @FechaInicioTorneo,
          FechaFinTorneo = @FechaFinTorneo,
          FechaInicioInscripcion = @FechaInicioInscripcion,
          FechaFinInscripcion = @FechaFinInscripcion,
          DivisionFK = @DivisionFK,
          CategoriaFK = @CategoriaFK
        WHERE IDTORNEO = @IDTORNEO
      `);

    res.status(200).send('Torneo actualizado exitosamente.');
  } catch (error) {
    console.error('Error al actualizar torneo:', error.message);
    res.status(500).send('Error al actualizar torneo.');
  }
};
