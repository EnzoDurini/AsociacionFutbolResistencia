import { getConnection } from './dbController.js';
import sql from 'mssql';

export const getFechas = async (req, res) => {
    try {
      const pool = await getConnection();
      const result = await pool.request().query('SELECT * FROM Fecha');
      res.json(result.recordset); // Devuelve las fechas como JSON
    } catch (error) {
      console.error('Error al obtener fechas:', error.message);
      res.status(500).send('Error al obtener fechas');
    }
  };

  export const createFecha = async (req, res) => {
    try {
      const { IDFECHA, IDRUEDAFK } = req.body;
      const pool = await getConnection();
      await pool
        .request()
        .input('IDFECHA', sql.Int, IDFECHA)
        .input('IDRUEDAFK', sql.Int, IDRUEDAFK)
        .query(
          `INSERT INTO Fecha (IDFECHA , IDRUEDAFK) 
           VALUES (@IDFECHA , @IDRUEDAFK)`
        );
      res.status(201).send('Fecha creada exitosamente');
    } catch (error) {
      console.error('Error al crear fecha:', error.message);
      res.status(500).send('Error al crear fecha');
    }
  };

  export const updateFecha = async (req, res) => {
    try {
      const { id } = req.params;
      const { IDRUEDAFK } = req.body;
      const pool = await getConnection();
      await pool
        .request()
        .input('IDFECHA', sql.Int, id)
        .input('IDRUEDAFK', sql.Int, IDRUEDAFK)
        .query(
          `UPDATE Fecha 
           SET IDRUEDAFK = @IDRUEDAFK 
           WHERE IDFECHA = @IDFECHA`
        );
      res.status(200).send('Fecha actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar fecha:', error.message);
      res.status(500).send('Error al actualizar fecha');
    }
  };

  export const deleteFecha = async (req, res) => {
    try {
      const { id } = req.params;
      const pool = await getConnection();
      await pool
        .request()
        .input('IDFECHA', sql.Int, id)
        .query('DELETE FROM Fecha WHERE IDFECHA = @IDFECHA');
      res.status(200).send('Fecha eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar fecha:', error.message);
      res.status(500).send('Error al eliminar fecha');
    }
  };
  