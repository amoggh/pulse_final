import sys
import os
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

# Load env
load_dotenv(os.path.join('backend', '.env'))

try:
    from app.agents.reasoning_agent import ReasoningAgent
    print("Successfully imported ReasoningAgent")
    
    agent = ReasoningAgent()
    print("Initialized ReasoningAgent")
    
    print("Analyzing situation...")
    decision = agent.analyze_situation()
    
    print("\n=== Decision Output ===")
    print(f"Risk Level: {decision.risk_level}")
    print(f"Actions: {len(decision.actions.staffing)} staffing, {len(decision.actions.supplies)} supplies")
    print("Reasoning Trace:")
    for trace in decision.reasoning_trace:
        print(f"- {trace}")
        
except Exception as e:
    print(f"Error: {e}")
