'use strict';

const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');
const taskList = document.querySelector('.task-list');

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

  checkbox.addEventListener('change', () => {
    span.classList.toggle('completed');
  });

  const button = document.createElement('button');
  button.textContent = '✕';

  button.addEventListener('click', () => {
    li.remove();
  });

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(button);

  taskList.appendChild(li);

  taskInput.value = '';
  taskInput.focus();
});