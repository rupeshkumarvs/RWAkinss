# Developer Setup Guide

## Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)
- Git

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/creditblocks.git
cd creditblocks
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
alembic upgrade head

# Run backend
uvicorn app:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run frontend
npm run dev
```

### 4. Database Setup

```bash
# Create database
createdb creditblocks_dev

# Run migrations
cd backend
alembic upgrade head
```

### 5. Redis Setup

```bash
# Start Redis (if not using Docker)
redis-server

# Or use Docker
docker run -d -p 6379:6379 redis:7-alpine
```

## Docker Setup (Alternative)

### Quick Start

```bash
# Start all services
docker-compose up -d

# Initialize database
docker-compose exec backend alembic upgrade head

# View logs
docker-compose logs -f
```

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write code
- Add tests
- Update documentation

### 3. Run Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: your feature description"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
# Create PR on GitHub
```

## Project Structure

```
creditblocks/
├── backend/
│   ├── app.py                 # FastAPI application
│   ├── services/              # Business logic services
│   ├── database/              # Database models and repositories
│   ├── middleware/            # Custom middleware
│   ├── utils/                 # Utility functions
│   ├── tests/                 # Test files
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── app/                   # Next.js app directory
│   ├── components/            # React components
│   ├── lib/                  # Utility functions
│   ├── tests/                # Test files
│   └── package.json          # Node dependencies
├── contracts/
│   ├── contracts/            # Solidity contracts
│   ├── scripts/             # Deployment scripts
│   ├── test/                # Contract tests
│   └── hardhat.config.ts    # Hardhat configuration
└── docs/                    # Documentation
```

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql+asyncpg://localhost:5432/creditblocks_dev

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Blockchain
QIE_TESTNET_RPC_URL=https://rpc1testnet.qie.digital/
PRIVATE_KEY=<your-private-key>

# Security
JWT_SECRET=dev-secret-key
API_KEY_ENCRYPTION_KEY=<fernet-key>

# Monitoring
SENTRY_DSN=
LOG_LEVEL=DEBUG
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CHAIN_ID=12345
NEXT_PUBLIC_RPC_URL=https://rpc1testnet.qie.digital/
```

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_scoring.py

# Run specific test
pytest tests/test_scoring.py::test_compute_score
```

### Frontend Tests

```bash
cd frontend

# Unit tests
npm test

# E2E tests
npm run test:e2e

# E2E with UI
npm run test:e2e:ui
```

### Contract Tests

```bash
cd contracts

# Run tests
npx hardhat test

# Run with coverage
npx hardhat coverage
```

## Code Quality

### Linting

```bash
# Backend
cd backend
ruff check .
black --check .

# Frontend
cd frontend
npm run lint
```

### Formatting

```bash
# Backend
cd backend
black .
ruff format .

# Frontend
cd frontend
npm run format
```

## Debugging

### Backend Debugging

```bash
# Run with debugger
python -m debugpy --listen 5678 --wait-for-client -m uvicorn app:app --reload

# VS Code: Attach to debugger on port 5678
```

### Frontend Debugging

```bash
# Run with debugger
NODE_OPTIONS='--inspect' npm run dev

# Chrome: chrome://inspect
```

## Common Tasks

### Database Migrations

```bash
cd backend

# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Adding Dependencies

```bash
# Backend
pip install package-name
pip freeze > requirements.txt

# Frontend
npm install package-name
```

### Building for Production

```bash
# Backend
cd backend
docker build -t creditblocks/backend:latest .

# Frontend
cd frontend
npm run build
docker build -t creditblocks/frontend:latest .
```

## Code Structure

### Backend Structure

```
backend/
├── app.py                 # FastAPI application entry point
├── services/              # Business logic services
│   ├── scoring.py        # Credit scoring service
│   ├── blockchain.py      # Blockchain interaction service
│   ├── oracle.py         # Oracle data service
│   ├── staking.py        # Staking service
│   ├── ml_scoring.py     # ML-based scoring
│   ├── fraud_detection.py # Fraud detection
│   └── ...
├── database/              # Database layer
│   ├── models.py         # SQLAlchemy models
│   ├── repositories.py   # Data access layer
│   └── connection.py    # Database connection
├── middleware/            # Custom middleware
│   ├── auth.py          # Authentication
│   ├── rate_limit.py    # Rate limiting
│   └── ...
├── utils/                 # Utility functions
│   ├── validators.py    # Input validation
│   ├── logger.py        # Logging utilities
│   └── ...
├── tests/                 # Test files
│   ├── unit/             # Unit tests
│   ├── integration/     # Integration tests
│   └── ...
└── requirements.txt       # Python dependencies
```

### Frontend Structure

```
frontend/
├── app/                   # Next.js app directory
│   ├── page.tsx          # Home page
│   ├── dashboard/        # Dashboard pages
│   └── ...
├── components/           # React components
│   ├── ui/              # UI components (Shadcn)
│   ├── layout/          # Layout components
│   └── ...
├── contexts/            # React contexts
│   └── WalletContext.tsx # Wallet connection context
├── lib/                 # Utility functions
│   ├── utils.ts        # General utilities
│   └── errors.ts       # Error handling
├── tests/               # Test files
│   ├── unit/           # Unit tests
│   └── e2e/            # E2E tests
└── package.json        # Node dependencies
```

### Contract Structure

```
contracts/
├── contracts/           # Solidity contracts
│   ├── CreditPassportNFT.sol
│   ├── NeuroCredStaking.sol
│   ├── LendingVault.sol
│   └── ...
├── scripts/            # Deployment scripts
│   ├── deploy.ts       # Deployment script
│   └── upgrade.ts      # Upgrade script
├── test/               # Contract tests
│   ├── CreditPassportNFT.test.ts
│   └── ...
└── hardhat.config.ts   # Hardhat configuration
```

## Contribution Guidelines

### Code Style

#### Python

- Follow PEP 8 style guide
- Use `black` for formatting
- Use `ruff` for linting
- Maximum line length: 100 characters

```bash
# Format code
black .

# Lint code
ruff check .
```

#### TypeScript/JavaScript

- Follow ESLint rules
- Use Prettier for formatting
- Use TypeScript for type safety

```bash
# Format code
npm run format

# Lint code
npm run lint
```

#### Solidity

- Follow Solidity style guide
- Use NatSpec comments
- Maximum line length: 120 characters

### Git Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code
   - Add tests
   - Update documentation

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create PR on GitHub
   ```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

Examples:
```
feat: add ML-based credit scoring
fix: resolve database connection pool issue
docs: update API documentation
```

### Pull Request Process

1. **Create PR**: Use PR template
2. **Review**: Address review comments
3. **Tests**: Ensure all tests pass
4. **Merge**: Squash and merge

### Testing Guidelines

- Write tests for all new features
- Maintain >80% code coverage
- Run tests before committing
- Update tests when changing behavior

## Troubleshooting

### Common Issues

1. **Database connection errors**: Check PostgreSQL is running
2. **Port conflicts**: Change ports in .env files
3. **Module not found**: Reinstall dependencies
4. **Migration errors**: Check database state
5. **Contract compilation errors**: Check Solidity version
6. **Type errors**: Run type checking (`mypy` for Python, `tsc` for TypeScript)

### Getting Help

- Check documentation in `/docs`
- Review existing issues on GitHub
- Ask in team Slack channel
- Create new issue if needed

