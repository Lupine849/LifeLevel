'use strict';

const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const task = taskInput.value.trim();

  if (task === '') {
    return;
  }

  const li = document.createElement('li');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';

  const span = document.createElement('span');
  span.textContent = task;

  li.appendChild(checkbox);
  li.appendChild(span);

  const taskList = document.querySelector('.task-list');

  taskList.appendChild(li);
});