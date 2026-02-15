const { test, expect } = require('@playwright/test');

test.describe('成就系统测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('index.html');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('应该能切换到成就系统界面', async ({ page }) => {
    await page.click('#achievements-btn');
    await expect(page.locator('#achievements-screen')).toBeVisible();
  });

  test('应该显示成就统计信息', async ({ page }) => {
    await page.click('#achievements-btn');
    await expect(page.locator('#achievement-total')).toBeVisible();
    await expect(page.locator('#achievement-unlocked')).toBeVisible();
    await expect(page.locator('#achievement-points')).toBeVisible();
  });

  test('初始应该显示所有成就', async ({ page }) => {
    await page.click('#achievements-btn');
    await expect(page.locator('.achievements-grid')).toBeVisible();
  });

  test('初始所有成就应该是锁定状态', async ({ page }) => {
    await page.click('#achievements-btn');
    const cards = await page.locator('.achievement-card').all();
    for (const card of cards) {
      await expect(card).toHaveClass(/locked/);
    }
  });

  test('应该显示成就筛选按钮', async ({ page }) => {
    await page.click('#achievements-btn');
    await expect(page.locator('.achievements-filter')).toBeVisible();
    await expect(page.locator('.filter-btn')).toHaveCountGreaterThan(0);
  });

  test('应该能按已解锁筛选成就', async ({ page }) => {
    await page.click('#achievements-btn');
    
    const unlockedFilter = page.locator('[data-filter="unlocked"]');
    if (await unlockedFilter.isVisible()) {
      await unlockedFilter.click();
      await expect(unlockedFilter).toHaveClass(/active/);
    }
  });

  test('应该能按未解锁筛选成就', async ({ page }) => {
    await page.click('#achievements-btn');
    
    const lockedFilter = page.locator('[data-filter="locked"]');
    if (await lockedFilter.isVisible()) {
      await lockedFilter.click();
      await expect(lockedFilter).toHaveClass(/active/);
    }
  });

  test('应该能按稀有度筛选成就', async ({ page }) => {
    await page.click('#achievements-btn');
    
    const rareFilter = page.locator('[data-filter="rare"]');
    if (await rareFilter.isVisible()) {
      await rareFilter.click();
      await expect(rareFilter).toHaveClass(/active/);
    }
  });

  test('赢得一场比赛应该解锁初次胜利成就', async ({ page }) => {
    await page.evaluate(() => {
      const rankedData = {
        currentPoints: 15,
        highestPoints: 15,
        wins: 1,
        losses: 0,
        currentWinStreak: 1,
        highestWinStreak: 1
      };
      localStorage.setItem('rankedData', JSON.stringify(rankedData));
    });

    await page.reload();
    await page.click('#achievements-btn');

    await page.evaluate(() => {
      if (typeof achievementManager !== 'undefined') {
        achievementManager.checkAchievements();
      }
    });

    await page.waitForTimeout(500);

    const firstWinCard = page.locator('.achievement-card').filter({ hasText: '初次胜利' });
    await expect(firstWinCard).toHaveClass(/unlocked/);
  });

  test('完成10场比赛应该解锁新手入门成就', async ({ page }) => {
    await page.evaluate(() => {
      const rankedData = {
        currentPoints: 100,
        highestPoints: 100,
        wins: 5,
        losses: 5,
        currentWinStreak: 0,
        highestWinStreak: 3
      };
      localStorage.setItem('rankedData', JSON.stringify(rankedData));
    });

    await page.reload();
    await page.click('#achievements-btn');

    await page.evaluate(() => {
      if (typeof achievementManager !== 'undefined') {
        achievementManager.checkAchievements();
      }
    });

    await page.waitForTimeout(500);

    const beginnerCard = page.locator('.achievement-card').filter({ hasText: '新手入门' });
    await expect(beginnerCard).toHaveClass(/unlocked/);
  });

  test('三连胜应该解锁三连胜成就', async ({ page }) => {
    await page.evaluate(() => {
      const rankedData = {
        currentPoints: 50,
        highestPoints: 50,
        wins: 3,
        losses: 0,
        currentWinStreak: 3,
        highestWinStreak: 3
      };
      localStorage.setItem('rankedData', JSON.stringify(rankedData));
    });

    await page.reload();
    await page.click('#achievements-btn');

    await page.evaluate(() => {
      if (typeof achievementManager !== 'undefined') {
        achievementManager.checkAchievements();
      }
    });

    await page.waitForTimeout(500);

    const winStreakCard = page.locator('.achievement-card').filter({ hasText: '三连胜' });
    await expect(winStreakCard).toHaveClass(/unlocked/);
  });

  test('达到300积分应该解锁黄金选手成就', async ({ page }) => {
    await page.evaluate(() => {
      const rankedData = {
        currentPoints: 300,
        highestPoints: 300,
        wins: 20,
        losses: 5,
        currentWinStreak: 2,
        highestWinStreak: 5
      };
      localStorage.setItem('rankedData', JSON.stringify(rankedData));
    });

    await page.reload();
    await page.click('#achievements-btn');

    await page.evaluate(() => {
      if (typeof achievementManager !== 'undefined') {
        achievementManager.checkAchievements();
      }
    });

    await page.waitForTimeout(500);

    const goldCard = page.locator('.achievement-card').filter({ hasText: '黄金选手' });
    await expect(goldCard).toHaveClass(/unlocked/);
  });

  test('解锁成就后应该增加总积分', async ({ page }) => {
    await page.evaluate(() => {
      const rankedData = {
        currentPoints: 15,
        highestPoints: 15,
        wins: 1,
        losses: 0,
        currentWinStreak: 1,
        highestWinStreak: 1
      };
      localStorage.setItem('rankedData', JSON.stringify(rankedData));
    });

    await page.reload();
    await page.click('#achievements-btn');

    const initialPoints = await page.locator('#achievement-points').textContent();

    await page.evaluate(() => {
      if (typeof achievementManager !== 'undefined') {
        achievementManager.checkAchievements();
      }
    });

    await page.waitForTimeout(500);

    const newPoints = await page.locator('#achievement-points').textContent();
    expect(parseInt(newPoints)).toBeGreaterThan(parseInt(initialPoints));
  });

  test('未解锁的成就应该显示进度条', async ({ page }) => {
    await page.click('#achievements-btn');
    
    const lockedCards = page.locator('.achievement-card.locked');
    const count = await lockedCards.count();
    
    if (count > 0) {
      const firstLockedCard = lockedCards.first();
      await expect(firstLockedCard.locator('.achievement-progress')).toBeVisible();
    }
  });

  test('成就卡片应该显示奖励信息', async ({ page }) => {
    await page.click('#achievements-btn');
    const firstCard = page.locator('.achievement-card').first();
    await expect(firstCard.locator('.achievement-reward')).toBeVisible();
  });

  test('已解锁的成就应该显示已解锁标识', async ({ page }) => {
    await page.evaluate(() => {
      const rankedData = {
        currentPoints: 15,
        highestPoints: 15,
        wins: 1,
        losses: 0,
        currentWinStreak: 1,
        highestWinStreak: 1
      };
      localStorage.setItem('rankedData', JSON.stringify(rankedData));
      
      const unlockedAchievements = ['first_win'];
      localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievements));
      localStorage.setItem('achievementPoints', '100');
    });

    await page.reload();
    await page.click('#achievements-btn');

    const unlockedCard = page.locator('.achievement-card.unlocked').first();
    await expect(unlockedCard.locator('.achievement-unlock-date')).toBeVisible();
  });

  test('应该能正确统计解锁成就数量', async ({ page }) => {
    await page.evaluate(() => {
      const unlockedAchievements = ['first_win', 'win_streak_3'];
      localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievements));
    });

    await page.reload();
    await page.click('#achievements-btn');

    await page.waitForTimeout(500);

    const unlockedCount = await page.locator('#achievement-unlocked').textContent();
    expect(parseInt(unlockedCount)).toBe(2);
  });
});
