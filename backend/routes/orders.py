from flask import Blueprint, request, jsonify
from models import db, Order, OrderItem, Product
from datetime import datetime
import random
import string

orders_bp = Blueprint('orders', __name__)


def generate_order_number():
    """生成订单号"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_str = ''.join(random.choices(string.digits, k=4))
    return f'TW{timestamp}{random_str}'


@orders_bp.route('', methods=['GET'])
def get_orders():
    """获取订单列表"""
    try:
        # 查询参数
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        payment_status = request.args.get('payment_status')
        search = request.args.get('search', '')

        # 构建查询
        query = Order.query

        if status:
            query = query.filter_by(status=status)

        if payment_status:
            query = query.filter_by(payment_status=payment_status)

        if search:
            query = query.filter(
                (Order.order_number.ilike(f'%{search}%')) |
                (Order.customer_name.ilike(f'%{search}%')) |
                (Order.customer_phone.ilike(f'%{search}%'))
            )

        # 排序
        query = query.order_by(Order.created_at.desc())

        # 分页
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            'orders': [order.to_dict(include_items=True) for order in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page,
            'per_page': per_page
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@orders_bp.route('/<int:order_id>', methods=['GET'])
def get_order(order_id):
    """获取单个订单"""
    try:
        order = Order.query.get_or_404(order_id)
        return jsonify(order.to_dict(include_items=True))
    except Exception as e:
        return jsonify({'error': str(e)}), 404


@orders_bp.route('', methods=['POST'])
def create_order():
    """创建订单"""
    try:
        data = request.get_json()

        # 验证必填字段
        required_fields = ['customer_name', 'customer_phone', 'items']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        if not data['items']:
            return jsonify({'error': 'Order must have at least one item'}), 400

        # 生成订单号
        order_number = generate_order_number()

        # 计算总金额
        total_amount = 0
        order_items = []

        for item_data in data['items']:
            product = Product.query.get(item_data['product_id'])
            if not product:
                return jsonify({'error': f'Product {item_data["product_id"]} not found'}), 404

            if not product.is_active:
                return jsonify({'error': f'Product {product.name} is not available'}), 400

            quantity = item_data['quantity']
            if quantity <= 0:
                return jsonify({'error': 'Quantity must be greater than 0'}), 400

            # 检查库存
            if product.stock < quantity:
                return jsonify({'error': f'Insufficient stock for {product.name}'}), 400

            subtotal = product.price * quantity
            total_amount += subtotal

            order_items.append({
                'product_id': product.id,
                'product_name': product.name,
                'product_price': product.price,
                'quantity': quantity,
                'subtotal': subtotal
            })

        # 创建订单
        order = Order(
            order_number=order_number,
            customer_name=data['customer_name'],
            customer_phone=data['customer_phone'],
            customer_email=data.get('customer_email', ''),
            delivery_address=data.get('delivery_address', ''),
            total_amount=total_amount,
            payment_method=data.get('payment_method', 'cash'),
            notes=data.get('notes', '')
        )

        db.session.add(order)
        db.session.flush()  # 获取订单ID

        # 创建订单项并扣减库存
        for item_data in order_items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item_data['product_id'],
                product_name=item_data['product_name'],
                product_price=item_data['product_price'],
                quantity=item_data['quantity'],
                subtotal=item_data['subtotal']
            )
            db.session.add(order_item)

            # 扣减库存
            product = Product.query.get(item_data['product_id'])
            product.stock -= item_data['quantity']

        db.session.commit()

        return jsonify({
            'message': 'Order created successfully',
            'order': order.to_dict(include_items=True)
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@orders_bp.route('/<int:order_id>', methods=['PUT'])
def update_order(order_id):
    """更新订单"""
    try:
        order = Order.query.get_or_404(order_id)
        data = request.get_json()

        # 更新字段
        if 'customer_name' in data:
            order.customer_name = data['customer_name']
        if 'customer_phone' in data:
            order.customer_phone = data['customer_phone']
        if 'customer_email' in data:
            order.customer_email = data['customer_email']
        if 'delivery_address' in data:
            order.delivery_address = data['delivery_address']
        if 'status' in data:
            order.status = data['status']
        if 'payment_method' in data:
            order.payment_method = data['payment_method']
        if 'payment_status' in data:
            order.payment_status = data['payment_status']
        if 'notes' in data:
            order.notes = data['notes']

        db.session.commit()

        return jsonify({
            'message': 'Order updated successfully',
            'order': order.to_dict(include_items=True)
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@orders_bp.route('/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    """删除订单（取消订单并恢复库存）"""
    try:
        order = Order.query.get_or_404(order_id)

        # 只有待处理或已取消的订单可以删除
        if order.status not in ['pending', 'cancelled']:
            return jsonify({'error': 'Only pending or cancelled orders can be deleted'}), 400

        # 恢复库存
        for item in order.items:
            product = Product.query.get(item.product_id)
            if product:
                product.stock += item.quantity

        db.session.delete(order)
        db.session.commit()

        return jsonify({'message': 'Order deleted successfully'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@orders_bp.route('/<int:order_id>/cancel', methods=['POST'])
def cancel_order(order_id):
    """取消订单并恢复库存"""
    try:
        order = Order.query.get_or_404(order_id)

        if order.status == 'cancelled':
            return jsonify({'error': 'Order is already cancelled'}), 400

        if order.status in ['delivered', 'completed']:
            return jsonify({'error': 'Cannot cancel completed orders'}), 400

        # 恢复库存
        for item in order.items:
            product = Product.query.get(item.product_id)
            if product:
                product.stock += item.quantity

        order.status = 'cancelled'
        db.session.commit()

        return jsonify({
            'message': 'Order cancelled successfully',
            'order': order.to_dict(include_items=True)
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@orders_bp.route('/statistics', methods=['GET'])
def get_order_statistics():
    """获取订单统计信息"""
    try:
        total_orders = Order.query.count()
        pending_orders = Order.query.filter_by(status='pending').count()
        completed_orders = Order.query.filter_by(status='delivered').count()
        cancelled_orders = Order.query.filter_by(status='cancelled').count()

        # 计算总收入（已支付的订单）
        total_revenue = db.session.query(db.func.sum(Order.total_amount)).filter_by(
            payment_status='paid'
        ).scalar() or 0

        return jsonify({
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'completed_orders': completed_orders,
            'cancelled_orders': cancelled_orders,
            'total_revenue': total_revenue
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
