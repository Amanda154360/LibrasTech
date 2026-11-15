document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.querySelector('#formLogin');
  const inputEmail = document.querySelector('#inputEmail');
  const inputSenha = document.querySelector('#inputSenha');
  const btnToggleSenha = document.querySelector('#btnToggleSenha');
  const iconeOlho = document.querySelector('#iconeOlho');
  const btnEntrar = document.querySelector('#btnEntrar');
  const btnText = document.querySelector('#btnText');
  const btnSpinner = document.querySelector('#btnSpinner');
  const alertaErro = document.querySelector('#alertaErro');

  // Alternar visibilidade da senha
  btnToggleSenha.addEventListener('click', () => {
    const tipoAtual = inputSenha.getAttribute('type');
    if (tipoAtual === 'password') {
      inputSenha.setAttribute('type', 'text');
      iconeOlho.classList.remove('fa-eye');
      iconeOlho.classList.add('fa-eye-slash');
    } else {
      inputSenha.setAttribute('type', 'password');
      iconeOlho.classList.remove('fa-eye-slash');
      iconeOlho.classList.add('fa-eye');
    }
  });

  // Ocultar mensagem de erro ao digitar
  inputEmail.addEventListener('input', () => alertaErro.classList.add('d-none'));
  inputSenha.addEventListener('input', () => alertaErro.classList.add('d-none'));

  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = inputEmail.value.trim();
    const senha = inputSenha.value;

    if (!email || !senha) {
      exibirErro('Por favor, preencha todos os campos.');
      return;
    }

    setCarregando(true);

    try {
      const resposta = await window.api.login({ email, senha });

      if (resposta && resposta.sucesso) {
        await window.api.navegarPara('frmPrincipal.html');
      } else {
        exibirErro(resposta.mensagem || 'Falha ao autenticar. Verifique suas credenciais.');
      }
    } catch (err) {
      exibirErro('Erro de conexão com o serviço de autenticação.');
    } finally {
      setCarregando(false);
    }
  });

  function exibirErro(msg) {
    alertaErro.textContent = msg;
    alertaErro.classList.remove('d-none');
  }

  function setCarregando(carregando) {
    if (carregando) {
      btnEntrar.disabled = true;
      btnText.textContent = 'Autenticando...';
      btnSpinner.classList.remove('d-none');
    } else {
      btnEntrar.disabled = false;
      btnText.textContent = 'Entrar';
      btnSpinner.classList.add('d-none');
    }
  }
});