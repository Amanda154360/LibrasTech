document.addEventListener('DOMContentLoaded', async () => {
  const btnNavDashboard = document.querySelector('#btnNavDashboard');
  const btnNavUsuarios = document.querySelector('#btnNavUsuarios');
  const btnSair = document.querySelector('#btnSair');
  const nomeAdmin = document.querySelector('#nomeAdmin');
  const emailAdmin = document.querySelector('#emailAdmin');
  const avatarLetra = document.querySelector('#avatarLetra');

  const formMeusDados = document.querySelector('#formMeusDados');
  const inputPrimeiroNome = document.querySelector('#inputPrimeiroNome');
  const inputSegundoNome = document.querySelector('#inputSegundoNome');
  const inputEmail = document.querySelector('#inputEmail');
  const btnEditar = document.querySelector('#btnEditar');
  const btnSalvar = document.querySelector('#btnSalvar');
  const btnCancelar = document.querySelector('#btnCancelar');
  const alertaFeedback = document.querySelector('#alertaFeedback');

  const modalSenhaEl = document.querySelector('#modalSenha');
  const modalSenha = new bootstrap.Modal(modalSenhaEl);
  const btnAbrirModalSenha = document.querySelector('#btnAbrirModalSenha');
  const formAlterarSenha = document.querySelector('#formAlterarSenha');
  const inputSenhaAtual = document.querySelector('#inputSenhaAtual');
  const inputNovaSenha = document.querySelector('#inputNovaSenha');
  const alertaSenha = document.querySelector('#alertaSenha');

  let dadosOriginais = {};

  // Carregar Usuário Logado
  const user = await window.api.obterUsuarioLogado();
  if (user) {
    atualizarHeaderUsuario(user);
  }

  await carregarDadosFormulario();

  btnNavDashboard.addEventListener('click', () => window.api.navegarPara('frmPrincipal.html'));
  btnNavUsuarios.addEventListener('click', () => window.api.navegarPara('frmUsuarios.html'));
  btnSair.addEventListener('click', () => window.api.logout());

  btnEditar.addEventListener('click', () => setModoEdicao(true));
  btnCancelar.addEventListener('click', () => {
    restaurarCampos();
    setModoEdicao(false);
  });

  formMeusDados.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      primeiro_nome: inputPrimeiroNome.value.trim(),
      segundo_nome: inputSegundoNome.value.trim(),
      email: inputEmail.value.trim()
    };

    const res = await window.api.atualizarMeusDados(payload);
    if (res && res.sucesso) {
      exibirFeedback('Dados salvos com sucesso!', 'success');
      dadosOriginais = { ...payload };
      atualizarHeaderUsuario(payload);
      setModoEdicao(false);
    } else {
      exibirFeedback(res.mensagem || 'Erro ao salvar dados.', 'danger');
    }
  });

  btnAbrirModalSenha.addEventListener('click', () => {
    formAlterarSenha.reset();
    alertaSenha.classList.add('d-none');
    modalSenha.show();
  });

  formAlterarSenha.addEventListener('submit', async (e) => {
    e.preventDefault();
    const senhaAtual = inputSenhaAtual.value;
    const novaSenha = inputNovaSenha.value;

    const res = await window.api.alterarSenha({ senhaAtual, novaSenha });
    if (res && res.sucesso) {
      modalSenha.hide();
      exibirFeedback('Senha alterada com sucesso!', 'success');
    } else {
      alertaSenha.textContent = res.mensagem || 'Falha ao alterar senha.';
      alertaSenha.classList.remove('d-none');
    }
  });

  async function carregarDadosFormulario() {
    const res = await window.api.buscarMeusDados();
    if (res && res.sucesso) {
      dadosOriginais = res.dados;
      restaurarCampos();
    }
  }

  function restaurarCampos() {
    inputPrimeiroNome.value = dadosOriginais.primeiro_nome || '';
    inputSegundoNome.value = dadosOriginais.segundo_nome || '';
    inputEmail.value = dadosOriginais.email || '';
  }

  function setModoEdicao(ativo) {
    inputPrimeiroNome.disabled = !ativo;
    inputSegundoNome.disabled = !ativo;
    inputEmail.disabled = !ativo;

    if (ativo) {
      btnEditar.classList.add('d-none');
      btnSalvar.classList.remove('d-none');
      btnCancelar.classList.remove('d-none');
    } else {
      btnEditar.classList.remove('d-none');
      btnSalvar.classList.add('d-none');
      btnCancelar.classList.add('d-none');
    }
  }

  function atualizarHeaderUsuario(u) {
    nomeAdmin.textContent = `${u.primeiro_nome} ${u.segundo_nome}`;
    emailAdmin.textContent = u.email;
    avatarLetra.textContent = u.primeiro_nome.charAt(0).toUpperCase();
  }

  function exibirFeedback(msg, tipo) {
    alertaFeedback.textContent = msg;
    alertaFeedback.className = `alert alert-${tipo} py-2 px-3 mb-3`;
    alertaFeedback.classList.remove('d-none');
    setTimeout(() => alertaFeedback.classList.add('d-none'), 4000);
  }
});