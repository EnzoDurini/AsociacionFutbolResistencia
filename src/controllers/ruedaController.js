import { getConnection } from './dbController.js';
import sql from 'mssql';


export const getRuedas = async (req, res) => {
    try {
      const pool = await getConnection();
      const result = await pool.request().query('SELECT * FROM Rueda');
      res.json(result.recordset); 
    } catch (error) {
      console.error('Error al obtener ruedas:', error.message);
      res.status(500).send('Error al obtener ruedas');
    }
  };


  export const createRueda = async (req, res) => {
    try {
      const { IDTORNEOFK, NOMBRETORNEOFK } = req.body;
      const pool = await getConnection();
      await pool
        .request()
        .input('IDRUEDA', sql.Int, IDTORNEOFK)
        .input('IDTORNEOFK', sql.Int, IDTORNEOFK)
        .input('NOMBRETORNEOFK', sql.VarChar, NOMBRETORNEOFK)
        .query(
          `INSERT INTO Rueda (IDRUEDA, IDTORNEOFK, NOMBRETORNEOFK)
           VALUES (@IDRUEDA, @IDTORNEOFK, @NOMBRETORNEOFK)`
        );
      res.status(201).send('Rueda creada exitosamente');
    } catch (error) {
      console.error('Error al crear rueda:', error.message);
      res.status(500).send('Error al crear rueda');
    }
  };


  export const updateRueda = async (req, res) => {
    try {
      const { id } = req.params;
      const { IDTORNEOFK, NOMBRETORNEOFK } = req.body;
      const pool = await getConnection();
      await pool
        .request()
        .input('IDRUEDA', sql.Int, id)
        .input('IDTORNEOFK', sql.Int, IDTORNEOFK)
        .input('NOMBRETORNEOFK', sql.VarChar, NOMBRETORNEOFK)
        .query(
          `UPDATE Rueda 

           SET IDTORNEOFK = @IDTORNEOFK, 
               NOMBRETORNEOFK = @NOMBRETORNEOFK 
           WHERE IDRUEDA = @IDRUEDA`
        );
      res.status(200).send('Rueda actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar rueda:', error.message);
      res.status(500).send('Error al actualizar rueda');
    }
  };

  
  export const deleteRueda = async (req, res) => {
    try {
      const { id } = req.params;
      const pool = await getConnection();
      await pool
        .request()
        .input('IDRUEDA', sql.Int, id)
        .query('DELETE FROM Rueda WHERE IDRUEDA = @IDRUEDA');
      res.status(200).send('Rueda eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar rueda:', error.message);
      res.status(500).send('Error al eliminar rueda');
    }
  };
  