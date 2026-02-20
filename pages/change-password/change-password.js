// 修改密码页面逻辑
const app = getApp();

Page({
  data: {
    // 密码输入
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    // 密码强度
    passwordStrength: {
      width: '0%',
      color: '#ccc',
      text: '请输入新密码'
    },
    // 提交状态
    submitting: false
  },

  // 生命周期函数
  onLoad() {
    console.log('修改密码页面加载');
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  },

  // 当前密码变更
  onCurrentPasswordChange(e) {
    const currentPassword = e.detail.value;
    this.setData({ currentPassword: currentPassword });
  },

  // 新密码变更
  onNewPasswordChange(e) {
    const newPassword = e.detail.value;
    this.setData({ newPassword: newPassword });
    // 检测密码强度
    this.checkPasswordStrength(newPassword);
  },

  // 确认新密码变更
  onConfirmPasswordChange(e) {
    const confirmPassword = e.detail.value;
    this.setData({ confirmPassword: confirmPassword });
  },

  // 检测密码强度
  checkPasswordStrength(password) {
    let strength = 0;
    
    // 长度检查
    if (password.length >= 6) strength += 1;
    if (password.length >= 10) strength += 1;
    
    // 复杂度检查
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // 计算强度百分比
    const strengthPercent = Math.min(Math.floor((strength / 6) * 100), 100);
    
    // 设置强度信息
    let strengthInfo = {
      width: `${strengthPercent}%`,
      color: '#ccc',
      text: '请输入新密码'
    };
    
    if (strengthPercent >= 80) {
      strengthInfo = {
        width: '100%',
        color: '#4CAF50',
        text: '强'
      };
    } else if (strengthPercent >= 50) {
      strengthInfo = {
        width: '66%',
        color: '#FFC107',
        text: '中'
      };
    } else if (strengthPercent > 0) {
      strengthInfo = {
        width: '33%',
        color: '#F44336',
        text: '弱'
      };
    }
    
    this.setData({ passwordStrength: strengthInfo });
  },

  // 提交修改密码
  submitChangePassword() {
    if (this.data.submitting) return;
    
    // 验证输入
    if (!this.data.currentPassword) {
      wx.showToast({ title: '请输入当前密码', icon: 'none' });
      return;
    }
    
    if (!this.data.newPassword) {
      wx.showToast({ title: '请输入新密码', icon: 'none' });
      return;
    }
    
    if (this.data.newPassword !== this.data.confirmPassword) {
      wx.showToast({ title: '两次输入的密码不一致', icon: 'none' });
      return;
    }
    
    if (this.data.newPassword.length < 6) {
      wx.showToast({ title: '新密码长度至少6位', icon: 'none' });
      return;
    }
    
    this.setData({ submitting: true });
    wx.showLoading({ title: '修改中...' });
    
    // 模拟调用后端API修改密码
    setTimeout(() => {
      wx.hideLoading();
      this.setData({ submitting: false });
      
      wx.showToast({ title: '密码修改成功', icon: 'success' });
      setTimeout(() => {
        this.navigateBack();
      }, 1000);
    }, 1500);
  }
});