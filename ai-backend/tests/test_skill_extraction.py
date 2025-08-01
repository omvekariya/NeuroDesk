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
        "ticket": {
            "subject": "Network connectivity issues affecting multiple users",
            "description": "Users unable to connect to corporate network. VPN connection failing and users cannot access shared drives.",
            "requester_id": 101,
            "priority": "high",
            "impact": "high",
            "urgency": "high",
            "complexity_level": "level_2",
            "tags": ["network", "vpn", "connectivity"]
        },
        "skills": [
            "Network Troubleshooting",
            "Windows Administration",
            "Hardware Repair",
            "Software Installation",
            "VPN Configuration",
            "Firewall Management",
            "Database Management",
            "Security Analysis",
            "Linux Administration",
            "Application Support"
        ]
    }
    
    print("🧪 Testing Skill Extraction")
    print("=" * 40)
    print(f"Ticket Subject: {test_data['ticket']['subject']}")
    print(f"Available Skills: {len(test_data['skills'])} skills")
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
                print(f"⏱️  Processing Time: {result.get('processing_time_ms', 'N/A')}ms")
                
                # Display extracted skills
                extracted_skills = result.get('extracted_skills', [])
                if extracted_skills:
                    print(f"📊 Extracted Skills ({len(extracted_skills)}):")
                    for i, skill_obj in enumerate(extracted_skills, 1):
                        skill_name = skill_obj.get('skill_name', 'Unknown')
                        skill_id = skill_obj.get('skill_id', 'None')
                        score = skill_obj.get('score', 0.0)
                        print(f"  {i}. {skill_name} (ID: {skill_id}, Score: {score})")
                else:
                    print("⚠️  No skills were extracted")
                
                print(f"💭 Reasoning: {result.get('reasoning', 'N/A')}")
                
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