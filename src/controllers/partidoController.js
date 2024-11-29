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
      const { idPartido } = req.params;
      const { FechaHoraEncuentro, DNIARBITROFK, NombreCancha, UbicCancha } = req.body;
  
      const pool = await getConnection();
  
      await pool.request()
        .input('IdPartido', sql.Int, idPartido)
        .input('FechaHoraEncuentro', sql.DateTime, FechaHoraEncuentro)
        .input('DNIARBITROFK', sql.Int, DNIARBITROFK)
        .input('NombreCancha', sql.VarChar, NombreCancha)
        .input('UbicCancha', sql.VarChar, UbicCancha)
        .query(`
          UPDATE Partido
          SET FechaHoraEncuentro = @FechaHoraEncuentro,
              DNIARBITROFK = @DNIARBITROFK,
              NombreCancha = @NombreCancha,
              UbicCancha = @UbicCancha
          WHERE IdPartido = @IdPartido
        `);
  
      res.status(200).send('Partido actualizado con éxito.');
    } catch (error) {
      console.error('Error al actualizar partido:', error.message);
      res.status(500).send('Error interno del servidor.');
    }
  };