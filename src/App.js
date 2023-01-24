import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import Start from './components/Start';
import Blob from './components/Blob';
import initQs from './data';
import Questions from './components/Questions';

export default function App() {
  const [start, setStart] = useState(true);
  const [triviaQs, setTriviaQs] = useState(initQs);
  const [roundEnd, setRoundEnd] = useState(false);
  const [next, setNext] = useState(0);

  function htmlDecode(input) {
    const doc = new DOMParser().parseFromString(input, 'text/html');
    return doc.documentElement.textContent;
  }

  function reformatData(data) {
    return data.results
      .map((item) => ({
        warning: false,
        question: htmlDecode(item.question),
        answers:
          item.type === 'boolean'
            ? [
                {
                  text: 'True',
                  correct: item.correct_answer === 'True',
                },
                {
                  text: 'False',
                  correct: item.correct_answer === 'False',
                },
              ]
            : [
                ...item.incorrect_answers.map((answer) => ({
                  text: htmlDecode(answer),
                  correct: false,
                })),
                {
                  text: htmlDecode(item.correct_answer),
                  correct: true,
                },
              ].sort(() => 0.5 - Math.random()),
      }))
      .map((extra) => ({
        ...extra,
        id: nanoid(),
        answers: extra.answers.map((ans) => ({
          ...ans,
          id: nanoid(),
          selected: false,
        })),
      }));
  }

  useEffect(() => {
    fetch('https://opentdb.com/api.php?amount=5&category=15')
      .then((res) => res.json())
      .then((data) => setTriviaQs(reformatData(data)));
  }, [next]);

  // reformat data
  // useEffect(() => {
  //   setTriviaQs((prev) =>
  //     !prev.results
  //       ? prev
  //       :
  // }, [triviaQs]);

  function userSelect(qId, aId) {
    setTriviaQs((prev) =>
      prev.map((item) =>
        item.id === qId
          ? {
              ...item,
              answers: item.answers.map((ans) =>
                ans.id === aId
                  ? { ...ans, selected: !ans.selected }
                  : { ...ans, selected: false }
              ),
            }
          : item
      )
    );
  }

  function checkSelections() {
    const needAnswers = [];
    triviaQs.forEach((q) => {
      if (q.answers.every((a) => !a.selected)) {
        needAnswers.push(q.id);
      }
    });
    return needAnswers;
  }

  function sendWarnings(needAnswers) {
    if (needAnswers.length) {
      setTriviaQs((prev) =>
        prev.map((item) =>
          needAnswers.includes(item.id) ? { ...item, warning: true } : item
        )
      );
    }
  }

  function endRound() {
    const needAnswers = checkSelections();
    if (needAnswers.length) {
      sendWarnings(needAnswers);
      return;
    }
    setNext((prev) => prev + 1);
  }

  return (
    <div className='app'>
      {start && <Start begin={() => setStart(false)} />}
      <div className='blob-container'>
        <Blob position='top right' color='#fffad1' />
        <Blob position='bottom left' color='#DEEBF8' />
      </div>
      {!start && (
        <main>
          <Questions data={triviaQs} userSelect={userSelect} />
          <button type='button' className='check-button' onClick={endRound}>
            Check answers
          </button>
        </main>
      )}
    </div>
  );
}
