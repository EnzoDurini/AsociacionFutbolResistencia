import { getConnection } from './dbController.js';
import sql from 'mssql';

// Obtener todos los jugadores
export const getJugadores = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM Jugador');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener equipos:', error.message);
    res.status(500).send('Error al obtener equipos');
  }
};

//Registrar jugador
export const createJugador = async (req, res) => {
  try {
    const pool = await getConnection();

    const {
      DNI,
      Nombre,
      Apellido,
      Direccion,
      FechaNacimiento,
      Telefono,
      NROSOCIO,
      Foto,
      NROEQUIPOFK,
      IDCATEGORIAFK,
      NOMBREEQUIPOFK,
    } = req.body;

    // Registro en la tabla Persona
    await pool.request()
      .input('DNI', sql.Int, DNI)
      .input('Nombre', sql.VarChar, Nombre)
      .input('Apellido', sql.VarChar, Apellido)
      .input('Direccion', sql.VarChar, Direccion)
      .input('FechaNacimiento', sql.Date, FechaNacimiento)
      .input('Telefono', sql.BigInt, Telefono)
      .query(
        `INSERT INTO Persona (DNI, Nombre, Apellido, Direccion, FechaNacimiento, Telefono) 
         VALUES (@DNI, @Nombre, @Apellido, @Direccion, @FechaNacimiento, @Telefono)`
      );

    // Registro en la tabla Jugador
    await pool.request()
      .input('DNIFK', sql.Int, DNI)
      .input('NROSOCIO', sql.Int, NROSOCIO)
      .input('Foto', sql.VarBinary, Foto || null)
      .input('NROEQUIPOFK', sql.Int, NROEQUIPOFK)
      .input('IDCATEGORIAFK', sql.Int, IDCATEGORIAFK)
 
      .query(
        `INSERT INTO Jugador (DNIFK, NROSOCIO, Foto, NROEQUIPOFK, IDCATEGORIAFK) 
         VALUES (@DNIFK, @NROSOCIO, @Foto, @NROEQUIPOFK, @IDCATEGORIAFK)`
      );

    res.status(201).send('Jugador creado exitosamente');
  } catch (error) {
    console.error('Error al crear jugador:', error.message);
    res.status(500).send('Error al crear jugador');
  }
};

  
  

export const updateJugador = async (req,res) => {
    try {
        const {dni} = req.params
        const {Nombre,Apellido, Direccion, FechaNacimiento, Telefono, 
            nrosocio, foto, nroequipo, idcategoria, nombreequipo} = req.body
        const pool = await getConnection();

        await pool.request()
        .input('DNI', sql.VarChar, dni)
        .input('Nombre', sql.VarChar, Nombre)
        .input('Apellido', sql.VarChar, Apellido)
        .input('Direccion', sql.VarChar, Direccion)
        .input('FechaNacimiento', sql.Date, FechaNacimiento)
        .input('Telefono', sql.VarChar, Telefono)
        .query(
            `UPDATE Persona 
         SET Nombre = @Nombre, Apellido = @Apellido, Direccion = @Direccion, 
             FechaNacimiento = @FechaNacimiento, Telefono = @Telefono 
         WHERE DNI = @DNI`          
        )

        await pool.request()
        .input('DNIFK',sql.NVarChar, dni)
        .input('nrosocio',sql.NVarChar, nrosocio)
        .input('foto',sql.NVarChar, foto)
        .input('nroequipo',sql.NVarChar, nroequipo)
        .input('idcategoria',sql.NVarChar, idcategoria)
        .input('nombreequipo',sql.NVarChar, nombreequipo)
        .query( `UPDATE Jugador 
            SET NROSOCIO = @NROSOCIO, Foto = @Foto, NROEQUIPOFK = @NROEQUIPOFK, 
                IDCATEGORIAFK = @IDCATEGORIAFK, NOMBREEQUIPOFK = @NOMBREEQUIPOFK 
            WHERE DNIFK = @DNIFK`);
        res.status(201).send('Jugador actualizado exitosamente');

    } catch (error) {
        console.error('Error al actualizar jugador', error.message);
        res.status(500).send('Error al crear jugador')        
    }
}

//Eliminar un equipo

export const deleteJugador = async (req,res) => {
    try {
        const{dni} = req.params;
        const pool = await getConnection();
        await pool
        .request()
        .input('DNIFK',sql.Int, dni)
        .query(`DELETE FROM Jugador WHERE DNIFK = @DNIFK`);
        res.status(200).send('Jugador eliminado exitosamente')
    } catch (error) {
        console.error('Error al eliminar jugador', error.message);
        res.status(500).send('Error al eliminar jugador')        
    }
};