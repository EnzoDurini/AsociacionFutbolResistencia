import { getConnection } from './dbController.js';
import sql from 'mssql';

// Obtener todos los equipos
export const getEquipos = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM Equipo');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener equipos:', error.message);
    res.status(500).send('Error al obtener equipos');
  }
};

// Crear un nuevo equipo
export const createEquipo = async (req, res) => {
  try {
    const { NombreEquipo, NombreDT, NombreRepresentante, DivisionFK, CategoriaFK } = req.body;
    const pool = await getConnection();

    // Obtener el siguiente número de equipo
    const siguienteNumeroEquipo = (await pool.request().query(`
      SELECT ISNULL(MAX(NROEQUIPO), 0) + 1 AS Siguiente 
      FROM Equipo
    `)).recordset[0].Siguiente;

    // Insertar equipo
    await pool.request()
      .input('NombreEquipo', sql.VarChar, NombreEquipo)
      .input('NombreDT', sql.VarChar, NombreDT)
      .input('NombreRepresentante', sql.VarChar, NombreRepresentante)
      .input('DivisionFK', sql.VarChar, DivisionFK)
      .input('CategoriaFK', sql.VarChar, CategoriaFK)
      .input('NROEQUIPO', sql.Int, siguienteNumeroEquipo)
      .query(`
        INSERT INTO Equipo (NombreEquipo, NombreDT, NombreRepresentante, DivisionFK, CategoriaFK, NROEQUIPO)
        VALUES (@NombreEquipo, @NombreDT, @NombreRepresentante, @DivisionFK, @CategoriaFK, @NROEQUIPO)
      `);

    res.status(201).send('Equipo creado exitosamente');
  } catch (error) {
    console.error('Error al crear equipo:', error.message);
    res.status(500).send('Error al crear equipo');
  }
};

// Actualizar un equipo
export const updateEquipo = async (req, res) => {
  try {
    const { id } = req.params;
    const { NombreEquipo, NombreDT, NombreRepresentante, DivisionFK, CategoriaFK } = req.body;
    const pool = await getConnection();

    await pool.request()
      .input('id', sql.Int, id)
      .input('NombreEquipo', sql.VarChar, NombreEquipo)
      .input('NombreDT', sql.VarChar, NombreDT)
      .input('NombreRepresentante', sql.VarChar, NombreRepresentante)
      .input('DivisionFK', sql.VarChar, DivisionFK)
      .input('CategoriaFK', sql.VarChar, CategoriaFK)
      .query(`
        UPDATE Equipo 
        SET NombreEquipo = @NombreEquipo, NombreDT = @NombreDT, 
            NombreRepresentante = @NombreRepresentante, DivisionFK = @DivisionFK, 
            CategoriaFK = @CategoriaFK
        WHERE NROEQUIPO = @id
      `);

    res.status(200).send('Equipo actualizado exitosamente');
  } catch (error) {
    console.error('Error al actualizar equipo:', error.message);
    res.status(500).send('Error al actualizar equipo');
  }
};

// Eliminar un equipo
export const deleteEquipo = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Equipo WHERE NROEQUIPO = @id');

    res.status(200).send('Equipo eliminado exitosamente');
  } catch (error) {
    console.error('Error al eliminar equipo:', error.message);
    res.status(500).send('Error al eliminar equipo');
  }
};

// Obtener equipos por categoría y división
export const getEquiposByCategoriaDivision = async (req, res) => {
  try {
    const { CategoriaFK, DivisionFK } = req.query;
    const pool = await getConnection();

    const result = await pool.request()
      .input('CategoriaFK', sql.VarChar, CategoriaFK)
      .input('DivisionFK', sql.VarChar, DivisionFK)
      .query(`
        SELECT * 
        FROM Equipo 
        WHERE CategoriaFK = @CategoriaFK AND DivisionFK = @DivisionFK
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener equipos por categoría y división:', error.message);
    res.status(500).send('Error al obtener equipos por categoría y división');
  }
};

