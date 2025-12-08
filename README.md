# data-service

This project explores the app’s data layer, including the main repository, vector databases for embedding storage, SQLite, and local file-based storage.

### General notes:

1. Framework: We use FastAPI. It is faster and more suited for modern "app-like" data flows than Flask. Since we are connecting the React frontent to the Python backend, this is a better option.

2. Communication: We can use REST for buttons and WebSockets to show live progress bars.

3. Efficiency: Use Background Tasks for any Python script that takes longer than 1 second to run, otherwise, our app will feel sluggish.
