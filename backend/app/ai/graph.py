from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from flask import current_app
from .tools import get_all_tools

class CashFlowGraph:
    def __init__(self):
        # Usamos o create_react_agent do LangGraph que substitui o AgentExecutor
        pass
        
    def analyze(self, query: str):
        llm = ChatOpenAI(
            temperature=0, 
            model="gpt-4-turbo-preview", 
            openai_api_key=current_app.config['OPENAI_API_KEY']
        )
        tools = get_all_tools()
        system_prompt = "Você é um assistente financeiro especialista em fluxo de caixa para empresas em Angola."
        
        # Cria o agente compilado
        app = create_react_agent(llm, tools, state_modifier=system_prompt)
        
        # Invoca com a mensagem do utilizador
        result = app.invoke({"messages": [HumanMessage(content=query)]})
        
        # O resultado contém a lista de mensagens. A última mensagem é a resposta do assistente.
        messages = result.get("messages", [])
        if messages:
            return messages[-1].content
        return "Sem resposta."