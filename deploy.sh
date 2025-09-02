#!/bin/bash

# 🚀 流程天命人 - 自动部署脚本
# 版本: v1.1.0
# 作者: 数字化管理中心

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Docker 是否安装
check_docker() {
    log_info "检查 Docker 环境..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker 服务未运行，请启动 Docker"
        exit 1
    fi
    
    log_success "Docker 环境检查通过"
}

# 检查端口是否被占用
check_port() {
    local port=$1
    log_info "检查端口 $port 是否可用..."
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warning "端口 $port 已被占用"
        return 1
    else
        log_success "端口 $port 可用"
        return 0
    fi
}

# 构建镜像
build_image() {
    log_info "开始构建 Docker 镜像..."
    
    if docker build -t lctmr-app .; then
        log_success "镜像构建成功"
    else
        log_error "镜像构建失败"
        exit 1
    fi
}

# 运行容器
run_container() {
    local port=$1
    local container_name="lctmr-app-$(date +%s)"
    
    log_info "启动容器 (端口: $port, 容器名: $container_name)..."
    
    if docker run -d -p $port:80 --name $container_name lctmr-app; then
        log_success "容器启动成功"
        echo -e "${GREEN}应用访问地址: http://localhost:$port${NC}"
        echo -e "${GREEN}健康检查地址: http://localhost:$port/health${NC}"
        echo -e "${GREEN}容器名称: $container_name${NC}"
    else
        log_error "容器启动失败"
        exit 1
    fi
}

# 显示容器状态
show_status() {
    log_info "容器状态:"
    docker ps --filter "ancestor=lctmr-app" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# 清理旧容器
cleanup() {
    log_info "清理旧容器..."
    docker ps -a --filter "ancestor=lctmr-app" --format "{{.Names}}" | xargs -r docker rm -f
    log_success "清理完成"
}

# 显示帮助信息
show_help() {
    echo "🚀 流程天命人 - 部署脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -p, --port PORT     指定端口 (默认: 8080)"
    echo "  -c, --cleanup       清理旧容器"
    echo "  -s, --status        显示容器状态"
    echo "  -h, --help          显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0                  # 使用默认端口 8080 部署"
    echo "  $0 -p 8081          # 使用端口 8081 部署"
    echo "  $0 -c               # 清理旧容器"
    echo "  $0 -s               # 查看状态"
}

# 主函数
main() {
    local port=8080
    local cleanup_flag=false
    local status_flag=false
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -p|--port)
                port="$2"
                shift 2
                ;;
            -c|--cleanup)
                cleanup_flag=true
                shift
                ;;
            -s|--status)
                status_flag=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 显示状态
    if [ "$status_flag" = true ]; then
        show_status
        exit 0
    fi
    
    # 清理旧容器
    if [ "$cleanup_flag" = true ]; then
        cleanup
        exit 0
    fi
    
    # 开始部署
    echo -e "${BLUE}🚀 开始部署流程天命人应用...${NC}"
    echo ""
    
    # 检查环境
    check_docker
    
    # 检查端口
    if ! check_port $port; then
        log_warning "尝试使用端口 8081..."
        if check_port 8081; then
            port=8081
        else
            log_error "无法找到可用端口，请手动指定端口"
            exit 1
        fi
    fi
    
    # 构建和运行
    build_image
    run_container $port
    
    echo ""
    log_success "🎉 部署完成！"
    echo -e "${GREEN}应用已成功部署到: http://localhost:$port${NC}"
    echo ""
    echo "常用命令:"
    echo "  查看日志: docker logs $container_name"
    echo "  停止容器: docker stop $container_name"
    echo "  删除容器: docker rm $container_name"
    echo "  查看状态: $0 -s"
}

# 执行主函数
main "$@"
