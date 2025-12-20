from flask import Flask, jsonify, render_template
from flask_cors import CORS
from config import Config
from models import db
import os


def create_app(config_class=Config):
    """应用工厂函数"""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # 初始化扩展
    db.init_app(app)
    CORS(app, resources={r"/api/*": {
        "origins": app.config['CORS_ORIGINS'],
        "supports_credentials": True
    }})

    # 确保上传文件夹存在
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # 注册路由
    from routes.categories import categories_bp
    from routes.products import products_bp
    from routes.articles import articles_bp
    from routes.orders import orders_bp
    from routes.auth import auth_bp
    from routes.upload import upload_bp

    app.register_blueprint(categories_bp, url_prefix='/api/categories')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(articles_bp, url_prefix='/api/articles')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(upload_bp, url_prefix='/api/uploads')

    # 健康检查端点
    @app.route('/api/health')
    def health():
        return jsonify({'status': 'ok', 'message': 'Taiwaka Coffee API is running'})

    # 管理后台页面路由
    @app.route('/admin/login')
    def admin_login():
        return render_template('admin/login.html')

    @app.route('/admin/dashboard')
    def admin_dashboard():
        return render_template('admin/dashboard.html')

    @app.route('/admin')
    def admin_redirect():
        return render_template('admin/login.html')

    # 错误处理
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

    return app


if __name__ == '__main__':
    app = create_app()

    # 创建数据库表
    with app.app_context():
        db.create_all()
        print("Database tables created successfully!")

    # 运行应用
    app.run(debug=True, host='0.0.0.0', port=5000)
