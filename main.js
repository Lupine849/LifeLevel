'use strict';

const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');
const taskList = document.querySelector('.task-list');
const expInput = document.querySelector('#exp-input');
const expText = document.querySelector('.exp-text');
const expFill = document.querySelector('.exp-fill');
const level = document.querySelector('.level');
const dailyExpText = document.querySelector('.daily-exp-text');

const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
const dailyExpLimit = 100;
const dailyBonusExp = 20;

let currentExp = Number(localStorage.getItem('currentExp')) || 0;
let currentLevel = Number(localStorage.getItem('currentLevel')) || 1;
let requiredExp = 100 + (currentLevel * currentLevel * 10);
let dailyExp = Number(localStorage.getItem('dailyExp')) || 0;
let dailyExpDate = localStorage.getItem('dailyExpDate');

const percentage = (currentExp / requiredExp) * 100;

expText.textContent = `EXP ${currentExp} / ${requiredExp}`;
level.textContent = `Lv.${currentLevel}`;
expFill.style.width = `${percentage}%`;
dailyExpText.textContent = `Daily EXP ${dailyExp} / ${dailyExpLimit}`;

function getToday() {
  return new Date().toLocaleDateString('sv-SE');
}

function resetDailyExp(today) {
  if (dailyExpDate !== today) {
    dailyExp = 0;
    dailyExpDate = today;

    localStorage.setItem('dailyExp', dailyExp);
    localStorage.setItem('dailyExpDate', dailyExpDate);

    dailyExpText.textContent = `Daily EXP ${dailyExp} / ${dailyExpLimit}`;
  }
}

resetDailyExp(getToday());

function createTask(task) {
  const today = getToday();

  if (task.lastClaimDate !== today) {
    task.completed = false;
  }

  const li = document.createElement('li');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;

  const taskSpan = document.createElement('span');
  taskSpan.textContent = task.task;

  if (task.completed) {
    taskSpan.classList.add('completed');
  }

  checkbox.addEventListener('change', () => {
    const today = getToday();

    resetDailyExp(today);

    if (
      checkbox.checked &&
      task.lastClaimDate !== today &&
      dailyExp + task.exp > dailyExpLimit
    ) {
      alert(`1日に獲得できるEXPは${dailyExpLimit}までです。`);

      checkbox.checked = false;
    }

    task.completed = checkbox.checked;

    taskSpan.classList.toggle('completed', task.completed);

    if (
      checkbox.checked &&
      task.lastClaimDate !== today
    ) {
      currentExp += task.exp;
      dailyExp += task.exp;

      if (dailyExp === dailyExpLimit) {
        currentExp += dailyBonusExp;

        alert(`${dailyExpLimit}EXP達成！ボーナス${dailyBonusExp}EXPを獲得しました。`);
      }

      localStorage.setItem('currentExp', currentExp);

      task.lastClaimDate = today;

      expText.textContent = `EXP ${currentExp} / ${requiredExp}`;
      dailyExpText.textContent = `Daily EXP ${dailyExp} / ${dailyExpLimit}`;

      if (currentExp >= requiredExp) {
        currentLevel++;

        localStorage.setItem('currentLevel', currentLevel);

        currentExp -= requiredExp;

        localStorage.setItem('currentExp', currentExp);

        level.textContent = `Lv.${currentLevel}`;

        requiredExp = 100 + (currentLevel * currentLevel * 10);

        expText.textContent = `EXP ${currentExp} / ${requiredExp}`;
      }
    }

    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('dailyExp', dailyExp);

    const percentage = (currentExp / requiredExp) * 100;

    expFill.style.width = `${percentage}%`;
  });

  const expSpan = document.createElement('span');
  expSpan.textContent = `${task.exp}EXP`;
  expSpan.classList.add('task-exp');

  const button = document.createElement('button');
  button.textContent = '✕';

  button.addEventListener('click', () => {
    const index = tasks.indexOf(task);

    tasks.splice(index, 1);

    localStorage.setItem('tasks', JSON.stringify(tasks));

    li.remove();
  });

  li.appendChild(checkbox);
  li.appendChild(taskSpan);
  li.appendChild(expSpan);
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
    lastClaimDate: null
  };

  tasks.push(newTask);

  localStorage.setItem('tasks', JSON.stringify(tasks));

  createTask(newTask);

  taskInput.value = '';
  expInput.value = '';
  taskInput.focus();
});