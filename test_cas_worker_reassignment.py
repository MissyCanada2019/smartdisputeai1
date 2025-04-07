#!/usr/bin/env python3
"""
Test script for CAS Worker Reassignment letter generation
This script tests the creation of CAS worker reassignment request templates
"""

import os
import sys
from create_cas_worker_reassignment_template import create_cas_worker_reassignment_template, create_french_quebec_template, create_all_provincial_templates

def test_ontario_template():
    """Test creation of Ontario worker reassignment template"""
    template_path = create_cas_worker_reassignment_template("ON")
    if os.path.exists(template_path):
        print(f"✅ Successfully created Ontario template at {template_path}")
        return True
    else:
        print(f"❌ Failed to create Ontario template")
        return False

def test_quebec_french_template():
    """Test creation of Quebec French worker reassignment template"""
    template_path = create_french_quebec_template()
    if os.path.exists(template_path):
        print(f"✅ Successfully created Quebec French template at {template_path}")
        return True
    else:
        print(f"❌ Failed to create Quebec French template")
        return False

def test_all_templates():
    """Test creation of all provincial templates"""
    try:
        create_all_provincial_templates()
        print("✅ Successfully created all provincial templates")
        return True
    except Exception as e:
        print(f"❌ Failed to create all templates: {e}")
        return False

def main():
    """Run all tests"""
    print("Testing CAS Worker Reassignment Template Creation...")
    
    results = []
    results.append(test_ontario_template())
    results.append(test_quebec_french_template())
    results.append(test_all_templates())
    
    success_count = results.count(True)
    failure_count = results.count(False)
    
    print(f"\nTest Summary: {success_count} passed, {failure_count} failed")
    
    return 0 if failure_count == 0 else 1

if __name__ == "__main__":
    sys.exit(main())