'use strict';

const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');
const taskList = document.querySelector('.task-list');
const expInput = document.querySelector('#exp-input');
const expText = document.querySelector('.exp-text');
const expFill = document.querySelector('.exp-fill');
const level = document.querySelector('.level');
const dailyExpText = document.querySelector('.daily-exp-text');
const achievementRate = document.querySelector('.achievement-rate');
const streakText = document.querySelector('.streak-text');

const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
const dailyExpLimit = 100;
const dailyBonusExp = 20;

let currentExp = Number(localStorage.getItem('currentExp')) || 0;
let currentLevel = Number(localStorage.getItem('currentLevel')) || 1;
let requiredExp = 100 + (currentLevel * currentLevel * 10);
let dailyExp = Number(localStorage.getItem('dailyExp')) || 0;
let dailyExpDate = localStorage.getItem('dailyExpDate');
let totalExp = Number(localStorage.getItem('totalExp')) || 0;
let trackingStartDate = localStorage.getItem('trackingStartDate');
let streak = Number(localStorage.getItem('streak')) || 0;

const percentage = (currentExp / requiredExp) * 100;

expText.textContent = `EXP ${currentExp} / ${requiredExp}`;
level.textContent = `Lv.${currentLevel}`;
expFill.style.width = `${percentage}%`;
dailyExpText.textContent = `Daily EXP ${dailyExp} / ${dailyExpLimit}`;
streakText.textContent = `連続達成日数 ${streak}日`;

function getToday() {
  return new Date().toLocaleDateString('sv-SE');
}

function getYesterday() {
  const yesterday = new Date();

  yesterday.setDate(yesterday.getDate() - 1);

  return yesterday.toLocaleDateString('sv-SE');
}

function updateStreak() {
  if (dailyExp === dailyExpLimit && getYesterday() === dailyExpDate) {
    streak++;
  } else {
    streak = 0;
  }

  localStorage.setItem('streak', streak);

  streakText.textContent = `連続達成日数 ${streak}日`;
}

function resetDailyExp(today) {
  if (dailyExpDate !== today) {
    updateStreak();

    dailyExp = 0;
    dailyExpDate = today;

    localStorage.setItem('dailyExp', dailyExp);
    localStorage.setItem('dailyExpDate', dailyExpDate);

    dailyExpText.textContent = `Daily EXP ${dailyExp} / ${dailyExpLimit}`;

    return true;
  }

  return false;
}

resetDailyExp(getToday());

if (!trackingStartDate) {
  trackingStartDate = getToday();

  localStorage.setItem('trackingStartDate', trackingStartDate);
}

function calculateRecordDays(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  const difference = end - start;

  return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
}

function updateAchievementRate() {
  const recordDays = calculateRecordDays(trackingStartDate, getToday()) - 1;
  const completedTotalExp = totalExp - dailyExp;
  const totalTargetExp = recordDays * dailyExpLimit;
  const habitAchievementRate = totalTargetExp === 0 ? 0 : Math.floor((completedTotalExp / totalTargetExp) * 100);

  achievementRate.textContent = `累計達成率 ${habitAchievementRate}%`;
}

updateAchievementRate();

function createTask(task) {
  const today = getToday();

  if (task.lastClaimDate !== today) {
    task.completed = false;
  }

  const li = document.createElement('li');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;

  const taskName = document.createElement('span');
  taskName.textContent = task.task;

  if (task.completed) {
    taskName.classList.add('completed');
  }

  const exp = document.createElement('span');
  exp.textContent = `${task.exp}EXP`;
  exp.classList.add('task-exp');

  const achievementCount = document.createElement('span');
  achievementCount.textContent = `${task.achievementCount}回`;
  achievementCount.classList.add('task-achievementCount');

  checkbox.addEventListener('change', () => {
    const today = getToday();

    const wasDailyExpReset = resetDailyExp(today);

    if (wasDailyExpReset) {
      updateAchievementRate();
    }

    if (
      checkbox.checked &&
      task.lastClaimDate !== today &&
      dailyExp + task.exp > dailyExpLimit
    ) {
      alert(`1日に獲得できるEXPは${dailyExpLimit}までです。`);

      checkbox.checked = false;
    }

    task.completed = checkbox.checked;

    taskName.classList.toggle('completed', task.completed);

    if (
      checkbox.checked &&
      task.lastClaimDate !== today
    ) {
      currentExp += task.exp;
      dailyExp += task.exp;
      totalExp += task.exp;
      task.achievementCount++;

      if (dailyExp === dailyExpLimit) {
        currentExp += dailyBonusExp;

        alert(`${dailyExpLimit}EXP達成！ボーナス${dailyBonusExp}EXPを獲得しました。`);
      }

      task.lastClaimDate = today;

      expText.textContent = `EXP ${currentExp} / ${requiredExp}`;
      dailyExpText.textContent = `Daily EXP ${dailyExp} / ${dailyExpLimit}`;
      achievementCount.textContent = `${task.achievementCount}回`;

      if (currentExp >= requiredExp) {
        currentLevel++;

        currentExp -= requiredExp;

        level.textContent = `Lv.${currentLevel}`;

        requiredExp = 100 + (currentLevel * currentLevel * 10);

        expText.textContent = `EXP ${currentExp} / ${requiredExp}`;
      }
    }

    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('currentExp', currentExp);
    localStorage.setItem('currentLevel', currentLevel);
    localStorage.setItem('dailyExp', dailyExp);
    localStorage.setItem('totalExp', totalExp);

    const percentage = (currentExp / requiredExp) * 100;

    expFill.style.width = `${percentage}%`;
  });

  const button = document.createElement('button');
  button.textContent = '✕';

  button.addEventListener('click', () => {
    const index = tasks.indexOf(task);

    tasks.splice(index, 1);

    localStorage.setItem('tasks', JSON.stringify(tasks));

    li.remove();
  });

  li.appendChild(checkbox);
  li.appendChild(taskName);
  li.appendChild(exp);
  li.appendChild(achievementCount);
  li.appendChild(button);

  taskList.appendChild(li);
}

tasks.forEach((task) => {
  createTask(task);
});

localStorage.setItem('tasks', JSON.stringify(tasks));

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const taskName = taskInput.value.trim();
  const exp = Number(expInput.value);

  if (taskName === '' || exp < 1 || exp > 100) {
    return;
  }

  const newTask = {
    task: taskName,
    exp: exp,
    completed: false,
    lastClaimDate: null,
    achievementCount: 0,
  };

  tasks.push(newTask);

  localStorage.setItem('tasks', JSON.stringify(tasks));

  createTask(newTask);

  taskInput.value = '';
  expInput.value = '';
  taskInput.focus();
});