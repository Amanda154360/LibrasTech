const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Autenticação
  login: (credenciais) => ipcRenderer.invoke('auth:login', credenciais),
  logout: () => ipcRenderer.invoke('auth:logout'),
  obterUsuarioLogado: () => ipcRenderer.invoke('auth:getUsuarioLogado'),

  // Navegação de Telas
  navegarPara: (pagina) => ipcRenderer.invoke('app:navegar', pagina),

  // Gestão da Conta do Administrador Logado
  buscarMeusDados: () => ipcRenderer.invoke('conta:buscarDados'),
  atualizarMeusDados: (dados) => ipcRenderer.invoke('conta:atualizarDados', dados),
  alterarSenha: (dados) => ipcRenderer.invoke('conta:alterarSenha', dados),

  // Gestão de Usuários
  listarUsuarios: (filtros) => ipcRenderer.invoke('usuarios:listar', filtros),
  buscarUsuarioPorId: (id) => ipcRenderer.invoke('usuarios:buscarPorId', id),
  adicionarUsuario: (dados) => ipcRenderer.invoke('usuarios:adicionar', dados),
  atualizarUsuario: (dados) => ipcRenderer.invoke('usuarios:atualizar', dados),

  // Dados dos Gráficos do Dashboard
  obterAcessosHoje: () => ipcRenderer.invoke('dashboard:acessosHoje'),
  obterUsuariosComPlanos: () => ipcRenderer.invoke('dashboard:usuariosComPlanos')
});