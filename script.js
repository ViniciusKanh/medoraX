// ============================================================
// 🔧 Funções auxiliares
// ============================================================
function $(id) {
  return document.getElementById(id);
}

// Função para converter JSON do Notebook em HTML (aprimorada para Markdown)
function notebookToHtml(notebookJson) {
    let html = '';
    let notebook;
    try {
        notebook = JSON.parse(notebookJson);
    } catch (e) {
        return `<p class="error-message">Erro ao processar o arquivo do Notebook: ${e.message}</p>`;
    }

    notebook.cells.forEach(cell => {
        if (cell.cell_type === 'markdown') {
            const source = cell.source.join('');
            // Conversão básica de Markdown para HTML
            let content = source
                .replace(/^#\s*(.*)$/gm, '<h3>$1</h3>') // H3 para títulos de seção
                .replace(/^##\s*(.*)$/gm, '<h4>$1</h4>') // H4 para subtítulos
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Negrito
                .replace(/\*(.*?)\*/g, '<em>$1</em>') // Itálico
                .replace(/^- (.*)$/gm, '<li>$1</li>') // Lista
                .replace(/^(<li>.*<\/li>)$/gms, '<ul>$1</ul>') // Envolve a lista
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>'); // Links

            html += `<div class="doc-content-item">${content}</div>`;
        } else if (cell.cell_type === 'code') {
            const source = cell.source.join('');
            html += `<div class="doc-content-item"><h4>Código Fonte</h4><pre><code>${source}</code></pre></div>`;
        }
    });

    return html;
}

// ============================================================
// 📁 Seletores principais
// ============================================================
const fileInput = $("fileInput");
const dropzone = $("dropzone");
const pickFile = $("pickFile");
const previewContainer = $("previewContainer");
const previewImg = $("previewImg");
const clearBtn = $("clearBtn");
const btnAnalyze = $("btnAnalyze");
const progress = $("progress");
const resultContainer = $("resultContainer");
const emptyState = $("emptyState");
const docContent = $("doc-content");
const splashScreen = $("splash-screen");

// Campos de saída
const modality = $("modality");
const confidence = $("confidence");
const findingsList = $("findings");
const diffList = $("differential");
const report = $("report");
const refs = $("refs");

// Campos de pesquisa
const btnSearch = $("btnSearch");
const q = $("q");
const site = $("site");
const num = $("num");
const searchResults = $("searchResults");

// ============================================================
// 🎯 Funções auxiliares
// ============================================================

function getBackendBase() {
  // O link do HF Spaces fornecido pelo Vinicius
  return "https://viniciuskhan-backend-medorax.hf.space";
}

function showPreview() {
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    previewContainer.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
}

function updateResultDisplay(data) {
    // Limpa listas
    findingsList.innerHTML = "";
    diffList.innerHTML = "";
    refs.innerHTML = "";

    // Exibe resultados
    modality.textContent = data.modality || "Não Identificado";
    confidence.textContent =
      data.confidence_modality !== undefined
        ? (data.confidence_modality * 100).toFixed(1) + "%"
        : "N/A";

    if (data.findings && data.findings.length > 0) {
        findingsList.innerHTML = data.findings
            .map((f) => `<li><strong>${f.name}</strong>: ${f.evidence || "Sem evidência detalhada"}</li>`)
            .join("");
    } else {
        findingsList.innerHTML = "<li>Nenhum achado clínico relevante identificado.</li>";
    }

    if (data.differential && data.differential.length > 0) {
        diffList.innerHTML = data.differential
            .map(
                (d) =>
                    `<li>${d.label} — <span class="text-gray-500">${(
                        d.confidence * 100
                    ).toFixed(0)}%</span></li>`
            )
            .join("");
    } else {
        diffList.innerHTML = "<li>Nenhum diagnóstico diferencial sugerido.</li>";
    }

    report.textContent = data.report_text || "Relatório não gerado.";

    if (data.references && data.references.length > 0) {
        refs.innerHTML = data.references
            .map(
                (r) =>
                    `<li><a href="${r.url}" target="_blank">${r.title}</a></li>`
            )
            .join("");
    } else {
        refs.innerHTML = "<li>Nenhuma referência encontrada.</li>";
    }

    emptyState.classList.add("hidden");
    resultContainer.classList.remove("hidden");
    resultContainer.scrollIntoView({ behavior: "smooth" });
}

// ============================================================
// 🚀 Inicialização e Efeitos Visuais
// ============================================================

// Lógica da Splash Screen
function hideSplashScreen() {
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        // Adiciona um delay para garantir que a transição de opacidade termine antes de esconder
        setTimeout(() => {
            splashScreen.style.visibility = 'hidden';
            splashScreen.style.display = 'none'; // Garante que não interfira em cliques
        }, 1000); // 1 segundo de transição de opacidade
    }, 2000); // 2.0 segundos de animação inicial (tempo da animação da barra de progresso)
}

// ============================================================
// 📤 Drag & Drop + upload
// ============================================================

dropzone.addEventListener("click", () => fileInput.click());
pickFile?.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add('dropzone-active');
});
dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove('dropzone-active');
});
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove('dropzone-active');
  fileInput.files = e.dataTransfer.files;
  showPreview();
});
fileInput.addEventListener("change", showPreview);

clearBtn.addEventListener("click", () => {
  fileInput.value = "";
  previewContainer.classList.add("hidden");
  resultContainer.classList.add("hidden");
  emptyState.classList.remove("hidden");
  searchResults.innerHTML = "";
});

// ============================================================
// 🧠 Análise de imagem
// ============================================================

btnAnalyze.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) return alert("Selecione uma imagem primeiro.");

  progress.classList.remove("hidden");
  btnAnalyze.disabled = true;
  btnAnalyze.textContent = "⏳ Analisando...";

  const formData = new FormData();
  formData.append("image", file);

  try {
    const backendBase = getBackendBase();
    const res = await fetch(`${backendBase}/predict`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Erro ${res.status}: ${text}`);
    }

    const data = await res.json();
    updateResultDisplay(data);

  } catch (err) {
    alert("❌ Erro ao processar imagem: " + err.message);
    console.error(err);
  } finally {
    progress.classList.add("hidden");
    btnAnalyze.disabled = false;
    btnAnalyze.textContent = "▶️ Analisar Imagem";
  }
});

// ============================================================
// 🔍 Pesquisa clínica
// ============================================================

btnSearch.addEventListener("click", async () => {
  const query = q.value.trim();
  const siteVal = site.value.trim();
  const numVal = num.value;

  if (!query) return alert("Digite um termo para pesquisar.");

  searchResults.innerHTML = "<p class='progress-status'>🔎 Buscando...</p>";

  try {
    const backendBase = getBackendBase();
    const url = new URL(`${backendBase}/research`);
    url.searchParams.append("q", query);
    url.searchParams.append("num", numVal);
    if (siteVal) url.searchParams.append("site", siteVal);

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erro ${res.status}`);

    const data = await res.json();

    if (data.items && data.items.length > 0) {
      searchResults.innerHTML = data.items
        .map(
          (i) =>
            `<div class="result-item"><a href="${i.url}" target="_blank">${i.title}</a><p>${i.url}</p></div>`
        )
        .join("");
    } else {
      searchResults.innerHTML = "<p class='empty-state'>Nenhum resultado encontrado.</p>";
    }
  } catch (e) {
    searchResults.innerHTML = `<p class='error-message'>Erro na pesquisa: ${e.message}</p>`;
    console.error(e);
  }
});

// ============================================================
// 📝 Injeção da Documentação
// ============================================================

// Conteúdo do Notebook MedoraX.ipynb (JSON)
const notebookJson = `
{
  "nbformat": 4,
  "nbformat_minor": 0,
  "metadata": {
    "colab": {
      "provenance": []
    },
    "kernelspec": {
      "name": "python3",
      "display_name": "Python 3"
    },
    "language_info": {
      "name": "python"
    }
  },
  "cells": [
    {
      "cell_type": "markdown",
      "source": [
        "# MedoraX: Sistema de Análise Médica Inteligente",
        "",
        "## Visão Geral do Projeto",
        "",
        "O MedoraX é um projeto de pesquisa e desenvolvimento em Inteligência Artificial aplicada à saúde, idealizado por **Vinicius de Souza Santos**, estudante de Mestrado em Ciências da Computação. O objetivo principal é criar um assistente educacional e de pesquisa capaz de realizar a **análise multimodal de imagens médicas** e fornecer **referências clínicas** relevantes de forma rápida e explicável.",
        "",
        "O sistema demonstra o potencial da IA na área da saúde, integrando modelos de linguagem avançados com ferramentas de busca especializadas para auxiliar estudantes, pesquisadores e profissionais no processo de interpretação e estudo de casos clínicos.",
        "",
        "## Arquitetura e Tecnologias",
        "",
        "O backend do MedoraX é uma API robusta e modular, hospedada no Hugging Face Spaces, que orquestra diferentes serviços para entregar a análise completa.",
        "",
        "### 1. Análise Multimodal (Gemini)",
        "",
        "O coração do sistema é o modelo **Google Gemini**, utilizado para a análise da imagem médica e a geração do relatório estruturado. O Gemini é capaz de processar a imagem (PNG/JPG) e o prompt de instrução para extrair informações cruciais como:",
        "",
        "- **Tipo de Imagem/Modalidade:** Raio-X, Tomografia, Ressonância, etc.",
        "- **Achados Clínicos:** Descrição detalhada das anomalias observadas.",
        "- **Diagnóstico Diferencial (DDx):** Lista de possíveis diagnósticos com base nos achados.",
        "- **Relatório Explicativo:** Texto coeso e estruturado para o usuário.",
        "",
        "### 2. Pesquisa Clínica Avançada (Tavily e Google CSE)",
        "",
        "Para garantir a relevância e a confiabilidade das informações, o MedoraX utiliza ferramentas de busca especializadas:",
        "",
        "- **Tavily API:** Utilizada para buscar artigos e referências em fontes médicas e científicas de alta qualidade.",
        "- **Google Custom Search Engine (CSE):** Permite a busca em domínios específicos (ex: `radiopaedia.org`, `nejm.org`), garantindo que as referências sejam de fontes confiáveis e especializadas.",
        "",
        "Essas ferramentas são integradas ao fluxo de análise para fornecer referências em tempo real, complementando o relatório gerado pelo Gemini.",
        "",
        "### 3. API Backend (Hugging Face Spaces)",
        "",
        "A API é implementada em Python, utilizando o framework **FastAPI** (ou similar, como Flask/Gradio) para criar dois endpoints principais:",
        "",
        "- `/predict`: Recebe a imagem e retorna o JSON estruturado da análise do Gemini.",
        "- `/research`: Recebe o termo de busca e retorna os resultados da pesquisa clínica (Tavily/CSE).",
        "",
        "O link da API é: `https://huggingface.co/spaces/ViniciusKhan/backend-medoraX`",
        "",
        "## Código de Exemplo (Estrutura da API)",
        "",
        "Abaixo, um trecho simplificado do código que demonstra a integração com o Gemini:",
        "",
        "```python",
        "from google import genai",
        "from google.genai import types",
        "from PIL import Image",
        "import io",
        "",
        "client = genai.Client()",
        "",
        "def analyze_image_with_gemini(image_bytes):",
        "    img = Image.open(io.BytesIO(image_bytes))",
        "    ",
        "    prompt = (",
        "        \"Você é um assistente de análise médica. Analise a imagem fornecida e gere um JSON estruturado com os seguintes campos: 'modality', 'confidence_modality', 'findings' (lista de objetos com 'name' e 'evidence'), 'differential' (lista de objetos com 'label' e 'confidence'), e 'report_text'.\"",
        "    )",
        "    ",
        "    response = client.models.generate_content(",
        "        model='gemini-2.5-flash',",
        "        contents=[prompt, img],",
        "        config=types.GenerateContentConfig(",
        "            response_mime_type='application/json'",
        "        )",
        "    )",
        "    ",
        "    return response.text",
        "```",
        "",
        "## Contribuições e Futuro",
        "",
        "O MedoraX é um projeto de código aberto focado em pesquisa. Contribuições são bem-vindas, especialmente em:",
        "",
        "- **Otimização de Prompts:** Melhorar a precisão e a estrutura dos relatórios gerados pelo Gemini.",
        "- **Integração de Novas APIs:** Adicionar outras fontes de dados e ferramentas de pesquisa.",
        "- **Frontend:** Melhorias contínuas na interface do usuário para uma experiência mais fluida e intuitiva (como esta que está sendo implementada!).",
        "",
        "Para mais detalhes sobre o desenvolvimento e a pesquisa, consulte o repositório completo do projeto."
      ]
    }
  ]
}
`;

async function loadDocumentation() {
    // Injeta o conteúdo do notebook (simulado) no elemento de documentação
    docContent.innerHTML = notebookToHtml(notebookJson);
}

// ============================================================
// 🏁 Início
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    loadDocumentation();
    // A splash screen será escondida após a animação de carregamento
    hideSplashScreen();

    // Adiciona o evento de scroll para a navegação suave
    document.querySelectorAll('.main-nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
