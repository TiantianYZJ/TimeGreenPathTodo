const express = require('express');
const router = express.Router();
const workReportController = require('../controllers/workReportController');
const reportTemplateController = require('../controllers/reportTemplateController');
const { authMiddleware } = require('../middleware/auth');

// Work report endpoints
router.get('/', authMiddleware, workReportController.getList);
router.get('/board', authMiddleware, workReportController.getBoard);
router.get('/:id', authMiddleware, workReportController.getById);
router.post('/', authMiddleware, workReportController.create);
router.put('/:id', authMiddleware, workReportController.update);
router.delete('/:id', authMiddleware, workReportController.deleteReport);

// Template endpoints
router.get('/templates/list', authMiddleware, reportTemplateController.getTemplates);
router.put('/templates', authMiddleware, reportTemplateController.upsertTemplate);
router.post('/templates/defaults', authMiddleware, reportTemplateController.createDefaults);

module.exports = router;
