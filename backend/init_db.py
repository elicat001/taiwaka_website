"""
数据库初始化脚本
运行此脚本以创建数据库表并添加初始数据
"""
from app import create_app
from models import db, Category, Product, Article, Admin
from datetime import datetime


def init_database():
    """初始化数据库"""
    app = create_app()

    with app.app_context():
        # 创建所有表
        print("Creating database tables...")
        db.create_all()

        # 检查是否已有数据
        if Category.query.first() is not None:
            print("Database already initialized!")
            return

        # 添加默认分类
        print("Adding default categories...")
        categories = [
            Category(name='精品咖啡', description='手工精选咖啡豆', icon='☕', sort_order=1),
            Category(name='特调饮品', description='创意特调咖啡', icon='🍹', sort_order=2),
            Category(name='茶饮系列', description='精选茶饮', icon='🍵', sort_order=3),
            Category(name='甜点糕点', description='手工制作甜点', icon='🍰', sort_order=4),
        ]

        for category in categories:
            db.session.add(category)
        db.session.commit()

        # 添加示例产品
        print("Adding sample products...")
        coffee_cat = Category.query.filter_by(name='精品咖啡').first()
        drink_cat = Category.query.filter_by(name='特调饮品').first()

        products = [
            Product(
                name='美式咖啡',
                description='经典美式，浓郁醇香',
                price=25.0,
                original_price=30.0,
                category_id=coffee_cat.id,
                stock=100,
                is_featured=True,
                tags='热饮,冰饮,推荐',
                sort_order=1
            ),
            Product(
                name='拿铁咖啡',
                description='香浓拿铁，奶香四溢',
                price=30.0,
                category_id=coffee_cat.id,
                stock=100,
                is_featured=True,
                tags='热饮,冰饮,奶制品',
                sort_order=2
            ),
            Product(
                name='卡布奇诺',
                description='经典卡布，绵密奶泡',
                price=32.0,
                category_id=coffee_cat.id,
                stock=100,
                tags='热饮,奶制品,推荐',
                sort_order=3
            ),
            Product(
                name='焦糖玛奇朵',
                description='甜蜜焦糖，层次分明',
                price=35.0,
                category_id=drink_cat.id,
                stock=80,
                is_featured=True,
                tags='热饮,冰饮,甜品系',
                sort_order=4
            ),
        ]

        for product in products:
            db.session.add(product)
        db.session.commit()

        # 添加示例文章
        print("Adding sample articles...")
        articles = [
            Article(
                title='太哇卡咖啡的诞生',
                subtitle='一个关于咖啡与梦想的故事',
                content='''
                # 品牌故事

                太哇卡咖啡创立于2024年，源于对咖啡的热爱和对品质的执着追求。

                ## 我们的理念

                - 精选全球优质咖啡豆
                - 坚持手工烘焙
                - 追求每一杯咖啡的完美呈现

                ## 我们的承诺

                为每一位顾客提供最优质的咖啡体验，让咖啡成为生活中的美好时刻。
                ''',
                category='brand_story',
                author='太哇卡团队',
                is_published=True,
                published_at=datetime.utcnow(),
                sort_order=1
            ),
        ]

        for article in articles:
            db.session.add(article)
        db.session.commit()

        # 添加默认管理员账户
        print("Adding default admin user...")
        admin = Admin(
            username='admin',
            email='admin@taiwaka.com'
        )
        admin.set_password('admin123')  # 默认密码，建议首次登录后修改
        db.session.add(admin)
        db.session.commit()

        print("\n" + "="*50)
        print("Database initialized successfully!")
        print("="*50)
        print("\nDefault admin credentials:")
        print("Username: admin")
        print("Password: admin123")
        print("\nPlease change the password after first login!")
        print("="*50)


if __name__ == '__main__':
    init_database()
