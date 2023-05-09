export function buildUpdateQuery(table: string, data: Object) {
  return `UPDATE ${table} SET
  ${Object.entries(data)
    .map(([k, v]) => {
      let newVal: string = `${v}`;
      if (typeof v == 'string') {
        newVal = `'${v}'`;
      }
      return `${k} = ` + newVal;
    }).join(', ')}
      WHERE id = $1
      RETURNING *`;
}
