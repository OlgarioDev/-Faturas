# Starkdata Customer Churn Prediction API

Este repositório contém um Microserviço de IA Preditiva focado na predição de **Customer Churn** (probabilidade de abandono de cliente). A API foi desenhada seguindo as melhores práticas de Engenharia de Software, orientada para cenários de **Enterprise AI**.

---

## 1. Âmbito e Funcionamento do Sistema

O objetivo principal desta API é receber dados comportamentais e contratuais de um cliente e calcular, em tempo real, o seu risco de abandono (`risk_score`). O sistema opera da seguinte forma:

1. **Ingestão (Input):** O cliente da API (ex: um CRM ou dashboard) envia um payload JSON contendo o identificador do cliente, a sua antiguidade (`tenure`), encargos mensais (`monthly_charges`) e o número de chamadas de suporte recentes (`support_calls`).
2. **Validação:** A camada de validação assegura que a inferência nunca falha por tipos de dados incorretos, verificando domínios (ex: `tenure` não pode ser negativo).
3. **Processamento e Inferência:** O pedido é delegado para a camada de serviços onde um modelo preditivo calcula um score entre `0.0` e `1.0`.
4. **Decisão (Output):** Com base no threshold do score, a API gera uma `recommendation` acionável (ex: oferecer desconto para retenção) e envia a resposta de volta ao utilizador.

---

## 2. Arquitetura e Estrutura Modular

O projeto foi estruturado seguindo os princípios de **Clean Architecture**, garantindo que as responsabilidades estão altamente coesas e pouco acopladas.

*   **`main.py` (Camada de Delivery / Transporte):**
    *   Ponto de entrada da aplicação FastAPI.
    *   Responsável pelo roteamento (`/predict/churn`, `/health`), configuração do Swagger UI e injeção do sistema de Logging.
    *   Contém um **Timing Middleware**, que interceta todos os pedidos e adiciona um header `X-Process-Time-ms` na resposta, essencial para métricas de Observabilidade.
*   **`schemas.py` (Camada de Domínio / Validação):**
    *   Utiliza o **Pydantic v2** para definir os Modelos de Dados e os seus limites.
    *   Garante validação *Type-Safe*, gerando automaticamente descrições claras no Swagger e erros consistentes (HTTP 422 Unprocessable Entity) perante *bad requests*.
*   **`services.py` (Camada de Business / Machine Learning):**
    *   Isola toda a lógica preditiva.
    *   Permite que, no futuro, a função de cálculo seja substituída por uma chamada a um modelo real (ex: XGBoost, Scikit-Learn exportado em Pickle) ou a uma API de inferência gerida (ex: AWS SageMaker, MLflow), sem necessidade de reescrever os endpoints.
*   **`test_main.py` (QA / Testes Unitários):**
    *   Inclui testes desenvolvidos com `TestClient` (HTTPx) e `pytest`.
    *   Assegura que regressões não são introduzidas ao longo do desenvolvimento.
*   **`Dockerfile` (DevOps / Deploy):**
    *   Utiliza a estratégia de *Multi-Stage Build*. Um *stage* temporal compila os binários necessários (reduzindo complexidades de C++) e o *stage* final transporta apenas a aplicação para uma imagem `python:3.11-slim`, garantindo a leveza do container e minimizando falhas de segurança.

---

## 3. Endpoints da API

### `POST /predict/churn`
Gera a predição de churn para o utilizador.
*   **Payload Esperado:**
    ```json
    {
      "customer_id": "CUST-12345",
      "tenure": 12,
      "monthly_charges": 89.99,
      "support_calls": 3
    }
    ```
*   **Resposta de Sucesso (200 OK):**
    ```json
    {
      "customer_id": "CUST-12345",
      "risk_score": 0.8,
      "recommendation": "High Priority Retention: Offer 20% discount..."
    }
    ```

### `GET /health`
Endpoint padrão para sondas de liveness/readiness em ambientes Cloud (Kubernetes/Docker).
*   **Resposta (200 OK):** `{"status": "healthy", "version": "1.0.0"}`

---

## 4. Como Executar Localmente

### Alternativa A: Usando Python Virtual Environment

1. Instalar as dependências:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # (Linux/Mac) ou .venv\Scripts\activate (Windows)
   pip install -r requirements.txt
   ```
2. Correr o servidor Uvicorn:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
3. Aceder à documentação Swagger em: http://localhost:8000/docs

### Alternativa B: Usando Docker

1. Construir a imagem (otimizada):
   ```bash
   docker build -t churn-prediction-api .
   ```
2. Correr o contentor:
   ```bash
   docker run -d -p 8000:8000 --name starkdata-churn-api churn-prediction-api
   ```

---

## 5. Como Correr os Testes

Para garantir a estabilidade do serviço, corre os testes unitários utilizando o ambiente Python:

```bash
pytest -v
```

Os testes cobrem:
1. Funcionalidade base e resposta de health.
2. Cenário de Cliente com Alto Risco de Abandono (validação da lógica interna de ML).
3. Verificação de rejeição atempada de payload (Pydantic v2).
