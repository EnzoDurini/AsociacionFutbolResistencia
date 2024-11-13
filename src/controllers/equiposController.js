import sql from 'mssql';

export const registrarEquipo = async (req, res) => {
  const { nombre, directorTecnico } = req.body;
  try {
    await sql.query(`INSERT INTO Equipos (Nombre, DirectorTecnico) VALUES ('${nombre}', '${directorTecnico}')`);
    res.redirect('/');
  } catch (err) {
    console.error("Error al registrar equipo:", err);
    res.status(500).send("Error en el servidor.");
  }
};
