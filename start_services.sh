#!/bin/bash

# Suppress job control messages like 'Terminated'
set +m

# --- Configuration ---
LOG_DIR="logs"
DATA_SERVICE_LOG="$LOG_DIR/data-service.log"
LLM_SERVICE_LOG="$LOG_DIR/llm-service.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# --- Cleanup Function ---
cleanup() {
    echo -e "\n\n${RED}Shutting down all services...${NC}"
    # Kill all background processes
    if [ ! -z "$TAIL_PID" ]; then kill $TAIL_PID 2>/dev/null; fi
    if [ ! -z "$DATA_SERVICE_PID" ]; then kill $DATA_SERVICE_PID 2>/dev/null; fi
    if [ ! -z "$LLM_SERVICE_PID" ]; then kill $LLM_SERVICE_PID 2>/dev/null; fi
    if [ ! -z "$FRONTEND_PID" ]; then kill $FRONTEND_PID 2>/dev/null; fi
    
    # Remove the log directory
    echo -e "${RED}Removing log files...${NC}"
    rm -rf "$LOG_DIR"
    
    echo -e "${GREEN}All services stopped and logs cleaned up.${NC}"
    exit 0
}

# --- Trap Signals ---
trap cleanup SIGINT SIGTERM

# --- Create Log Directory ---
echo -e "${BLUE}Starting AI Lab Services...${NC}\n"
mkdir -p $LOG_DIR
# Clear old logs
> $DATA_SERVICE_LOG
> $LLM_SERVICE_LOG
> $FRONTEND_LOG

# --- Start Services ---
echo -e "${GREEN}Starting data-service on port 8000...${NC}"
(cd data-service && conda run -n deeplearning uvicorn main:app --host 0.0.0.0 --port 8000) > "$DATA_SERVICE_LOG" 2>&1 &
DATA_SERVICE_PID=$!

echo -e "${GREEN}Starting llm-service on port 8002...${NC}"
(cd "llm-service/LLM API" && conda run -n deeplearning uvicorn llm_api:app --host 0.0.0.0 --port 8002) > "$LLM_SERVICE_LOG" 2>&1 &
LLM_SERVICE_PID=$!

echo -e "${GREEN}Starting frontend on port 8080...${NC}"
(cd frontend && npm run dev) > "$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!

sleep 2 # Give services a moment to start up

# --- Display Info and Stream Logs ---
echo -e "\n${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Services are running in the background.${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "  Frontend:      ${GREEN}http://127.0.0.1:8080${NC}"
echo -e "  data-service:  ${GREEN}http://127.0.0.1:8000/docs${NC}"
echo -e "  llm-service:   ${GREEN}http://127.0.0.1:8002/docs${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "\nStreaming logs from all services. Press ${RED}Ctrl+C${NC} to stop everything.\n"

tail -f $LOG_DIR/*.log &
TAIL_PID=$!

wait $TAIL_PID