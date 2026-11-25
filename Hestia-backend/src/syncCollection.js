// Reemplaza el contenido de una tabla por el array recibido del frontend:
// upsert de cada fila (solo las columnas listadas) + borra las filas que ya
// no están en el array (igual que si el reducer del frontend las hubiera
// eliminado de data.<coleccion>).
export async function syncCollection(client, { table, columns, rows, deleteMissing = true }) {
  const ids = []

  for (const row of rows) {
    const values = columns.map((column) => row[column.key] ?? null)
    ids.push(row.id)

    const columnNames = columns.map((column) => column.sql).join(', ')
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ')
    const updates = columns
      .filter((column) => column.sql !== 'id')
      .map((column) => `${column.sql} = EXCLUDED.${column.sql}`)
      .join(', ')

    await client.query(
      `INSERT INTO ${table} (${columnNames}) VALUES (${placeholders})
       ON CONFLICT (id) DO UPDATE SET ${updates}`,
      values,
    )
  }

  if (deleteMissing) {
    if (ids.length === 0) {
      await client.query(`DELETE FROM ${table}`)
    } else {
      await client.query(`DELETE FROM ${table} WHERE id <> ALL($1::text[])`, [ids])
    }
  }
}
