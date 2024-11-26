import { getConnection } from './dbController.js';
import sql from 'mssql';


export const getEquipoParticipaTorneo = async (req,res) => {
        try {
            const pool = await getConnection()
            const result = await pool.request().query('SELECT * FROM EquipoParticipaTorneo')
            res.json(result.recordset)

        } catch (e) {
            console.error('Error al obtener los registros', e.message)
            res.status(500).json({ message: 'Error al obtener los registros' })
        }
}

export const createEquipoParticipaTorneo = async (req, res) => {
    try {
        const{IDTORNEOFK, NOMBRETORNEOFK, NROEQUIPOFK, NOMBREEQUIPOFK} = req.body
        const pool = await getConnection()
        await pool.request()
        .input('IDTORNEOFK', sql.Int, IDTORNEOFK)
        .input('NOMBRETORNEOFK', sql.NVarChar, NOMBRETORNEOFK)
        .input('NROEQUIPOFK', sql.Int, NROEQUIPOFK)
        .input('NOMBREEQUIPOFK', sql.NVarChar, NOMBREEQUIPOFK)
        .query(`INSERT INTO EquipoParticipaTorneo (IDTORNEOFK, NOMBRETORNEOFK, NROEQUIPOFK,
            NOMBREEQUIPOFK) VALUES (@IDTORNEOFK, @NOMBRETORNEOFK, @NROEQUIPOFK, NOMBREEQUIPOFK)`)
            res.status(201).send('Registro creado exitosamente');

    } catch (e) {
        console.error('Error al crear equipoparticipatorneo')
        res.status(500).json({ message: 'Error al crear equipoparticipatorneo'})
        
    }
}

export const updateEquipoParticipaTorneo = async (req, res) => {
    try {
      const { id } = req.params; // IDTORNEOFK como identificador único
      const { NOMBRETORNEOFK, NROEQUIPOFK, NOMBREEQUIPOFK } = req.body;
  
      const pool = await getConnection();
      await pool
        .request()
        .input('IDTORNEOFK', sql.Int, id)
        .input('NOMBRETORNEOFK', sql.VarChar, NOMBRETORNEOFK)
        .input('NROEQUIPOFK', sql.Int, NROEQUIPOFK)
        .input('NOMBREEQUIPOFK', sql.VarChar, NOMBREEQUIPOFK)
        .query(
          `UPDATE EquipoParticipaTorneo 
           SET NOMBRETORNEOFK = @NOMBRETORNEOFK, 
               NROEQUIPOFK = @NROEQUIPOFK, 
               NOMBREEQUIPOFK = @NOMBREEQUIPOFK 
           WHERE IDTORNEOFK = @IDTORNEOFK`
        );
      res.status(200).send('Registro actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar el registro:', error.message);
      res.status(500).send('Error al actualizar el registro');
    }
  };


  export const deleteEquipoParticipaTorneo = async (req, res) => {
    try {
      const { id } = req.params; // IDTORNEOFK como identificador único
      const pool = await getConnection();
      await pool
        .request()
        .input('IDTORNEOFK', sql.Int, id)
        .query('DELETE FROM EquipoParticipaTorneo WHERE IDTORNEOFK = @IDTORNEOFK');
      res.status(200).send('Registro eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar el registro:', error.message);
      res.status(500).send('Error al eliminar el registro');
    }
  };