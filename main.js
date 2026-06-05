'use strict';

const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
});