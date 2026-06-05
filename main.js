'use strict';

const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const task = taskInput.value.trim();

  if (task === '') {
    return;
  }
});