 var fs = require('fs');
 var p = 'E:\\WechatDevelop\\TimeGreen Path Todo\\backend\\controllers\\comboController.js';
 var s = fs.readFileSync(p, 'utf8');
 
 // 1. INSERT shared_todos - add priority column and value
 s = s.replace(
   '(combo_id, creator_id, text, set_date, set_time, remarks, assign_type, created_at)',
   '(combo_id, creator_id, text, set_date, set_time, remarks, assign_type, priority, created_at)'
 );
 s = s.replace(
   "VALUES (?, ?, ?, ?, ?, ?, 'all', NOW())",
   "VALUES (?, ?, ?, ?, ?, ?, 'all', ?, NOW())"
 );
 s = s.replace(
   '[comboId, userId, todo.text, todo.set_date, todo.set_time, todo.remarks]',
   '[comboId, userId, todo.text, todo.set_date, todo.set_time, todo.remarks, todo.priority || \'p2\']'
 );
 
 // 2. Format shared todo return - add priority fallback
 s = s.replace(
   'images: images,\n            completedAt: todo.completed_at,',
   'images: images,\n            priority: todo.priority || \'p2\',\n            completedAt: todo.completed_at,'
 );
 
 fs.writeFileSync(p, s, 'utf8');
 console.log('comboController.js updated');
 console.log('Verifying...');
 s = fs.readFileSync(p, 'utf8');
 console.log('priority in INSERT:', s.includes('priority, created_at'));
 console.log('priority in format:', s.includes('priority: todo.priority'));
