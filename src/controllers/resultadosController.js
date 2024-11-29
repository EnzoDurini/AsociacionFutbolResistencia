import { getConnection } from './dbController.js';
import sql from 'mssql';

export const getResultados = async (req, res) => {
    try {
      const { torneoId } = req.query; // Obtener el ID del torneo desde los parámetros
      const pool = await getConnection();
  
      // Obtener la lista de torneos
      const torneos = await pool.request().query(`
        SELECT IDTORNEO, NOMBRETORNEO 
        FROM Torneo
      `);
  
      let resultados = []; // Resultados vacíos por defecto
  
      // Si hay un torneo seleccionado, ejecutar la consulta
      if (torneoId) {
        const result = await pool.request()
          .input('IdTorneo', sql.Int, torneoId)
          .query(`
           SELECT e.NombreEquipo AS Equipo, COUNT(edp1.IdPartidoFK) AS PJ,
    SUM(CASE WHEN edp1.Resultado > EDP2.Resultado THEN 1 ELSE 0 END) AS PG,
    SUM(CASE WHEN edp1.Resultado = EDP2.Resultado THEN 1 ELSE 0 END) AS PE,
    SUM(CASE WHEN edp1.Resultado < EDP2.Resultado THEN 1 ELSE 0 END) AS PP,
    SUM(edp1.Resultado) AS GF,
    SUM(EDP2.Resultado) AS GC,
    SUM(CASE WHEN edp1.Resultado > EDP2.Resultado THEN 3 WHEN edp1.Resultado = EDP2.Resultado THEN 1 ELSE 0 END) AS PTS
    FROM EquipoDisputaPartido EDP1
    JOIN EquipoDisputaPartido EDP2 ON edp1.IdPartidoFK = EDP2.IdPartidoFK AND edp1.NroEquipoFK != EDP2.NroEquipoFK
    JOIN Equipo e 
    ON edp1.NroEquipoFK = e.NROEQUIPO
    JOIN Partido P 
    ON edp1.IdPartidoFK = P.IDPARTIDO
    JOIN Fecha F 
    ON P.NroFechaFK = F.IdFecha
     JOIN Rueda R ON F.IdRuedaFK = R.IdRueda
    JOIN Fixture Fix ON R.IdFixtureFK = Fix.IdFixture
    JOIN Torneo T ON Fix.IdTorneoFK = T.IDTORNEO
    WHERE edp1.Asistio = 1 AND T.IdTorneo = @IdTorneo  -- Solo se cuentan equipos que asistieron
    GROUP BY e.NombreEquipo
    ORDER BY PTS DESC, GF DESC, GC ASC
          `);
  
        resultados = result.recordset; // Actualizar resultados
      }
  
      res.render('resultados', { resultados, torneos: torneos.recordset, torneoId });
    } catch (error) {
      console.error('Error al obtener los resultados:', error.message);
      res.status(500).send('Error interno al cargar los resultados.');
    }
  };
  
  