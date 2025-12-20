#!/bin/bash

echo "===================================="
echo "太哇卡咖啡 - 后端管理系统"
echo "===================================="
echo ""

# 检查是否已安装依赖
if [ ! -d "venv" ]; then
    echo "首次运行，正在创建虚拟环境..."
    python3 -m venv venv
    echo ""
    echo "正在安装依赖..."
    source venv/bin/activate
    pip install -r requirements.txt
    echo ""
else
    source venv/bin/activate
fi

# 检查数据库是否存在
if [ ! -f "database.db" ]; then
    echo "数据库不存在，正在初始化..."
    python init_db.py
    echo ""
fi

echo "正在启动服务器..."
echo "访问地址: http://localhost:5000"
echo "管理后台: http://localhost:5000/admin"
echo ""
echo "按 Ctrl+C 停止服务器"
echo "===================================="
python app.py
