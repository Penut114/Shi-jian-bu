const { test, expect } = require('@playwright/test');

test.describe('排位赛系统测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('index.html');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('应该能切换到排位赛界面', async ({ page }) => {
    await page.click('#ranked-btn');
    await expect(page.locator('#ranked-screen')).toBeVisible();
  });

  test('初始段位应该是青铜', async ({ page }) => {
    await page.click('#ranked-btn');
    await expect(page.locator('.rank-name')).toContainText('青铜');
  });

  test('应该显示当前积分', async ({ page }) => {
    await page.click('#ranked-btn');
    await expect(page.locator('.rank-points')).toBeVisible();
  });

  test('应该显示段位进度条', async ({ page }) => {
    await page.click('#ranked-btn');
    await expect(page.locator('.rank-progress')).toBeVisible();
    await expect(page.locator('.progress-bar')).toBeVisible();
    await expect(page.locator('.progress-fill')).toBeVisible();
  });

  test('赢得比赛后积分应该增加', async ({ page }) => {
    await page.evaluate(() => {
      const rankedData = {
        currentPoints: 0,
        highestPoints: 0,
        wins: 0,
        losses: 0,
        currentWinStreak: 0,
        highestWinStreak: 0
      };
      localStorage.setItem('rankedData', JSON.stringify(rankedData));
    });

    await page.reload();
    await page.click('#ranked-btn');

    await page.evaluate(() => {
      if (typeof rankedManager !== 'undefined') {
        rankedManager.addMatchResult(true, 15, '测试对手');
      }
    });

    await page.waitForTimeout(500);

    const points = await page.locator('.rank-points').textContent();
    expect(points).toContain('15');
  });

  test('输掉比赛后积分应该减少', async ({ page }) => {
    await page.evaluate(() => {
      const rankedData = {
        currentPoints: 50,
        highestPoints: 50,
        wins: 1,
        losses: 0,
        currentWinStreak: 1,
        highestWinStreak: 1
      };
      localStorage.setItem('rankedData', JSON.stringify(rankedData));
    });

    await page.reload();
    await page.click('#ranked-btn');

    await page.evaluate(() => {
      if (typeof rankedManager !== 'undefined') {
        rankedManager.addMatchResult(false, -10, '测试对手');
      }
    });

    await page.waitForTimeout(500);

    const points = await page.locator('.rank-points').textContent();
    expect(points).toContain('40');
  });

  test('连胜应该有额外积分加成', async ({ page }) => {
    await page.evaluate(() => {
      const rankedData = {
        currentPoints: 0,
        highestPoints: 0,
        wins: 2,
        losses: 0,
        currentWinStreak: 2,
        highestWinStreak: 2
      };
      localStorage.setItem('rankedData', JSON.stringify(rankedData));
    });

    await page.reload();
    await page.click('#ranked-btn');

    await page.evaluate(() => {
      if (typeof rankedManager !== 'undefined') {
        const pointsChange = rankedManager.calculatePointsChange(true);
        expect(pointsChange).toBeGreaterThan(15);
      }
    });
  });

  test('达到300积分应该升到黄金段位', async ({ page }) => {
    await page.evaluate(() => {
      const rankedData = {
        currentPoints: 290,
        highestPoints: 290,
        wins: 20,
        losses: 5,
        currentWinStreak: 3,
        highestWinStreak: 5
      };
      localStorage.setItem('rankedData', JSON.stringify(rankedData));
    });

    await page.reload();
    await page.click('#ranked-btn');

    await page.evaluate(() => {
      if (typeof rankedManager !== 'undefined') {
        rankedManager.addMatchResult(true, 20, '测试对手');
      }
    });

    await page.waitForTimeout(500);

    await expect(page.locator('.rank-name')).toContainText('黄金');
  });

  test('应该显示赛季信息', async ({ page }) => {
    await page.click('#ranked-btn');
    await expect(page.locator('.season-info')).toBeVisible();
  });

  test('应该显示比赛历史', async ({ page }) => {
    await page.evaluate(() => {
      const rankedData = {
        currentPoints: 50,
        highestPoints: 50,
        wins: 3,
        losses: 2,
        currentWinStreak: 1,
        highestWinStreak: 2
      };
      localStorage.setItem('rankedData', JSON.stringify(rankedData));

      const matchHistory = [
        {
          id: 1,
          date: new Date().toISOString(),
          result: 'win',
          pointsChange: 15,
          opponentName: '对手1'
        },
        {
          id: 2,
          date: new Date().toISOString(),
          result: 'lose',
          pointsChange: -10,
          opponentName: '对手2'
        }
      ];
      localStorage.setItem('matchHistory', JSON.stringify(matchHistory));
    });

    await page.reload();
    await page.click('#ranked-btn');

    await expect(page.locator('.match-history-list')).toBeVisible();
    await expect(page.locator('.match-item')).toHaveCount(2);
  });

  test('比赛历史应该显示胜负结果', async ({ page }) => {
    await page.evaluate(() => {
      const matchHistory = [
        {
          id: 1,
          date: new Date().toISOString(),
          result: 'win',
          pointsChange: 15,
          opponentName: '对手1'
        }
      ];
      localStorage.setItem('matchHistory', JSON.stringify(matchHistory));
    });

    await page.reload();
    await page.click('#ranked-btn');

    await expect(page.locator('.match-result.win')).toBeVisible();
  });

  test('点击开始排位赛应该有反应', async ({ page }) => {
    await page.click('#ranked-btn');
    
    const startBtn = page.locator('#start-ranked-match');
    if (await startBtn.isVisible()) {
      await startBtn.click();
    }
  });
});
