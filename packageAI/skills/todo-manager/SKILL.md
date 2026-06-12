# 待办管理 SKILL

## 业务流程
1. 用户意图「创建待办」→ createTodo → 用户确认 → 渲染 todo-form-card
2. 用户意图「查看待办」→ listTodos → 渲染 todo-list-card
3. 用户意图「完成/取消完成」→ completeTodo → 告知结果
4. 用户意图「编辑待办」→ 先 listTodos → 用户选择 → updateTodo → 告知结果
5. 用户意图「删除待办」→ 先 listTodos → 用户选择 → deleteTodo → 告知结果
6. 用户意图「搜索待办」→ searchTodos → 渲染搜索结果

## 接口依赖关系
- updateTodo 需要先从 listTodos 获取 todoId
- completeTodo 需要先从 listTodos 获取 todoId
- deleteTodo 需要先从 listTodos 获取 todoId

## 业务约束
- 删除操作为软删除，不可逆，30天后自动清理
- 修改时 version 自动递增
