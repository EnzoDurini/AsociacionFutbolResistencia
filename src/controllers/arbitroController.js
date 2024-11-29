import { getConnection } from './dbController.js';
import sql from 'mssql';

// Obtener todos los arbitros
export const getArbitros = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM Arbitro');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener arbitros:', error.message);
    res.status(500).send('Error al obtener arbitros');
  }
};

//Registrar Arbitro

export const createArbitro = async (res,req) =>{
    try {
        const pool = await getConnection();
        const {DNI, Nombre, Apellido, Direccion, FechaNacimiento, Telefono, experiencia, tienecertificacion} = req.body
    
        //Registro como Persona primero
        await pool.request()
        .input('DNI', sql.VarChar, DNI)
        .input('Nombre', sql.VarChar, Nombre)
        .input('Apellido', sql.VarChar, Apellido)
        .input('Direccion', sql.VarChar, Direccion)
        .input('FechaNacimiento', sql.Date, FechaNacimiento)
        .input('Telefono', sql.VarChar, Telefono)
        .query(
            `INSERT INTO Persona (DNI, Nombre, Apellido, Direccion,
            FechaNacimiento, Telefono) VALUES (@DNI, @Nombre, @Apellido, @Direccion,
            @FechaNacimiento, @Telefono)`,
        )
                
        await pool.request()
        .input('DNIFK',sql.Int, DNI)
        .input('Experiencia',sql.NVarChar, experiencia)
        .input('TieneCertificacion',sql.Bit, tienecertificacion)
        .query(`INSERT INTO Arbitro (DNIFK, Experiencia, TieneCertificacion ) 
            VALUES (@DNIFK, @Experiencia, @TieneCertificacion )`);
        res.status(201).send('Arbitro creado exitosamente');
        } catch (error) {
            console.error('Error al crear arbitro:', error.message)
                res.status(500).send('Error al crear arbitro');
}
}

export const updateArbitro = async (req,res) => {
    try {
        const {dni} = req.params
        const {Nombre,Apellido, Direccion, FechaNacimiento, Telefono, experiencia, tienecertificacion} = req.body
        const pool = await getConnection();

        await pool.request()
        .input('DNI', sql.Int, dni)
        .input('Nombre', sql.VarChar, Nombre)
        .input('Apellido', sql.VarChar, Apellido)
        .input('Direccion', sql.VarChar, Direccion)
        .input('FechaNacimiento', sql.Date, FechaNacimiento)
        .input('Telefono', sql.Int, Telefono)
        .query(
           `UPDATE Persona 
         SET Nombre = @Nombre, 
             Apellido = @Apellido, 
             Direccion = @Direccion, 
             FechaNacimiento = @FechaNacimiento, 
             Telefono = @Telefono 
         WHERE DNI = @DNI`
        )

        await pool.request()
      .input('DNIFK', sql.Int, dni) // Clave foránea a Persona
      .input('Experiencia', sql.VarChar, experiencia)
      .input('TieneCertificacion', sql.Bit, tienecertificacion) // Manejo de valor booleano
      .query(
        `UPDATE Arbitro 
         SET Experiencia = @Experiencia, 
             TieneCertificacion = @TieneCertificacion 
         WHERE DNIFK = @DNIFK`
      );
        res.status(201).send('Arbitro actualizado exitosamente');

    } catch (error) {
        console.error('Error al actualizar arbitro', error.message);
        res.status(500).send('Error al crear arbitro')        
    }
}

//Eliminar un equipo

export const deleteArbitro = async (req,res) => {
    try {
        const{dni} = req.params;
        const pool = await getConnection();
        await pool
        .request()
        .input('DNIFK',sql.Int, dni)
        .query(`DELETE FROM Arbitro WHERE DNIFK = @DNIFK`);
        res.status(200).send('Arbitro eliminado exitosamente')
    } catch (error) {
        console.error('Error al eliminar Arbitro', error.message);
        res.status(500).send('Error al eliminar arbitro')        
    }
};

export const getArbitrosNombre = async (req,res) => {
    try {
        const pool = await getConnection()
       const nombres =  await pool.request()
        .query(`SELECT A.DNIFK, CONCAT(P.Nombre, ' ' ,P.Apellido) AS NombreArbitro
            FROM Arbitro A
            INNER JOIN Persona P ON A.DNIFK = P.DNI
            `)
        const arbitrosNombres = nombres.recordset
        res.status(200).send(arbitrosNombres);
    } catch (error) {
        
    }
}