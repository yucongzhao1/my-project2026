/* eslint-disable import/order */
import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { DelonACLModule } from '@delon/acl';
import { AlainThemeModule } from '@delon/theme';
import { AlainConfig, ALAIN_CONFIG } from '@delon/util/config';

import { throwIfAlreadyLoaded } from '@core';

import { environment } from '@env/environment';

// Please refer to: https://ng-alain.com/docs/global-config
// #region NG-ALAIN Config

const alainConfig: AlainConfig = {
  st: { modal: { size: 'lg' } },
  pageHeader: { homeI18n: 'home' },
  lodop: {
    /// 打印插件Lodop的授权码
    license: `A59B099A586B3851E0F0D7FDBF37B603`,
    licenseA: `C94CEE276DB2187AE6B65D56B3FC2848`
  },
  auth: { login_url: '/login' }
};

const alainModules: any[] = [AlainThemeModule.forRoot(), DelonACLModule.forRoot()];
// 将 alainConfig 绑定到 ALAIN_CONFIG 令牌，项目中任何组件都可通过 inject(ALAIN_CONFIG) 获取这些配置
const alainProvides = [{ provide: ALAIN_CONFIG, useValue: alainConfig }];

// #region reuse-tab
/**
 * 若需要[路由复用](https://ng-alain.com/components/reuse-tab)需要：
 * 1、在 `shared-delon.module.ts` 导入 `ReuseTabModule` 模块
 * 2、注册 `RouteReuseStrategy`
 * 3、在 `src/app/layout/default/default.component.html` 修改：
 *  ```html
 *  <section class="alain-default__content">
 *    <reuse-tab #reuseTab></reuse-tab>
 *    <router-outlet (activate)="reuseTab.activate($event)"></router-outlet>
 *  </section>
 *  ```
 */
// import { RouteReuseStrategy } from '@angular/router';
// import { ReuseTabService, ReuseTabStrategy } from '@delon/abc/reuse-tab';
// alainProvides.push({
//   provide: RouteReuseStrategy,
//   useClass: ReuseTabStrategy,
//   deps: [ReuseTabService],
// } as any);

// #endregion

// #endregion

// Please refer to: https://ng.ant.design/docs/global-config/en#how-to-use
// #region NG-ZORRO Config

import { NzConfig, NZ_CONFIG } from 'ng-zorro-antd/core/config';

const ngZorroConfig: NzConfig = {};

const zorroProvides = [{ provide: NZ_CONFIG, useValue: ngZorroConfig }];

// #endregion

@NgModule({
  imports: [...alainModules, ...(environment.modules || [])]
})
export class GlobalConfigModule {
  // 构造函数：检测模块是否被重复导入
  /**
   * 
   * @param parentModule @Optional()：表示 parentModule 可选（根模块导入时无父模块，不会报错）；
    @SkipSelf()：从父注入器查找 GlobalConfigModule，而非当前注入器；
   */
  constructor(@Optional() @SkipSelf() parentModule: GlobalConfigModule) {
    throwIfAlreadyLoaded(parentModule, 'GlobalConfigModule');
  }

  // 静态 forRoot 方法：根模块导入时提供全局配置
  static forRoot(): ModuleWithProviders<GlobalConfigModule> {
    return {
      ngModule: GlobalConfigModule,
      providers: [...alainProvides, ...zorroProvides]
    };
  }
  /**
   * Angular 约定：全局配置模块通过 forRoot() 提供 providers（服务 / 配置），确保只在根模块（AppModule）导入时初始化一次；
      返回 ModuleWithProviders：包含模块本身 + 全局配置 providers（NG-ALAIN + NG-ZORRO 配置）；
      子模块绝对不能调用 forRoot()，只能根模块调用
   */
}

/**
 * 写法	本质	核心作用forRoot ()	providers	的区别
imports: [GlobalConfigModule.forRoot()]	导入 Angular 模块（Module）	加载模块的代码、组件、指令，并执行模块 forRoot() 中定义的「全局配置 / 服务注册」
providers: [...INTERCEPTOR_PROVIDES]	注册依赖注入（DI）令牌	直接向当前模块的注入器注册服务、拦截器、配置令牌等，无需封装成模块
 */
