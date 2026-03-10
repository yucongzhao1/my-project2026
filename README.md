## --configuration production作用：
 * 1. 指定本次构建使用的「预定义配置集」angular 会根据你指定的配置名（如 production/beta），加载 angular.json 中对应的构建规则，实现「一套代码、多环境 / 多配置构建」（比如生产环境压缩代码、测试环境保留日志、beta 环境指向测试接口） 

 -configuration 可简写为 -c，

## "build": "node --max_old_space_size=8048 ./node_modules/@angular/cli/bin/ng build --configuration=production && node obfuscate.js",
./node_modules/@angular/cli/bin/ng  直接调用本地安装的 Angular CLI（避免全局 CLI 版本不一致
- npm install javascript-obfuscator --save-dev 在项目跟目录中安装obfuscator

```js

"build": "node --max_old_space_size=8048 ./node_modules/@angular/cli/bin/ng build --configuration=production && node obfuscate.js", 简化为如下

"scripts": {
  "ng": "node --max_old_space_size=8048 ./node_modules/@angular/cli/bin/ng",
  "build": "npm run ng build -- --configuration=production && node obfuscate.js"
}

```

## ng serve -o --hmr
启动 Angular 开发服务器：
- s：serve 的简写，启动热重载的开发服务器；
- -o：启动后自动打开浏览器；
启动热模块替换（HMR） 的开发服务器：
- --hmr：热重载升级，修改代码后无需刷新页面，直接替换模块（保留页面状态）；

## "lint-staged": {
    "(src)/**/*.{html,ts}": [
      "eslint --fix"
    ],
    "(src)/**/*.less": [
      "npm run lint:style"
    ]
    }
工作原理
    A[开发者执行 git add 文件名] --> B[文件进入 Git 暂存区]
    B --> C[执行 git commit]
    C --> D[Husky 触发 pre-commit 钩子]
    D --> E[lint-staged 读取配置规则]
    E --> F1[匹配暂存区的 ts/html 文件 → 执行 eslint --fix]
    E --> F2[匹配暂存区的 less 文件 → 执行 npm run lint:style]
    F1 & F2 --> G{校验是否通过？}
    G -->|通过| H[完成 commit]
    G -->|失败| I[终止 commit，提示错误]
- 全量 lint（npm run lint）检查所有文件，大型项目耗时久

- 和 lint:ts 的关系：
lint:ts 是 ng lint --fix（Angular CLI 封装的 ESLint 检查），作用于所有 ts 文件；
lint-staged 中的 eslint --fix 仅作用于暂存区的 ts/html 文件，核心规则一致，只是范围更小。

## git 钩子函数
钩子名称	触发时机	核心用途	实战场景
pre-commit	执行 git commit 后、生成提交记录前	校验即将提交的代码	1. 执行 lint-staged 检查暂存区代码；2. 禁止提交调试代码（如 console.log）；3. 执行单元测试（仅测试修改的文件）
commit-msg	提交信息输入后、提交完成前	校验提交信息格式	1. 强制提交信息符合规范（如 feat: 新增XX功能）；2. 禁止空提交、敏感关键词（如 临时修改）；3. 关联需求编号（如 feat(XXX-123): 新增XX）
pre-push	执行 git push 后、推送到远程前	校验即将推送的代码	1. 执行全量单元测试 / 集成测试；2. 检查代码覆盖率是否达标；3. 禁止推送未合并的开发分支到主分支
post-commit	提交完成后	提交后的收尾操作	1. 自动生成提交日志；2. 通知团队成员（如钉钉 / 飞书消息）；3. 更新项目文档
pre-merge-commit	执行 git merge 后、合并提交前	校验合并的代码	1. 检查合并分支的代码规范；2. 避免合并冲突代码到主分支

## "prepare": "husky install" 初始化 husky， 形成.husky 目录
简单来说：git commit → Git 触发钩子 → husky 接管钩子 → 调用 lint-staged → 执行 lint 规则。
- 关键要点
    husky 是 Git 钩子的「管理器」，负责接管和执行钩子脚本；
    lint-staged 是「暂存区文件的 lint 工具」，仅检查修改的文件，提升效率；
    整个流程的核心是「Git 钩子的触发时机 + 工具的协作」，最终实现「提交前自动校验代码规范」的工程化目标

- 核心逻辑：lint-staged 的配置查找流程
    graph TD
    A[执行 npx lint-staged] --> B[读取命令行参数：是否指定配置文件（如 --config .lintstagedrc）]
    B --> C{指定了配置文件？}
    C -->|是| D[加载指定的配置文件]
    C -->|否| E[扫描项目根目录，按优先级查找默认配置文件]
    E --> E1[先找 .lintstagedrc/.lintstagedrc.json/.lintstagedrc.yml（优先级最高）]
    E --> E2[找不到则找 lint-staged.config.js/lint-staged.config.cjs（其次）]
    E --> E3[找不到则找 package.json 中的 lint-staged 字段（默认）]
    E --> E4[都找不到则使用默认空配置（无操作）]
    D & E1 & E2 & E3 & E4 --> F[解析配置规则，执行对应操作]

- lint-staged 内部通过 cosmiconfig 这个库实现配置查找
-  如何确认 lint-staged 读取的是哪个配置 npx lint-staged --debug 查看配置查找过程