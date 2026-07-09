'use strict';

const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');
const taskList = document.querySelector('.task-list');
const expInput = document.querySelector('#exp-input');
const expText = document.querySelector('.exp-text');
const expFill = document.querySelector('.exp-fill');
const level = document.querySelector('.level');

const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

let currentExp = Number(localStorage.getItem('currentExp')) || 0;
let currentLevel = Number(localStorage.getItem('currentLevel')) || 1;
let requiredExp = 100 + (currentLevel * currentLevel * 10);

const percentage = (currentExp / requiredExp) * 100;

expText.textContent = `EXP ${currentExp} / ${requiredExp}`;
level.textContent = `Lv.${currentLevel}`;
expFill.style.width = `${percentage}%`;

function createTask(task) {
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
    const today = new Date().toLocaleDateString('sv-SE');

    taskSpan.classList.toggle('completed');

    task.completed = checkbox.checked;

    localStorage.setItem('tasks', JSON.stringify(tasks));

    if (task.lastClaimDate !== today) {
      currentExp += task.exp;

      localStorage.setItem('currentExp', currentExp);

      task.lastClaimDate = today;

      localStorage.setItem('tasks', JSON.stringify(tasks));

      expText.textContent = `EXP ${currentExp} / ${requiredExp}`;

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

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const task = taskInput.value.trim();
  const exp = Number(expInput.value);

  if (task === '' || exp < 1 || exp > 100) {
    return;
  }

  const newTask = {
    task: task,
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