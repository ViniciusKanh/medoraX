<div align="center">
  <img src="https://raw.githubusercontent.com/ViniciusKanh/medoraX/main/assets/img/medorax_logo.png" alt="MedoraX Logo" width="200"/>
  <h1>MedoraX: Assistente de Análise Médica Inteligente</h1>
  <p><strong>Protótipo de Pesquisa e Desenvolvimento em IA Aplicada à Saúde</strong></p>
  
  <p>
    <a href="https://huggingface.co/spaces/ViniciusKhan/backend-medoraX" target="_blank">
      <img src="https://img.shields.io/badge/Backend-Hugging%20Face%20Spaces-blue?style=for-the-badge&logo=huggingface&logoColor=white&color=00eaff" alt="Hugging Face Spaces">
    </a>
    <a href="https://github.com/ViniciusKanh/medoraX" target="_blank">
      <img src="https://img.shields.io/badge/Frontend-GitHub%20Pages-blue?style=for-the-badge&logo=github&logoColor=white&color=ff0077" alt="GitHub Pages">
    </a>
    <img src="https://img.shields.io/badge/Modelo%20Principal-Google%20Gemini-blue?style=for-the-badge&logo=google&logoColor=white&color=00eaff" alt="Google Gemini">
    <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge&color=ffcc00" alt="Status">
  </p>
</div>

---

## 💡 Visão Geral do Projeto

O **MedoraX** é um sistema inovador de **Análise Médica Inteligente** desenvolvido como parte de uma pesquisa de Mestrado em Ciências da Computação. Ele demonstra o potencial da Inteligência Artificial Multimodal para auxiliar no processo de **interpretação de imagens médicas** e na **pesquisa clínica contextualizada**.

O projeto integra o poder do modelo **Google Gemini** para análise visual e textual, complementado por um agente de **Recuperação Aumentada (RAG)** que utiliza o **Google Custom Search Engine (CSE)** e a **Tavily API** para fornecer referências clínicas de alta confiabilidade.

> **AVISO:** O MedoraX é um protótipo educacional e de pesquisa. **NÃO** deve ser utilizado para diagnóstico clínico ou tomada de decisões médicas. Consulte sempre um profissional de saúde qualificado.

## 🚀 Funcionalidades Chave

| Funcionalidade | Descrição | Tecnologias Envolvidas |
| :--- | :--- | :--- |
| **Análise Multimodal** | Upload de imagens médicas (Raio-X, Dermatológicas, etc.) com retorno de um relatório estruturado. | Google Gemini, CLIP (Fallback) |
| **Relatório Explicável** | Geração de achados clínicos, diagnóstico diferencial (DDx), sinais de alarme e próximos passos sugeridos. | Google Gemini (JSON Mode) |
| **Pesquisa Clínica RAG** | Agente de pesquisa que reescreve a *query*, busca em fontes médicas confiáveis (CSE/Tavily), ranqueia os resultados e sintetiza a resposta. | Google CSE, Tavily API, Gemini Embeddings, BM25 |
| **Interface Futurista** | Frontend moderno, responsivo e com design *cyber-médico* para uma experiência de usuário intuitiva. | HTML5, CSS3 (Neon/Glow), JavaScript |

## 💻 Demonstração Visual

| Tela Inicial (Frontend) | Tela de Análise (Resultado) |
| :---: | :---: |
| <img src="https://raw.githubusercontent.com/ViniciusKanh/medoraX/main/assets/img/Tela%20Inicial.png" alt="Tela Inicial do MedoraX" width="450"/> | <img src="https://raw.githubusercontent.com/ViniciusKanh/medoraX/main/assets/img/Analise.png" alt="Tela de Análise do MedoraX" width="450"/> |

## ⚙️ Arquitetura Técnica

O MedoraX adota uma arquitetura **Serverless/API-Centric** para máxima escalabilidade e portabilidade.

### Backend (API)

| Componente | Descrição | Link |
| :--- | :--- | :--- |
| **Framework** | FastAPI (Python) | [Código Fonte](https://github.com/ViniciusKanh/medoraX/blob/main/app.py) |
| **Hospedagem** | Hugging Face Spaces | [API Endpoint](https://huggingface.co/spaces/ViniciusKhan/backend-medoraX) |
| **Visão/Relatório** | Google Gemini (via `google-genai` SDK) | `gemini-2.5-flash` (ou modelo similar) |
| **Pesquisa** | Google Custom Search Engine (CSE) | Requer `GOOGLE_CSE_ID` |
| **RAG/Contexto** | Tavily API (para busca de artigos) | Requer `TAVILY_API_KEY` |
| **Reranqueamento** | BM25 + Gemini Embeddings (`text-embedding-004`) | Ranqueamento híbrido para relevância |

### Frontend (Interface)

| Componente | Descrição |
| :--- | :--- |
| **Tecnologias** | HTML5, CSS3 (Estilo Neon/Futurista), JavaScript Puro |
| **Hospedagem** | GitHub Pages (Link a ser inserido) |
| **Interação** | Requisições `fetch` assíncronas para a API do Hugging Face Spaces. |

## 📝 Documentação Técnica (Notebook)

A documentação completa do desenvolvimento, incluindo a lógica de *prompt engineering* para o Gemini, a estrutura do agente RAG e exemplos de uso, está detalhada no **Jupyter Notebook** do projeto.

> **Acesse o Notebook:** [MedoraX.ipynb](https://github.com/ViniciusKanh/medoraX/blob/main/MedoraX.ipynb)

## 🛠️ Como Utilizar (Localmente)

Para rodar o backend da API localmente, siga os passos abaixo:

1.  **Clone o Repositório:**
    ```bash
    git clone https://github.com/ViniciusKanh/medoraX.git
    cd medoraX
    ```

2.  **Crie o Ambiente Virtual e Instale as Dependências:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # No Windows use: venv\Scripts\activate
    pip install -r requirements.txt
    ```

3.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz do projeto com suas chaves de API:
    ```
    GOOGLE_API_KEY="SUA_CHAVE_GEMINI"
    GOOGLE_CSE_ID="SEU_ID_CSE"
    TAVILY_API_KEY="SUA_CHAVE_TAVILY"
    ```

4.  **Inicie a API (FastAPI):**
    ```bash
    uvicorn app:app --reload --port 7860
    ```
    A API estará acessível em `http://localhost:7860`.

5.  **Acesse o Frontend:**
    Abra o arquivo `index.html` no seu navegador para interagir com a interface.

## 🎓 Sobre o Autor

O projeto **MedoraX** é uma iniciativa de pesquisa de:

> **Vinicius de Souza Santos**
>
> Mestrando em Ciências da Computação
>
> **Foco de Pesquisa:** Inteligência Artificial Aplicada à Saúde, Processamento de Linguagem Natural (NLP) e Visão Computacional.

### 🔗 Produções Acadêmicas Relevantes

| Publicação | Ano | Link |
| :--- | :--- | :--- |
| Comparison and Selection of Machine Learning Algorithms for Diabetes Prediction: An Exploratory Quantitative Study Based on Medical Data Analysis | 2024 | [Revista TH](https://scholar.google.com/citations?user=if-cVqQAAAAJ&hl=pt-BR) |
| Modelagem e Previsão de Consumo Energético em Ambientes Urbanos: Explorando o Potencial do Machine Learning | 2024 | [FAPESP](https://scholar.google.com/citations?user=if-cVqQAAAAJ&hl=pt-BR) |
| Desenvolvimento de uma Ferramenta de Manutenção Preditiva e Preventiva para Transformadores de Potência | 2024 | [Revista Contemporânea](https://scholar.google.com/citations?user=if-cVqQAAAAJ&hl=pt-BR) |
| Sistema Didático para Análise de Correção de Fator de Potência com Capacitores e Dispositivos DL69-2048/D52-2048 | 2024 | [Brazilian Journal of Development](https://scholar.google.com/citations?user=if-cVqQAAAAJ&hl=pt-BR) |
| Predição de Obesidade Baseada em Hábitos Alimentares e Condições Físicas | 2024 | [Detalhes](https://scholar.google.com/citations?user=if-cVqQAAAAJ&hl=pt-BR) |
| Revisão Sistemática: Otimização da Eficiência Energética com IA | 2024 | [Detalhes](https://scholar.google.com/citations?user=if-cVqQAAAAJ&hl=pt-BR) |

**Perfis Acadêmicos:**
*   [Google Acadêmico](https://scholar.google.com/citations?user=if-cVqQAAAAJ&hl=pt-BR)
*   [ResearchGate](https://www.researchgate.net/profile/Vinicius-Santos-64?ev=hdr_xprf)

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir *issues* ou enviar *pull requests* para melhorias no código, na documentação ou na interface.

## 📜 Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](https://github.com/ViniciusKanh/medoraX/blob/main/LICENSE) para mais detalhes.

---
<div align="center">
  <p>Desenvolvido com paixão por IA e Saúde.</p>
</div>
