const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query } = require('../config/database');
const logger = require('../utils/logger');

const uploadDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user.id;
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `avatar_${userId}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'), false);
    }
  }
});

const uploadAvatar = async (req, res) => {
  const userId = req.user.id;
  
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: '请选择要上传的图片'
    });
  }
  
  try {
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    const oldAvatars = await query(
      'SELECT avatar_url FROM users WHERE id = ? AND avatar_url LIKE ?',
      [userId, '/uploads/avatars/%']
    );
    
    if (oldAvatars.length > 0 && oldAvatars[0].avatar_url) {
      const oldPath = path.join(__dirname, '..', oldAvatars[0].avatar_url);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    
    await query(
      'UPDATE users SET avatar_url = ?, updated_at = NOW() WHERE id = ?',
      [avatarUrl, userId]
    );
    
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const fullUrl = `${baseUrl}${avatarUrl}`;
    
    res.json({
      success: true,
      message: '头像上传成功',
      avatarUrl: fullUrl
    });
  } catch (err) {
    logger.uploadError('上传头像', '上传头像失败', { userId, error: err.message });
    res.status(500).json({
      success: false,
      message: '上传失败'
    });
  }
};

module.exports = {
  upload,
  uploadAvatar
};
