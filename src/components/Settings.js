import { useState } from 'react';

export default function Settings({ categories }) {
  const [userInput, setUserInput] = useState({
    number: 5,
    category: null,
    difficulty: null,
    type: null,
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setUserInput((prev) => ({ ...prev, [name]: value }));
  }
  function handleSubmit() {}
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
            <option value='null'>Any Category</option>
            {categories.map((cat) => (
              <option value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </label>

        <label htmlFor='input--difficulty'>
          <select
            id='input--difficulty'
            value={userInput.difficulty}
            onChange={handleChange}
            name='difficulty'
          >
            <option value='null'>Any Difficulty</option>
            <option value='easy'>Easy</option>
            <option value='medium'>Medium</option>
            <option value='hard'>Hard</option>
          </select>
        </label>

        <label htmlFor='input--type'>
          <select
            id='input--type'
            value={userInput.value}
            onChange={handleChange}
            name='type'
          >
            <option value='null'>Any Type</option>
            <option value='multiple'>Multiple Choice</option>
            <option value='boolean'>True / False</option>
          </select>
        </label>
      </form>
    </div>
  );
}
