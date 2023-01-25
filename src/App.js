/* eslint-disable react/jsx-no-bind */
import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import Start from './components/Start';
import Blob from './components/Blob';
import initData from './data';
import Questions from './components/Questions';
import Footer from './components/Footer';
import Settings from './components/Settings';

export default function App() {
  const [start, setStart] = useState(true);
  const [roundEnd, setRoundEnd] = useState(false);
  const [next, setNext] = useState(0);

  const [triviaQs, setTriviaQs] = useState(initData.questions);
  const [sessionToken, setSessionToken] = useState('');
  const [dbEmpty, setDbEmpty] = useState(false);
  const [categories, setCategories] = useState(initData);
  const [showSettings, setShowSettings] = useState(false);

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

  function fetchToken() {
    return fetch('https://opentdb.com/api_token.php?command=request');
  }

  useEffect(() => {
    fetch('https://opentdb.com/api_category.php')
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  console.log(categories);

  useEffect(() => {
    const fetchData = async () => {
      if (!sessionToken) {
        const token1 = await fetchToken();
        const token = await token1.json();
        setSessionToken(token);
      }
      const res = await fetch(
        `https://opentdb.com/api.php?amount=5&category=15&token=${sessionToken.token}`
      );
      const data = await res.json();
      switch (data.response_code) {
        case 0:
          setTriviaQs(reformatData(data));
          break;
        case 1:
          setDbEmpty(true);
          break;
        default:
          break;
      }
    };
    fetchData();
  }, [next, sessionToken]);

  function userSelect(qId, aId) {
    if (roundEnd) return;
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
              warning: false,
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
    setRoundEnd(true);
  }

  function playAgain() {
    setNext((prev) => prev + 1);
    setRoundEnd(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className='app'>
      {start && <Start begin={() => setStart(false)} />}
      {/* {dbEmpty && } */}
      <div className='blob-container'>
        <Blob position='top right' color='#fffad1' />
        <Blob position='bottom left' color='#DEEBF8' />
      </div>
      {!start && (
        <main>
          <Questions
            data={triviaQs}
            userSelect={userSelect}
            showResults={roundEnd}
          />
          <Footer
            roundEnd={roundEnd}
            endRound={endRound}
            results={triviaQs}
            playAgain={playAgain}
          />
        </main>
      )}
      {showSettings && <Settings categories={categories.trivia_categories}/>}
    </div>
  );
}
