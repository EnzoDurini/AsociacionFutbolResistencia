import { getConnection } from './dbController.js';
import sql from 'mssql';


export const getPartidos = async (req,res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM Partido')
        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener partidos:', error.message);
    res.status(500).send('Error al obtener partidos');
    }
}

export const createPartido = async (req,res) => {
    try {
        const {FechaHoraEncuentro, IDFECHAFK,
             NROARBITROFK, DNIARBITROFK, 
            EquipoLocal, IdEquipoLocal, EquipoVisitante, 
            IdEquipoVisitante, NombreCancha, UbicCancha} = req.body

        const pool = await getConnection()
        await pool.request()  
        .input('FechaHoraEncuentro', sql.DateTime2, FechaHoraEncuentro)
        .input('IDFECHAFK', sql.Int, IDFECHAFK)
        .input('NROARBITROFK', sql.Int, NROARBITROFK)
        .input('DNIARBITROFK', sql.Int, DNIARBITROFK)
        .input('EquipoLocal', sql.VarChar, EquipoLocal)
        .input('IdEquipoLocal', sql.Int, IdEquipoLocal)
        .input('EquipoVisitante', sql.VarChar, EquipoVisitante)
        .input('IdEquipoVisitante', sql.Int, IdEquipoVisitante)
        .input('NombreCancha', sql.VarChar, NombreCancha)
        .input('UbicCancha', sql.VarChar, UbicCancha)
        .query( `INSERT INTO Partido (FechaHoraEncuentro,
            IDEFECHAFK, NROARBITROFK, DNIARBITROFK, EquipoLocal, IdEquipoLocal, 
            EquipoVisitante, IdEquipoVisitante,NombreCancha, UbicCancha) 
            VALUES (@FechaHoraEncuentro, @IDFECHAFK, @NROARBITROFK, @DNIARBITROFK,
            @EquipoLocal, @IdEquipoLocal, @EquipoVisitante, @IdEquipoVisitante, @NombreCancha, @UbicCancha)`
            );

            res.status(201).send('Partido creado exitosamente')

    } catch (error) {
        console.error('Error al crear el partido', error.message);
        res.status(500).send('Error al crear el partido');
    }
}

export const updatePartido = async (req,res) => {
    try {
        const {IDPARTIDO} = req.params
        const{
            FechaHoraEncuentro, IDFECHAFK, NROARBITROFK, DNIARBITROFK,
            EquipoLocal, IdEquipoLocal, EquipoVisitante, IdEquipoVisitante,
            NombreCancha, UbicCancha} = req.body
        const pool = await getConnection()
        await pool
        .request()
        .input('IDPARTIDO', sql.Int, IDPARTIDO)
        .input('FechaHoraEncuentro', sql.DateTime2, FechaHoraEncuentro)
        .input('IDFECHAFK', sql.Int, IDFECHAFK)
        .input('NROARBITROFK', sql.Int, NROARBITROFK)
        .input('DNIARBITROFK', sql.Int, DNIARBITROFK)
        .input('EquipoLocal', sql.VarChar, EquipoLocal)
        .input('IdEquipoLocal', sql.Int, IdEquipoLocal)
        .input('EquipoVisitante', sql.VarChar, EquipoVisitante)
        .input('IdEquipoVisitante', sql.Int, IdEquipoVisitante)
        .input('NombreCancha', sql.VarChar, NombreCancha)
        .input('UbicCancha', sql.VarChar, UbicCancha)
        .query(`UPDATE Partido SET FechaHoraEncuentro = @FechaHoraEncuentro,
            IDEFECHAFK = @IDFECHAFK, NROARBITROFK= @NROARBITROFK,
            DNIARBITROFK = @DNIARBITROFK, EquipoLocal = @EquipoLocal,
            IdEquipoLocal = @IdEquipoLocal, EquipoVisitante = @EquipoVisitante
            IdEquipoVisitante = @IdEquipoVisitante, NombreCancha = @NombreCancha
            UbicCancha = @UbicCancha WHERE IDPARTIDO = @IDPARTIDO`)
            res.status(200).send('Partido actualizado exitosamente')
        
    } catch (e) {
        console.error('Error al actualizar partido', error.message);
        res.status(500).send('Error al actualizar partido');        
    }
}

export const deletePartido = async (req, res) => {
    try {
      const { id } = req.params;
      const pool = await getConnection();
      await pool
        .request()
        .input('IDPARTIDO', sql.Int, id)
        .query('DELETE FROM Partido WHERE IDPARTIDO = @IDPARTIDO');
      res.status(200).send('Partido eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar partido:', error.message);
      res.status(500).send('Error al eliminar partido');
    }
  };
  