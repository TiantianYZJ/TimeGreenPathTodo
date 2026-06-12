# 组合协作 SKILL

## 业务流程
1. 用户意图「查看组合」→ listCombos → 渲染 combo-card
2. 用户意图「查看组合内待办」→ getComboDetail → 渲染 shared-todo-card
3. 用户意图「完成共享待办」→ completeSharedTodo → 告知结果
4. 用户意图「查看成员」→ listMembers → 展示成员列表

## 业务约束
- 共享组合分为 owner/admin/member 三种角色
- 只有 owner/admin 可以管理待办，member 只能完成分配的任务
