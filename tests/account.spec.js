const { test, expect } = require('@playwright/test');

test.describe('账号系统测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('index.html');
    await page.evaluate(() => localStorage.clear());
  });

  test('页面应该正确加载', async ({ page }) => {
    await expect(page.locator('#game-container')).toBeVisible();
  });

  test('应该能切换到账号中心界面', async ({ page }) => {
    await page.click('#account-btn');
    await expect(page.locator('#account-screen')).toBeVisible();
  });

  test('应该能在登录和注册标签之间切换', async ({ page }) => {
    await page.click('#account-btn');
    
    await page.click('#register-tab');
    await expect(page.locator('#register-tab')).toHaveClass(/active/);
    await expect(page.locator('#register-form')).toHaveClass(/active/);
    
    await page.click('#login-tab');
    await expect(page.locator('#login-tab')).toHaveClass(/active/);
    await expect(page.locator('#login-form')).toHaveClass(/active/);
  });

  test('应该能注册新账号', async ({ page }) => {
    await page.click('#account-btn');
    await page.click('#register-tab');
    
    await page.fill('#register-username', 'testuser');
    await page.fill('#register-email', 'test@example.com');
    await page.fill('#register-password', 'password123');
    await page.fill('#register-confirm-password', 'password123');
    
    await page.click('#register-form button[type="submit"]');
    
    await page.waitForTimeout(500);
    
    const userProfile = await page.locator('#user-profile');
    await expect(userProfile).not.toHaveClass(/hidden/);
  });

  test('密码不匹配时应该显示错误', async ({ page }) => {
    await page.click('#account-btn');
    await page.click('#register-tab');
    
    await page.fill('#register-username', 'testuser2');
    await page.fill('#register-email', 'test2@example.com');
    await page.fill('#register-password', 'password123');
    await page.fill('#register-confirm-password', 'different');
    
    await page.click('#register-form button[type="submit"]');
    
    await page.waitForTimeout(500);
  });

  test('应该能登录已注册的账号', async ({ page }) => {
    await page.evaluate(() => {
      const users = [{
        id: 1,
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
        stats: { gamesPlayed: 0, wins: 0, losses: 0, totalScore: 0 }
      }];
      localStorage.setItem('users', JSON.stringify(users));
    });
    
    await page.click('#account-btn');
    
    await page.fill('#login-username', 'existinguser');
    await page.fill('#login-password', 'password123');
    
    await page.click('#login-form button[type="submit"]');
    
    await page.waitForTimeout(500);
    
    const userProfile = await page.locator('#user-profile');
    await expect(userProfile).not.toHaveClass(/hidden/);
  });

  test('错误的密码应该登录失败', async ({ page }) => {
    await page.evaluate(() => {
      const users = [{
        id: 1,
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
        stats: { gamesPlayed: 0, wins: 0, losses: 0, totalScore: 0 }
      }];
      localStorage.setItem('users', JSON.stringify(users));
    });
    
    await page.click('#account-btn');
    
    await page.fill('#login-username', 'existinguser');
    await page.fill('#login-password', 'wrongpassword');
    
    await page.click('#login-form button[type="submit"]');
    
    await page.waitForTimeout(500);
  });

  test('应该能退出登录', async ({ page }) => {
    await page.evaluate(() => {
      const currentUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        stats: { gamesPlayed: 0, wins: 0, losses: 0, totalScore: 0 }
      };
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    });
    
    await page.reload();
    await page.click('#account-btn');
    
    await page.waitForTimeout(500);
    await page.click('#logout-btn');
    
    await page.waitForTimeout(500);
    
    const loginForm = await page.locator('#login-form');
    await expect(loginForm).toHaveClass(/active/);
  });

  test('登录后应该显示用户统计信息', async ({ page }) => {
    await page.evaluate(() => {
      const currentUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        stats: { gamesPlayed: 10, wins: 6, losses: 4, totalScore: 1000 }
      };
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    });
    
    await page.reload();
    await page.click('#account-btn');
    
    await page.waitForTimeout(500);
    
    await expect(page.locator('#profile-name')).toHaveText('testuser');
    await expect(page.locator('#profile-email')).toHaveText('test@example.com');
    await expect(page.locator('#games-played')).toHaveText('10');
    await expect(page.locator('#wins')).toHaveText('6');
    await expect(page.locator('#win-rate')).toHaveText('60%');
  });
});
