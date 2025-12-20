@echo off
echo ====================================
echo 太哇卡咖啡 - 后端管理系统
echo ====================================
echo.

REM 检查是否已安装依赖
if not exist "venv\" (
    echo 首次运行，正在创建虚拟环境...
    python -m venv venv
    echo.
    echo 正在安装依赖...
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    echo.
) else (
    call venv\Scripts\activate.bat
)

REM 检查数据库是否存在
if not exist "database.db" (
    echo 数据库不存在，正在初始化...
    python init_db.py
    echo.
)

echo 正在启动服务器...
echo 访问地址: http://localhost:5000
echo 管理后台: http://localhost:5000/admin
echo.
echo 按 Ctrl+C 停止服务器
echo ====================================
python app.py
