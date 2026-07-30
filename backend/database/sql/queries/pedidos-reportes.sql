SELECT
  u.nombre,
  u.email,
  COUNT(p.id) AS total_pedidos,
  SUM(p.total) AS total_gastado,
  AVG(p.total) AS ticket_promedio,
  MAX(p.created_at) AS ultimo_pedido
FROM usuarios u
LEFT JOIN pedidos p ON p.usuario_id = u.id
WHERE
  p.estado != 'cancelado'
  AND u.deleted_at IS NULL
GROUP BY u.id, u.nombre, u.email
ORDER BY total_gastado DESC;
