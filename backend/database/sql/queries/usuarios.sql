SELECT
  u.id,
  u.nombre,
  u.email,
  u.created_at
FROM usuarios u
WHERE
  u.is_activo = TRUE
  AND u.deleted_at IS NULL
  AND u.nombre ILIKE '%juan%'
ORDER BY u.created_at DESC
LIMIT 20 OFFSET 0;

SELECT
  u.id,
  u.nombre,
  u.email
FROM usuarios u
WHERE u.deleted_at IS NULL
ORDER BY u.created_at DESC
LIMIT $1 OFFSET $2;

SELECT
  u.id,
  u.nombre,
  u.email,
  ARRAY_AGG(r.nombre) AS roles
FROM usuarios u
LEFT JOIN usuarios_roles ur ON ur.usuario_id = u.id
LEFT JOIN roles r ON r.id = ur.rol_id
WHERE
  u.id = $1
  AND u.deleted_at IS NULL
GROUP BY u.id, u.nombre, u.email;
