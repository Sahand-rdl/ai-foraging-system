import os
import subprocess
import threading
import webbrowser
import time
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

LLM_API_PATH = os.path.join(BASE_DIR, "LLM API")
DATA_SERVICE_PATH = os.path.join(BASE_DIR, "data-service")
FRONTEND_PATH = os.path.join(BASE_DIR, "frontend")
npm_cmd = r"C:\nvm4w\nodejs\npm.cmd"  # configure this path as needed

def run_llm_api():
    os.chdir(LLM_API_PATH)
    subprocess.run([sys.executable, "-m", "uvicorn", "llm_api:app", "--reload", "--port", "8002"])

def run_data_service():
    os.chdir(DATA_SERVICE_PATH)
    subprocess.run([sys.executable, "-m", "uvicorn", "main:app", "--reload", "--port", "8000"], cwd=DATA_SERVICE_PATH)

def run_frontend():
    os.chdir(FRONTEND_PATH)
    #subprocess.run([npm_cmd, "install"])  # optional
    subprocess.run([npm_cmd, "run", "dev"])

if __name__ == "__main__":
    t_frontend = threading.Thread(target=run_frontend, daemon=True)
    t_frontend.start()

    time.sleep(4)
    webbrowser.open("http://localhost:8080/")

    t_data = threading.Thread(target=run_data_service, daemon=True)
    t_data.start()

    t_llm = threading.Thread(target=run_llm_api, daemon=True)
    t_llm.start()

    t_frontend.join()
    t_data.join()
    t_llm.join()