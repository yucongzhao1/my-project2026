import { Component } from '@angular/core';
import { interval, take } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent {
  phoneNumber: string = '';
  captcha: string = '';
  isCountdownActive: boolean = false;
  countdown: number = 60;

  // 发送验证码
  sendCaptcha(): void {
    if (!this.phoneNumber) {
      alert('请输入手机号');
      return;
    }

    // 模拟发送验证码请求
    console.log(`向 ${this.phoneNumber} 发送验证码`);

    // 启动倒计时
    this.startCountdown();
  }

  // 倒计时逻辑
  startCountdown(): void {
    this.isCountdownActive = true;
    const countdown$ = interval(1000).pipe(take(this.countdown));

    countdown$.subscribe({
      next: value => {
        this.countdown = this.countdown - 1;
      },
      complete: () => {
        this.isCountdownActive = false;
        this.countdown = 60; // 重置倒计时
      }
    });
  }

  // 登录逻辑
  onLogin(): void {
    if (!this.phoneNumber || !this.captcha) {
      alert('请填写完整信息');
      return;
    }

    // 模拟登录请求
    console.log(`手机号: ${this.phoneNumber}, 验证码: ${this.captcha}`);
    alert('登录成功！');
  }
}
