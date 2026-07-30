SELECT
  u.nombre,
  COUNT(p.id) AS total_pedidos,
  SUM(p.total) AS total_gastado
FROM usuarios u
LEFT JOIN pedidos p ON p.usuario_id = u.id
GROUP BY u.id, u.nombre
ORDER BY total_gastado DESC;
