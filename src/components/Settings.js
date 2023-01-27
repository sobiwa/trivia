import { useState } from 'react';

export default function Settings({ userInput, handleChange, categories, editSettings, toggleDisplay }) {

  function handleSubmit(e) {
    e.preventDefault();
    editSettings();
    toggleDisplay();
  }
  return (
    <div className='settings'>
      <form onSubmit={handleSubmit}>
        <label htmlFor='input--number'>
          Number of Questions:
          <input
            id='input--number'
            name='number'
            onChange={handleChange}
            value={userInput.number}
            type='number'
            min='1'
            max='50'
          />
        </label>

        <label htmlFor='input--category'>
          Select Category:
          <select
            id='input--category'
            value={userInput.category}
            onChange={handleChange}
            name='category'
          >
            <option value='undefined'>Any Category</option>
            {categories.map((cat) => (
              <option key ={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </label>

        <label htmlFor='input--difficulty'>
          Select Difficulty:
          <select
            id='input--difficulty'
            value={userInput.difficulty}
            onChange={handleChange}
            name='difficulty'
          >
            <option value='undefined'>Any Difficulty</option>
            <option value='easy'>Easy</option>
            <option value='medium'>Medium</option>
            <option value='hard'>Hard</option>
          </select>
        </label>

        <label htmlFor='input--type'>
          Select Type:
          <select
            id='input--type'
            value={userInput.value}
            onChange={handleChange}
            name='type'
          >
            <option value='undefined'>Any Type</option>
            <option value='multiple'>Multiple Choice</option>
            <option value='boolean'>True / False</option>
          </select>
        </label>
        <button className='settings--button' type='submit' onClick={handleSubmit}>Update Settings</button>
      </form>
    </div>
  );
}
