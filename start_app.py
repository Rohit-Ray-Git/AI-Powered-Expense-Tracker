import subprocess
import time
import os
import signal
import sys

# Define commands with their working directories
commands = [
    {
        "name": "Backend",
        "cmd": ["npm", "run", "dev"],
        "cwd": "backend"
    },
    {
        "name": "ML Service",
        # Check if 'uv' is available or just use uvicorn directly if in venv. 
        # User has been using 'uv run', so we stick to that.
        "cmd": ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"],
        "cwd": "ml-service"
    },
    {
        "name": "Frontend",
        "cmd": ["npm", "run", "dev"],
        "cwd": "frontend"
    }
]

processes = []

def signal_handler(sig, frame):
    print("\n🛑 Stopping all services...")
    for p in processes:
        p.terminate()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

print("🚀 Starting AI Powered Expense Tracker...")

for service in commands:
    print(f"👉 Starting {service['name']}...")
    try:
        # Use shell=True for npm commands on Windows to resolve properly
        p = subprocess.Popen(
            service['cmd'], 
            cwd=os.path.join(os.getcwd(), service['cwd']),
            shell=True 
        )
        processes.append(p)
    except Exception as e:
        print(f"❌ Failed to start {service['name']}: {e}")

print("\n✨ All services started! Press Ctrl+C to stop.")

# Keep script running
while True:
    time.sleep(1)
