# Flujo para buscar los documentos

1. La idea es que cuando el usuario seleccione un docuemento, o varios documentos, estos queden guardados en un array o diccionario (los documentos pueden tener una ID y esto se usará para poder buscar en la DB).
2. Con estos valores, el flujo del chatbot va a generar una consultar a la DB.
3. La consulta debe buscar todos los registros que tengan esa ID de documento y retornarla.
4. Ya con el retorno de la información, el agente IA guardará ese contexto por el resto del chat.
5. Si el usuario actualiza los documentos con los cuales quiera trabajar, entonces la consulta se debe de actualizar y con ello lo hará el contexto.

# Artefactos o acciones rápidas

1. La idea de los artefactos es que al generar un chat, estos no estén seleccionados por defecto.
2. Si el usuario quiere hacer uso de alguno, debe de dar click y este automáticamente se activará, sirviendo como parámetro.
3. El mensaje se envía al chatbot, y con el quickaction como parámetro, este realizará su respuesta en base a esa solicitud.

# Cosas a implementar.

1. Asegurar que todas las rutas que requieran un usuario logueado, no permitan el acceso al usuarios NO logueados.
2. Que el modal al presionar el botón Ver Documentos, se muestre correctamente en medio de la pantalla.
3. Alinear correctamente los botones del chatInput con el área de texto.
4. Que el panel de artefactos sea igual al sidebar, pero con los elementos del ArtifactsPanel.
5. Pulir un poco más el header de la página.
6. Que las conversaciones se asocien al usuario.
7. Que el status del bot funcione y no sea algo fijo.
8. Arreglas los quickActions que aparecen al momento de escribir un mensaje.
9. Las tarjetas que aparecen al momento de tener una conversación vacía deben ser un poco más minimalistas, que ocupen menos espacio.
10. Que al momento de crear una nueva conversación, se cree correctamente en la DB y esté asociada como debe al usuario.
11. Revisar cómo hacer para implementar los botones de feedback (los pulgares bajo los mensajes del bot).
12. Volver a implementar correctamente Marked.JS para los mensajes.
13. Estructurar mejor los quickActions del chat y hacer más limpia esa interfaz.
14. Ser capaz de modificar el título de la conversación presionando el texto del header.
15. Que se guarde las preferencias del tema que usa el usuario (tema claro o tema oscuro).
16. Asegurar que realmente se cierre sesión y si vuelvo a una página con login requerido (/chat por ejemplo) que me derive a una página indicando que debo estar logueado para eso.
