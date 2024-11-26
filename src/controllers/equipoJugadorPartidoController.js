import { getConnection } from './dbController.js';
import sql from 'mssql';


export const getEquipoJugadorPartido = async (req, res) => {
    try {
        const pool = await getConnection()
        const result = await pool.request().query('SELECT * FROM EquipoJugadorPartido')
        res.json(result.recordset)
        } catch (error) {
            console.error('Error al obtener los registros:', error.message)
            res.status(500).json({ message: 'Error al obtener los registros' })
            }
}

export const createEquipoJugadorPartido = async (req,res) => {
    try {
        const{NROSOCIOJUGADORFK, NROEQUIPOFK,IDPARTIDOFK, DNIJUGADORFK,Goles, Faltas, TarjAmarillas, Expulsion,NOMBREEQUIPOFK} = req.body
        const pool = await getConnection()
        await pool.request()
        .input('NROSOCIOJUGADORFK', sql.Int, NROSOCIOJUGADORFK)
        .input('NROEQUIPOFK', sql.Int, NROEQUIPOFK)
        .input('IDPARTIDOFK', sql.Int, IDPARTIDOFK)
        .input('DNIJUGADORFK', sql.Int, DNIJUGADORFK)
        .input('Goles', sql.SmallInt, Goles)
        .input('Faltas', sql.SmallInt, Faltas)
        .input('TarjAmarillas', sql.SmallInt, TarjAmarillas)
        .input('Expulsion', sql.SmallInt, Expulsion)
        .input('NOMBREEQUIPOFK', sql.NVarChar, NOMBREEQUIPOFK)
        .query(`INSERT INTO EquipoJugadorPartido (NROSOCIOJUGADORFK,NROEQUIPOFK,
            IDPARTIDOFK, DNIJUGADORFK, Goles, Faltas,TarjAmarillas,Expulsion, NOMBREEQUIPOFK)
            VALUES (@NROSOCIOJUGADORFK, @NROEQUIPOFK, @IDPARTIDOFK, @DNIJUGADORFK,
            @Goles, @Faltas, @TarjAmarillas, @Expulsion, @NOMBREEQUIPOFK)`)

        res.status(201).send('EquipoJugadorPartido creado')
    } catch (error) {
        console.error('Error al crear EquipoJugadorPartido');
        res.status(500).json({ message: 'Error al crear EquipoJugadorPartido'})
        
    }
}

export const updateEquipoJugadorPartido = async (req,res) => {
    try {
        const {id} = req.params
    
    const{ NROEQUIPOFK,IDPARTIDOFK,DNIJUGADORFK,Goles,Faltas,TarjAmarillas,Expulsion, NOMBREEQUIPOFK} = req.body
    const pool = await getConnection()
    await pool.request()
    .input('NROSOCIOJUGADORFK', sql.Int, id)
    .input('NROEQUIPOFK', sql.Int, NROEQUIPOFK)
    .input('IDPARTIDOFK', sql.Int, IDPARTIDOFK)
    .input('DNIJUGADORFK', sql.Int, DNIJUGADORFK)
    .input('Goles', sql.SmallInt, Goles)
    .input('Faltas', sql.SmallInt, Faltas)
    .input('TarjAmarillas', sql.SmallInt, TarjAmarillas)
    .input('Expulsion', sql.SmallInt, Expulsion)
    .input('NOMBREEQUIPOFK', sql.NVarChar, NOMBREEQUIPOFK)
    .query(`UPDATE EquipoJugadorPartido SET
        NROEQUIPOFK = @NROEQUIPOFK,
        IDPARTIDOFK = @IDPARTIDOF
        DNIJUGADORFK = @DNIJUGADORFK,
        Goles = @Goles,
        Faltas = @Faltas,
        TarjAmarillas = @TarjAmarillas,
        Expulsion = @Expulsion,
        NOMBREEQUIPOFK = @NOMBREEQUIPOFK
        WHERE NROSOCIOJUGADORFK = @NROSOCIOJUGADORFK`)
        res.status(200).send('EquipoJugadorPartido actualizado')
        
        } catch (e) {
        console.error('Erro al actualizar el registro', e.message);
        res.status(500).json({ message: 'Error al actualizar el registro' });
        
    }
    
}

export const deleteEquipoJugadorPartido = async (req,res) => {
    
    try {
        const {id} = req.params
        const pool = await getConnection()
        await pool.request()
        .input('NROSOCIOJUGADORFK', sql.Int, id)
        .query(`DELETE FROM EquipoJugadorPartido WHERE NROSOCIOJUGADORFK = @NROSOCIOJUGADORFK`)
        res.status(200).send('EquipoJugadorPartido eliminado')
    } catch (e) {
        console.error('Error al eliminar el registro', e.message);
        res.status(500).json({ message: 'Error al eliminar el registro' });        
    }
}