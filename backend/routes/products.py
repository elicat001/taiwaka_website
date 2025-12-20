from flask import Blueprint, request, jsonify
from models import db, Product, Category
from sqlalchemy import or_

products_bp = Blueprint('products', __name__)


@products_bp.route('', methods=['GET'])
def get_products():
    """获取产品列表"""
    try:
        # 查询参数
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        category_id = request.args.get('category_id', type=int)
        is_featured = request.args.get('is_featured', type=bool)
        is_active = request.args.get('is_active', type=bool)
        search = request.args.get('search', '')

        # 构建查询
        query = Product.query

        if category_id:
            query = query.filter_by(category_id=category_id)

        if is_featured is not None:
            query = query.filter_by(is_featured=is_featured)

        if is_active is not None:
            query = query.filter_by(is_active=is_active)
        else:
            # 默认只返回激活的产品
            query = query.filter_by(is_active=True)

        if search:
            query = query.filter(
                or_(
                    Product.name.ilike(f'%{search}%'),
                    Product.description.ilike(f'%{search}%'),
                    Product.tags.ilike(f'%{search}%')
                )
            )

        # 排序
        query = query.order_by(Product.sort_order.asc(), Product.created_at.desc())

        # 分页
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            'products': [product.to_dict() for product in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page,
            'per_page': per_page
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """获取单个产品"""
    try:
        product = Product.query.get_or_404(product_id)
        return jsonify(product.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 404


@products_bp.route('', methods=['POST'])
def create_product():
    """创建产品"""
    try:
        data = request.get_json()

        # 验证必填字段
        required_fields = ['name', 'price', 'category_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # 验证分类是否存在
        category = Category.query.get(data['category_id'])
        if not category:
            return jsonify({'error': 'Category not found'}), 404

        # 创建产品
        product = Product(
            name=data['name'],
            description=data.get('description', ''),
            price=data['price'],
            original_price=data.get('original_price'),
            image_url=data.get('image_url', ''),
            category_id=data['category_id'],
            stock=data.get('stock', 0),
            is_featured=data.get('is_featured', False),
            is_active=data.get('is_active', True),
            tags=data.get('tags', ''),
            sort_order=data.get('sort_order', 0)
        )

        db.session.add(product)
        db.session.commit()

        return jsonify({
            'message': 'Product created successfully',
            'product': product.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@products_bp.route('/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    """更新产品"""
    try:
        product = Product.query.get_or_404(product_id)
        data = request.get_json()

        # 更新字段
        if 'name' in data:
            product.name = data['name']
        if 'description' in data:
            product.description = data['description']
        if 'price' in data:
            product.price = data['price']
        if 'original_price' in data:
            product.original_price = data['original_price']
        if 'image_url' in data:
            product.image_url = data['image_url']
        if 'category_id' in data:
            # 验证分类是否存在
            category = Category.query.get(data['category_id'])
            if not category:
                return jsonify({'error': 'Category not found'}), 404
            product.category_id = data['category_id']
        if 'stock' in data:
            product.stock = data['stock']
        if 'is_featured' in data:
            product.is_featured = data['is_featured']
        if 'is_active' in data:
            product.is_active = data['is_active']
        if 'tags' in data:
            product.tags = data['tags']
        if 'sort_order' in data:
            product.sort_order = data['sort_order']

        db.session.commit()

        return jsonify({
            'message': 'Product updated successfully',
            'product': product.to_dict()
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@products_bp.route('/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    """删除产品"""
    try:
        product = Product.query.get_or_404(product_id)
        db.session.delete(product)
        db.session.commit()

        return jsonify({'message': 'Product deleted successfully'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@products_bp.route('/featured', methods=['GET'])
def get_featured_products():
    """获取精选产品"""
    try:
        products = Product.query.filter_by(
            is_featured=True,
            is_active=True
        ).order_by(Product.sort_order.asc()).all()

        return jsonify([product.to_dict() for product in products])

    except Exception as e:
        return jsonify({'error': str(e)}), 500
