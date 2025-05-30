# Collaborative Code Editor

A real-time collaborative code editor built with React, Django, Monaco Editor, and Yjs.

## Features

- 🚀 Real-time collaborative editing
- 👥 Live cursors and user awareness
- 🎨 Syntax highlighting for multiple languages
- 📁 Document management
- 🔄 Automatic synchronization
- 💾 Persistent storage with Redis
- 🐳 Docker support

## Tech Stack

### Frontend
- React 18
- Monaco Editor (VS Code editor)
- Yjs (Conflict-free Replicated Data Types)
- Tailwind CSS
- Axios for API calls

### Backend
- Django 4.2
- Django Channels (WebSocket support)
- Django REST Framework
- Redis (for real-time sync)
- SQLite (default database)

## Quick Start

### Option 1: Using Docker (Recommended)

1. Make sure Docker and Docker Compose are installed
2. Run the setup:
   `ash
   docker-compose up --build
   `
3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin

### Option 2: Manual Setup

#### Prerequisites
- Node.js 18+
- Python 3.11+
- Redis server

#### Backend Setup
`ash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start the server
python manage.py runserver
`

#### Frontend Setup
`ash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
`

#### Start Redis
`ash
redis-server
`

## Project Structure

`
collaborative-editor/
├── backend/
│   ├── collab_editor/          # Django project settings
│   ├── editor/                 # Main Django app
│   │   ├── models.py          # Document and Collaborator models
│   │   ├── views.py           # REST API views
│   │   ├── consumers.py       # WebSocket consumers for Yjs sync
│   │   ├── routing.py         # WebSocket routing
│   │   └── serializers.py     # API serializers
│   ├── requirements.txt
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── CollaborativeEditor.js
│   │   │   ├── DocumentList.js
│   │   │   ├── Header.js
│   │   │   ├── CollaboratorsList.js
│   │   │   └── LanguageSelector.js
│   │   ├── services/          # API services
│   │   ├── hooks/             # Custom React hooks
│   │   └── App.js
│   ├── package.json
│   └── tailwind.config.js
└── docker-compose.yml
`

## Usage

1. **Create a Document**: Click "New Document" to create a new code file
2. **Select Language**: Choose your programming language from the dropdown
3. **Start Coding**: Begin typing in the Monaco editor
4. **Collaborate**: Share the document URL with others to collaborate in real-time
5. **See Live Cursors**: Watch other users' cursors and selections in real-time

## API Endpoints

- GET /api/documents/ - List all documents
- POST /api/documents/ - Create a new document
- GET /api/documents/{id}/ - Get a specific document
- PATCH /api/documents/{id}/ - Update a document
- DELETE /api/documents/{id}/ - Delete a document
- POST /api/documents/{id}/add_collaborator/ - Add a collaborator

## WebSocket Endpoints

- ws://localhost:8000/ws/document/{document_id}/ - Real-time document synchronization

## Configuration

### Environment Variables

Create a .env file in the backend directory:

`nv
DEBUG=True
SECRET_KEY=your-secret-key-here
REDIS_URL=redis://localhost:6379
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
`

### Docker Environment

For Docker deployment, create a .env.docker file:

`nv
DEBUG=False
SECRET_KEY=your-production-secret-key
REDIS_URL=redis://redis:6379
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
`

## Development

### Running Tests

Backend tests:
`ash
cd backend
python manage.py test
`

Frontend tests:
`ash
cd frontend
npm test
`

### Code Style

Backend (Python):
`ash
# Install development dependencies
pip install black flake8 isort

# Format code
black .
isort .

# Check code style
flake8 .
`

Frontend (JavaScript):
`ash
# Install development dependencies
npm install --save-dev prettier eslint

# Format code
npm run format

# Check code style
npm run lint
`

## Deployment

### Docker Production Deployment

1. Update environment variables in .env.docker
2. Build and run production containers:
   `ash
   docker-compose -f docker-compose.prod.yml up --build -d
   `

### Manual Production Deployment

1. Set up a production database (PostgreSQL recommended)
2. Configure Redis for production
3. Set up a reverse proxy (Nginx)
4. Use a process manager (PM2, Supervisor, or systemd)
5. Configure environment variables for production

## Contributing

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add some amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editor
- [Yjs](https://yjs.dev/) for conflict-free collaborative editing
- [Django Channels](https://channels.readthedocs.io/) for WebSocket support
- [React](https://reactjs.org/) for the frontend framework

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/owskar/collaborative-code-editor/issues) page
2. Create a new issue with detailed information
3. Join our [Discord community](https://discord.gg/your-invite-code)

## Roadmap

- [ ] User authentication and authorization
- [ ] File upload and import functionality
- [ ] Code execution and preview
- [ ] Plugin system for custom extensions
- [ ] Mobile responsive design
- [ ] Offline support with sync
- [ ] Integration with Git repositories
- [ ] Advanced collaboration features (comments, suggestions)
