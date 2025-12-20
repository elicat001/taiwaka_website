from flask import Blueprint, request, jsonify, session
from models import db, Admin
from datetime import datetime
from functools import wraps

auth_bp = Blueprint('auth', __name__)


def login_required(f):
    """登录验证装饰器"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function


@auth_bp.route('/login', methods=['POST'])
def login():
    """管理员登录"""
    try:
        data = request.get_json()

        # 验证必填字段
        if 'username' not in data or 'password' not in data:
            return jsonify({'error': 'Username and password are required'}), 400

        # 查找管理员
        admin = Admin.query.filter_by(username=data['username']).first()

        if not admin:
            return jsonify({'error': 'Invalid username or password'}), 401

        if not admin.is_active:
            return jsonify({'error': 'Account is disabled'}), 403

        if not admin.check_password(data['password']):
            return jsonify({'error': 'Invalid username or password'}), 401

        # 更新最后登录时间
        admin.last_login = datetime.utcnow()
        db.session.commit()

        # 设置session
        session['admin_id'] = admin.id
        session['admin_username'] = admin.username

        return jsonify({
            'message': 'Login successful',
            'admin': admin.to_dict()
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """管理员登出"""
    try:
        session.clear()
        return jsonify({'message': 'Logout successful'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/me', methods=['GET'])
@login_required
def get_current_admin():
    """获取当前登录的管理员信息"""
    try:
        admin = Admin.query.get(session['admin_id'])
        if not admin:
            session.clear()
            return jsonify({'error': 'Admin not found'}), 404

        return jsonify(admin.to_dict())

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/register', methods=['POST'])
def register():
    """注册新管理员（需要超级管理员权限或首次注册）"""
    try:
        data = request.get_json()

        # 验证必填字段
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # 检查用户名是否已存在
        if Admin.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400

        # 检查邮箱是否已存在
        if Admin.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400

        # 密码长度验证
        if len(data['password']) < 6:
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400

        # 创建管理员
        admin = Admin(
            username=data['username'],
            email=data['email']
        )
        admin.set_password(data['password'])

        db.session.add(admin)
        db.session.commit()

        return jsonify({
            'message': 'Admin registered successfully',
            'admin': admin.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/change-password', methods=['POST'])
@login_required
def change_password():
    """修改密码"""
    try:
        data = request.get_json()

        # 验证必填字段
        if 'current_password' not in data or 'new_password' not in data:
            return jsonify({'error': 'Current password and new password are required'}), 400

        admin = Admin.query.get(session['admin_id'])

        # 验证当前密码
        if not admin.check_password(data['current_password']):
            return jsonify({'error': 'Current password is incorrect'}), 401

        # 新密码长度验证
        if len(data['new_password']) < 6:
            return jsonify({'error': 'New password must be at least 6 characters long'}), 400

        # 更新密码
        admin.set_password(data['new_password'])
        db.session.commit()

        return jsonify({'message': 'Password changed successfully'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/admins', methods=['GET'])
@login_required
def get_admins():
    """获取所有管理员列表"""
    try:
        admins = Admin.query.all()
        return jsonify([admin.to_dict() for admin in admins])

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/admins/<int:admin_id>', methods=['PUT'])
@login_required
def update_admin(admin_id):
    """更新管理员信息"""
    try:
        admin = Admin.query.get_or_404(admin_id)
        data = request.get_json()

        # 更新字段
        if 'username' in data and data['username'] != admin.username:
            # 检查用户名是否已被使用
            if Admin.query.filter_by(username=data['username']).first():
                return jsonify({'error': 'Username already exists'}), 400
            admin.username = data['username']

        if 'email' in data and data['email'] != admin.email:
            # 检查邮箱是否已被使用
            if Admin.query.filter_by(email=data['email']).first():
                return jsonify({'error': 'Email already exists'}), 400
            admin.email = data['email']

        if 'is_active' in data:
            # 不允许禁用自己
            if admin_id == session['admin_id'] and not data['is_active']:
                return jsonify({'error': 'Cannot disable your own account'}), 400
            admin.is_active = data['is_active']

        db.session.commit()

        return jsonify({
            'message': 'Admin updated successfully',
            'admin': admin.to_dict()
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/admins/<int:admin_id>', methods=['DELETE'])
@login_required
def delete_admin(admin_id):
    """删除管理员"""
    try:
        # 不允许删除自己
        if admin_id == session['admin_id']:
            return jsonify({'error': 'Cannot delete your own account'}), 400

        admin = Admin.query.get_or_404(admin_id)
        db.session.delete(admin)
        db.session.commit()

        return jsonify({'message': 'Admin deleted successfully'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
