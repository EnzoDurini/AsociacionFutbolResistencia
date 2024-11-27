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
    const { Division, NombreEquipo, NombreDT, NombreRepresentante, IDCATEGORIAFK } = req.body;
    const pool = await getConnection();

    // Obtener el último número de equipo y calcular el siguiente
    const ultimoNumeroEquipoResult = await pool.request().query(
      'SELECT ISNULL(MAX(NROEQUIPO), 0) AS UltimoNumero FROM Equipo'
    );
    const siguienteNumeroEquipo = ultimoNumeroEquipoResult.recordset[0].UltimoNumero + 1;


    await pool
      .request()
      .input('Division', sql.VarChar, Division)
      .input('NombreEquipo', sql.VarChar, NombreEquipo)
      .input('NombreDT', sql.VarChar, NombreDT)
      .input('NombreRepresentante', sql.VarChar, NombreRepresentante)
      .input('NROEQUIPO', sql.Int, siguienteNumeroEquipo)
      .input('IDCATEGORIAFK', sql.Int, IDCATEGORIAFK)
      .query(
        'INSERT INTO Equipo (Division, NombreEquipo, NombreDT, NombreRepresentante, NROEQUIPO, IDCATEGORIAFK) VALUES (@Division, @NombreEquipo, @NombreDT, @NombreRepresentante, @NROEQUIPO, @IDCATEGORIAFK)'
      );
    res.status(201).send('Equipo creado exitosamente');
  } catch (error) {
    console.error('Error al crear equipo:', error.message);
    res.status(500).send('Error al crear equipo');
  }
};

// Actualizar un equipo
export const updateEquipo = async (req, res) => {
  try {
    const { id} = req.params;
    const { Division, NombreEquipo, NombreDT, NombrePresentante, IDCATEGORIAFK } = req.body;
    const pool = await getConnection();
    await pool
      .request()
      .input('id', sql.Int, id)
      .input('Division', sql.VarChar, Division)
      .input('NombreEquipo', sql.VarChar, NombreEquipo)
      .input('NombreDT', sql.VarChar, NombreDT)
      .input('NombrePresentante', sql.VarChar, NombrePresentante)
      .input('IDCATEGORIAFK', sql.Int, IDCATEGORIAFK)
      .query(
        'UPDATE Equipo SET Division = @Division, NombreEquipo = @NombreEquipo, NombreDT = @NombreDT, NombrePresentante = @NombrePresentante, IDCATEGORIAFK = @IDCATEGORIAFK WHERE NROEQUIPO = @id'
      );
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
    await pool
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Equipo WHERE NROEQUIPO = @id');
    res.status(200).send('Equipo eliminado exitosamente');
  } catch (error) {
    console.error('Error al eliminar equipo:', error.message);
    res.status(500).send('Error al eliminar equipo');
  }
};
