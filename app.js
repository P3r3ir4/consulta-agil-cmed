let todosMedicamentos = [];

const campoBusca = document.getElementById('campoBusca');
const filtroImposto = document.getElementById('filtroImposto'); // O seletor de imposto
const listaResultados = document.getElementById('listaResultados');
const mensagemCarregando = document.getElementById('mensagemCarregando');

// --- 1. Carregar Dados ---
async function carregarDados() {
    try {
        const resposta = await fetch('lista_cmed.json');
        todosMedicamentos = await resposta.json();
        mensagemCarregando.style.display = 'none';

        // Renderiza lista inicial vazia ou completa (opcional)
        filtrarERenderizar();

    } catch (erro) {
        mensagemCarregando.innerText = "Erro ao carregar dados.";
        console.error(erro);
    }
}

// --- 2. Lógica de Filtragem ---
// Função unificada que é chamada tanto ao digitar quanto ao mudar o imposto
function filtrarERenderizar() {
    const termoDigitado = campoBusca.value.toLowerCase();
    const impostoSelecionado = filtroImposto.value;

    const resultados = todosMedicamentos.filter(med => {
        const nome = (med['PRODUTO'] || '').toLowerCase();
        const substancia = (med['SUBSTÂNCIA'] || '').toLowerCase();
        const laboratorio = (med['LABORATÓRIO'] || '').toLowerCase();

        return nome.includes(termoDigitado) ||
        substancia.includes(termoDigitado) ||
        laboratorio.includes(termoDigitado);
    });

    renderizarLista(resultados, impostoSelecionado);
}

// Eventos (Listeners)
campoBusca.addEventListener('input', filtrarERenderizar);
filtroImposto.addEventListener('change', filtrarERenderizar);

// --- 3. Renderização ---
function renderizarLista(lista, imposto) {
    listaResultados.innerHTML = '';

    if (lista.length === 0) {
        listaResultados.innerHTML = '<p style="text-align:center">Nenhum medicamento encontrado.</p>';
        return;
    }

    lista.forEach(med => {
        const cartao = document.createElement('div');
        cartao.classList.add('medicamento-card');

        // Cabeçalho do Cartão (Informações fixas)
        let htmlConteudo = `
        <h3>${med['PRODUTO']}</h3>
        <div class="medicamento-info">
        <p><strong>Substância:</strong> ${med['SUBSTÂNCIA']}</p>
        <p><strong>Laboratório:</strong> ${med['LABORATÓRIO']}</p>
        <p><strong>Apresentação:</strong> ${med['APRESENTAÇÃO']}</p>
        </div>
        `;

        // Verifica se o usuário quer ver TODOS ou um ESPECÍFICO
        if (imposto === 'todos') {
            // --- MODO TABELA COMPLETA ---
            htmlConteudo += `
            <p><strong>Tabela de Preços (PF e PMC):</strong></p>
            <table class="tabela-precos">
            <thead>
            <tr>
            <th>ICMS</th>
            <th>Preço Fábrica</th>
            <th>Preço Máximo (PMC)</th>
            </tr>
            </thead>
            <tbody>
            ${gerarLinhaTabela(med, '0%')}
            ${gerarLinhaTabela(med, '12 %')}
            ${gerarLinhaTabela(med, '17 %')}
            ${gerarLinhaTabela(med, '18 %')}
            ${gerarLinhaTabela(med, '20 %')}
            </tbody>
            </table>
            `;
        } else {
            // --- MODO PREÇO ÚNICO ---
            // Constrói as chaves dinamicamente baseadas na seleção (ex: "PF 18 %")
            const chavePF = `PF ${imposto}`;
            const chavePMC = `PMC ${imposto}`;

            const valorPF = med[chavePF] || '-';
            const valorPMC = med[chavePMC] || '-';

            htmlConteudo += `
            <div class="preco-box">
            <p>Preço Fábrica (${imposto}): R$ ${valorPF}</p>
            <p class="preco-destaque">Preço Máximo (${imposto}): R$ ${valorPMC}</p>
            </div>
            `;
        }

        cartao.innerHTML = htmlConteudo;
        listaResultados.appendChild(cartao);
    });
}

// Função auxiliar para criar linhas da tabela
function gerarLinhaTabela(med, aliquota) {
    const pf = med[`PF ${aliquota}`] || '-';
    const pmc = med[`PMC ${aliquota}`] || '-';
    return `
    <tr>
    <td>${aliquota}</td>
    <td>R$ ${pf}</td>
    <td>R$ ${pmc}</td>
    </tr>
    `;
}

// Iniciar
carregarDados();
