#!/bin/bash

# 流程天命人 - 部署测试脚本
# 用于验证前后端分离部署配置

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
    echo -e "${BLUE} 流程天命人 - 部署测试脚本${NC}"
    echo -e "${BLUE}================================${NC}"
}

# 检查Docker环境
check_docker() {
    print_message "检查Docker环境..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装"
        return 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose 未安装"
        return 1
    fi
    
    print_message "Docker 环境检查通过"
    return 0
}

# 检查配置文件
check_config() {
    print_message "检查配置文件..."
    
    local missing_files=()
    
    # 检查必需文件
    local required_files=(
        "frontend/Dockerfile"
        "frontend/nginx.conf"
        "backend/Dockerfile"
        "backend/server.js"
        "backend/package.json"
        "docker-compose.yml"
        "docker-compose.dev.yml"
        "env.example"
        "env.development"
        "env.production"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        print_error "缺少以下配置文件:"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
        return 1
    fi
    
    print_message "配置文件检查通过"
    return 0
}

# 检查环境变量
check_env_vars() {
    print_message "检查环境变量配置..."
    
    if [ ! -f ".env" ]; then
        print_warning ".env 文件不存在，将使用默认配置"
        cp env.example .env
    fi
    
    print_message "环境变量配置检查完成"
    return 0
}

# 构建镜像测试
test_build() {
    print_message "测试镜像构建..."
    
    # 测试生产环境构建
    if docker-compose build --no-cache; then
        print_message "生产环境镜像构建成功"
    else
        print_error "生产环境镜像构建失败"
        return 1
    fi
    
    # 测试开发环境构建
    if docker-compose -f docker-compose.dev.yml build --no-cache; then
        print_message "开发环境镜像构建成功"
    else
        print_error "开发环境镜像构建失败"
        return 1
    fi
    
    return 0
}

# 启动服务测试
test_start() {
    print_message "测试服务启动..."
    
    # 启动生产环境服务
    if docker-compose up -d; then
        print_message "生产环境服务启动成功"
        
        # 等待服务启动
        sleep 10
        
        # 检查服务状态
        if docker-compose ps | grep -q "Up"; then
            print_message "服务运行正常"
        else
            print_error "服务启动后未正常运行"
            docker-compose logs
            return 1
        fi
        
        # 停止服务
        docker-compose down
        print_message "生产环境服务测试完成"
    else
        print_error "生产环境服务启动失败"
        return 1
    fi
    
    return 0
}

# 健康检查测试
test_health() {
    print_message "测试健康检查..."
    
    # 启动服务
    docker-compose up -d
    
    # 等待服务启动
    sleep 15
    
    # 检查后端健康状态
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        print_message "后端健康检查通过"
    else
        print_error "后端健康检查失败"
        docker-compose logs backend
        docker-compose down
        return 1
    fi
    
    # 检查前端健康状态
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_message "前端健康检查通过"
    else
        print_warning "前端健康检查失败（可能正常，取决于Nginx配置）"
    fi
    
    # 停止服务
    docker-compose down
    print_message "健康检查测试完成"
    
    return 0
}

# 清理测试环境
cleanup() {
    print_message "清理测试环境..."
    
    # 停止所有服务
    docker-compose down 2>/dev/null || true
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    
    # 删除测试镜像
    docker rmi $(docker images -q lctmr-v2.0*) 2>/dev/null || true
    
    print_message "测试环境清理完成"
}

# 主函数
main() {
    print_header
    
    local exit_code=0
    
    # 执行测试步骤
    check_docker || exit_code=1
    check_config || exit_code=1
    check_env_vars || exit_code=1
    
    if [ $exit_code -eq 0 ]; then
        test_build || exit_code=1
        test_start || exit_code=1
        test_health || exit_code=1
    fi
    
    # 清理测试环境
    cleanup
    
    if [ $exit_code -eq 0 ]; then
        print_message "所有测试通过！部署配置正确。"
        echo ""
        echo "下一步操作："
        echo "1. 配置数据库连接信息"
        echo "2. 运行: ./deploy.sh start production"
        echo "3. 访问: http://localhost:3000"
    else
        print_error "测试失败，请检查配置。"
    fi
    
    exit $exit_code
}

# 执行主函数
main "$@"
