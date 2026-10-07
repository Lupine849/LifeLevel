'use strict';

// DOM要素

const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');
const taskList = document.querySelector('.task-list');
const expInput = document.querySelector('#exp-input');
const expText = document.querySelector('.exp-text');
const expFill = document.querySelector('.exp-fill');
const levelText = document.querySelector('.level-text');
const dailyExpText = document.querySelector('.daily-exp-text');
const achievementRate = document.querySelector('.achievement-rate');
const streakText = document.querySelector('.streak-text');
const levelUpText = document.querySelector('.level-up-text');
const expBar = document.querySelector('.exp-bar');

// 設定値

const dailyExpLimit = 100;
const dailyBonusExp = 20;

// アプリ状態

const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

let currentExp = Number(localStorage.getItem('currentExp')) || 0;
let currentLevel = Number(localStorage.getItem('currentLevel')) || 1;
let requiredExp = calculateRequiredExp(currentLevel);
let dailyExp = Number(localStorage.getItem('dailyExp')) || 0;
let dailyExpDate = localStorage.getItem('dailyExpDate');
let totalExp = Number(localStorage.getItem('totalExp')) || 0;
let trackingStartDate = localStorage.getItem('trackingStartDate');
let streak = Number(localStorage.getItem('streak')) || 0;

// 日付関連

function getToday() {
  return new Date().toLocaleDateString('sv-SE');
}

function getYesterday() {
  const yesterday = new Date();

  yesterday.setDate(yesterday.getDate() - 1);

  return yesterday.toLocaleDateString('sv-SE');
}

// EXP・レベル関連

function updateLevelDisplay() {
  levelText.textContent = `Lv.${currentLevel}`;
}

function updateExpDisplay() {
  expText.textContent = `EXP ${currentExp} / ${requiredExp}`;

  const percentage = (currentExp / requiredExp) * 100;

  expFill.style.width = `${percentage}%`;
}

function levelUp() {
  currentLevel++;
  currentExp -= requiredExp;
  requiredExp = calculateRequiredExp(currentLevel);

  updateLevelDisplay();

  levelUpText.classList.add('level-up-animation');
  expBar.classList.add('exp-bar-level-up');
}

function completeTask(task, today) {
  currentExp += task.exp;
  dailyExp += task.exp;
  totalExp += task.exp;
  task.achievementCount++;

  if (dailyExp === dailyExpLimit) {
    currentExp += dailyBonusExp;

    alert(`${dailyExpLimit}EXP達成！ボーナス${dailyBonusExp}EXPを獲得しました。`);
  }

  task.lastClaimDate = today;

  if (currentExp >= requiredExp) {
    levelUp();
  }
}

function calculateRequiredExp(level) {
  return 100 + (level * level * 10);
}

// 習慣記録関連

function updateDailyExpDisplay() {
  dailyExpText.textContent = `Daily EXP ${dailyExp} / ${dailyExpLimit}`;
}

function updateStreakDisplay() {
  streakText.textContent = `連続達成日数 ${streak}日`;
}

function updateStreak() {
  if (dailyExp === dailyExpLimit && getYesterday() === dailyExpDate) {
    streak++;
  } else {
    streak = 0;
  }

  localStorage.setItem('streak', streak);
}

function updateDailyState(today) {
  if (dailyExpDate !== today) {
    updateStreak();

    dailyExp = 0;
    dailyExpDate = today;

    localStorage.setItem('dailyExp', dailyExp);
    localStorage.setItem('dailyExpDate', dailyExpDate);

    return true;
  }

  return false;
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
  const cumulativeAchievementRate = totalTargetExp === 0 ? 0 : Math.floor((completedTotalExp / totalTargetExp) * 100);

  achievementRate.textContent = `累計達成率 ${cumulativeAchievementRate}%`;
}

// タスク関連

function createTask(task) {
  const today = getToday();

  if (task.lastClaimDate !== today) {
    task.completed = false;
  }

  const li = document.createElement('li');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.disabled = task.lastClaimDate === today;
  checkbox.classList.add('checkbox');

  const taskName = document.createElement('span');
  taskName.textContent = task.task;
  taskName.classList.add('task-name');

  if (task.completed) {
    taskName.classList.add('completed');
  }

  const exp = document.createElement('span');
  exp.textContent = `${task.exp}EXP`;

  const achievementCount = document.createElement('span');
  achievementCount.textContent = `${task.achievementCount}回`;

  checkbox.addEventListener('change', () => {
    const today = getToday();

    const wasDailyStateUpdate = updateDailyState(today);

    if (wasDailyStateUpdate) {
      updateStreakDisplay();
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
      completeTask(task, today);

      checkbox.disabled = true;

      achievementCount.textContent = `${task.achievementCount}回`;
    }

    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('currentExp', currentExp);
    localStorage.setItem('currentLevel', currentLevel);
    localStorage.setItem('dailyExp', dailyExp);
    localStorage.setItem('totalExp', totalExp);

    updateDailyExpDisplay();
    updateExpDisplay();
  });

  const editButton = document.createElement('button');
  editButton.textContent = '編集';
  editButton.classList.add('edit-button');

  let isEditing = false;
  let editExp;
  let editExpInput;

  function saveExp() {
    if (!editExpInput.reportValidity()) {
      return;
    }

    const newExp = Number(editExpInput.value);

    task.exp = newExp;

    exp.textContent = `${task.exp}EXP`;

    editExp.replaceWith(exp);

    localStorage.setItem('tasks', JSON.stringify(tasks));

    editButton.textContent = '編集';

    isEditing = false;
  }

  editButton.addEventListener('click', () => {
    if (!isEditing) {
      editButton.textContent = '保存';

      editExp = document.createElement('div');
      editExpInput = document.createElement('input');
      const expUnit = document.createElement('span');

      editExpInput.classList.add('edit-exp-input');

      editExpInput.type = 'number';
      editExpInput.min = '1';
      editExpInput.max = '100';
      editExpInput.required = true;
      editExpInput.value = task.exp;
      expUnit.textContent = 'EXP';

      editExp.appendChild(editExpInput);
      editExp.appendChild(expUnit);

      exp.replaceWith(editExp);

      editExpInput.focus();

      editExpInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          saveExp();
        }
      });

      isEditing = true;
    } else {
      saveExp();
    }
  });

  const deleteButton = document.createElement('button');
  deleteButton.textContent = '✕';
  deleteButton.classList.add('delete-button');

  deleteButton.addEventListener('click', () => {
    const index = tasks.indexOf(task);

    tasks.splice(index, 1);

    localStorage.setItem('tasks', JSON.stringify(tasks));

    li.remove();
  });

  li.appendChild(checkbox);
  li.appendChild(taskName);
  li.appendChild(exp);
  li.appendChild(achievementCount);
  li.appendChild(editButton);
  li.appendChild(deleteButton);

  taskList.appendChild(li);
}

// 初期化

if (!trackingStartDate) {
  trackingStartDate = getToday();

  localStorage.setItem('trackingStartDate', trackingStartDate);
}

updateDailyState(getToday());
updateLevelDisplay();
updateExpDisplay();
updateDailyExpDisplay();
updateStreakDisplay();
updateAchievementRate();

tasks.forEach((task) => {
  createTask(task);
});

localStorage.setItem('tasks', JSON.stringify(tasks));

// イベント

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

levelUpText.addEventListener('animationend', () => {
  levelUpText.classList.remove('level-up-animation');
});

expBar.addEventListener('animationend', () => {
  expBar.classList.remove('exp-bar-level-up');
});