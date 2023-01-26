/* eslint-disable react/jsx-no-bind */
import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import settingsIcon from './assets/settings.svg';
import Start from './components/Start';
import Blob from './components/Blob';
import initData from './data';
import Questions from './components/Questions';
import Footer from './components/Footer';
import Settings from './components/Settings';
import Loading from './components/Loading';

export default function App() {
  const [start, setStart] = useState(true);
  const [roundEnd, setRoundEnd] = useState(false);
  const [next, setNext] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [triviaQs, setTriviaQs] = useState(initData.questions);
  const [sessionToken, setSessionToken] = useState(null);
  const [dbEmpty, setDbEmpty] = useState(false);
  const [categories, setCategories] = useState(initData);
  const [showSettings, setShowSettings] = useState(false);
  const [apiCall, setApiCall] = useState(null);

  const [userInput, setUserInput] = useState({
    number: 5,
    category: undefined,
    difficulty: undefined,
    type: undefined,
  });

  function fetchToken() {
    return fetch('https://opentdb.com/api_token.php?command=request');
  }

  useEffect(() => {
    async function init() {
      const tokenCall = await fetch(
        'https://opentdb.com/api_token.php?command=request'
      );
      const token = await tokenCall.json();
      setSessionToken(token);
      const apiX = `https://opentdb.com/api.php?amount=${userInput.number}&token=${token.token}`;
      setApiCall(apiX);
    }
    init().finally(() => {
      setIsLoading(false);
    });
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setUserInput((prev) => ({ ...prev, [name]: value }));
  }

  function editSettings() {
    const { number, category, difficulty, type } = userInput;
    const addition1 = category ? `&category=${category}` : '';
    const addition2 = difficulty ? `&difficulty=${difficulty}` : '';
    const addition3 = type ? `&type=${type}` : '';
    setApiCall(
      `https://opentdb.com/api.php?amount=${number}${addition1}${addition2}${addition3}&token=${sessionToken.token}`
    );
  }

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
    fetch('https://opentdb.com/api_category.php')
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  useEffect(() => {
    if (!sessionToken || apiCall === null) {
      return;
    }
    const fetchData = async () => {
      const res = await fetch(apiCall);
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
    fetchData().finally(() => {
      setIsLoading(false);
    });
  }, [next, apiCall]);

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
    setIsLoading(true);
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
      {!start &&
        (isLoading ? (
          <Loading />
        ) : (
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
            <button
              className='open-settings-button'
              type='button'
              onClick={() => setShowSettings((prev) => !prev)}
            >
              <img src={settingsIcon} alt='settings icon' />
            </button>
          </main>
        ))}
      {showSettings && (
        <Settings
          categories={categories.trivia_categories}
          handleChange={handleChange}
          userInput={userInput}
          editSettings={editSettings}
          toggleDisplay={() => setShowSettings((prev) => !prev)}
        />
      )}
    </div>
  );
}
