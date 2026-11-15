document.addEventListener('DOMContentLoaded', async () => {
  const btnNavDashboard = document.querySelector('#btnNavDashboard');
  const btnNavMinhaConta = document.querySelector('#btnNavMinhaConta');
  const btnSair = document.querySelector('#btnSair');
  const nomeAdmin = document.querySelector('#nomeAdmin');
  const emailAdmin = document.querySelector('#emailAdmin');
  const avatarLetra = document.querySelector('#avatarLetra');

  const tbodyUsuarios = document.querySelector('#tbodyUsuarios');
  const inputPesquisa = document.querySelector('#inputPesquisa');
  const btnAtualizarTabela = document.querySelector('#btnAtualizarTabela');
  const estadoVazio = document.querySelector('#estadoVazio');
  const estadoCarregando = document.querySelector('#estadoCarregando');
  const infoPaginacao = document.querySelector('#infoPaginacao');
  const alertaFeedback = document.querySelector('#alertaFeedback');

  // Elementos do Modal de Cadastro
  const btnAbrirModalNovo = document.querySelector('#btnAbrirModalNovo');
  const modalNovoEl = document.querySelector('#modalNovoUsuario');
  const modalNovo = (modalNovoEl && window.bootstrap) ? new bootstrap.Modal(modalNovoEl) : null;
  const formNovoUsuario = document.querySelector('#formNovoUsuario');
  const novoPrimeiroNome = document.querySelector('#novoPrimeiroNome');
  const novoSegundoNome = document.querySelector('#novoSegundoNome');
  const novoCpf = document.querySelector('#novoCpf');
  const novoEmail = document.querySelector('#novoEmail');
  const novoSenha = document.querySelector('#novoSenha');
  const novoPossuiPlano = document.querySelector('#novoPossuiPlano');
  const novoNomePlano = document.querySelector('#novoNomePlano');
  const alertaModalNovo = document.querySelector('#alertaModalNovo');

  // Elementos do Modal de Edição
  const modalEditarEl = document.querySelector('#modalEditarUsuario');
  const modalEditar = (modalEditarEl && window.bootstrap) ? new bootstrap.Modal(modalEditarEl) : null;
  const formEditarUsuario = document.querySelector('#formEditarUsuario');
  const editUserId = document.querySelector('#editUserId');
  const editPrimeiroNome = document.querySelector('#editPrimeiroNome');
  const editSegundoNome = document.querySelector('#editSegundoNome');
  const editCpf = document.querySelector('#editCpf');
  const editEmail = document.querySelector('#editEmail');
  const editNovaSenha = document.querySelector('#editNovaSenha');
  const editPossuiPlano = document.querySelector('#editPossuiPlano');
  const editNomePlano = document.querySelector('#editNomePlano');
  const alertaModalEditar = document.querySelector('#alertaModalEditar');

  // Navegação da Sidebar
  if (btnNavDashboard) {
    btnNavDashboard.addEventListener('click', () => window.api.navegarPara('frmPrincipal.html'));
  }
  if (btnNavMinhaConta) {
    btnNavMinhaConta.addEventListener('click', () => window.api.navegarPara('frmMeusDados.html'));
  }
  if (btnSair) {
    btnSair.addEventListener('click', () => window.api.logout());
  }
  if (btnAtualizarTabela) {
    btnAtualizarTabela.addEventListener('click', () => carregarUsuarios());
  }

  // Carregar dados do administrador logado na Sidebar
  try {
    const user = await window.api.obterUsuarioLogado();
    if (user) {
      if (nomeAdmin) nomeAdmin.textContent = `${user.primeiro_nome} ${user.segundo_nome}`;
      if (emailAdmin) emailAdmin.textContent = user.email;
      if (avatarLetra) avatarLetra.textContent = user.primeiro_nome.charAt(0).toUpperCase();
    }
  } catch (err) {
    console.error('Erro ao obter usuário logado:', err);
  }

  // Sincronizar seleção de planos no Cadastro
  if (novoPossuiPlano && novoNomePlano) {
    novoPossuiPlano.addEventListener('change', () => {
      if (novoPossuiPlano.value === '0') {
        novoNomePlano.value = 'Nenhum plano';
        novoNomePlano.disabled = true;
      } else {
        novoNomePlano.disabled = false;
        if (novoNomePlano.value === 'Nenhum plano') {
          novoNomePlano.value = 'Plano Mensal Básico';
        }
      }
    });
  }

  // Sincronizar seleção de planos na Edição
  if (editPossuiPlano && editNomePlano) {
    editPossuiPlano.addEventListener('change', () => {
      if (editPossuiPlano.value === '0') {
        editNomePlano.value = 'Nenhum plano';
        editNomePlano.disabled = true;
      } else {
        editNomePlano.disabled = false;
        if (editNomePlano.value === 'Nenhum plano') {
          editNomePlano.value = 'Plano Mensal Básico';
        }
      }
    });
  }

  // Abrir Modal de Cadastro
  if (btnAbrirModalNovo) {
    btnAbrirModalNovo.addEventListener('click', () => {
      if (!modalNovo) {
        exibirFeedback('Não foi possível abrir o formulário. Verifique se o HTML foi atualizado.', 'danger');
        return;
      }
      formNovoUsuario.reset();
      alertaModalNovo.classList.add('d-none');
      novoPossuiPlano.value = '0';
      novoNomePlano.value = 'Nenhum plano';
      novoNomePlano.disabled = true;
      modalNovo.show();
    });
  }

  // Submeter Cadastro de Novo Usuário
  if (formNovoUsuario) {
    formNovoUsuario.addEventListener('submit', async (e) => {
      e.preventDefault();
      alertaModalNovo.classList.add('d-none');

      const payload = {
        primeiro_nome: novoPrimeiroNome.value.trim(),
        segundo_nome: novoSegundoNome.value.trim(),
        cpf: novoCpf.value.trim(),
        email: novoEmail.value.trim(),
        senha: novoSenha.value,
        possui_plano: novoPossuiPlano.value === '1',
        nome_plano: novoPossuiPlano.value === '1' ? novoNomePlano.value : 'Nenhum plano'
      };

      try {
        const res = await window.api.adicionarUsuario(payload);
        if (res && res.sucesso) {
          if (modalNovo) modalNovo.hide();
          exibirFeedback(res.mensagem || 'Usuário cadastrado com sucesso!', 'success');
          await carregarUsuarios();
        } else {
          alertaModalNovo.textContent = (res && res.mensagem) || 'Erro ao cadastrar usuário.';
          alertaModalNovo.classList.remove('d-none');
        }
      } catch (err) {
        alertaModalNovo.textContent = 'Erro de comunicação ao cadastrar usuário.';
        alertaModalNovo.classList.remove('d-none');
      }
    });
  }

  // Submeter Edição de Usuário
  if (formEditarUsuario) {
    formEditarUsuario.addEventListener('submit', async (e) => {
      e.preventDefault();
      alertaModalEditar.classList.add('d-none');

      const payload = {
        id: editUserId.value,
        primeiro_nome: editPrimeiroNome.value.trim(),
        segundo_nome: editSegundoNome.value.trim(),
        cpf: editCpf.value.trim(),
        email: editEmail.value.trim(),
        nova_senha: editNovaSenha.value,
        possui_plano: editPossuiPlano.value === '1',
        nome_plano: editPossuiPlano.value === '1' ? editNomePlano.value : 'Nenhum plano'
      };

      try {
        const res = await window.api.atualizarUsuario(payload);
        if (res && res.sucesso) {
          if (modalEditar) modalEditar.hide();
          exibirFeedback(res.mensagem || 'Usuário atualizado com sucesso!', 'success');
          await carregarUsuarios();
        } else {
          alertaModalEditar.textContent = (res && res.mensagem) || 'Erro ao atualizar usuário.';
          alertaModalEditar.classList.remove('d-none');
        }
      } catch (err) {
        alertaModalEditar.textContent = 'Erro de comunicação ao atualizar usuário.';
        alertaModalEditar.classList.remove('d-none');
      }
    });
  }

  // Filtro de Pesquisa
  if (inputPesquisa) {
    let timeoutPesquisa = null;
    inputPesquisa.addEventListener('input', () => {
      clearTimeout(timeoutPesquisa);
      timeoutPesquisa = setTimeout(() => {
        carregarUsuarios();
      }, 300);
    });
  }

  // Carrega a tabela ao abrir a página
  await carregarUsuarios();

  async function carregarUsuarios() {
    setCarregando(true);
    if (tbodyUsuarios) tbodyUsuarios.replaceChildren();

    try {
      const termo = inputPesquisa ? inputPesquisa.value.trim() : '';
      const res = await window.api.listarUsuarios({ busca: termo });

      if (res && res.sucesso && Array.isArray(res.usuarios)) {
        renderizarTabela(res.usuarios);
      } else {
        renderizarTabela([]);
        if (res && res.mensagem) {
          exibirFeedback(res.mensagem, 'danger');
        }
      }
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      renderizarTabela([]);
      exibirFeedback('Erro ao carregar a lista de usuários.', 'danger');
    } finally {
      setCarregando(false);
    }
  }

  function renderizarTabela(usuarios) {
    if (!tbodyUsuarios) return;
    tbodyUsuarios.replaceChildren();

    if (usuarios.length === 0) {
      if (estadoVazio) estadoVazio.classList.remove('d-none');
      if (infoPaginacao) infoPaginacao.textContent = 'Exibindo 0 registros';
      return;
    }

    if (estadoVazio) estadoVazio.classList.add('d-none');
    if (infoPaginacao) infoPaginacao.textContent = `Exibindo ${usuarios.length} registros`;

    usuarios.forEach(u => {
      const tr = document.createElement('tr');

      const tdPrimeiroNome = document.createElement('td');
      tdPrimeiroNome.className = 'ps-4 fw-semibold';
      tdPrimeiroNome.textContent = u.primeiro_nome;
      tr.appendChild(tdPrimeiroNome);

      const tdSegundoNome = document.createElement('td');
      tdSegundoNome.textContent = u.segundo_nome;
      tr.appendChild(tdSegundoNome);

      const tdCpf = document.createElement('td');
      tdCpf.textContent = u.cpf;
      tr.appendChild(tdCpf);

      const tdEmail = document.createElement('td');
      tdEmail.textContent = u.email;
      tr.appendChild(tdEmail);

      const tdSenha = document.createElement('td');
      const badgeSenha = document.createElement('span');
      badgeSenha.className = 'badge bg-light text-muted border';
      badgeSenha.textContent = 'Senha cadastrada';
      tdSenha.appendChild(badgeSenha);
      tr.appendChild(tdSenha);

      const tdPossuiPlano = document.createElement('td');
      const badgePlano = document.createElement('span');
      if (Number(u.possui_plano) === 1) {
        badgePlano.className = 'badge-plano-ativo';
        badgePlano.textContent = 'Sim';
      } else {
        badgePlano.className = 'badge-plano-inativo';
        badgePlano.textContent = 'Não';
      }
      tdPossuiPlano.appendChild(badgePlano);
      tr.appendChild(tdPossuiPlano);

      const tdQualPlano = document.createElement('td');
      tdQualPlano.textContent = u.nome_plano || 'Nenhum plano';
      tr.appendChild(tdQualPlano);

      const tdAcoes = document.createElement('td');
      tdAcoes.className = 'text-center';

      const btnEditar = document.createElement('button');
      btnEditar.type = 'button';
      btnEditar.className = 'btn btn-sm btn-outline-primary';
      btnEditar.innerHTML = '<i class="fa-regular fa-pen-to-square me-1"></i> Editar';
      btnEditar.title = 'Editar Usuário';
      btnEditar.addEventListener('click', () => abrirEdicao(u.id));

      tdAcoes.appendChild(btnEditar);
      tr.appendChild(tdAcoes);

      tbodyUsuarios.appendChild(tr);
    });
  }

  async function abrirEdicao(id) {
    if (!modalEditar) {
      exibirFeedback('Não foi possível abrir o modal de edição.', 'danger');
      return;
    }

    alertaModalEditar.classList.add('d-none');
    editNovaSenha.value = '';

    try {
      const res = await window.api.buscarUsuarioPorId(id);
      if (res && res.sucesso && res.usuario) {
        const u = res.usuario;
        editUserId.value = u.id;
        editPrimeiroNome.value = u.primeiro_nome;
        editSegundoNome.value = u.segundo_nome;
        editCpf.value = u.cpf;
        editEmail.value = u.email;
        editPossuiPlano.value = String(u.possui_plano);
        editNomePlano.value = u.nome_plano || 'Nenhum plano';
        editNomePlano.disabled = Number(u.possui_plano) !== 1;

        modalEditar.show();
      } else {
        exibirFeedback('Não foi possível carregar os dados do usuário.', 'danger');
      }
    } catch (err) {
      exibirFeedback('Erro ao buscar detalhes do usuário.', 'danger');
    }
  }

  function setCarregando(carregando) {
    if (carregando) {
      if (estadoCarregando) estadoCarregando.classList.remove('d-none');
      if (estadoVazio) estadoVazio.classList.add('d-none');
    } else {
      if (estadoCarregando) estadoCarregando.classList.add('d-none');
    }
  }

  function exibirFeedback(msg, tipo) {
    if (!alertaFeedback) return;
    alertaFeedback.textContent = msg;
    alertaFeedback.className = `alert alert-${tipo} py-2 px-3 mb-3`;
    alertaFeedback.classList.remove('d-none');
    setTimeout(() => alertaFeedback.classList.add('d-none'), 4000);
  }
});