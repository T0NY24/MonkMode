CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE usuarios (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nombre        VARCHAR(255) NOT NULL,
  is_activo     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at    TIMESTAMP WITH TIME ZONE NULL
);

CREATE TABLE roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at  TIMESTAMP WITH TIME ZONE NULL
);

CREATE TABLE usuarios_roles (
  usuario_id  UUID NOT NULL REFERENCES usuarios(id),
  rol_id      UUID NOT NULL REFERENCES roles(id),
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (usuario_id, rol_id)
);

CREATE TABLE permisos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo      VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at  TIMESTAMP WITH TIME ZONE NULL
);

CREATE TABLE roles_permisos (
  rol_id      UUID NOT NULL REFERENCES roles(id),
  permiso_id  UUID NOT NULL REFERENCES permisos(id),
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (rol_id, permiso_id)
);

CREATE TABLE productos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio      DECIMAL(10,2) NOT NULL,
  stock       INTEGER NOT NULL DEFAULT 0,
  is_activo   BOOLEAN DEFAULT TRUE,
  metadata    JSONB,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at  TIMESTAMP WITH TIME ZONE NULL
);

CREATE TABLE pedidos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  UUID NOT NULL REFERENCES usuarios(id),
  estado      VARCHAR(50) CHECK (
    estado IN ('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado')
  ) DEFAULT 'pendiente',
  total       DECIMAL(10,2) NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at  TIMESTAMP WITH TIME ZONE NULL
);

CREATE TABLE pedidos_productos (
  pedido_id   UUID NOT NULL REFERENCES pedidos(id),
  producto_id UUID NOT NULL REFERENCES productos(id),
  cantidad    INTEGER NOT NULL DEFAULT 1,
  precio      DECIMAL(10,2) NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (pedido_id, producto_id)
);
