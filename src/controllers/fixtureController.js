import { getConnection } from './dbController.js';
import sql from 'mssql';

// Obtener todos los fixtures
export const getFixtures = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM Fixture');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener fixtures:', error.message);
    res.status(500).send('Error al obtener fixtures');
  }
};

// Crear un nuevo fixture
export const createFixture = async (req, res) => {
  try {
    const { IdTorneoFK, IdDivisionFK, IdCategoriaFK } = req.body;
    const pool = await getConnection();

    await pool.request()
      .input('IdTorneoFK', sql.Int, IdTorneoFK)
      .input('IdDivisionFK', sql.Int, IdDivisionFK)
      .input('IdCategoriaFK', sql.Int, IdCategoriaFK)
      .query(`
        INSERT INTO Fixture (IdTorneoFK, IdDivisionFK, IdCategoriaFK) 
        VALUES (@IdTorneoFK, @IdDivisionFK, @IdCategoriaFK)
      `);

    res.status(201).send('Fixture creado exitosamente');
  } catch (error) {
    console.error('Error al crear fixture:', error.message);
    res.status(500).send('Error al crear fixture');
  }
};

// Eliminar un fixture
export const deleteFixture = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    await pool.request()
      .input('IdFixture', sql.Int, id)
      .query('DELETE FROM Fixture WHERE IdFixture = @IdFixture');

    res.status(200).send('Fixture eliminado exitosamente');
  } catch (error) {
    console.error('Error al eliminar fixture:', error.message);
    res.status(500).send('Error al eliminar fixture');
  }
};
