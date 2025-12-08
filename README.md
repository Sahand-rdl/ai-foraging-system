# data-service

This project explores the app’s data layer, including the main repository, vector databases for embedding storage, SQLite, and local file-based storage.

### General notes:

1. Framework: We use FastAPI. It is faster and more suited for modern "app-like" data flows than Flask. Since we are connecting the React frontent to the Python backend, this is a better option.

2. Communication: We can use REST for buttons and WebSockets to show live progress bars.

3. Efficiency: Use Background Tasks for any Python script that takes longer than 1 second to run, otherwise, our app will feel sluggish.

### Communication architectures so that different sections of the app can talk to each other seamlessly:

Level 1: Simple Trigger (REST API)
Best for: Sending data to save, or starting a quick script (< 2 seconds).
How: standard fetch or axios.

Level 2: Long-Running Scripts (Background Tasks)
The Problem: If the script takes 30 seconds, the React button will "hang" and look broken. We must avoid this.
The Solution: Use FastAPI BackgroundTasks. The backend replies "I started it!" immediately, and Python continues working in the background. We can show live progressbars (see level 3).

Level 3: Real-Time Updates (WebSockets)
Best for: If the Python script needs to tell React "I'm 50% done... now I'm 80% done..."
Method: Use WebSockets.
FastAPI: websocket_endpoint
React: useWebSocket hook.
