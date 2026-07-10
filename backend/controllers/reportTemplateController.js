const { query } = require('../config/database');
const logger = require('../utils/logger');

const MODULE = 'REPORT';

/**
 * Parse sections field from JSON string to object.
 * Returns the original value if already an object, or null on parse failure.
 */
const parseSections = (sections) => {
  if (!sections) return null;
  if (typeof sections === 'object') return sections;
  try {
    return JSON.parse(sections);
  } catch {
    return null;
  }
};

/**
 * GET /report-templates
 * Query param: combo_id
 * If combo_id > 0, verifies the requesting user is a combo member.
 * Returns all templates for that combo_id.
 */
const getTemplates = async (req, res) => {
  const userId = req.user.id;
  const comboId = parseInt(req.query.combo_id, 10) || 0;

  try {
    if (comboId > 0) {
      const members = await query(
        'SELECT id FROM combo_members WHERE combo_id = ? AND user_id = ?',
        [comboId, userId]
      );
      if (members.length === 0) {
        return res.status(403).json({
          success: false,
          message: '你不是该组合的成员'
        });
      }
    }

    const templates = await query(
      'SELECT * FROM report_templates WHERE combo_id = ?',
      [comboId]
    );

    const data = templates.map((t) => ({
      ...t,
      sections: parseSections(t.sections)
    }));

    res.json({ success: true, data });
  } catch (err) {
    logger.error(MODULE, 'GET_TEMPLATES', '获取汇报模板失败', { userId, comboId, error: err.message });
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

/**
 * PUT /report-templates
 * Body: { combo_id, type, sections }
 * If combo_id > 0, verifies the requesting user is combo owner or admin.
 * Upserts the template row.
 */
const upsertTemplate = async (req, res) => {
  const userId = req.user.id;
  const { combo_id, type, sections } = req.body;
  const comboId = parseInt(combo_id, 10) || 0;

  if (!type || !['daily', 'weekly'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'type 必须为 daily 或 weekly'
    });
  }

  if (!sections) {
    return res.status(400).json({
      success: false,
      message: 'sections 不能为空'
    });
  }

  try {
    if (comboId > 0) {
      const members = await query(
        "SELECT role FROM combo_members WHERE combo_id = ? AND user_id = ? AND role IN ('owner', 'admin')",
        [comboId, userId]
      );
      if (members.length === 0) {
        return res.status(403).json({
          success: false,
          message: '只有组合管理员或创建者才能编辑汇报模板'
        });
      }
    }

    const sectionsJson = typeof sections === 'object' ? JSON.stringify(sections) : sections;

    const existing = await query(
      'SELECT id FROM report_templates WHERE combo_id = ? AND type = ?',
      [comboId, type]
    );

    if (existing.length > 0) {
      await query(
        'UPDATE report_templates SET sections = ?, updated_at = NOW() WHERE id = ?',
        [sectionsJson, existing[0].id]
      );

      const updated = await query('SELECT * FROM report_templates WHERE id = ?', [existing[0].id]);

      res.json({
        success: true,
        message: '汇报模板更新成功',
        data: { ...updated[0], sections: parseSections(updated[0].sections) }
      });
    } else {
      const result = await query(
        'INSERT INTO report_templates (combo_id, type, sections, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
        [comboId, type, sectionsJson]
      );

      const inserted = await query('SELECT * FROM report_templates WHERE id = ?', [result.insertId]);

      res.json({
        success: true,
        message: '汇报模板创建成功',
        data: { ...inserted[0], sections: parseSections(inserted[0].sections) }
      });
    }
  } catch (err) {
    logger.error(MODULE, 'UPSERT_TEMPLATE', '更新汇报模板失败', { userId, comboId, type, error: err.message });
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

/**
 * POST /report-templates/defaults
 * Body: { combo_id }
 * Creates default daily and weekly templates if they don't already exist.
 */
const createDefaults = async (req, res) => {
  const userId = req.user.id;
  const comboId = parseInt(req.body.combo_id, 10) || 0;

  try {
    const defaults = [
      {
        type: 'daily',
        sections: JSON.stringify(['work_done', 'tomorrow_plan'])
      },
      {
        type: 'weekly',
        sections: JSON.stringify(['weekly_summary', 'next_plan'])
      }
    ];

    const created = [];

    for (const tmpl of defaults) {
      const existing = await query(
        'SELECT id FROM report_templates WHERE combo_id = ? AND type = ?',
        [comboId, tmpl.type]
      );

      if (existing.length === 0) {
        const result = await query(
          'INSERT INTO report_templates (combo_id, type, sections, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
          [comboId, tmpl.type, tmpl.sections]
        );
        created.push({ id: result.insertId, combo_id: comboId, type: tmpl.type, sections: parseSections(tmpl.sections) });
      } else {
        const row = await query('SELECT * FROM report_templates WHERE id = ?', [existing[0].id]);
        created.push({ ...row[0], sections: parseSections(row[0].sections) });
      }
    }

    res.json({
      success: true,
      message: '默认汇报模板已就绪',
      data: created
    });
  } catch (err) {
    logger.error(MODULE, 'CREATE_DEFAULTS', '创建默认汇报模板失败', { userId, comboId, error: err.message });
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

module.exports = {
  getTemplates,
  upsertTemplate,
  createDefaults
};
