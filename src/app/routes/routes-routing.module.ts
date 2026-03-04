import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { startPageGuard } from '@core';
import { SimpleGuard } from '@delon/auth';
import { environment } from '@env/environment';

import { LoginComponent } from './login/login.component';

// layout
// import { LayoutBasicComponent } from '../layout/basic/basic.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  // {
  //   path: '',
  //   component: LayoutBasicComponent,
  //   canActivate: [startPageGuard, SimpleGuard],
  //   children: [
  //     { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
  //     // { path: 'dashboard', component: DashboardComponent, data: { title: '仪表盘', titleI18n: 'dashboard' } },
  //     // { path: 'exception', loadChildren: () => import('./exception/exception.module').then(m => m.ExceptionModule) }
  //     // 业务子模块
  //     // { path: 'widgets', loadChildren: () => import('./widgets/widgets.module').then(m => m.WidgetsModule) },
  //   ]
  // },
  // 单页不包裹Layout
  // { path: 'passport/callback/:type', component: CallbackComponent },
  { path: '**', redirectTo: 'exception/404' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: environment.useHash,
      // NOTICE: If you use `reuse-tab` component and turn on keepingScroll you can set to `disabled`
      // Pls refer to https://ng-alain.com/components/reuse-tab
      scrollPositionRestoration: 'top'
    })
  ],
  exports: [RouterModule]
})
export class RouteRoutingModule {}
