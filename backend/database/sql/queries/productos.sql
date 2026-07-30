SELECT
  pr.nombre,
  SUM(pp.cantidad) AS unidades_vendidas,
  SUM(pp.precio * pp.cantidad) AS ingresos_total
FROM productos pr
JOIN pedidos_productos pp ON pp.producto_id = pr.id
JOIN pedidos p ON p.id = pp.pedido_id
WHERE
  p.estado = 'entregado'
  AND pr.deleted_at IS NULL
GROUP BY pr.id, pr.nombre
ORDER BY unidades_vendidas DESC
LIMIT 10;

SELECT
  pr.id,
  pr.nombre,
  pr.metadata
FROM productos pr
WHERE
  pr.metadata->>'categoria' = 'electronico'
  AND pr.deleted_at IS NULL;
