'use strict';

const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');
const taskList = document.querySelector('.task-list');
const expInput = document.querySelector('#exp-input');
const expText = document.querySelector('.exp-text');
const expFill = document.querySelector('.exp-fill');

let currentExp = 0;

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const task = taskInput.value.trim();
  const exp = Number(expInput.value);

  if (task === '' || exp < 1 || exp > 100) {
    return;
  }

  const li = document.createElement('li');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';

  const taskSpan = document.createElement('span');
  taskSpan.textContent = task;

  checkbox.addEventListener('change', () => {
    taskSpan.classList.toggle('completed');

    if (checkbox.checked) {
      currentExp += exp;
      expText.textContent = `EXP ${currentExp} / 100`;

      const percentage = currentExp;

      expFill.style.width = `${percentage}%`;
    }
  });

  const expSpan = document.createElement('span');
  expSpan.textContent = `${exp}EXP`;
  expSpan.classList.add('task-exp');

  const button = document.createElement('button');
  button.textContent = '✕';

  button.addEventListener('click', () => {
    li.remove();
  });

  li.appendChild(checkbox);
  li.appendChild(taskSpan);
  li.appendChild(expSpan);
  li.appendChild(button);

  taskList.appendChild(li);

  taskInput.value = '';
  expInput.value = '';
  taskInput.focus();
});