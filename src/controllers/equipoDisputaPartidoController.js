import { getConnection } from './dbController.js';
import sql from 'mssql';

export const getEquipoAsistePartido = async (req, res) => {
    try {
      const pool = await getConnection();
      const result = await pool.request().query('SELECT * FROM EquipoAsistePartido');
      res.json(result.recordset); // Devuelve los registros como JSON
    } catch (error) {
      console.error('Error al obtener los registros:', error.message);
      res.status(500).send('Error al obtener los registros');
    }
  };

export const createEquipoAsistePartido = async (req,res) => {
    try {
        const {IDPARTIDOFK, NROEQUIPOFK, Asistio, Resultado, NOMBREEQUIPOFK } = req.body;
        const pool = await getConnection()
        await pool.request()
        .input('IDPARTIDOFK', sql.Int, IDPARTIDOFK)
        .input('NROEQUIPOFK', sql.Int, NROEQUIPOFK)
        .input('Asistio', sql.Bit, Asistio)
        .input('Resultado', sql.SmallInt, Resultado)
        .input('NOMBREEQUIPOFK', sql.NVarChar, NOMBREEQUIPOFK)
        .query( ` INSERT INTO EquipoAsistePartido (IDPARTIDOFK, NROEQUIPOFK, Asistio, Resultado, NOMBREEQUIPOFK)
            VALUES (@IDPARTIDOFK, @NROEQUIPOFK, @Asistio, @Resultado, @NOMBREEQUIPOFK)`)
    } catch (e) {
        console.error('Error al crear los registros:', e.message);
      res.status(500).send('Error al crear los registros');
    }
}

export const updateEquipoAsistePartido = async (req,res) => {
    try {
        const {IDPARTIDOFK} = await getConnection()
        const {NROEQUIPOFK, Asistio, Resultado, NOMBREEQUIPOFK} = req.body
        await pool.request()
        .input('IDPARTIDOFK', sql.Int, IDPARTIDOFK)
        .input('NROEQUIPOFK', sql.Int, NROEQUIPOFK)
        .input('Asistio', sql.Bit, Asistio)
        .input('Resultado', sql.SmallInt, Resultado)
        .input('NOMBREEQUIPOFK', sql.VarChar, NOMBREEQUIPOFK)
        .query(`UPDATE EquipoAsistePartido SET NROEQUIPOFK = @NROEQUIPOFK
            , Asistio = @Asistio
            , Resultado = @Resultado
            , NOMBREEQUIPOFK = @NOMBREEQUIPOFK
            WHERE IDPARTIDOFK = @IDPARTIDOFK`)
            res.status(200).send('EAP actualizado')
    } catch (e) {
        console.error('Error al actualizra el registro de equipoasistepartido', e.message);
        res.status(500).send('Error al actualizar el registro de equipoasistepartido')
    }
}

export const deleteEquipoAsistePartido = async (req,res) => {
    try {
        const {IDPARTIDOFK} = req.params
        await pool.request()
        .input('IDPARTIDOFK', sql.Int, IDPARTIDOFK)
        .query(`DELETE FROM EquipoAsistePartido WHERE IDPARTIDOFK = @
            IDPARTIDOFK`
            )
            res.status(200).send('EAP eliminado')
            } catch (e) {
                console.error('Error al eliminar el registro de equipoasistepartido', e.message)
                res.status(500).send('Error al eliminar el EquipoAsistePartido')}    
}