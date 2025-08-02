#!/usr/bin/env python3
"""
Simple test to check if skills are being extracted successfully
"""
import requests
import json
import time

def test_skill_extraction():
    """Test if skills are being extracted successfully"""
    
    # API endpoint
    url = "http://localhost:8000/api/ticket-assignment"
    
    # Test data
    test_data = {
        "id": 1,
        "subject": "Cannot access internal portal",
        "description": "User is unable to log in to the internal HR portal after password reset.",
        "priority": "high",
        "impact": "high",
        "urgency": "low",
        "requester_id": 3,
        "tags": ["HR", "login", "urgent"],
        "resolution_due": "2025-08-02T18:00:00Z"
    }
    
    print("🧪 Testing Skill Extraction")
    print("=" * 40)
    print(f"Ticket Subject: {test_data['subject']}")
    print()
    
    try:
        # Make the request
        print("📤 Sending request to API...")
        response = requests.post(
            url,
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        
        print(f"📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('success'):
                print("✅ SUCCESS: Skills extracted successfully!")

                print(f"💭 Justification: {result.get('justification', 'N/A')}")
                print(f"💭 Selected Technician ID: {result.get('selected_technician_id', 'N/A')}")
                
                                
            else:
                print("❌ FAILED: Skill extraction failed!")
                print(f"Error: {result.get('error_message', 'Unknown error')}")
                
        else:
            print("❌ HTTP Error!")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the API server is running on localhost:8000")
        print("   Run: python app.py")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_server_health():
    """Test if server is running"""
    
    print("🔍 Checking Server Health")
    print("=" * 30)
    
    try:
        response = requests.get("http://localhost:8000/health", timeout=10)
        
        if response.status_code == 200:
            health = response.json()
            print("✅ Server is running!")
            print(f"Status: {health.get('status')}")
            print(f"LLM Available: {health.get('llm_available')}")
            return True
        else:
            print("❌ Server health check failed!")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Server is not running!")
        print("Please start the server with: python app.py")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Skill Extraction Test")
    print("=" * 50)
    
    # Check server health first
    if test_server_health():
        print()
        test_skill_extraction()
    else:
        print("\n❌ Cannot run skill extraction test - server is not running")
    
    print("\n" + "=" * 50)
    print("✅ Test completed!") 