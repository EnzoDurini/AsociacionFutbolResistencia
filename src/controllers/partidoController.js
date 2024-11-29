import { getConnection } from './dbController.js';
import sql from 'mssql';


export const createupdatePartido = async (req, res) => {
    try {
      const {
        idPartido,
        idEquipoLocal,
        idEquipoVisitante,
        fechaHoraEncuentro,
        nombreCancha,
        ubicacionCancha,
        dniArbitro,
        nroFecha
      } = req.body;
  
      const pool = await getConnection();
  
      if (idPartido) {
        // Actualizar partido existente
        await pool.request()
          .input('IdPartido', sql.Int, idPartido)
          .input('IdEquipoLocal', sql.Int, idEquipoLocal)
          .input('IdEquipoVisitante', sql.Int, idEquipoVisitante)
          .input('FechaHoraEncuentro', sql.DateTime2, fechaHoraEncuentro)
          .input('NombreCancha', sql.VarChar, nombreCancha)
          .input('UbicacionCancha', sql.VarChar, ubicacionCancha)
          .input('DNIArbitro', sql.Int, dniArbitro)
          .input('NroFechaFK', sql.Int, nroFecha)
          .query(`
            UPDATE Partido
            SET IdEquipoLocal = @IdEquipoLocal,
                IdEquipoVisitante = @IdEquipoVisitante,
                FechaHoraEncuentro = @FechaHoraEncuentro,
                NombreCancha = @NombreCancha,
                UbicCancha = @UbicacionCancha,
                DNIARBITROFK = @DNIArbitro,
                NroFechaFK = @NroFechaFK
            WHERE IDPARTIDO = @IdPartido
          `);
      } else {
        // Insertar nuevo partido
        await pool.request()
          .input('IdEquipoLocal', sql.Int, idEquipoLocal)
          .input('IdEquipoVisitante', sql.Int, idEquipoVisitante)
          .input('FechaHoraEncuentro', sql.DateTime2, fechaHoraEncuentro)
          .input('NombreCancha', sql.VarChar, nombreCancha)
          .input('UbicacionCancha', sql.VarChar, ubicacionCancha)
          .input('DNIArbitro', sql.Int, dniArbitro)
          .input('NroFechaFK', sql.Int, nroFecha)
          .query(`
            INSERT INTO Partido (IdEquipoLocal, IdEquipoVisitante, FechaHoraEncuentro, NombreCancha, UbicCancha, DNIARBITROFK, NroFechaFK)
            VALUES (@IdEquipoLocal, @IdEquipoVisitante, @FechaHoraEncuentro, @NombreCancha, @UbicacionCancha, @DNIArbitro, @NroFechaFK)
          `);
      }
  
      res.status(200).send('Partido guardado exitosamente.');
    } catch (error) {
      console.error('Error al guardar el partido:', error.message);
      res.status(500).send('Error interno al guardar el partido.');
    }
  };


  export const updatePartido = async (req, res) => {
    try {
      const { idPartido, fechaHora, nombreCancha, ubicCancha, dniArbitro } = req.body;
      console.log('Datos a actualizar de partido:',req.body)
  
      const pool = await getConnection();
  
      await pool.request()
        .input('IdPartido', sql.Int, idPartido)
        .input('FechaHoraEncuentro', sql.DateTime, fechaHora)
        .input('NombreCancha', sql.VarChar, nombreCancha)
        .input('UbicCancha', sql.VarChar, ubicCancha)
        .input('DNIARBITROFK', sql.Int, dniArbitro || null)
        .query(`
          UPDATE Partido
          SET 
            FechaHoraEncuentro = @FechaHoraEncuentro,
            NombreCancha = @NombreCancha,
            UbicCancha = @UbicCancha,
            DNIARBITROFK = @DNIARBITROFK
          WHERE IDPARTIDO = @IdPartido
        `);
  
      res.status(200).send('Partido actualizado exitosamente.');
    } catch (error) {
      console.error('Error al actualizar el partido:', error.message);
      res.status(500).send('Error interno al actualizar el partido.');
    }
  };


  export const getPartidos = async (req,res) => {
    const pool = await getConnection()
    const result = await pool.request()
    const partidos = await pool.request().query(`
      SELECT 
        P.IDPARTIDO, 
        P.FechaHoraEncuentro, 
        P.NombreCancha, 
        P.UbicCancha,
        P.DNIARBITROFK,
        EL.NombreEquipo AS EquipoLocal, 
        EV.NombreEquipo AS EquipoVisitante,
        CONCAT(PER.Nombre, ' ', PER.Apellido) AS NombreArbitro
      FROM Partido P
      LEFT JOIN Equipo EL ON P.IdEquipoLocal = EL.NROEQUIPO
      LEFT JOIN Equipo EV ON P.IdEquipoVisitante = EV.NROEQUIPO
      LEFT JOIN Arbitro A ON P.DNIARBITROFK = A.DNIARBITRO
      LEFT JOIN Persona PER ON A.DNIFK = PER.DNI
    `);

  }

  export const getPartidosyJugadores = async (req, res) => {
    try {
      const { id } = req.params; // Obtener el ID del partido de los parámetros
      const pool = await getConnection();
  
      // Obtener detalles del encuentro
      const encuentroQuery = await pool.request()
  .input('IdPartido', sql.Int, id)
  .query(`
    SELECT 
      P.IDPARTIDO,
      EL.NombreEquipo AS EquipoLocal,
      EL.NROEQUIPO AS EquipoLocalID,
      EV.NombreEquipo AS EquipoVisitante,
      EV.NROEQUIPO AS EquipoVisitanteID
    FROM Partido P
    LEFT JOIN Equipo EL ON P.IdEquipoLocal = EL.NROEQUIPO
    LEFT JOIN Equipo EV ON P.IdEquipoVisitante = EV.NROEQUIPO
    WHERE P.IDPARTIDO = @IdPartido
  `);
  
      if (encuentroQuery.recordset.length === 0) {
        return res.status(404).send('Partido no encontrado.');
      }
  
      const encuentro = encuentroQuery.recordset[0];
  
      // Obtener jugadores de ambos equipos
      const jugadoresQuery = await pool.request()
        .input('IdPartido', sql.Int, id)
        .query(`
          SELECT 
            J.DNIFK,
            J.NROSOCIO,
            J.NROEQUIPOFK, 
            P.Nombre, 
            P.Apellido,
            CASE 
              WHEN J.NROEQUIPOFK = (SELECT IdEquipoLocal FROM Partido WHERE IDPARTIDO = @IdPartido) THEN 'Local'
              ELSE 'Visitante'
            END AS Equipo
          FROM Jugador J
          JOIN Persona P ON J.DNIFK = P.DNI
          WHERE J.NROEQUIPOFK IN (
            SELECT IdEquipoLocal FROM Partido WHERE IDPARTIDO = @IdPartido
            UNION
            SELECT IdEquipoVisitante FROM Partido WHERE IDPARTIDO = @IdPartido
          )
        `);
  
      const jugadores = jugadoresQuery.recordset;
  
      // Renderizar la vista con los datos del encuentro y jugadores
      res.render('detalleEncuentro', {
        encuentro,
        jugadores,
      });
    } catch (error) {
      console.error('Error al obtener los detalles del encuentro:', error.message);
      res.status(500).send('Error interno al cargar los detalles del encuentro.');
    }
  };

  export const guardarResultadosEncuentro = async (req, res) => {
    try {
      const { idPartido, estadisticas } = req.body; // Recibir los datos enviados desde el frontend
      const pool = await getConnection();
  
      console.log("Datos recibidos:", req.body);
  
      // Guardar estadísticas de cada jugador en la tabla EquipoJugadorJuegaPartido
      for (const stats of estadisticas) {
        const { dnifk, faltas, goles, amarillas, expulsado } = stats;
  
        // Validar los datos del jugador
        if (!dnifk) {
          console.error(`Jugador sin DNIFK proporcionado: ${JSON.stringify(stats)}`);
          continue;
        }
  
        // Obtener el IdEquipoFK y NroJugador basado en DNIFK
        const equipoQuery = await pool.request()
          .input('DNIFK', sql.Int, dnifk)
          .query(`
            SELECT NROEQUIPOFK, NROSOCIO
            FROM Jugador 
            WHERE DNIFK = @DNIFK
          `);
  
        const idEquipoFK = equipoQuery.recordset[0]?.NROEQUIPOFK;
        const nroJugador = equipoQuery.recordset[0]?.NROSOCIO;
  
        if (!idEquipoFK || !nroJugador) {
          console.error(`Jugador con DNIFK ${dnifk} no tiene asignado un equipo o NroJugador.`);
          continue; // Saltar si no se encuentran los datos
        }
  
        // Guardar estadísticas si hay algún dato válido
        if (faltas > 0 || goles > 0 || amarillas > 0 || expulsado > 0) {
          await pool.request()
            .input('DNIFK', sql.Int, dnifk)
            .input('NroJugador', sql.Int, nroJugador) // Incluyendo NroJugador
            .input('IdEquipoFK', sql.Int, idEquipoFK)
            .input('IdPartidoFK', sql.Int, idPartido)
            .input('FaltasCometidas', sql.Int, faltas || 0)
            .input('Goles', sql.Int, goles || 0)
            .input('TarjAmarilla', sql.Int, amarillas || 0)
            .input('Expulsion', sql.Bit, expulsado || 0)
            .query(`
              INSERT INTO EquipoJugadorJuegaPartido (DNIFK, NroSocioFK, IdEquipoFK, IdPartidoFK, FaltasCometidas, Goles, TarjAmarilla, Expulsion)
              VALUES (@DNIFK, @NroJugador, @IdEquipoFK, @IdPartidoFK, @FaltasCometidas, @Goles, @TarjAmarilla, @Expulsion)
            `);
        }
      }
  
      // Obtener los equipos involucrados en el partido
      const equiposQuery = await pool.request()
        .input('IdPartido', sql.Int, idPartido)
        .query(`
          SELECT IdEquipoLocal, IdEquipoVisitante
          FROM Partido
          WHERE IDPARTIDO = @IdPartido
        `);
  
      const { IdEquipoLocal, IdEquipoVisitante } = equiposQuery.recordset[0];
  
      // Calcular los goles del equipo local y visitante
      const calcularGoles = async (idEquipo) => {
        const query = await pool.request()
          .input('IdEquipo', sql.Int, idEquipo)
          .input('IdPartidoFK', sql.Int, idPartido)
          .query(`
            SELECT SUM(Goles) AS TotalGoles
            FROM EquipoJugadorJuegaPartido
            WHERE IdEquipoFK = @IdEquipo AND IdPartidoFK = @IdPartidoFK
          `);
        return query.recordset[0].TotalGoles || 0;
      };
  
      const totalGolesLocal = await calcularGoles(IdEquipoLocal);
      const totalGolesVisitante = await calcularGoles(IdEquipoVisitante);
  
      // Guardar resultados en EquipoDisputaPartido
      const guardarResultadoEquipo = async (idEquipo, goles) => {
        const existe = await pool.request()
          .input('NroEquipoFK', sql.Int, idEquipo)
          .input('IdPartidoFK', sql.Int, idPartido)
          .query(`
            SELECT COUNT(*) AS Conteo
            FROM EquipoDisputaPartido
            WHERE NroEquipoFK = @NroEquipoFK AND IdPartidoFK = @IdPartidoFK
          `);
  
        if (existe.recordset[0].Conteo > 0) {
          // Actualizar si ya existe
          await pool.request()
            .input('NroEquipoFK', sql.Int, idEquipo)
            .input('IdPartidoFK', sql.Int, idPartido)
            .input('Resultado', sql.Int, goles)
            .query(`
              UPDATE EquipoDisputaPartido
              SET Resultado = @Resultado
              WHERE NroEquipoFK = @NroEquipoFK AND IdPartidoFK = @IdPartidoFK
            `);
        } else {
          // Insertar si no existe
          await pool.request()
            .input('NroEquipoFK', sql.Int, idEquipo)
            .input('IdPartidoFK', sql.Int, idPartido)
            .input('Resultado', sql.Int, goles)
            .input('Asistio', sql.Bit, 1) // Asistió
            .query(`
              INSERT INTO EquipoDisputaPartido (NroEquipoFK, IdPartidoFK, Resultado, Asistio)
              VALUES (@NroEquipoFK, @IdPartidoFK, @Resultado, @Asistio)
            `);
        }
      };
  
      await guardarResultadoEquipo(IdEquipoLocal, totalGolesLocal);
      await guardarResultadoEquipo(IdEquipoVisitante, totalGolesVisitante);
  
      res.status(200).send('Estadísticas guardadas y resultados actualizados.');
    } catch (error) {
      console.error('Error al guardar resultados del encuentro:', error.message);
      res.status(500).send('Error interno al guardar los resultados del encuentro.');
    }
  };
  
  
  
  export const marcarAusencia = async (req, res) => {
    try {
      const { equipoId, partidoId } = req.body;
      console.log(req.body)
      const pool = await getConnection();
      
      // Marcar ausencia para el equipo seleccionado
      await pool.request()
        .input('NroEquipoFK', sql.Int, equipoId)
        .input('IdPartidoFK', sql.Int, partidoId)
        .input('Resultado', sql.Int, 0) // Resultado = 0 para el equipo ausente
        .input('Asistio', sql.Bit, 0)  // No asistió
        .query(`
          INSERT INTO EquipoDisputaPartido (NroEquipoFK, IdPartidoFK, Resultado, Asistio)
          VALUES (@NroEquipoFK, @IdPartidoFK, @Resultado, @Asistio)
        `);
  
      // Marcar victoria para el otro equipo
      const otroEquipoQuery = await pool.request()
        .input('IdPartido', sql.Int, partidoId)
        .input('EquipoAusente', sql.Int, equipoId)
        .query(`
          SELECT CASE 
            WHEN IdEquipoLocal = @EquipoAusente THEN IdEquipoVisitante
            ELSE IdEquipoLocal
          END AS EquipoPresente
          FROM Partido
          WHERE IDPARTIDO = @IdPartido
        `);
  
      const equipoPresente = otroEquipoQuery.recordset[0].EquipoPresente;
  
      await pool.request()
        .input('NroEquipoFK', sql.Int, equipoPresente)
        .input('IdPartidoFK', sql.Int, partidoId)
        .input('Resultado', sql.Int, 3) // Resultado = 3 para el equipo presente
        .input('Asistio', sql.Bit, 1)  // Sí asistió
        .query(`
          INSERT INTO EquipoDisputaPartido (NroEquipoFK, IdPartidoFK, Resultado, Asistio)
          VALUES (@NroEquipoFK, @IdPartidoFK, @Resultado, @Asistio)
        `);
  
      res.status(200).send('Ausencia marcada exitosamente.');
    } catch (error) {
      console.error('Error al marcar ausencia:', error.message);
      res.status(500).send('Error interno al marcar ausencia.');
    }
  };
  
  