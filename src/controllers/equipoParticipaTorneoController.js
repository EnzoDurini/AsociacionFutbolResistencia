import { getConnection } from './dbController.js';
import sql from 'mssql';

// Obtener equipo por nombre
export const getEquipoByName = async (req, res) => {
  try {
    const { nombre } = req.params; // Nombre del equipo enviado por el frontend
    const pool = await getConnection();

    const equipos = await pool.request()
      .input('NombreEquipo', sql.VarChar, nombre)
      .query(`
        SELECT NROEQUIPO, NombreEquipo, CATEGORIAFK, DivisionFK
        FROM Equipo
        WHERE NombreEquipo = @NombreEquipo
      `);

    if (equipos.recordset.length === 0) {
      return res.status(404).json({ message: 'Equipo no encontrado' });
    }

    res.json(equipos.recordset); 
  } catch (error) {
    console.error('Error al obtener equipo por nombre:', error.message);
    res.status(500).json({ message: 'Error interno al buscar el equipo' });
  }
};

// Verificar si un equipo ya está inscrito en el torneo
export const verificarInscripcion = async (req, res) => {
  try {
    const { idTorneo, idEquipo } = req.body; // Datos enviados desde el frontend
    const pool = await getConnection();

    const resultado = await pool.request()
      .input('IdTorneoFK', sql.Int, idTorneo)
      .input('NroEquipoFK', sql.Int, idEquipo)
      .query(`
        SELECT COUNT(*) AS Inscrito
        FROM EquipoParticipaTorneo
        WHERE IdTorneoFK = @IdTorneoFK AND NroEquipoFK = @NroEquipoFK
      `);

    const yaInscrito = resultado.recordset[0].Inscrito > 0;

    res.json({ yaInscrito });
  } catch (error) {
    console.error('Error al verificar inscripción:', error.message);
    res.status(500).json({ message: 'Error interno al verificar inscripción' });
  }
};

// Inscribir un equipo en un torneo
export const inscribirEquipoEnTorneo = async (req, res) => {
  try {
    const { idTorneo, idEquipo } = req.body; // Datos enviados desde el frontend
    const pool = await getConnection();

    // Obtener información del torneo
    const torneo = await pool.request()
      .input('IdTorneo', sql.Int, idTorneo)
      .query(`
        SELECT CategoriaFK, DivisionFK 
        FROM Torneo
        WHERE IDTORNEO = @IdTorneo
      `);

    if (torneo.recordset.length === 0) {
      return res.status(404).json({ message: 'Torneo no encontrado.' });
    }

    const { CategoriaFK: categoriaTorneo, DivisionFK: divisionTorneo } = torneo.recordset[0];

    // Obtener información del equipo
    const equipo = await pool.request()
      .input('NroEquipo', sql.Int, idEquipo)
      .query(`
        SELECT CategoriaFK, DivisionFK 
        FROM Equipo
        WHERE NROEQUIPO = @NroEquipo
      `);

    if (equipo.recordset.length === 0) {
      return res.status(404).json({ message: 'Equipo no encontrado.' });
    }

    const { CategoriaFK: categoriaEquipo, DivisionFK: divisionEquipo } = equipo.recordset[0];

    // Verificar si la categoría y división coinciden
    if (categoriaEquipo !== categoriaTorneo) {
      return res.status(400).json({ message: 'El equipo no pertenece a la misma categoría del torneo.' });
    }

    if (divisionEquipo !== divisionTorneo) {
      return res.status(400).json({ message: 'El equipo no pertenece a la misma división del torneo.' });
    }

    // Verificar si el equipo ya está inscrito
    const resultado = await pool.request()
      .input('IdTorneoFK', sql.Int, idTorneo)
      .input('NroEquipoFK', sql.Int, idEquipo)
      .query(`
        SELECT COUNT(*) AS Inscrito
        FROM EquipoParticipaTorneo
        WHERE IdTorneoFK = @IdTorneoFK AND NroEquipoFK = @NroEquipoFK
      `);

    if (resultado.recordset[0].Inscrito > 0) {
      return res.status(400).json({ message: 'El equipo ya está inscripto en este torneo.' });
    }

    // Inscribir el equipo en el torneo
    await pool.request()
      .input('IdTorneoFK', sql.Int, idTorneo)
      .input('NroEquipoFK', sql.Int, idEquipo)
      .query(`
        INSERT INTO EquipoParticipaTorneo (IdTorneoFK, NroEquipoFK)
        VALUES (@IdTorneoFK, @NroEquipoFK)
      `);

    res.status(201).json({ message: 'Equipo inscrito exitosamente en el torneo.' });
  } catch (error) {
    console.error('Error al inscribir equipo en torneo:', error.message);
    res.status(500).json({ message: 'Error interno al inscribir equipo en el torneo.' });
  }
};
