from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime

upload_bp = Blueprint('upload', __name__)


def allowed_file(filename):
    """检查文件扩展名是否允许"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']


def generate_filename(original_filename):
    """生成唯一的文件名"""
    ext = original_filename.rsplit('.', 1)[1].lower()
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    unique_id = str(uuid.uuid4())[:8]
    return f"{timestamp}_{unique_id}.{ext}"


@upload_bp.route('/image', methods=['POST'])
def upload_image():
    """上传图片"""
    try:
        # 检查是否有文件
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']

        # 检查文件名
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # 检查文件类型
        if not allowed_file(file.filename):
            return jsonify({'error': f'File type not allowed. Allowed types: {", ".join(current_app.config["ALLOWED_EXTENSIONS"])}'}), 400

        # 生成安全的文件名
        filename = generate_filename(file.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)

        # 保存文件
        file.save(filepath)

        # 返回文件URL
        file_url = f'/api/uploads/{filename}'

        return jsonify({
            'message': 'File uploaded successfully',
            'filename': filename,
            'url': file_url
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@upload_bp.route('/images', methods=['POST'])
def upload_multiple_images():
    """批量上传图片"""
    try:
        # 检查是否有文件
        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400

        files = request.files.getlist('files')

        if not files or len(files) == 0:
            return jsonify({'error': 'No files selected'}), 400

        uploaded_files = []
        errors = []

        for file in files:
            if file.filename == '':
                continue

            if not allowed_file(file.filename):
                errors.append(f'{file.filename}: File type not allowed')
                continue

            try:
                filename = generate_filename(file.filename)
                filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)

                uploaded_files.append({
                    'filename': filename,
                    'url': f'/api/uploads/{filename}'
                })

            except Exception as e:
                errors.append(f'{file.filename}: {str(e)}')

        return jsonify({
            'message': f'Uploaded {len(uploaded_files)} files',
            'files': uploaded_files,
            'errors': errors
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@upload_bp.route('/<filename>', methods=['GET'])
def get_uploaded_file(filename):
    """获取上传的文件"""
    try:
        return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        return jsonify({'error': 'File not found'}), 404


@upload_bp.route('/<filename>', methods=['DELETE'])
def delete_uploaded_file(filename):
    """删除上传的文件"""
    try:
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)

        if not os.path.exists(filepath):
            return jsonify({'error': 'File not found'}), 404

        os.remove(filepath)

        return jsonify({'message': 'File deleted successfully'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500
