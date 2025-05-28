#!/usr/bin/env python3
"""
Test script to verify the dashboard statistics fixes
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_login_and_statistics():
    """Test login and check if statistics are correctly calculated"""
    
    # Create a session to maintain cookies
    session = requests.Session()
    
    print("🔐 Testing login...")
    
    # Login with test credentials
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    
    login_response = session.post(f"{BASE_URL}/login", json=login_data)
    
    if login_response.status_code == 200:
        print("✅ Login successful!")
        print(f"Response: {login_response.json()}")
    else:
        print(f"❌ Login failed: {login_response.status_code}")
        print(f"Response: {login_response.text}")
        return
    
    print("\n📊 Testing statistics endpoint...")
    
    # Get statistics
    stats_response = session.get(f"{BASE_URL}/statistics")
    
    if stats_response.status_code == 200:
        stats = stats_response.json()
        print("✅ Statistics retrieved successfully!")
        print(f"📈 Statistics: {json.dumps(stats, indent=2)}")
        
        # Check if exercise count is correct
        exercises_completed = stats.get('exercises_completed', 0)
        certificates_earned = stats.get('certificates_earned', 0)
        daily_streak = stats.get('daily_streak', 0)
        
        print(f"\n🎯 Key Metrics:")
        print(f"   Exercises Completed: {exercises_completed}")
        print(f"   Certificates Earned: {certificates_earned}")
        print(f"   Daily Streak: {daily_streak}")
        
        # Verify the fixes
        if exercises_completed >= 3:
            print("✅ Exercise count looks correct (should be 3 or more)")
        else:
            print("❌ Exercise count still incorrect")
            
        if certificates_earned == exercises_completed:
            print("✅ Certificate count is correct (1 per exercise)")
        else:
            print("❌ Certificate count is incorrect")
            
        if daily_streak >= 1:
            print("✅ Daily streak updated on login")
        else:
            print("❌ Daily streak not updated")
            
    else:
        print(f"❌ Statistics failed: {stats_response.status_code}")
        print(f"Response: {stats_response.text}")
    
    print("\n🔍 Testing debug endpoint...")
    
    # Get debug statistics
    debug_response = session.get(f"{BASE_URL}/debug/statistics")
    
    if debug_response.status_code == 200:
        debug_stats = debug_response.json()
        print("✅ Debug statistics retrieved successfully!")
        print(f"🔧 Debug Data: {json.dumps(debug_stats, indent=2)}")
    else:
        print(f"❌ Debug statistics failed: {debug_response.status_code}")
        print(f"Response: {debug_response.text}")

if __name__ == "__main__":
    print("🧪 Testing Dashboard Statistics Fixes")
    print("=" * 50)
    test_login_and_statistics()
    print("\n" + "=" * 50)
    print("🏁 Test completed!")
