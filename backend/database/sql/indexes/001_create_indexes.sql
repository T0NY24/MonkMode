CREATE INDEX idx_usuarios_email
ON usuarios(email);

CREATE INDEX idx_usuarios_deleted_at
ON usuarios(deleted_at);

CREATE INDEX idx_productos_deleted_at
ON productos(deleted_at);

CREATE INDEX idx_pedidos_usuario
ON pedidos(usuario_id);

CREATE INDEX idx_pedidos_estado_fecha
ON pedidos(estado, created_at);

CREATE INDEX idx_pedidos_deleted_at
ON pedidos(deleted_at);

CREATE INDEX idx_usuarios_roles_usuario
ON usuarios_roles(usuario_id);

CREATE INDEX idx_usuarios_roles_rol
ON usuarios_roles(rol_id);

CREATE INDEX idx_roles_permisos_rol
ON roles_permisos(rol_id);

CREATE INDEX idx_roles_permisos_permiso
ON roles_permisos(permiso_id);
