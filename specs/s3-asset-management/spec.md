# S3 Asset Management Spec

## Goal

用户能在制作画布中管理角色、角色形态、场景、道具、参考图和全景资产，并把资产绑定到镜头或画布节点。

## Scope

- Asset metadata CRUD.
- Upload/reference file binding.
- Character and CharacterForm data.
- Asset drawer / frame state.

## Acceptance

- 用户能创建角色、场景、道具和参考素材。
- 上传文件能生成私有对象存储 URI 和 Asset 记录。
- 镜头能引用角色形态和资产。
- 前端 asset drawer 和 React Flow node 状态同步。

## Out of Scope

- 正式跨项目资产市场。
- 团队权限。
