document.addEventListener('DOMContentLoaded', async () => {
  const btnNavMinhaConta = document.querySelector('#btnNavMinhaConta');
  const btnNavUsuarios = document.querySelector('#btnNavUsuarios');
  const btnSair = document.querySelector('#btnSair');
  const nomeAdmin = document.querySelector('#nomeAdmin');
  const emailAdmin = document.querySelector('#emailAdmin');
  const avatarLetra = document.querySelector('#avatarLetra');

  const totalAcessosHoje = document.querySelector('#totalAcessosHoje');
  const badgeDataHoje = document.querySelector('#badgeDataHoje');
  const fonteDadosAcessos = document.querySelector('#fonteDadosAcessos');
  const percentualComPlano = document.querySelector('#percentualComPlano');
  const qtdComPlano = document.querySelector('#qtdComPlano');
  const qtdSemPlano = document.querySelector('#qtdSemPlano');

  // Carregar dados do usuário logado
  const user = await window.api.obterUsuarioLogado();
  if (user) {
    nomeAdmin.textContent = `${user.primeiro_nome} ${user.segundo_nome}`;
    emailAdmin.textContent = user.email;
    avatarLetra.textContent = user.primeiro_nome.charAt(0).toUpperCase();
  }

  // Eventos de Navegação
  btnNavMinhaConta.addEventListener('click', () => window.api.navegarPara('frmMeusDados.html'));
  btnNavUsuarios.addEventListener('click', () => window.api.navegarPara('frmUsuarios.html'));
  btnSair.addEventListener('click', () => window.api.logout());

  // Renderizar Gráficos
  await carregarGraficoAcessos();
  await carregarGraficoPlanos();

  async function carregarGraficoAcessos() {
    const res = await window.api.obterAcessosHoje();
    if (!res || !res.sucesso) return;

    totalAcessosHoje.textContent = res.total.toLocaleString('pt-BR');
    badgeDataHoje.textContent = new Date().toLocaleDateString('pt-BR');
    fonteDadosAcessos.textContent = res.fonte ? `Fonte: ${res.fonte}` : '';

    const ctx = document.getElementById('chartAcessos').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: res.horas,
        datasets: [{
          label: 'Acessos',
          data: res.acessos,
          borderColor: '#1565C0',
          backgroundColor: 'rgba(33, 150, 243, 0.15)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` Acessos: ${context.raw}`
            }
          }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: '#EDF2F7' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  async function carregarGraficoPlanos() {
    const res = await window.api.obterUsuariosComPlanos();
    if (!res || !res.sucesso) return;

    qtdComPlano.textContent = res.comPlano;
    qtdSemPlano.textContent = res.semPlano;
    percentualComPlano.textContent = `${res.percentual}% assinantes`;

    const ctx = document.getElementById('chartUsuariosPlanos').getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Com Plano', 'Sem Plano'],
        datasets: [{
          data: [res.comPlano, res.semPlano],
          backgroundColor: ['#2E7D32', '#9E9E9E'],
          borderWidth: 2,
          borderColor: '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        },
        cutout: '70%'
      }
    });
  }
});