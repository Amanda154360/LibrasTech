const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool, testarConexao } = require('./conexao');

let mainWindow = null;
let sessaoUsuario = null;
let usaBancoReal = false;

const mockUsuarios = [
  {
    id: 1,
    primeiro_nome: 'Carlos',
    segundo_nome: 'Eduardo',
    cpf: '123.456.789-00',
    email: 'admin@librastech.com',
    senha_hash: '$2a$10$X813U4oQ2gP/.Csk38OAtOn/IeHQ92R41E4YpT7.a5B6lVf8VLOtK',
    is_admin: 1,
    possui_plano: 1,
    nome_plano: 'Plano Dev Pro'
  },
  {
    id: 2,
    primeiro_nome: 'Ana',
    segundo_nome: 'Beatriz',
    cpf: '234.567.890-11',
    email: 'ana.beatriz@gmail.com',
    senha_hash: '$2a$10$X813U4oQ2gP/.Csk38OAtOn/IeHQ92R41E4YpT7.a5B6lVf8VLOtK',
    is_admin: 0,
    possui_plano: 1,
    nome_plano: 'Plano Anual Premium'
  },
  {
    id: 3,
    primeiro_nome: 'Lucas',
    segundo_nome: 'Mendes',
    cpf: '345.678.901-22',
    email: 'lucas.mendes@hotmail.com',
    senha_hash: '$2a$10$X813U4oQ2gP/.Csk38OAtOn/IeHQ92R41E4YpT7.a5B6lVf8VLOtK',
    is_admin: 0,
    possui_plano: 0,
    nome_plano: 'Nenhum plano'
  },
  {
    id: 4,
    primeiro_nome: 'Fernanda',
    segundo_nome: 'Silva',
    cpf: '456.789.012-33',
    email: 'fernanda.silva@outlook.com',
    senha_hash: '$2a$10$X813U4oQ2gP/.Csk38OAtOn/IeHQ92R41E4YpT7.a5B6lVf8VLOtK',
    is_admin: 0,
    possui_plano: 1,
    nome_plano: 'Plano Mensal Básico'
  },
  {
    id: 5,
    primeiro_nome: 'Roberto',
    segundo_nome: 'Almeida',
    cpf: '567.890.123-44',
    email: 'roberto.almeida@yahoo.com',
    senha_hash: '$2a$10$X813U4oQ2gP/.Csk38OAtOn/IeHQ92R41E4YpT7.a5B6lVf8VLOtK',
    is_admin: 0,
    possui_plano: 0,
    nome_plano: 'Nenhum plano'
  }
];

function criarJanelaPrincipal() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title: 'LibrasTech Desktop — Painel Administrativo',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/frmLogin.html'));
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(async () => {
  usaBancoReal = await testarConexao();
  criarJanelaPrincipal();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) criarJanelaPrincipal();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Navegação
ipcMain.handle('app:navegar', (event, paginaHtml) => {
  const paginasPermitidas = ['frmLogin.html', 'frmPrincipal.html', 'frmMeusDados.html', 'frmUsuarios.html'];
  if (!paginasPermitidas.includes(paginaHtml)) {
    throw new Error('Navegação não permitida para a página solicitada.');
  }

  if (paginaHtml !== 'frmLogin.html' && !sessaoUsuario) {
    mainWindow.loadFile(path.join(__dirname, '../renderer/frmLogin.html'));
    return { sucesso: false, mensagem: 'Sessão expirada ou usuário não autenticado.' };
  }

  mainWindow.loadFile(path.join(__dirname, `../renderer/${paginaHtml}`));
  return { sucesso: true };
});

// Autenticação
ipcMain.handle('auth:login', async (event, credenciais) => {
  const { email, senha } = credenciais || {};

  if (!email || !senha) {
    return { sucesso: false, mensagem: 'Por favor, informe o e-mail e a senha.' };
  }

  try {
    if (usaBancoReal && pool) {
      const [rows] = await pool.query(
        'SELECT id, primeiro_nome, segundo_nome, cpf, email, senha, is_admin, possui_plano, nome_plano FROM usuarios WHERE email = ? LIMIT 1',
        [email]
      );

      if (rows.length === 0) {
        return { sucesso: false, mensagem: 'E-mail ou senha incorretos.' };
      }

      const user = rows[0];
      const senhaValida = await bcrypt.compare(senha, user.senha);

      if (!senhaValida) {
        return { sucesso: false, mensagem: 'E-mail ou senha incorretos.' };
      }

      sessaoUsuario = {
        id: user.id,
        primeiro_nome: user.primeiro_nome,
        segundo_nome: user.segundo_nome,
        cpf: user.cpf,
        email: user.email,
        is_admin: user.is_admin,
        possui_plano: user.possui_plano,
        nome_plano: user.nome_plano
      };

      return { sucesso: true, usuario: sessaoUsuario, fonte: 'MySQL' };
    } else {
      const user = mockUsuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return { sucesso: false, mensagem: 'E-mail ou senha incorretos.' };
      }

      const senhaValida = (senha === '123456') || (await bcrypt.compare(senha, user.senha_hash));
      if (!senhaValida) {
        return { sucesso: false, mensagem: 'E-mail ou senha incorretos.' };
      }

      sessaoUsuario = {
        id: user.id,
        primeiro_nome: user.primeiro_nome,
        segundo_nome: user.segundo_nome,
        cpf: user.cpf,
        email: user.email,
        is_admin: user.is_admin,
        possui_plano: user.possui_plano,
        nome_plano: user.nome_plano
      };

      return { sucesso: true, usuario: sessaoUsuario, fonte: 'Demonstração' };
    }
  } catch (err) {
    console.error('[IPC Auth Error]', err);
    return { sucesso: false, mensagem: 'Ocorreu um erro interno ao processar a autenticação.' };
  }
});

ipcMain.handle('auth:logout', () => {
  sessaoUsuario = null;
  mainWindow.loadFile(path.join(__dirname, '../renderer/frmLogin.html'));
  return { sucesso: true };
});

ipcMain.handle('auth:getUsuarioLogado', () => {
  return sessaoUsuario;
});

// Meus Dados
ipcMain.handle('conta:buscarDados', async () => {
  if (!sessaoUsuario) return { sucesso: false, mensagem: 'Usuário não autenticado.' };

  if (usaBancoReal && pool) {
    try {
      const [rows] = await pool.query(
        'SELECT id, primeiro_nome, segundo_nome, email FROM usuarios WHERE id = ?',
        [sessaoUsuario.id]
      );
      if (rows.length > 0) {
        return { sucesso: true, dados: rows[0] };
      }
    } catch (err) {
      console.error(err);
    }
  }

  return {
    sucesso: true,
    dados: {
      id: sessaoUsuario.id,
      primeiro_nome: sessaoUsuario.primeiro_nome,
      segundo_nome: sessaoUsuario.segundo_nome,
      email: sessaoUsuario.email
    }
  };
});

ipcMain.handle('conta:atualizarDados', async (event, dados) => {
  if (!sessaoUsuario) return { sucesso: false, mensagem: 'Usuário não autenticado.' };
  const { primeiro_nome, segundo_nome, email } = dados || {};

  if (!primeiro_nome || !segundo_nome || !email) {
    return { sucesso: false, mensagem: 'Todos os campos obrigatórios devem ser preenchidos.' };
  }

  if (usaBancoReal && pool) {
    try {
      await pool.query(
        'UPDATE usuarios SET primeiro_nome = ?, segundo_nome = ?, email = ? WHERE id = ?',
        [primeiro_nome, segundo_nome, email, sessaoUsuario.id]
      );
    } catch (err) {
      console.error(err);
      return { sucesso: false, mensagem: 'Erro ao atualizar dados no banco de dados MySQL.' };
    }
  } else {
    const idx = mockUsuarios.findIndex(u => u.id === sessaoUsuario.id);
    if (idx !== -1) {
      mockUsuarios[idx].primeiro_nome = primeiro_nome;
      mockUsuarios[idx].segundo_nome = segundo_nome;
      mockUsuarios[idx].email = email;
    }
  }

  sessaoUsuario.primeiro_nome = primeiro_nome;
  sessaoUsuario.segundo_nome = segundo_nome;
  sessaoUsuario.email = email;

  return { sucesso: true, mensagem: 'Dados atualizados com sucesso!' };
});

ipcMain.handle('conta:alterarSenha', async (event, dados) => {
  if (!sessaoUsuario) return { sucesso: false, mensagem: 'Usuário não autenticado.' };
  const { senhaAtual, novaSenha } = dados || {};

  if (!senhaAtual || !novaSenha || novaSenha.length < 6) {
    return { sucesso: false, mensagem: 'A nova senha deve possuir pelo menos 6 caracteres.' };
  }

  try {
    if (usaBancoReal && pool) {
      const [rows] = await pool.query('SELECT senha FROM usuarios WHERE id = ?', [sessaoUsuario.id]);
      if (rows.length === 0) return { sucesso: false, mensagem: 'Usuário não encontrado.' };

      const senhaCorreta = await bcrypt.compare(senhaAtual, rows[0].senha);
      if (!senhaCorreta) return { sucesso: false, mensagem: 'A senha atual informada está incorreta.' };

      const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
      await pool.query('UPDATE usuarios SET senha = ? WHERE id = ?', [novaSenhaHash, sessaoUsuario.id]);
    } else {
      const idx = mockUsuarios.findIndex(u => u.id === sessaoUsuario.id);
      if (idx !== -1) {
        const user = mockUsuarios[idx];
        const senhaCorreta = (senhaAtual === '123456') || (await bcrypt.compare(senhaAtual, user.senha_hash));
        if (!senhaCorreta) return { sucesso: false, mensagem: 'A senha atual informada está incorreta.' };

        user.senha_hash = await bcrypt.hash(novaSenha, 10);
      }
    }

    return { sucesso: true, mensagem: 'Senha alterada com sucesso!' };
  } catch (err) {
    console.error(err);
    return { sucesso: false, mensagem: 'Erro ao processar alteração de senha.' };
  }
});

// Listagem e Operações em Usuários
ipcMain.handle('usuarios:listar', async (event, filtros) => {
  if (!sessaoUsuario) return { sucesso: false, mensagem: 'Acesso negado.' };

  const busca = (filtros && filtros.busca) ? filtros.busca.trim().toLowerCase() : '';

  if (usaBancoReal && pool) {
    try {
      let sql = 'SELECT id, primeiro_nome, segundo_nome, cpf, email, possui_plano, nome_plano FROM usuarios';
      let params = [];

      if (busca) {
        sql += ' WHERE LOWER(primeiro_nome) LIKE ? OR LOWER(segundo_nome) LIKE ? OR LOWER(email) LIKE ?';
        const termo = `%${busca}%`;
        params = [termo, termo, termo];
      }

      sql += ' ORDER BY id DESC';

      const [rows] = await pool.query(sql, params);
      return { sucesso: true, usuarios: rows, fonte: 'MySQL' };
    } catch (err) {
      console.error(err);
      return { sucesso: false, mensagem: 'Erro ao listar usuários do MySQL.' };
    }
  }

  let resultados = [...mockUsuarios].sort((a, b) => b.id - a.id);
  if (busca) {
    resultados = resultados.filter(u =>
      u.primeiro_nome.toLowerCase().includes(busca) ||
      u.segundo_nome.toLowerCase().includes(busca) ||
      u.email.toLowerCase().includes(busca)
    );
  }

  const dadosLimpos = resultados.map(u => ({
    id: u.id,
    primeiro_nome: u.primeiro_nome,
    segundo_nome: u.segundo_nome,
    cpf: u.cpf,
    email: u.email,
    possui_plano: u.possui_plano,
    nome_plano: u.nome_plano
  }));

  return { sucesso: true, usuarios: dadosLimpos, fonte: 'Demonstração' };
});

ipcMain.handle('usuarios:buscarPorId', async (event, id) => {
  if (!sessaoUsuario) return { sucesso: false, mensagem: 'Acesso negado.' };

  if (usaBancoReal && pool) {
    try {
      const [rows] = await pool.query(
        'SELECT id, primeiro_nome, segundo_nome, cpf, email, possui_plano, nome_plano FROM usuarios WHERE id = ?',
        [id]
      );
      if (rows.length > 0) return { sucesso: true, usuario: rows[0] };
    } catch (err) {
      console.error(err);
    }
  }

  const user = mockUsuarios.find(u => u.id === Number(id));
  if (user) {
    return {
      sucesso: true,
      usuario: {
        id: user.id,
        primeiro_nome: user.primeiro_nome,
        segundo_nome: user.segundo_nome,
        cpf: user.cpf,
        email: user.email,
        possui_plano: user.possui_plano,
        nome_plano: user.nome_plano
      }
    };
  }

  return { sucesso: false, mensagem: 'Usuário não encontrado.' };
});

ipcMain.handle('usuarios:adicionar', async (event, dados) => {
  if (!sessaoUsuario) return { sucesso: false, mensagem: 'Acesso negado.' };

  const { primeiro_nome, segundo_nome, cpf, email, senha, possui_plano, nome_plano } = dados || {};

  if (!primeiro_nome || !segundo_nome || !cpf || !email || !senha) {
    return { sucesso: false, mensagem: 'Preencha todos os campos obrigatórios.' };
  }

  if (senha.trim().length < 6) {
    return { sucesso: false, mensagem: 'A senha deve possuir no mínimo 6 caracteres.' };
  }

  const flagPlano = possui_plano ? 1 : 0;
  const planoFinal = flagPlano === 1 ? (nome_plano || 'Plano Mensal Básico') : 'Nenhum plano';

  try {
    const senhaHash = await bcrypt.hash(senha.trim(), 10);

    if (usaBancoReal && pool) {
      const [existentes] = await pool.query(
        'SELECT id FROM usuarios WHERE email = ? OR cpf = ? LIMIT 1',
        [email, cpf]
      );

      if (existentes.length > 0) {
        return { sucesso: false, mensagem: 'Já existe um usuário cadastrado com este e-mail ou CPF.' };
      }

      await pool.query(
        `INSERT INTO usuarios (primeiro_nome, segundo_nome, cpf, email, senha, is_admin, possui_plano, nome_plano)
         VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
        [primeiro_nome, segundo_nome, cpf, email, senhaHash, flagPlano, planoFinal]
      );

      return { sucesso: true, mensagem: 'Usuário cadastrado com sucesso no MySQL!' };
    } else {
      const duplicado = mockUsuarios.some(
        u => u.email.toLowerCase() === email.toLowerCase() || u.cpf === cpf
      );

      if (duplicado) {
        return { sucesso: false, mensagem: 'Já existe um usuário cadastrado com este e-mail ou CPF.' };
      }

      const novoId = mockUsuarios.length > 0 ? Math.max(...mockUsuarios.map(u => u.id)) + 1 : 1;

      mockUsuarios.push({
        id: novoId,
        primeiro_nome,
        segundo_nome,
        cpf,
        email,
        senha_hash: senhaHash,
        is_admin: 0,
        possui_plano: flagPlano,
        nome_plano: planoFinal
      });

      return { sucesso: true, mensagem: 'Usuário cadastrado com sucesso!' };
    }
  } catch (err) {
    console.error('[IPC usuarios:adicionar Error]', err);
    return { sucesso: false, mensagem: 'Erro ao cadastrar o novo usuário.' };
  }
});

ipcMain.handle('usuarios:atualizar', async (event, dados) => {
  if (!sessaoUsuario) return { sucesso: false, mensagem: 'Acesso negado.' };

  const { id, primeiro_nome, segundo_nome, cpf, email, nova_senha, possui_plano, nome_plano } = dados || {};

  if (!id || !primeiro_nome || !segundo_nome || !email || !cpf) {
    return { sucesso: false, mensagem: 'Preencha todos os campos obrigatórios.' };
  }

  const flagPlano = possui_plano ? 1 : 0;
  const planoFinal = flagPlano === 1 ? (nome_plano || 'Plano Mensal Básico') : 'Nenhum plano';

  try {
    if (usaBancoReal && pool) {
      if (nova_senha && nova_senha.trim().length >= 6) {
        const senhaHash = await bcrypt.hash(nova_senha.trim(), 10);
        await pool.query(
          `UPDATE usuarios 
           SET primeiro_nome = ?, segundo_nome = ?, cpf = ?, email = ?, senha = ?, possui_plano = ?, nome_plano = ? 
           WHERE id = ?`,
          [primeiro_nome, segundo_nome, cpf, email, senhaHash, flagPlano, planoFinal, id]
        );
      } else {
        await pool.query(
          `UPDATE usuarios 
           SET primeiro_nome = ?, segundo_nome = ?, cpf = ?, email = ?, possui_plano = ?, nome_plano = ? 
           WHERE id = ?`,
          [primeiro_nome, segundo_nome, cpf, email, flagPlano, planoFinal, id]
        );
      }
      return { sucesso: true, mensagem: 'Usuário atualizado com sucesso no MySQL!' };
    } else {
      const idx = mockUsuarios.findIndex(u => u.id === Number(id));
      if (idx !== -1) {
        mockUsuarios[idx].primeiro_nome = primeiro_nome;
        mockUsuarios[idx].segundo_nome = segundo_nome;
        mockUsuarios[idx].cpf = cpf;
        mockUsuarios[idx].email = email;
        mockUsuarios[idx].possui_plano = flagPlano;
        mockUsuarios[idx].nome_plano = planoFinal;

        if (nova_senha && nova_senha.trim().length >= 6) {
          mockUsuarios[idx].senha_hash = await bcrypt.hash(nova_senha.trim(), 10);
        }
        return { sucesso: true, mensagem: 'Usuário atualizado com sucesso!' };
      }
      return { sucesso: false, mensagem: 'Usuário não encontrado.' };
    }
  } catch (err) {
    console.error('[IPC usuarios:atualizar Error]', err);
    return { sucesso: false, mensagem: 'Erro ao atualizar os dados do usuário.' };
  }
});

// Dashboard
ipcMain.handle('dashboard:acessosHoje', async () => {
  const hoje = new Date().toISOString().split('T')[0];

  if (usaBancoReal && pool) {
    try {
      const [rows] = await pool.query(
        'SELECT hora, quantidade FROM acessos_diarios WHERE data_registro = ? ORDER BY hora ASC',
        [hoje]
      );

      if (rows.length > 0) {
        const horas = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
        const acessos = new Array(24).fill(0);
        let total = 0;

        rows.forEach(r => {
          if (r.hora >= 0 && r.hora < 24) {
            acessos[r.hora] = r.quantidade;
            total += r.quantidade;
          }
        });

        return { sucesso: true, data: hoje, total, horas, acessos, fonte: 'MySQL' };
      }
    } catch (err) {
      console.error(err);
    }
  }

  const horas = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  const acessos = [12, 5, 3, 18, 85, 142, 210, 180, 245, 190, 130, 65];
  const total = acessos.reduce((a, b) => a + b, 0);

  return {
    sucesso: true,
    data: hoje,
    total,
    horas,
    acessos,
    demonstrativo: true,
    fonte: 'Dados Demonstrativos Fictícios'
  };
});

ipcMain.handle('dashboard:usuariosComPlanos', async () => {
  if (usaBancoReal && pool) {
    try {
      const [rows] = await pool.query(
        'SELECT possui_plano, COUNT(*) as qtd FROM usuarios GROUP BY possui_plano'
      );

      let comPlano = 0;
      let semPlano = 0;

      rows.forEach(r => {
        if (r.possui_plano === 1) comPlano = r.qtd;
        else semPlano = r.qtd;
      });

      const total = comPlano + semPlano;
      const percentual = total > 0 ? ((comPlano / total) * 100).toFixed(1) : 0;

      return {
        sucesso: true,
        comPlano,
        semPlano,
        total,
        percentual,
        fonte: 'MySQL'
      };
    } catch (err) {
      console.error(err);
    }
  }

  const comPlano = mockUsuarios.filter(u => u.possui_plano === 1).length;
  const semPlano = mockUsuarios.filter(u => u.possui_plano === 0).length;
  const total = comPlano + semPlano;
  const percentual = total > 0 ? ((comPlano / total) * 100).toFixed(1) : 0;

  return {
    sucesso: true,
    comPlano,
    semPlano,
    total,
    percentual,
    fonte: 'Demonstração'
  };
});