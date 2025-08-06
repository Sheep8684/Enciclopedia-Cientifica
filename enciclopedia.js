const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const port = 7036;

const enciclopediaPath = path.join(__dirname, 'enciclopedia-cientifica.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Envios para outra página
function adicionar() {
    window.location.href = 'adicionarartigo.html';
}

function alterar() {
    window.location.href = 'atualizarartigo.html';
}

function excluir() {
    window.location.href = 'atexcluirartigo.html';
}

function voltar() {
    window.location.href = 'index.html';
}

function pesquisar() {
    window.location.href = 'buscarartigo.html';
}

// Definir index como principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Lendo os dados do arquivo JSON
let enciclopediaData = fs.readFileSync(enciclopediaPath, 'utf-8');
let enciclopedia = JSON.parse(enciclopediaData);

// Função para salvar dados atualizados no arquivo JSON
function salvarDados() {
    fs.writeFileSync(enciclopediaPath, JSON.stringify(enciclopedia, null, 2));
}

// Rota para exibir formulário HTML
app.get('/adicionar-artigo', (req, res) => {
    res.sendFile(path.join(__dirname, 'adicionarartigo.html'));
});

// Rota para processar a requisição POST do formulário
app.post('/adicionar-artigo', (req, res) => {
    const novoArtigo = req.body;

    // Verificando se o artigo já existe pelo nome
    if (enciclopedia.find(artigo => artigo.titulo.toLowerCase() === novoArtigo.titulo.toLowerCase())) {
        res.send('<h1>Este artigo já existe. Não é possível adicionar duplicatas</h1>');
        return;
    }

    // Adicionando um novo artigo ao array de artigos
    enciclopedia.push(novoArtigo);

    // Salvando os dados atualizados no arquivo JSON
    salvarDados();

    // Enviando uma resposta informando que o artigo foi adicionado com sucesso
    res.send('<h1>O artigo foi adicionado com sucesso</h1>');
});

// Rota para exibir o formulário HTML para atualizar os dados do artigo
app.get('/atualizar-artigo', (req, res) => {
    res.sendFile(path.join(__dirname, 'atualizarartigo.html'));
});

// Rota para processar a requisição POST do formulário e atualizar os dados do artigo
app.post('/atualizar-artigo', (req, res) => {
    const { titulo, novoAutor, novoConteudo } = req.body;

    // Lendo os dados do arquivo JSON
    let enciclopediaData = fs.readFileSync(enciclopediaPath, 'utf-8');
    let enciclopedia = JSON.parse(enciclopediaData);

    // Procurando o artigo pelo nome
    const artigoIndex = enciclopedia.findIndex(artigo => artigo.titulo.toLowerCase() === titulo.toLowerCase());

    // Verificando se o artigo existe
    if (artigoIndex === -1) {
        res.send('<h1>O artigo não foi encontrado.</h1>');
        return;
    }

    // Atualizando os dados do artigo
    enciclopedia[artigoIndex].autor = novoAutor;
    enciclopedia[artigoIndex].conteudo = novoConteudo;

    // Salvando os dados atualizados no arquivo JSON
    salvarDados();

    // Enviando uma resposta indicando que os dados foram atualizados com sucesso
    res.send('<h1>Dados do artigo atualizados com sucesso!</h1>');
});

// Função para buscar um artigo específico pelo nome
function buscarArtigoPorTitulo(titulo) {
    return enciclopedia.find(artigo => artigo.titulo.toLowerCase() === titulo.toLowerCase());
}

// Rota para buscar e exibir um artigo pelo nome
app.get('/buscar-artigo', (req, res) => {
    res.sendFile(path.join(__dirname, 'buscarartigo.html'));
});

// Rota para buscar um artigo pelo título via POST
app.post('/buscar-artigo', (req, res) => {
    const { titulo } = req.body;

    // Buscando o artigo pelo título
    const artigoEncontrado = buscarArtigoPorTitulo(titulo);

    // Verificando se o artigo foi encontrado
    if (artigoEncontrado) {
        res.send(`<h1>Artigo Encontrado:</h1><pre>${JSON.stringify(artigoEncontrado, null, 2)}</pre>`);
    } else {
        res.send('<h1>O artigo não foi encontrado.</h1>');
    }
});

// Rota para exibir HTML de exclusão
app.get('/excluir-artigo', (req, res) => {
    res.sendFile(path.join(__dirname, 'excluirartigo.html'));
});

// Rota para processar a requisição POST do formulário e excluir o artigo
app.post('/excluir-artigo', (req, res) => {
    const { titulo } = req.body;

    // Lendo os dados do arquivo JSON
    let enciclopediaData = fs.readFileSync(enciclopediaPath, 'utf-8');
    let enciclopedia = JSON.parse(enciclopediaData);

    // Procurando o artigo pelo nome
    const artigoIndex = enciclopedia.findIndex(artigo => artigo.titulo.toLowerCase() === titulo.toLowerCase());

    // Verificando se o artigo existe
    if (artigoIndex === -1) {
        res.send('<h1>O artigo não foi encontrado.</h1>');
        return;
    }

    // Solicitar confirmação do usuário antes de excluir o artigo
    res.send(`
        <script>
            if (confirm('Tem certeza de que deseja excluir o artigo ${titulo}?')){
                window.location.href='/excluir-artigo-confirmado?titulo=${titulo}';
            } else {
                window.location.href = '/excluir-artigo'; 
            }
        </script>
    `);
});

// Rota para confirmar a exclusão do artigo após a confirmação do usuário
app.get('/excluir-artigo-confirmado', (req, res) => {
    const titulo = req.query.titulo;

    // Lendo os dados do arquivo JSON
    let enciclopediaData = fs.readFileSync(enciclopediaPath, 'utf-8');
    let enciclopedia = JSON.parse(enciclopediaData);

    // Procurando o artigo pelo nome
    const artigoIndex = enciclopedia.findIndex(artigo => artigo.titulo.toLowerCase() === titulo.toLowerCase());

    // Verificando se o artigo existe antes de excluir
    if (artigoIndex === -1) {
        res.send('<h1>O artigo não foi encontrado.</h1>');
        return;
    }

    // Removendo o artigo do array
    enciclopedia.splice(artigoIndex, 1);

    // Salvando os dados atualizados
    salvarDados();

    // Enviando resposta da exclusão de dados
    res.send(`<h1>O artigo ${titulo} foi excluído com sucesso!</h1>`);
});

// Iniciando o servidor
app.listen(port, () => {
    console.log(`Servidor iniciado em http://localhost:${port}`);
});