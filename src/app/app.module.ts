/* eslint-disable import/order */
/* eslint-disable import/no-duplicates */
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, Injector, LOCALE_ID, NgModule, Type } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { Observable } from 'rxjs';

// #region default language
// Reference: https://ng-alain.com/docs/i18n
import { default as ngLang } from '@angular/common/locales/zh';
import { DELON_LOCALE, zh_CN as delonLang } from '@delon/theme';
import { zhCN as dateLang } from 'date-fns/locale';
import { NZ_DATE_LOCALE, NZ_I18N, zh_CN as zorroLang } from 'ng-zorro-antd/i18n';
const LANG = {
  abbr: 'zh', // 语言缩写（中文）
  ng: ngLang, // Angular 核心中文语言包
  zorro: zorroLang, // NG-ZORRO 中文语言包
  date: dateLang, // NG-ZORRO 日期组件中文语言包
  delon: delonLang // Delon（NG-ALAIN）中文语言包
};
// register angular
import { registerLocaleData } from '@angular/common';
// // 注册 Angular 中文语言包
registerLocaleData(LANG.ng, LANG.abbr);
// 全局语言注入配置 LANG_PROVIDES
const LANG_PROVIDES = [
  // 1. 设置 Angular 全局默认语言为中文
  { provide: LOCALE_ID, useValue: LANG.abbr },
  // 2. 设置 NG-ZORRO 组件全局语言为中文
  { provide: NZ_I18N, useValue: LANG.zorro },
  // 3. 设置 NG-ZORRO 日期组件全局语言为中文
  { provide: NZ_DATE_LOCALE, useValue: LANG.date },
  // 4. 设置 Delon（NG-ALAIN）框架全局语言为中文
  { provide: DELON_LOCALE, useValue: LANG.delon }
];
// 总结
// 核心功能：统一配置 Angular、NG-ZORRO、Delon 框架的中文语言包，设置全局默认语言为中文；
// 关键步骤：
// 整合各框架语言包到 LANG 对象；
// 用 registerLocaleData 注册 Angular 核心语言包；
// 通过依赖注入提供 LOCALE_ID/NZ_I18N 等令牌，让语言配置全局生效；
// 扩展能力：替换语言包和缩写即可快速切换为其他语言（如英文）。

/**
 * registerLocaleData 注册与  LANG_PROVIDES注入 缺一不可
 * 前者是「给 Angular 提供语言 “素材”」，后者是「告诉框架 / 组件库该用哪个素材」
 * 1.分工不同：
      registerLocaleData：给 Angular 核心 “存语言规则”（素材）；
      LOCALE_ID：告诉 Angular 核心 “用哪个规则”（开关）；
      NZ_I18N/DELON_LOCALE：告诉第三方组件库 “用哪个语言包”（专属开关）。
    2.范围不同：
      registerLocaleData + LOCALE_ID 仅管 Angular 核心；
      NZ_I18N/DELON_LOCALE 管第三方框架，和 Angular 核心的配置互不影响。
    3，缺一不可：
      少了 registerLocaleData：Angular 核心找不到对应语言的规则，降级英文；
      少了 LOCALE_ID：Angular 核心用默认英文，注册的素材白搭；
      少了 NZ_I18N：NG-ZORRO 组件仍显示英文，和 Angular 核心的语言不一致
 */
// #endregion

// #endregion

// #region Http Interceptors
import { HTTP_INTERCEPTORS } from '@angular/common/http'; //Angular 提供的「HTTP 拦截器注入令牌」，是注册拦截器的核心标识；
import { DefaultInterceptor } from '@core'; // 主要处理通用业务（如请求加公共参数、统一错误处理、加载状态提示）；
import { SimpleInterceptor } from '@delon/auth'; // ：主要处理权限相关（如给请求自动加 Token、Token 过期跳转登录页）；
const INTERCEPTOR_PROVIDES = [
  // 注册 Delon 内置的权限拦截器
  { provide: HTTP_INTERCEPTORS, useClass: SimpleInterceptor, multi: true },
  // 注册项目自定义的通用拦截器
  { provide: HTTP_INTERCEPTORS, useClass: DefaultInterceptor, multi: true }
];
/**
 *   { provide: 指定要注入的令牌, useClass: 指定要注册的拦截器类, multi: 表示「允许多个拦截器绑定到同一个 HTTP_INTERCEPTORS 令牌」，如果设为 false，后注册的拦截器会覆盖前一个 },
 * 1. 执行顺序（重点）
 * 请求阶段：先经过 SimpleInterceptor → 再经过 DefaultInterceptor；
    响应阶段：先经过 DefaultInterceptor → 再经过 SimpleInterceptor；
    （可以理解为 “请求顺行，响应逆行”）
    拦截器	所属框架	核心功能	典型场景
  2. 两个拦截器的核心能力
    SimpleInterceptor（Delon 内置）	NG-ALAIN (@delon/auth)	
      1. 自动给请求头加 Token（从 localStorage/cookie 读取）；
      2. 拦截 401/403 错误（Token 过期 / 无权限），跳转登录页；
      3. 支持刷新 Token 逻辑；
      4. 忽略指定 URL（如登录接口）	权限校验、Token 管理
    DefaultInterceptor（自定义）	项目核心模块	
      1. 给所有请求加公共参数（如 appId、timestamp）；
      2. 统一处理响应错误（如 500 提示、接口返回的业务错误）；
      3. 全局加载状态（请求时显示 loading，响应后隐藏）；
      4. 请求 / 响应日志打印（开发环境）；
      5. 统一处理请求超时	业务逻辑、通用请求处理
 */
// #endregion

// #region global third module 预留的全局第三方模块数组（
const GLOBAL_THIRD_MODULES: Array<Type<void>> = [];
// #endregion

// #region Startup Service
import { StartupService } from '@core';
/**：在 Angular 应用初始化完成前，先执行 StartupService 的 load() 方法（比如加载全局配置、用户信息、权限数据等），确保应用启动前必备的基础数据已加载完成 */
export function StartupServiceFactory(startupService: StartupService): () => Observable<void> {
  return () => startupService.load();
}

// APPINIT_PROVIDES：核心配置 —— 利用 Angular 的 APP_INITIALIZER 令牌，在应用启动时先执行 StartupService.load() 方法，完成初始化数据加载。
const APPINIT_PROVIDES = [
  // 1. 注册 StartupService，使其可被依赖注入  先注册 StartupService 到依赖注入系统，确保工厂函数能获取到其实例
  StartupService,
  {
    // 2. 指定要注入的令牌为 APP_INITIALIZER（Angular 应用初始化令牌）
    provide: APP_INITIALIZER,
    // 3. 使用上面定义的工厂函数作为初始化逻辑 Angular 会在启动时调用这个函数
    useFactory: StartupServiceFactory,
    // 4. 声明工厂函数的依赖（Angular 会先创建 StartupService 实例，再传入工厂函数）
    deps: [StartupService],
    // 5. 允许注册多个 APP_INITIALIZER（多初始化逻辑并行/串行执行）
    multi: true
  }
];
// #endregion

/**
 * APP_INITIALIZER 的核心行为（应用启动流程）
      Angular 应用的启动流程会因这段配置发生变化：
      应用启动 → Angular 初始化依赖注入系统；
      检测到 APP_INITIALIZER 提供者 → 执行 StartupServiceFactory 工厂函数；
      工厂函数调用 startupService.load() → 执行异步初始化逻辑（如请求 /api/config 加载全局配置）；
      Angular 会等待 load() 返回的 Observable 完成（complete） 后，才继续启动应用（渲染根组件、初始化路由等）；
      若 load() 失败（抛出错误），应用会启动失败，停留在加载状态。
 */

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { GlobalConfigModule } from './global-config.module';
import { LayoutModule } from './layout/layout.module';
import { RoutesModule } from './routes/routes.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, //Angular 浏览器端的 “基础引擎”
    // BrowserAnimationsModule 是 Angular 动画系统在浏览器端的实现模块，导入它才能启用 Angular 的 @angular/animations 功能（如组件过渡动画、状态动画等）
    BrowserAnimationsModule,
    HttpClientModule,
    GlobalConfigModule.forRoot(),
    CoreModule, // 单例服务、核心组件、防重复逻辑
    SharedModule,
    LayoutModule,
    RoutesModule,
    NzMessageModule,
    NzNotificationModule,
    ...GLOBAL_THIRD_MODULES
  ],
  providers: [...LANG_PROVIDES, ...INTERCEPTOR_PROVIDES, ...APPINIT_PROVIDES],
  bootstrap: [AppComponent]
})
export class AppModule {}

/**
 * 配置项	核心作用	通俗理解
declarations	
  声明当前模块私有的组件、指令、管道（只有声明后才能在模块内使用）	
  模块的 “本地资产清单”—— 告诉 Angular：这个模块里有哪些自己写的组件 / 指令 / 管道
imports	
  导入当前模块需要依赖的其他 Angular 模块（如第三方模块、自定义模块）	
  模块的 “依赖包”—— 告诉 Angular：这个模块需要用到其他模块的功能（如 CommonModule 的 NgIf）
providers	
  注册当前模块的依赖注入令牌（服务、拦截器、配置令牌等）	
  模块的 “服务仓库”—— 告诉 Angular：这个模块提供哪些可注入的服务 / 配置，供组件 / 其他服务使用
bootstrap	
  指定应用的根组件（仅根模块 AppModule 可用）	
  应用的 “启动入口”—— 告诉 Angular：启动应用时先渲染哪个组件（通常是 AppComponent）

记忆口诀
  声明（declarations）：我的资产（组件 / 指令 / 管道）；
  导入（imports）：借别人的工具（其他模块）；
  提供（providers）：共享的服务（可注入的依赖）；
  启动（bootstrap）：应用的起点（根组件）
 */
