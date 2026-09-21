/* ============================================================
   PetCare São Mateus - script.js
   Funcionalidades: menu mobile, scroll suave, link ativo,
   voltar ao topo, revelar ao rolar, validação do formulário,
   toast de produtos e registro do Service Worker.
   ============================================================ */

'use strict';

/* ---------- Atalhos de seleção ---------- */
const $ = (seletor, contexto = document) => contexto.querySelector(seletor);
const $$ = (seletor, contexto = document) => Array.from(contexto.querySelectorAll(seletor));

/* ============================================================
   1. MENU MOBILE (HAMBURGER)
   ============================================================ */
const header = $('#header');
const botaoMenu = $('#hamburger');
const nav = $('#nav');
const navOverlay = $('#nav-overlay');

function alternarMenu() {
    const aberto = nav.classList.toggle('ativo');
    botaoMenu.classList.toggle('ativo', aberto);
    navOverlay.classList.toggle('ativo', aberto);
    document.body.classList.toggle('menu-aberto', aberto);
    botaoMenu.setAttribute('aria-expanded', String(aberto));
    botaoMenu.setAttribute('aria-label', aberto ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
}

function fecharMenu() {
    nav.classList.remove('ativo');
    botaoMenu.classList.remove('ativo');
    navOverlay.classList.remove('ativo');
    document.body.classList.remove('menu-aberto');
    botaoMenu.setAttribute('aria-expanded', 'false');
    botaoMenu.setAttribute('aria-label', 'Abrir menu de navegação');
}

botaoMenu.addEventListener('click', alternarMenu);
navOverlay.addEventListener('click', fecharMenu);

// Fecha o menu com a tecla ESC
document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && nav.classList.contains('ativo')) {
        fecharMenu();
        botaoMenu.focus();
    }
});

/* ============================================================
   2. SCROLL SUAVE ENTRE SEÇÕES
   ============================================================ */
const ALTURA_HEADER = header.offsetHeight || 72;

$$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (evento) => {
        const idAlvo = link.getAttribute('href');
        if (idAlvo === '#' || idAlvo === '') return;

        const alvo = document.querySelector(idAlvo);
        if (!alvo) return;

        evento.preventDefault();
        fecharMenu();

        const posicao = alvo.getBoundingClientRect().top + window.scrollY - ALTURA_HEADER;
        window.scrollTo({ top: posicao, behavior: 'smooth' });
        history.replaceState(null, '', idAlvo);
    });
});

/* ============================================================
   3. HEADER COM SOMBRA + LINK ATIVO + BOTÃO VOLTAR AO TOPO
   ============================================================ */
const btnTopo = $('#btn-topo');
const secoes = $$('main section[id]');
const linksNavegacao = $$('.nav-link');

function destacarLinkAtivo() {
    const pontoReferencia = window.scrollY + ALTURA_HEADER + 60;
    let secaoAtual = secoes[0]?.id || '';

    secoes.forEach((secao) => {
        if (pontoReferencia >= secao.offsetTop) {
            secaoAtual = secao.id;
        }
    });

    linksNavegacao.forEach((link) => {
        const ativo = link.getAttribute('href') === `#${secaoAtual}`;
        link.classList.toggle('ativo', ativo);
    });
}

window.addEventListener(
    'scroll',
    () => {
        const rolagem = window.scrollY;

        header.classList.toggle('rolagem', rolagem > 10);
        btnTopo.classList.toggle('visivel', rolagem > 400);
        destacarLinkAtivo();
    },
    { passive: true }
);

// Botão "Voltar ao topo"
btnTopo.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ============================================================
   4. REVELAR ELEMENTOS AO ROLAR (animação suave)
   ============================================================ */
const elementosRevelaveis = $$('.revelar');

if ('IntersectionObserver' in window) {
    const observador = new IntersectionObserver(
        (entradas, obs) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add('visivel');
                    obs.unobserve(entrada.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    elementosRevelaveis.forEach((elemento) => observador.observe(elemento));
} else {
    // Navegadores antigos: mostra tudo direto
    elementosRevelaveis.forEach((elemento) => elemento.classList.add('visivel'));
}

/* ============================================================
   5. TOAST (avisos rápidos)
   ============================================================ */
const toast = $('#toast');
let tempoToast = null;

function mostrarToast(mensagem) {
    clearTimeout(tempoToast);
    toast.textContent = mensagem;
    toast.classList.add('mostrar');
    tempoToast = setTimeout(() => toast.classList.remove('mostrar'), 3200);
}

// Botões "Comprar" dos produtos (loja demonstrativa)
$$('.btn-comprar').forEach((botao) => {
    botao.addEventListener('click', () => {
        mostrarToast(`${botao.dataset.produto} adicionado! Loja demonstrativa - projeto educacional.`);
    });
});

/* ============================================================
   6. FORMULÁRIO DE AGENDAMENTO (máscara, validação e sucesso)
   ============================================================ */
const form = $('#form-agendamento');
const campoPet = $('#pet');
const campoServico = $('#servico');
const campoData = $('#data');
const campoTelefone = $('#telefone');
const boxSucesso = $('#form-sucesso');
const textoSucesso = $('#sucesso-detalhe');

// Impede datas passadas (mínimo = hoje)
function hojeISO() {
    const hoje = new Date();
    return new Date(hoje.getTime() - hoje.getTimezoneOffset() * 60000).toISOString().split('T')[0];
}
campoData.min = hojeISO();

// Máscara do telefone: (11) 91234-5678
campoTelefone.addEventListener('input', () => {
    let digitos = campoTelefone.value.replace(/\D/g, '').slice(0, 11);

    if (digitos.length > 6) {
        campoTelefone.value = `(${digitos.slice(0, 2)}) ${digitos.slice(2, digitos.length === 11 ? 7 : 6)}-${digitos.slice(digitos.length === 11 ? 7 : 6)}`;
    } else if (digitos.length > 2) {
        campoTelefone.value = `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
    } else if (digitos.length > 0) {
        campoTelefone.value = `(${digitos}`;
    } else {
        campoTelefone.value = '';
    }
});

// Define a mensagem de erro de um campo
function definirErro(campo, mensagem) {
    const grupo = campo.closest('.form-group');
    const aviso = grupo.querySelector('.campo-erro');

    grupo.classList.toggle('grupo-invalido', Boolean(mensagem));
    aviso.textContent = mensagem || '';
    campo.setAttribute('aria-invalid', mensagem ? 'true' : 'false');
    return !mensagem;
}

// Regras de validação de cada campo
function validarCampo(campo) {
    const valor = campo.value.trim();

    switch (campo) {
        case campoPet:
            if (valor.length < 2) return 'Informe o nome do pet (mínimo 2 letras).';
            return '';

        case campoServico:
            if (!valor) return 'Selecione o tipo de serviço.';
            return '';

        case campoData: {
            if (!valor) return 'Escolha a data do atendimento.';
            if (valor < campoData.min) return 'A data não pode estar no passado.';
            const diaSemana = new Date(`${valor}T12:00:00`).getDay();
            if (diaSemana === 0) return 'Fechamos aos domingos - escolha outro dia.';
            return '';
        }

        case campoTelefone: {
            const digitos = valor.replace(/\D/g, '');
            if (digitos.length !== 10 && digitos.length !== 11) {
                return 'Informe um telefone válido com DDD, ex.: (11) 98765-4321.';
            }
            return '';
        }

        default:
            return '';
    }
}

// Valida ao sair do campo e limpa o erro enquanto digita
[campoPet, campoServico, campoData, campoTelefone].forEach((campo) => {
    campo.addEventListener('blur', () => definirErro(campo, validarCampo(campo)));
    campo.addEventListener('input', () => {
        if (campo.closest('.form-group').classList.contains('grupo-invalido')) {
            definirErro(campo, validarCampo(campo));
        }
    });
    campo.addEventListener('change', () => definirErro(campo, validarCampo(campo)));
});

form.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const campos = [campoPet, campoServico, campoData, campoTelefone];
    let primeiroInvalido = null;

    campos.forEach((campo) => {
        const valido = definirErro(campo, validarCampo(campo));
        if (!valido && !primeiroInvalido) primeiroInvalido = campo;
    });

    if (primeiroInvalido) {
        primeiroInvalido.focus();
        mostrarToast('Verifique os campos destacados e tente novamente.');
        return;
    }

    // Monta a mensagem de sucesso com os dados do agendamento
    const dataFormatada = new Date(`${campoData.value}T12:00:00`).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    textoSucesso.textContent =
        `${campoPet.value.trim()} foi agendado para ${campoServico.value} na ${dataFormatada}. ` +
        `Vamos confirmar pelo telefone ${campoTelefone.value}. Até logo!`;

    boxSucesso.hidden = false;
    form.reset();
    campoData.min = hojeISO();
    boxSucesso.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    mostrarToast('Agendamento enviado com sucesso!');

    clearTimeout(boxSucesso._temporizador);
    boxSucesso._temporizador = setTimeout(() => {
        boxSucesso.hidden = true;
    }, 12000);
});

/* ============================================================
   7. ANO DINÂMICO NO RODAPÉ
   ============================================================ */
$('#ano').textContent = new Date().getFullYear();

/* ============================================================
   8. REGISTRO DO SERVICE WORKER (PWA)
   ============================================================ */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registrado'))
            .catch(err => console.log('Erro no Service Worker:', err));
    });
}
