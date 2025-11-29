"""
LangGraph Agent Graph Definition
Orchestrates the predictive analysis workflow
"""

from typing import Dict, Any
from langgraph.graph import StateGraph, END
from .state import AgentState
from .nodes import (
    load_context_data,
    analyze_festivals,
    analyze_pollution,
    analyze_epidemics,
    predict_surge,
    generate_alerts,
    generate_recommendations,
    save_results
)


def create_agent_graph():
    """
    Create the LangGraph agent workflow
    
    Returns:
        Compiled StateGraph
    """
    # Create the graph
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("load_data", load_context_data)
    workflow.add_node("analyze_festivals", analyze_festivals)
    workflow.add_node("analyze_pollution", analyze_pollution)
    workflow.add_node("analyze_epidemics", analyze_epidemics)
    workflow.add_node("predict_surge", predict_surge)
    workflow.add_node("generate_alerts", generate_alerts)
    workflow.add_node("generate_recommendations", generate_recommendations)
    workflow.add_node("save_results", save_results)
    
    # Define the workflow
    workflow.set_entry_point("load_data")
    
    # Sequential flow
    workflow.add_edge("load_data", "analyze_festivals")
    workflow.add_edge("analyze_festivals", "analyze_pollution")
    workflow.add_edge("analyze_pollution", "analyze_epidemics")
    workflow.add_edge("analyze_epidemics", "predict_surge")
    workflow.add_edge("predict_surge", "generate_alerts")
    workflow.add_edge("generate_alerts", "generate_recommendations")
    workflow.add_edge("generate_recommendations", "save_results")
    workflow.add_edge("save_results", END)
    
    # Compile the graph
    app = workflow.compile()
    
    return app


def run_agent(hospital_id: int = None, department_id: int = None) -> Dict[str, Any]:
    """
    Run the agent workflow
    
    Args:
        hospital_id: Optional hospital ID
        department_id: Optional department ID
        
    Returns:
        Final state with all results
    """
    from datetime import datetime
    
    # Create the graph
    app = create_agent_graph()
    
    # Initial state
    initial_state = {
        "hospital_id": hospital_id,
        "department_id": department_id,
        "current_date": datetime.now(),
        "context_signals": {},
        "historical_inflow": [],
        "festivals": [],
        "pollution": {},
        "epidemics": []
    }
    
    # Run the workflow
    print("\n" + "="*60)
    print("🏥 PULSE PREDICTIVE AGENT")
    print("="*60)
    
    final_state = app.invoke(initial_state)
    
    print("\n" + "="*60)
    print("✅ AGENT WORKFLOW COMPLETE")
    print("="*60)
    
    return final_state
