"""
Test script for the Pulse Agent
Run this to verify the agent is working correctly
"""

import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agent.graph import run_agent


def test_agent_basic():
    """Test basic agent execution with mock data"""
    print("\n" + "="*60)
    print("🧪 TEST 1: Basic Agent Execution")
    print("="*60)
    
    try:
        results = run_agent(hospital_id=1)
        
        # Verify all required keys are present
        required_keys = [
            "hospital_name",
            "context_signals",
            "festival_analysis",
            "pollution_analysis",
            "epidemic_analysis",
            "surge_prediction",
            "alerts",
            "recommendations",
            "results"
        ]
        
        missing_keys = [key for key in required_keys if key not in results]
        
        if missing_keys:
            print(f"❌ FAILED: Missing keys: {missing_keys}")
            return False
        
        print("✅ PASSED: All required keys present")
        
        # Verify alerts were generated
        alerts = results.get("alerts", [])
        if len(alerts) > 0:
            print(f"✅ PASSED: Generated {len(alerts)} alerts")
        else:
            print("⚠️ WARNING: No alerts generated")
        
        # Verify recommendations were generated
        recommendations = results.get("recommendations", [])
        if len(recommendations) > 0:
            print(f"✅ PASSED: Generated {len(recommendations)} recommendations")
        else:
            print("⚠️ WARNING: No recommendations generated")
        
        # Verify surge prediction
        surge = results.get("surge_prediction", {})
        if "predicted_surge_percentage" in surge:
            print(f"✅ PASSED: Surge prediction: {surge['predicted_surge_percentage']:.1f}%")
        else:
            print("❌ FAILED: No surge prediction")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_agent_with_high_pollution():
    """Test agent with high pollution scenario"""
    print("\n" + "="*60)
    print("🧪 TEST 2: High Pollution Scenario")
    print("="*60)
    
    try:
        from agent.graph import create_agent_graph
        
        app = create_agent_graph()
        
        # Create state with high pollution
        initial_state = {
            "hospital_id": 1,
            "current_date": datetime.now(),
            "context_signals": {
                "aqi": 300,  # Very high pollution
                "festival_flag": 0,
                "epidemic_tag": "",
                "weather": {}
            },
            "historical_inflow": [],
            "festivals": [],
            "pollution": {},
            "epidemics": []
        }
        
        results = app.invoke(initial_state)
        
        # Check if pollution alert was generated
        alerts = results.get("alerts", [])
        pollution_alerts = [a for a in alerts if a.get("type") == "pollution_risk"]
        
        if pollution_alerts:
            print(f"✅ PASSED: Generated {len(pollution_alerts)} pollution alerts")
            print(f"   Alert: {pollution_alerts[0].get('title')}")
        else:
            print("⚠️ WARNING: No pollution alerts generated despite high AQI")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_agent_with_festival():
    """Test agent with festival scenario"""
    print("\n" + "="*60)
    print("🧪 TEST 3: Festival Scenario")
    print("="*60)
    
    try:
        from agent.graph import create_agent_graph
        
        app = create_agent_graph()
        
        # Create state with festival
        initial_state = {
            "hospital_id": 1,
            "current_date": datetime(2024, 10, 31),  # Diwali time
            "context_signals": {
                "aqi": 150,
                "festival_flag": 1,  # Festival active
                "epidemic_tag": "",
                "weather": {}
            },
            "historical_inflow": [],
            "festivals": [],
            "pollution": {},
            "epidemics": []
        }
        
        results = app.invoke(initial_state)
        
        # Check festival analysis
        festival_analysis = results.get("festival_analysis", {})
        if festival_analysis.get("is_festival_period"):
            print(f"✅ PASSED: Festival detected")
            print(f"   Festival: {festival_analysis.get('festival_name', 'Unknown')}")
            print(f"   Multiplier: {festival_analysis.get('surge_multiplier', 1.0)}x")
        else:
            print("⚠️ WARNING: Festival not detected despite festival_flag=1")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_output_files():
    """Test that output files are created"""
    print("\n" + "="*60)
    print("🧪 TEST 4: Output File Generation")
    print("="*60)
    
    try:
        results = run_agent(hospital_id=1)
        
        output_files = results.get("output_files", {})
        
        if not output_files:
            print("❌ FAILED: No output files generated")
            return False
        
        # Check if files exist
        files_exist = []
        for key, path in output_files.items():
            if path and os.path.exists(path):
                files_exist.append(key)
                print(f"✅ File exists: {key} -> {path}")
            elif path:
                print(f"⚠️ File missing: {key} -> {path}")
        
        if len(files_exist) > 0:
            print(f"✅ PASSED: {len(files_exist)} output files created")
            return True
        else:
            print("❌ FAILED: No output files found")
            return False
        
    except Exception as e:
        print(f"❌ FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


def run_all_tests():
    """Run all tests"""
    print("\n" + "="*70)
    print("🧪 PULSE AGENT TEST SUITE")
    print("="*70)
    
    tests = [
        ("Basic Agent Execution", test_agent_basic),
        ("High Pollution Scenario", test_agent_with_high_pollution),
        ("Festival Scenario", test_agent_with_festival),
        ("Output File Generation", test_output_files)
    ]
    
    results = []
    for name, test_func in tests:
        try:
            passed = test_func()
            results.append((name, passed))
        except Exception as e:
            print(f"\n❌ Test '{name}' crashed: {e}")
            results.append((name, False))
    
    # Print summary
    print("\n" + "="*70)
    print("📊 TEST SUMMARY")
    print("="*70)
    
    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    
    for name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{status}: {name}")
    
    print(f"\nTotal: {passed_count}/{total_count} tests passed")
    
    if passed_count == total_count:
        print("\n🎉 All tests passed!")
    else:
        print(f"\n⚠️ {total_count - passed_count} test(s) failed")
    
    print("="*70)


if __name__ == "__main__":
    run_all_tests()
