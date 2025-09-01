function validate(schema, target = 'body') {
 return (req, res, next) => {
  const data = req[target];

  // paso 1 verificar que haya datos
  if (!data || Object.keys(data).length === 0) {
   return res.status(400).json({ message: 'No data found' });
  }

  // paso 2 validar contra el schema con opciones
  const { error, value } = schema.validate(data, {
    abortEarly: false, //No detenerne en el primer error, mostrar todos
    stripUnknown: true, //Eliminar campos no definidos en el schema
  })

  // paso 3 sihay errores de validaci'on, devolver 400 con mensaje claro
  if(error) {
    return res.status(400).json({
      message: `Error de validaci'on en ${target}`,
      errores: error.details.map(err => err.message)
    })
  }

  // paso 4 Reemplazar el objeto origical con datos limpios
  req[target] = value;

  // Continuamos....
  next();
 }
}

export default validate