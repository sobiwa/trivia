import { useState } from 'react';
import stopIcon from '../assets/stop.svg';
import backIcon from '../assets/back.svg';
import stopIconWhite from '../assets/stop-white.svg';

function AlertBox({ close, reset }) {
  function handleReset() {
    reset();
    close();
  }
  return (
    <div className='full-screen-fade'>
      <div className='stats--alert-box'>
        <img src={stopIcon} alt='warning icon' />
        Are you sure you want to erase all of your history with this app?
        Records will be gone for good!
        <div className='stats--alert-box-buttons'>
          <button className='reset' type='button' onClick={handleReset}>
            Yes! Start fresh!
          </button>
          <button type='button' onClick={close}>
            No! Keep my records!
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ correct, answered, category, className }) {
  return (
    <tr className={className || ''}>
      <td>{category}</td>
      <td className='stats--data'>
        {Math.round((correct / answered) * 1000) / 10}%
      </td>
      <td className='stats--data'>{correct}</td>
      <td className='stats--data'>{answered}</td>
    </tr>
  );
}

export default function Stats({ stats, close, reset }) {
  const [alertBox, setAlertBox] = useState(false);
  const [total, ...rest] = stats;
  rest.sort((a, b) => b.correct / b.answered - a.correct / a.answered);
  return (
    <div className='stats--display'>
      {alertBox && <AlertBox close={() => setAlertBox(false)} reset={reset} />}
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>% Correct</th>
            <th>Correct</th>
            <th>Answered</th>
          </tr>
        </thead>
        <tbody>
          <Row
            category='TOTAL'
            correct={total.correct}
            answered={total.answered}
            className='stats--total-row'
          />
          {rest.map((item) => (
            <Row
              key={item.category}
              category={item.category}
              correct={item.correct}
              answered={item.answered}
            />
          ))}
        </tbody>
      </table>
      <div className='stats--button-container'>
        <button
          className='stats--reset-button'
          type='button'
          onClick={() => setAlertBox((prev) => !prev)}
        >
          <img src={stopIconWhite} alt='warning icon' />
          Clean slate
        </button>
        <button className='back-button' type='button' onClick={close}>
          <img src={backIcon} alt='back icon' />
          Back
        </button>
      </div>
    </div>
  );
}
