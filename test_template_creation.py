#!/usr/bin/env python3
"""
Test script for template creation
This script tests the creation of all templates for the SmartDispute.ai platform
"""

import os
import sys
import shutil
from create_tenant_notice_templates import create_all_provincial_templates as create_tenant_templates
from create_cas_answer_plan_template import create_all_provincial_templates as create_cas_answer_templates
from create_cas_records_request_template import create_all_provincial_templates as create_cas_records_templates
from create_cas_appeal_template import create_all_provincial_templates as create_cas_appeal_templates
from create_sublease_agreement_template import create_all_provincial_templates as create_sublease_templates

def clear_template_directory():
    """Clear the templates/docs directory to ensure clean test environment"""
    template_dir = "templates/docs"
    if os.path.exists(template_dir):
        # Only remove specific files that match our template naming patterns
        for filename in os.listdir(template_dir):
            if any(filename.startswith(prefix) for prefix in [
                "repair_notice", 
                "intent_to_vacate", 
                "termination_notice",
                "cas_answer_plan",
                "cas_records_request",
                "cas_appeal",
                "sublease_agreement"
            ]):
                file_path = os.path.join(template_dir, filename)
                if os.path.isfile(file_path):
                    os.remove(file_path)
                    print(f"Removed: {file_path}")
    
    # Ensure the directory exists
    os.makedirs(template_dir, exist_ok=True)

def test_tenant_templates():
    """Test creation of tenant notice templates"""
    print("\n=== Testing Tenant Notice Templates ===")
    try:
        create_tenant_templates()
        print("✅ Successfully created tenant notice templates")
        return True
    except Exception as e:
        print(f"❌ Failed to create tenant notice templates: {e}")
        return False

def test_cas_answer_templates():
    """Test creation of CAS answer and plan templates"""
    print("\n=== Testing CAS Answer and Plan Templates ===")
    try:
        create_cas_answer_templates()
        print("✅ Successfully created CAS answer and plan templates")
        return True
    except Exception as e:
        print(f"❌ Failed to create CAS answer and plan templates: {e}")
        return False

def test_cas_records_templates():
    """Test creation of CAS records request templates"""
    print("\n=== Testing CAS Records Request Templates ===")
    try:
        create_cas_records_templates()
        print("✅ Successfully created CAS records request templates")
        return True
    except Exception as e:
        print(f"❌ Failed to create CAS records request templates: {e}")
        return False

def test_cas_appeal_templates():
    """Test creation of CAS appeal templates"""
    print("\n=== Testing CAS Appeal Templates ===")
    try:
        create_cas_appeal_templates()
        print("✅ Successfully created CAS appeal templates")
        return True
    except Exception as e:
        print(f"❌ Failed to create CAS appeal templates: {e}")
        return False

def test_sublease_templates():
    """Test creation of sublease agreement templates"""
    print("\n=== Testing Sublease Agreement Templates ===")
    try:
        create_sublease_templates()
        print("✅ Successfully created sublease agreement templates")
        return True
    except Exception as e:
        print(f"❌ Failed to create sublease agreement templates: {e}")
        return False

def count_templates():
    """Count the number of templates created"""
    template_dir = "templates/docs"
    if os.path.exists(template_dir):
        template_count = len([f for f in os.listdir(template_dir) if os.path.isfile(os.path.join(template_dir, f))])
        return template_count
    return 0

def main():
    """Run all tests"""
    print("Testing Template Creation for SmartDispute.ai...")
    print(f"Starting with {count_templates()} existing templates.")
    
    # Clear template directory for clean test
    clear_template_directory()
    print(f"After cleanup: {count_templates()} templates.")
    
    results = []
    results.append(test_tenant_templates())
    results.append(test_cas_answer_templates())
    results.append(test_cas_records_templates())
    results.append(test_cas_appeal_templates())
    results.append(test_sublease_templates())
    
    success_count = results.count(True)
    failure_count = results.count(False)
    
    print(f"\nTest Summary: {success_count} module(s) passed, {failure_count} module(s) failed")
    print(f"Total templates created: {count_templates()}")
    
    return 0 if failure_count == 0 else 1

if __name__ == "__main__":
    sys.exit(main())