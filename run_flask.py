"""
SmartDispute.ai Flask Application Launcher
This script runs the Flask application for the dispute letter generator
"""
import subprocess
import sys
import os

def main():
    """Run the Flask application for the dispute letter generator"""
    print("Starting SmartDispute.ai Dispute Letter Generator...")
    print("Checking for templates...")
    
    # Check if templates exist, if not create them
    if not os.path.exists("templates/docs"):
        print("Creating templates directory...")
        os.makedirs("templates/docs", exist_ok=True)
    
    template_files = os.listdir("templates/docs") if os.path.exists("templates/docs") else []
    if not template_files or len(template_files) < 12:  # We expect at least 12 templates (3 types × 4 provinces)
        print("Creating templates...")
        try:
            # Create basic templates for all combinations
            subprocess.run([sys.executable, "create_basic_template.py"], check=True)
            
            # Create specialized templates
            subprocess.run([sys.executable, "create_specific_templates.py"], check=True)
            
            # Create Ontario landlord/tenant template
            if os.path.exists("create_landlord_tenant_template.py"):
                subprocess.run([sys.executable, "create_landlord_tenant_template.py"], check=True)
            
            print("Templates created successfully.")
        except subprocess.CalledProcessError as e:
            print(f"Error creating templates: {e}")
            return 1
    else:
        print(f"Found {len(template_files)} templates. Continuing...")
    
    # Check if generated directory exists
    if not os.path.exists("generated"):
        print("Creating generated files directory...")
        os.makedirs("generated", exist_ok=True)
    
    # Run the Flask application
    print("Starting Flask application on port 5050...")
    subprocess.run([sys.executable, "app-simple.py"])
    
    return 0

if __name__ == "__main__":
    sys.exit(main())