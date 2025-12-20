from flask import Blueprint, request, jsonify
from models import db, Article
from datetime import datetime
from sqlalchemy import or_

articles_bp = Blueprint('articles', __name__)


@articles_bp.route('', methods=['GET'])
def get_articles():
    """获取文章列表"""
    try:
        # 查询参数
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        category = request.args.get('category')
        is_published = request.args.get('is_published', type=bool)
        search = request.args.get('search', '')
        include_content = request.args.get('include_content', False, type=bool)

        # 构建查询
        query = Article.query

        if category:
            query = query.filter_by(category=category)

        if is_published is not None:
            query = query.filter_by(is_published=is_published)
        else:
            # 默认只返回已发布的文章
            query = query.filter_by(is_published=True)

        if search:
            query = query.filter(
                or_(
                    Article.title.ilike(f'%{search}%'),
                    Article.subtitle.ilike(f'%{search}%'),
                    Article.content.ilike(f'%{search}%')
                )
            )

        # 排序
        query = query.order_by(Article.sort_order.asc(), Article.published_at.desc())

        # 分页
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            'articles': [article.to_dict(include_content=include_content) for article in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page,
            'per_page': per_page
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@articles_bp.route('/<int:article_id>', methods=['GET'])
def get_article(article_id):
    """获取单篇文章"""
    try:
        article = Article.query.get_or_404(article_id)

        # 增加浏览量
        article.view_count += 1
        db.session.commit()

        return jsonify(article.to_dict())

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@articles_bp.route('', methods=['POST'])
def create_article():
    """创建文章"""
    try:
        data = request.get_json()

        # 验证必填字段
        required_fields = ['title', 'content']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # 创建文章
        article = Article(
            title=data['title'],
            subtitle=data.get('subtitle', ''),
            content=data['content'],
            cover_image=data.get('cover_image', ''),
            author=data.get('author', ''),
            category=data.get('category', 'general'),
            is_published=data.get('is_published', False),
            sort_order=data.get('sort_order', 0)
        )

        # 如果是发布状态，设置发布时间
        if article.is_published and not data.get('published_at'):
            article.published_at = datetime.utcnow()
        elif data.get('published_at'):
            article.published_at = datetime.fromisoformat(data['published_at'])

        db.session.add(article)
        db.session.commit()

        return jsonify({
            'message': 'Article created successfully',
            'article': article.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@articles_bp.route('/<int:article_id>', methods=['PUT'])
def update_article(article_id):
    """更新文章"""
    try:
        article = Article.query.get_or_404(article_id)
        data = request.get_json()

        # 记录原发布状态
        was_published = article.is_published

        # 更新字段
        if 'title' in data:
            article.title = data['title']
        if 'subtitle' in data:
            article.subtitle = data['subtitle']
        if 'content' in data:
            article.content = data['content']
        if 'cover_image' in data:
            article.cover_image = data['cover_image']
        if 'author' in data:
            article.author = data['author']
        if 'category' in data:
            article.category = data['category']
        if 'is_published' in data:
            article.is_published = data['is_published']
            # 如果从未发布变为发布，设置发布时间
            if not was_published and article.is_published and not article.published_at:
                article.published_at = datetime.utcnow()
        if 'sort_order' in data:
            article.sort_order = data['sort_order']
        if 'published_at' in data:
            article.published_at = datetime.fromisoformat(data['published_at'])

        db.session.commit()

        return jsonify({
            'message': 'Article updated successfully',
            'article': article.to_dict()
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@articles_bp.route('/<int:article_id>', methods=['DELETE'])
def delete_article(article_id):
    """删除文章"""
    try:
        article = Article.query.get_or_404(article_id)
        db.session.delete(article)
        db.session.commit()

        return jsonify({'message': 'Article deleted successfully'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@articles_bp.route('/categories', methods=['GET'])
def get_article_categories():
    """获取所有文章分类"""
    try:
        # 获取所有不同的分类
        categories = db.session.query(Article.category).distinct().all()
        category_list = [cat[0] for cat in categories if cat[0]]

        return jsonify(category_list)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
