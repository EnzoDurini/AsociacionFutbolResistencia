import { getConnection } from './dbController.js';
import sql from 'mssql';


export const getTorneos = async (req,res) => {
    try {
        const pool = await getConnection()
        const result = await pool.reques().query('SELECT * FROM Torneo')
        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener los torneos', error.message);
        res.status(500).send('Error al obtener torneos')
    }
}

export const createTorneo = async (req,res) => {
    try {
        const {IDTORNEO, NOMBRETORNEO, FechaInicioTorneo, FechaFinTorneo, FechaInicioInscripcion, FechaFinInscripcion} = req.body
        const pool = await getConnection()
        await pool
        .request()
        .input('IDTORNEO', sql.Int, IDTORNEO)
        .input('NOMBRETORNEO', sql.VarChar, NOMBRETORNEO)
        .input('FechaInicioTorneo', sql.Date, FechaInicioTorneo)
        .input('FechaFinTorneo', sql.Date, FechaFinTorneo)
        .input('FechaInicioInscripcion', sql.Date, FechaInicioInscripcion)
        .input('FechaFinInscripcion', sql.Date, FechaFinInscripcion)
        .query(
            `INSERT INTO Torneo (NOMBRETORNEO, FechaInicioTorneo, FechaFinTorneo, FechaInicioInscripcion,
            FechaFinInscripcion) VALUES (@NOMBRETORNEO, @FechaInicioTorneo, @FechaFinTorneo,
            @FechaInicioInscripcion, @FechaFinInscripcion)`,
        )
        res.status(201).json({message: 'Torneo creado con exito'})
    } catch (error) {
        console.error('Error al crear el torneo', error.message);
        res.status(500).send('Error al crear torneo')        
    }
}

export const updateTorneo = async (req, res) => {
    try{
        const {id} = req.params;
        const {NOMBRETORNEO,FechaInicioTorneo, FechaFinTorneo, FechaInicioInscripcion, FechaFinInscripcion} = req.body
        const pool = await getConnection()
        await pool
        .request()
        .input('IDTORNEO', sql.Int, id)
        .input('NOMBRETORNEO', sql.VarChar, NOMBRETORNEO)
        .input('FechaInicioTorneo', sql.Date, FechaInicioTorneo)
        .input('FechaFinTorneo', sql.Date, FechaFinTorneo)
        .input('FechaInicioInscripcion', sql.Date, FechaInicioInscripcion)
        .input('FechaFinInscripcion', sql.Date, FechaFinInscripcion)
        .query(
            `UPDATE Torneo SET NOMBRETORNEO = @NOMBRETORNEO
            , FechaInicioTorneo = @FechaInicioTorneo
            , FechaFinTorneo = @FechaFinTorneo
            , FechaInicioInscripcion = @FechaInicioInscripcion
            , FechaFinInscripcion = @FechaFinInscripcion 
            WHERE IDTORNEO = @IDTORNEO`
            )
            res.status(201).json({message: 'Torneo actualizado con exito'})
    } catch(e){
        console.error('Error al actualizar el torneo', e.message)
        res.status(500).send('Error al actualizar torneo')
    }
}

export const deleteTorneo = async (req,res) => {
    try {
        const {id} = req.params;
        const pool = await getConnection()
        await pool
        .request()
        .input('IDTORNEO', sql.Int, id)
        .query(`DELETE FROM Torneo WHERE IDTORNEO = @IDTORNEO`);
        res.status(200).json({message: 'Torneo eliminado con exito'})
    } catch (error) {
        console.error('Error al eliminar el torneo', error.message);
        res.status(500).send('Error al eliminar el torneo')        
    }
}