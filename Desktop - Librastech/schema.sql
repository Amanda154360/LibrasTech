CREATE DATABASE IF NOT EXISTS librastech_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE librastech_db;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    primeiro_nome VARCHAR(50) NOT NULL,
    segundo_nome VARCHAR(50) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    is_admin TINYINT(1) DEFAULT 0,
    possui_plano TINYINT(1) DEFAULT 0,
    nome_plano VARCHAR(50) DEFAULT 'Nenhum plano',
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Registros de Acesso Diários
CREATE TABLE IF NOT EXISTS acessos_diarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hora INT NOT NULL, -- 0 a 23
    quantidade INT NOT NULL DEFAULT 0,
    data_registro DATE NOT NULL,
    UNIQUE KEY idx_data_hora (data_registro, hora)
);

-- Dados de Exemplo para Testes
INSERT INTO usuarios (primeiro_nome, segundo_nome, cpf, email, senha, is_admin, possui_plano, nome_plano) VALUES
('Ariely', 'Vitória', '123.456.789-00', 'admin@librastech.com', '$2a$10$X813U4oQ2gP/.Csk38OAtOn/IeHQ92R41E4YpT7.a5B6lVf8VLOtK', 1, 1, 'Plano Dev Pro'),
('Ana', 'Beatriz', '234.567.890-11', 'ana.beatriz@gmail.com', '$2a$10$X813U4oQ2gP/.Csk38OAtOn/IeHQ92R41E4YpT7.a5B6lVf8VLOtK', 0, 1, 'Plano Anual Premium'),
('Lucas', 'Mendes', '345.678.901-22', 'lucas.mendes@hotmail.com', '$2a$10$X813U4oQ2gP/.Csk38OAtOn/IeHQ92R41E4YpT7.a5B6lVf8VLOtK', 0, 0, 'Nenhum plano'),
('Fernanda', 'Silva', '456.789.012-33', 'fernanda.silva@outlook.com', '$2a$10$X813U4oQ2gP/.Csk38OAtOn/IeHQ92R41E4YpT7.a5B6lVf8VLOtK', 0, 1, 'Plano Mensal Básico'),
('Roberto', 'Almeida', '567.890.123-44', 'roberto.almeida@yahoo.com', '$2a$10$X813U4oQ2gP/.Csk38OAtOn/IeHQ92R41E4YpT7.a5B6lVf8VLOtK', 0, 0, 'Nenhum plano');

-- A senha padrão inserida é "123456" hash de testeCREATE DATABASE IF NOT EXISTS librastech_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- PARA TESTAR O LOGIN, USE O USUÁRIO ADMINISTRADOR ABAIXO:
--E-mail: admin@librastech.com
--Senha: 123456