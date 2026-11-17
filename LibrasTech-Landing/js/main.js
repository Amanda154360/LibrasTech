document.addEventListener("DOMContentLoaded", () => {
    // Descobre em qual página estamos olhando o título
    const path = window.location.pathname;
    
    // ==========================================
    //  PÁGINA DE LOGIN
    // ==========================================
    if (path.includes("login.html")) {
        const formLogin = document.getElementById("login");
        if (formLogin) {
            formLogin.addEventListener("submit", (e) => {
                e.preventDefault(); // Impede de recarregar a página
                // Aqui você pode adicionar a validação de senha real depois
                window.location.href = "pagUsuario.html"; // Redireciona para a área logada
            });
        }
    }

    // ==========================================
    // PÁGINA DE CADASTRO (2 PARTES)
    // ==========================================
    if (path.includes("cadastro.html")) {
        const parte1 = document.getElementById("parte1");
        const parte2 = document.getElementById("parte2");
        const form1 = document.getElementById("cadastro1");
        const form2 = document.getElementById("cadastro2");

        // Esconde a parte 2 ao carregar
        if (parte2) parte2.style.display = "none";

        if (form1) {
            form1.addEventListener("submit", (e) => {
                e.preventDefault();
                // Validação simples
                const senhas = form1.querySelectorAll('input[type="password"]');
                if(senhas[0].value !== senhas[1].value) {
                    alert("As senhas não coincidem!");
                    return;
                }
                // Avança para a parte 2
                parte1.style.display = "none";
                parte2.style.display = "block";
            });
        }

        if (form2) {
            form2.addEventListener("submit", (e) => {
                e.preventDefault();
                alert("Cadastro realizado com sucesso! Redirecionando para o login...");
                window.location.href = "login.html";
            });
        }
    }document.addEventListener("DOMContentLoaded", () => {

    const path = window.location.pathname;

    // ==========================================
    // LOGIN
    // ==========================================

    if (path.includes("login.html")) {

        const formLogin = document.getElementById("login");

        if (formLogin) {

            formLogin.addEventListener("submit", (e) => {

                e.preventDefault();

                const email = document.getElementById("email").value.trim();
                const senha = document.getElementById("senha").value;

                if (!email || !senha) {
                    alert("Preencha todos os campos!");
                    return;
                }

                // Ainda não consulta o banco de dados.
                window.location.href = "pagUsuario.html";

            });

        }

    }


    // ==========================================
    // CADASTRO - DUAS ETAPAS
    // ==========================================

    if (path.includes("cadastro.html")) {

        const parte1 = document.getElementById("parte1");
        const parte2 = document.getElementById("parte2");

        const form1 = document.getElementById("cadastro1");
        const form2 = document.getElementById("cadastro2");

        // Começa mostrando somente a primeira parte.
        if (parte1) parte1.style.display = "block";
        if (parte2) parte2.style.display = "none";


        // PRIMEIRA ETAPA
        if (form1) {

            form1.addEventListener("submit", (e) => {

                e.preventDefault();

                const email = form1.querySelector('input[type="email"]').value.trim();

                const senhas = form1.querySelectorAll('input[type="password"]');

                const senha = senhas[0].value;
                const confirmarSenha = senhas[1].value;

                if (!email || !senha || !confirmarSenha) {
                    alert("Preencha todos os campos!");
                    return;
                }

                if (senha !== confirmarSenha) {
                    alert("As senhas não coincidem!");
                    return;
                }

                // Guarda os dados temporariamente durante o cadastro.
                parte1.style.display = "none";
                parte2.style.display = "block";

            });

        }


        // SEGUNDA ETAPA
        if (form2) {

            form2.addEventListener("submit", (e) => {

                e.preventDefault();

                const primeiroNome = document.getElementById("primeiro-nome").value.trim();
                const sobrenome = document.getElementById("sobrenome").value.trim();

                if (!primeiroNome || !sobrenome) {
                    alert("Preencha seu nome e sobrenome!");
                    return;
                }

                alert("Cadastro realizado com sucesso! Redirecionando para o login...");

                // Ainda não salva os dados no banco.
                window.location.href = "login.html";

            });

        }

    }


    // ==========================================
    // BOTÃO CADASTRAR JÁ
    // ==========================================

    const btnCadastrarJa = document.querySelector(".btn-cadastrar-ja");

    if (btnCadastrarJa) {

        btnCadastrarJa.addEventListener("click", () => {

            window.location.href = "cadastro.html";

        });

    }


    // ==========================================
    // ANIMAÇÃO DE ENTRADA
    // ==========================================

    const elementsToAnimate = document.querySelectorAll(
        ".feature-card, .section-title, .home-content"
    );

    if ("IntersectionObserver" in window && elementsToAnimate.length > 0) {

        const observer = new IntersectionObserver((entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("show-animation");

                    observer.unobserve(entry.target);

                }

            });

        }, { threshold: 0.1 });

        elementsToAnimate.forEach(el => observer.observe(el));

    } else {

        elementsToAnimate.forEach(el => {
            el.classList.add("show-animation");
        });

    }

});

    // ==========================================
    // LÓGICA: BOTÃO "CADASTRAR JÁ" (Quero Aprender)
    // ==========================================
    const btnCadastrarJa = document.querySelector(".btn-cadastrar-ja");
    if (btnCadastrarJa) {
        // Se o link estiver no HTML, ele já funciona, mas se quiser via JS:
        btnCadastrarJa.addEventListener("click", () => {
            window.location.href = "cadastro.html";
        });
    }

    // ==========================================
    // LÓGICA: ANIMAÇÃO DE ENTRADA (Index)
    // ==========================================
    const elementsToAnimate = document.querySelectorAll('.feature-card, .section-title, .home-content');
    if (elementsToAnimate.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show-animation');
                }
            });
        }, { threshold: 0.1 });

        elementsToAnimate.forEach(el => observer.observe(el));
    }
});