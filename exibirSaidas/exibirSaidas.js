document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const verm = {x:150, y:950, nome: " "};
    const azul = {x:1760, y:950, nome: " "};


    // elemento da imagem (id "table") que será desenhada no canvas
    const tableImg = document.getElementById('table');

    // Pontos (serão alimentados via localStorage)
    const points = [];

    // guarda a ordem em que os pontos foram selecionados
    const selectionOrder = [];

    // Ajusta canvas para o tamanho da imagem e desenha
    function prepareCanvasAndDraw() {
        canvas.width = tableImg.naturalWidth || tableImg.width || canvas.width;
        canvas.height = tableImg.naturalHeight || tableImg.height || canvas.height;
        draw();
    }

function draw(chave) {
    let cores = localStorage.getItem(chave + 'cor');
    // desenha a imagem de fundo
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (tableImg.complete && tableImg.naturalWidth) {
        ctx.drawImage(tableImg, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Desenha pontos
    points.forEach((point, i) => {
    const color = point.color || cores;

    // desenha o círculo
    ctx.beginPath();
    ctx.arc(point.x, point.y, 7, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    // configura fonte
    ctx.font = "bold 30px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const texto = point.nome ? String(point.nome) : `P${i+1}`;
    const tx = point.x + 10;
    const ty = point.y - 20;

    // texto preenchido
    ctx.fillStyle = cores;
    ctx.fillText(texto, tx, ty);

    // borda do texto
    ctx.lineWidth = 2;              // espessura da borda
    ctx.strokeStyle = "black";      // cor da borda
    ctx.strokeText(texto, tx, ty);
});

    
    // Desenha linha na ordem de seleção
    if (selectionOrder.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(points[selectionOrder[0]].x, points[selectionOrder[0]].y);
        for (let i = 1; i < selectionOrder.length; i++) {
            const p = points[selectionOrder[i]];
            ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = points[0].color || cores; // usa cor do primeiro ponto
        ctx.lineWidth = 6;
        ctx.stroke();
    } else if (points.length >= 2) {
        // Fallback: liga os pontos na ordem do array
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = points[0].color || cores;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

    // Se a imagem já estiver carregada, prepara canvas; senão espera o load
    if (tableImg.complete && tableImg.naturalWidth) {
        prepareCanvasAndDraw();
    } else {
        tableImg.addEventListener('load', prepareCanvasAndDraw);
    }

    // Referências aos elementos extras
    const tempoTotal = document.getElementById('tempoTotal');
    const complexidadeMedia = document.getElementById('complexidadeMedia');
    const exitsSelect = document.getElementById('exits');

    // Funções de cálculo
    function calcularSomaTempo(data) {
        return data.reduce((total, item) => total + Number(item[3] || 0), 0);
    }

    function calcularMediaComplexidade(data) {
        if (data.length === 0) return 0;
        const soma = data.reduce((total, item) => total + Number(item[4] || 0), 0);
        return soma / data.length;
    }

    function atualizarMetricas(chave) {
    const data = JSON.parse(localStorage.getItem(chave));
    if (!data) return;

    // monta pontos
    points.length = 0;
    let cores = localStorage.getItem(chave + 'cor');
    data.forEach(([x,y,nome,tempo,outro]) => {
        points.push({ x:Number(x), y:Number(y), nome:nome||`P${points.length+1}`, tempo:Number(tempo)||0, outro:Number(outro)||0, color:cores });
    });

    // adiciona entrada/saída ANTES de recalcular selectionOrder
    const InOut = JSON.parse(localStorage.getItem(chave + 'InOut')) || [];
    if (InOut[0] === "verm") points.unshift({ ...verm, color:"green", tipo:"entrada" });
    else if (InOut[0] === "azul") points.unshift({ ...azul, color:"green", tipo:"entrada" });

    if (InOut[1] === "verm") points.push({ ...verm, color:"red", tipo:"saida" });
    else if (InOut[1] === "azul") points.push({ ...azul, color:"red", tipo:"saida" });

    // agora sim recalcula ordem
    selectionOrder.length = 0;
    for (let i=0; i<points.length; i++) selectionOrder.push(i);
    
    draw(chave);
    tempoTotal.textContent ='Tempo total das missões: ' + calcularSomaTempo(data)
    complexidadeMedia.textContent ='Média de complexidade: ' + calcularMediaComplexidade(data)

    }


    // Preencher o select com todas as chaves do localStorage
    if (exitsSelect) {
    // Preencher o select com todas as chaves do localStorage, exceto i18nextLng
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        // pula a chave de idioma do i18next
        if (key === "i18nextLng" || key.includes('cor') || key.includes('InOut') ) continue;

        const option = document.createElement("option");
        option.value = key;
        option.textContent = key;
        exitsSelect.appendChild(option);
}

        // Atualizar métricas ao trocar de cenário
        exitsSelect.addEventListener("change", e => {
            const chave = e.target.value;
            atualizarMetricas(chave);
        });

        // Carregar automaticamente o primeiro cenário (se houver)
        if (!exitsSelect.value && exitsSelect.options.length > 0) {
            exitsSelect.value = exitsSelect.options[0].value;
        }
        if (exitsSelect.value) {
            atualizarMetricas(exitsSelect.value);

        }
    }
});