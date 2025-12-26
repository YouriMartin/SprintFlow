#!/bin/bash

# SprintFlow Development Script with Watch Mode
# This script manages the development environment with hot reload/watch capabilities

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check if docker-compose is available
check_docker_compose() {
    if ! command -v docker-compose > /dev/null 2>&1 && ! docker compose version > /dev/null 2>&1; then
        print_error "Docker Compose is not available. Please install Docker Compose and try again."
        exit 1
    fi
}

# Function to get docker compose command
get_docker_compose_cmd() {
    if command -v docker-compose > /dev/null 2>&1; then
        echo "docker-compose"
    else
        echo "docker compose"
    fi
}

# Function to start development environment
start_dev() {
    print_status "Starting SprintFlow development environment with watch mode..."
    
    check_docker
    check_docker_compose
    
    local compose_cmd=$(get_docker_compose_cmd)
    
    # Stop any existing containers
    print_status "Stopping any existing containers..."
    $compose_cmd -f docker-compose.dev.yml down > /dev/null 2>&1 || true
    
    # Start the development environment
    print_status "Starting PostgreSQL database..."
    $compose_cmd -f docker-compose.dev.yml up -d postgres
    
    print_status "Waiting for database to be ready..."
    sleep 5
    
    print_status "Starting backend with watch mode..."
    $compose_cmd -f docker-compose.dev.yml up -d backend
    
    print_status "Starting frontend with watch mode..."
    $compose_cmd -f docker-compose.dev.yml up -d frontend
    
    print_success "Development environment started successfully!"
    print_status "Services:"
    print_status "  - Database: http://localhost:5432"
    print_status "  - Backend API: http://localhost:3000"
    print_status "  - Frontend: http://localhost:3001"
    print_status ""
    print_status "To view logs, run: $0 logs"
    print_status "To stop the environment, run: $0 stop"
}

# Function to stop development environment
stop_dev() {
    print_status "Stopping SprintFlow development environment..."
    
    check_docker_compose
    
    local compose_cmd=$(get_docker_compose_cmd)
    $compose_cmd -f docker-compose.dev.yml down
    
    print_success "Development environment stopped successfully!"
}

# Function to restart development environment
restart_dev() {
    print_status "Restarting SprintFlow development environment..."
    stop_dev
    sleep 2
    start_dev
}

# Function to show logs
show_logs() {
    check_docker_compose
    
    local compose_cmd=$(get_docker_compose_cmd)
    local service=${1:-""}
    
    if [ -n "$service" ]; then
        print_status "Showing logs for $service..."
        $compose_cmd -f docker-compose.dev.yml logs -f "$service"
    else
        print_status "Showing logs for all services..."
        $compose_cmd -f docker-compose.dev.yml logs -f
    fi
}

# Function to show status
show_status() {
    check_docker_compose
    
    local compose_cmd=$(get_docker_compose_cmd)
    print_status "Development environment status:"
    $compose_cmd -f docker-compose.dev.yml ps
}

# Function to rebuild containers
rebuild() {
    print_status "Rebuilding development environment..."
    
    check_docker_compose
    
    local compose_cmd=$(get_docker_compose_cmd)
    $compose_cmd -f docker-compose.dev.yml down
    $compose_cmd -f docker-compose.dev.yml pull
    start_dev
}

# Function to clean up (remove containers, volumes, networks)
cleanup() {
    print_warning "This will remove all development containers, volumes, and networks."
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        check_docker_compose
        
        local compose_cmd=$(get_docker_compose_cmd)
        print_status "Cleaning up development environment..."
        $compose_cmd -f docker-compose.dev.yml down -v --remove-orphans
        
        print_success "Development environment cleaned up successfully!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to show help
show_help() {
    echo "SprintFlow Development Script with Watch Mode"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Start the development environment with watch mode"
    echo "  stop      Stop the development environment"
    echo "  restart   Restart the development environment"
    echo "  logs      Show logs for all services"
    echo "  logs <service>  Show logs for specific service (postgres, backend, frontend)"
    echo "  status    Show status of all services"
    echo "  rebuild   Rebuild and restart the development environment"
    echo "  cleanup   Remove all containers, volumes, and networks"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start          # Start development environment"
    echo "  $0 logs backend   # Show backend logs"
    echo "  $0 logs frontend  # Show frontend logs"
    echo "  $0 stop           # Stop development environment"
}

# Main script logic
case "${1:-help}" in
    start)
        start_dev
        ;;
    stop)
        stop_dev
        ;;
    restart)
        restart_dev
        ;;
    logs)
        show_logs "$2"
        ;;
    status)
        show_status
        ;;
    rebuild)
        rebuild
        ;;
    cleanup)
        cleanup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac