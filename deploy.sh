#!/bin/bash

# 流程天命人 - 前后端分离部署脚本
# 支持开发环境和生产环境部署

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE} 流程天命人 - 容器化部署脚本${NC}"
    echo -e "${BLUE}================================${NC}"
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    print_message "Docker 环境检查通过"
}

# 构建镜像
build_images() {
    local env=${1:-production}
    
    print_message "开始构建镜像 (环境: $env)"
    
    if [ "$env" = "development" ]; then
        docker-compose -f docker-compose.dev.yml build
    else
        docker-compose build
    fi
    
    print_message "镜像构建完成"
}

# 启动服务
start_services() {
    local env=${1:-production}
    
    print_message "启动服务 (环境: $env)"
    
    if [ "$env" = "development" ]; then
        docker-compose -f docker-compose.dev.yml up -d
    else
        docker-compose up -d
    fi
    
    print_message "服务启动完成"
}

# 停止服务
stop_services() {
    local env=${1:-production}
    
    print_message "停止服务 (环境: $env)"
    
    if [ "$env" = "development" ]; then
        docker-compose -f docker-compose.dev.yml down
    else
        docker-compose down
    fi
    
    print_message "服务已停止"
}

# 查看服务状态
status_services() {
    local env=${1:-production}
    
    print_message "服务状态 (环境: $env)"
    
    if [ "$env" = "development" ]; then
        docker-compose -f docker-compose.dev.yml ps
    else
        docker-compose ps
    fi
}

# 查看日志
view_logs() {
    local env=${1:-production}
    local service=${2:-}
    
    if [ -n "$service" ]; then
        print_message "查看 $service 服务日志 (环境: $env)"
        if [ "$env" = "development" ]; then
            docker-compose -f docker-compose.dev.yml logs -f "$service"
        else
            docker-compose logs -f "$service"
        fi
    else
        print_message "查看所有服务日志 (环境: $env)"
        if [ "$env" = "development" ]; then
            docker-compose -f docker-compose.dev.yml logs -f
        else
            docker-compose logs -f
        fi
    fi
}

# 清理资源
cleanup() {
    print_message "清理Docker资源"
    
    # 停止所有相关容器
    docker-compose down 2>/dev/null || true
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    
    # 删除未使用的镜像
    docker image prune -f
    
    print_message "清理完成"
}

# 显示帮助信息
show_help() {
    echo "用法: $0 [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  build [env]     构建镜像 (env: development|production, 默认: production)"
    echo "  start [env]     启动服务 (env: development|production, 默认: production)"
    echo "  stop [env]      停止服务 (env: development|production, 默认: production)"
    echo "  restart [env]   重启服务 (env: development|production, 默认: production)"
    echo "  status [env]    查看服务状态 (env: development|production, 默认: production)"
    echo "  logs [env] [service]  查看日志 (env: development|production, 默认: production)"
    echo "  cleanup         清理Docker资源"
    echo "  help            显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 build development    # 构建开发环境镜像"
    echo "  $0 start production     # 启动生产环境服务"
    echo "  $0 logs development backend  # 查看开发环境后端日志"
    echo "  $0 cleanup             # 清理Docker资源"
}

# 主函数
main() {
    print_header
    
    case "${1:-help}" in
        "build")
            check_docker
            build_images "$2"
            ;;
        "start")
            check_docker
            start_services "$2"
            ;;
        "stop")
            check_docker
            stop_services "$2"
            ;;
        "restart")
            check_docker
            stop_services "$2"
            start_services "$2"
            ;;
        "status")
            check_docker
            status_services "$2"
            ;;
        "logs")
            check_docker
            view_logs "$2" "$3"
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# 执行主函数
main "$@"
