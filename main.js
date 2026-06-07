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
  li.textContent = task;

  const taskList = document.querySelector('.task-list');

  taskList.appendChild(li);
});