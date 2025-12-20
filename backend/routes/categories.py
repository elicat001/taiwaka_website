from flask import Blueprint, request, jsonify
from models import db, Category

categories_bp = Blueprint('categories', __name__)


@categories_bp.route('', methods=['GET'])
def get_categories():
    """获取分类列表"""
    try:
        is_active = request.args.get('is_active', type=bool)

        query = Category.query

        if is_active is not None:
            query = query.filter_by(is_active=is_active)
        else:
            # 默认只返回激活的分类
            query = query.filter_by(is_active=True)

        categories = query.order_by(Category.sort_order.asc()).all()

        return jsonify([category.to_dict() for category in categories])

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@categories_bp.route('/<int:category_id>', methods=['GET'])
def get_category(category_id):
    """获取单个分类"""
    try:
        category = Category.query.get_or_404(category_id)
        return jsonify(category.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 404


@categories_bp.route('', methods=['POST'])
def create_category():
    """创建分类"""
    try:
        data = request.get_json()

        # 验证必填字段
        if 'name' not in data:
            return jsonify({'error': 'Name is required'}), 400

        # 检查名称是否已存在
        existing = Category.query.filter_by(name=data['name']).first()
        if existing:
            return jsonify({'error': 'Category name already exists'}), 400

        # 创建分类
        category = Category(
            name=data['name'],
            description=data.get('description', ''),
            icon=data.get('icon', ''),
            sort_order=data.get('sort_order', 0),
            is_active=data.get('is_active', True)
        )

        db.session.add(category)
        db.session.commit()

        return jsonify({
            'message': 'Category created successfully',
            'category': category.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@categories_bp.route('/<int:category_id>', methods=['PUT'])
def update_category(category_id):
    """更新分类"""
    try:
        category = Category.query.get_or_404(category_id)
        data = request.get_json()

        # 检查名称是否与其他分类重复
        if 'name' in data and data['name'] != category.name:
            existing = Category.query.filter_by(name=data['name']).first()
            if existing:
                return jsonify({'error': 'Category name already exists'}), 400

        # 更新字段
        if 'name' in data:
            category.name = data['name']
        if 'description' in data:
            category.description = data['description']
        if 'icon' in data:
            category.icon = data['icon']
        if 'sort_order' in data:
            category.sort_order = data['sort_order']
        if 'is_active' in data:
            category.is_active = data['is_active']

        db.session.commit()

        return jsonify({
            'message': 'Category updated successfully',
            'category': category.to_dict()
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@categories_bp.route('/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    """删除分类"""
    try:
        category = Category.query.get_or_404(category_id)

        # 检查是否有关联的产品
        if len(category.products) > 0:
            return jsonify({
                'error': 'Cannot delete category with existing products',
                'product_count': len(category.products)
            }), 400

        db.session.delete(category)
        db.session.commit()

        return jsonify({'message': 'Category deleted successfully'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@categories_bp.route('/<int:category_id>/products', methods=['GET'])
def get_category_products(category_id):
    """获取分类下的所有产品"""
    try:
        category = Category.query.get_or_404(category_id)
        products = [product.to_dict() for product in category.products if product.is_active]

        return jsonify({
            'category': category.to_dict(),
            'products': products
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
