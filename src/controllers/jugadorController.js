import { getConnection } from './dbController.js';
import sql from 'mssql';

// Obtener todos los jugadores
export const getJugadores = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM Jugador');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener jugadores:', error.message);
    res.status(500).send('Error al obtener jugadores');
  }
};

// Registrar jugador
export const createJugador = async (req, res) => {
  try {
    const pool = await getConnection();
    console.log('Datos recibidos:', req.body);

    const {
      DNI,
      Nombre,
      Apellido,
      Direccion,
      Telefono,
      FechaNacimiento,
      NROSOCIO,
      Foto,
      CATEGORIAFK, 
      NROEQUIPOFK,
    } = req.body;

    // Validación básica
    if (!CATEGORIAFK || !NROEQUIPOFK) {
      return res.status(400).send('Faltan datos obligatorios como la categoría o el equipo.');
    }

    // Insertar en Persona
    await pool.request()
      .input('DNI', sql.Int, DNI)
      .input('Nombre', sql.VarChar, Nombre)
      .input('Apellido', sql.VarChar, Apellido)
      .input('Direccion', sql.VarChar, Direccion)
      .input('Telefono', sql.BigInt, Telefono)
      .input('FechaNacimiento', sql.Date, FechaNacimiento)
      .query(`
        INSERT INTO Persona (DNI, Nombre, Apellido, Direccion, Telefono, FechaNacimiento) 
        VALUES (@DNI, @Nombre, @Apellido, @Direccion, @Telefono, @FechaNacimiento)
      `);

    // Insertar en Jugador
    await pool.request()
      .input('DNIFK', sql.Int, DNI)
      .input('NROSOCIO', sql.Int, NROSOCIO)
      .input('Foto', sql.VarBinary, Foto || null)
      .input('CATEGORIAFK', sql.VarChar, CATEGORIAFK)
      .input('NROEQUIPOFK', sql.Int, NROEQUIPOFK)
      .query(`
        INSERT INTO Jugador (DNIFK, NROSOCIO, Foto, CATEGORIAFK, NROEQUIPOFK) 
        VALUES (@DNIFK, @NROSOCIO, @Foto, @CATEGORIAFK, @NROEQUIPOFK)
      `);

    res.status(201).send('Jugador creado exitosamente');
  } catch (error) {
    console.error('Error al crear jugador:', error.message);
    res.status(500).send('Error al crear jugador');
  }
};





export const deleteJugador = async (req, res) => {
  try {
    const { dni } = req.params; // DNI del jugador a eliminar
    const pool = await getConnection();

    // Eliminar jugador de la tabla Jugador (clave foránea)
    await pool
      .request()
      .input('DNI', sql.Int, dni)
      .query('DELETE FROM Jugador WHERE DNIFK = @DNI');

    // Eliminar persona de la tabla Persona
    await pool
      .request()
      .input('DNI', sql.Int, dni)
      .query('DELETE FROM Persona WHERE DNI = @DNI');

    res.status(200).send('Jugador eliminado exitosamente');
  } catch (error) {
    console.error('Error al eliminar jugador:', error.message);
    res.status(500).send('Error al eliminar jugador');
  }
};



export const updateJugador = async (req, res) => {
  try {
    const { dni } = req.params; // DNI del jugador a actualizar
    const {
      Nombre,
      Apellido,
      Direccion,
      FechaNacimiento,
      Telefono,
      NROSOCIO,
      Foto,
      Categoria,
      Equipo,
    } = req.body; // Datos enviados en el cuerpo de la solicitud

    const pool = await getConnection();

    // Actualizar datos en la tabla Persona
    await pool
      .request()
      .input('DNI', sql.Int, dni)
      .input('Nombre', sql.VarChar, Nombre)
      .input('Apellido', sql.VarChar, Apellido)
      .input('Direccion', sql.VarChar, Direccion)
      .input('FechaNacimiento', sql.Date, FechaNacimiento)
      .input('Telefono', sql.BigInt, Telefono)
      .query(`
        UPDATE Persona
        SET 
          Nombre = @Nombre,
          Apellido = @Apellido,
          Direccion = @Direccion,
          FechaNacimiento = @FechaNacimiento,
          Telefono = @Telefono
        WHERE DNI = @DNI
      `);

    // Actualizar datos en la tabla Jugador
    await pool
      .request()
      .input('DNI', sql.Int, dni)
      .input('NROSOCIO', sql.Int, NROSOCIO)
      .input('Foto', sql.VarBinary, Foto || null)
      .input('Equipo', sql.VarChar, Equipo)
      .input('Categoria', sql.VarChar, Categoria)
      .query(`
        UPDATE Jugador
        SET 
          NROSOCIO = @NROSOCIO,
          Foto = @Foto,
          NROEQUIPOFK = (SELECT NROEQUIPO FROM Equipo WHERE NombreEquipo = @Equipo),
          IDCATEGORIAFK = (SELECT Categoria FROM Categoria WHERE Categoria = @Categoria)
        WHERE DNIFK = @DNI
      `);

    res.status(200).send('Jugador actualizado exitosamente');
  } catch (error) {
    console.error('Error al actualizar jugador:', error.message);
    res.status(500).send('Error al actualizar jugador');
  }
};
