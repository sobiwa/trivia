/* eslint-disable no-restricted-syntax */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-no-bind */
import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import settingsIcon from './assets/settings.svg';
import statsIcon from './assets/stats.svg';
import Start from './components/Start';
import Stats from './components/Stats';
import DBempty from './components/DBempty';
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
  const [dbEmpty, setDbEmpty] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [tokensRequested, setTokensRequested] = useState(0);
  const [settingsEditRequired, setSettingsEditRequired] = useState(false);
  const [stats, setStats] = useState(
    JSON.parse(localStorage.getItem('stats')) || [
      { category: 'total', correct: 0, answered: 0 },
    ]
  );

  const [apiCall, setApiCall] = useState(null);
  const [triviaQs, setTriviaQs] = useState(initData.questions);
  const [sessionToken, setSessionToken] = useState(null);
  const [categories, setCategories] = useState(initData);

  const [userInput, setUserInput] = useState({
    number: 5,
    category: 'undefined',
    difficulty: 'undefined',
    type: 'undefined',
  });

  function hardReset() {
    setStats([{ category: 'total', correct: 0, answered: 0 }])
  }

  useEffect(() => {
    localStorage.setItem('stats', JSON.stringify(stats));
  }, [stats]);

  // retrieve categories from API
  useEffect(() => {
    fetch('https://opentdb.com/api_category.php')
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  async function retrieveNewToken() {
    const call = await fetch(
      'https://opentdb.com/api_token.php?command=request'
    );
    const data = await call.json();
    setSessionToken(data);
  }

  useEffect(() => {
    retrieveNewToken();
  }, [tokensRequested]);

  function updatedApiCall() {
    const { number, category, difficulty, type } = userInput;
    const { token } = sessionToken;
    const addition1 = category === 'undefined' ? '' : `&category=${category}`;
    const addition2 =
      difficulty === 'undefined' ? '' : `&difficulty=${difficulty}`;
    const addition3 = type === 'undefined' ? '' : `&type=${type}`;
    return `https://opentdb.com/api.php?amount=${number}${addition1}${addition2}${addition3}&token=${token}`;
  }

  function editSettings() {
    if (updatedApiCall() === apiCall) {
      return;
    }
    setIsLoading(true);
    if (dbEmpty) {
      setSettingsEditRequired(false);
      setDbEmpty(false);
    }
    setApiCall(updatedApiCall());
  }

  useEffect(() => {
    if (!sessionToken) return;
    editSettings();
  }, [sessionToken]);

  function htmlDecode(input) {
    const doc = new DOMParser().parseFromString(input, 'text/html');
    return doc.documentElement.textContent;
  }

  function reformatData(data) {
    return data.results
      .map((item) => ({
        warning: false,
        category: item.category,
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

        // Code 1: The API doesn't have enough questions for your query.
        // tested in browser and this code is not given when a token is provided
        case 1:
          setDbEmpty(true);
          setSettingsEditRequired(true);
          break;

        // Token Empty Session Token has returned all possible questions for the specified query. Resetting the Token is necessary.
        case 4:
          setDbEmpty(true);
          break;

        // Token not found
        case 3:
          setIsLoading(true);
          retrieveNewToken();
          break;
        default:
          break;
      }
    };
    fetchData().finally(() => {
      setIsLoading(false);
    });
  }, [next, apiCall]);

  function handleChange(e) {
    const { name, value } = e.target;
    setUserInput((prev) => ({ ...prev, [name]: value }));
  }

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

  function gatherStats() {
    const newStats = { total: { correct: 0, asked: 0 } };
    triviaQs.forEach((q) => {
      let answerCorrect = false;
      if (q.answers.some((a) => a.correct && a.selected)) {
        answerCorrect = true;
        newStats.total.correct += 1;
      }
      newStats[q.category] = {
        correct: answerCorrect
          ? newStats[q.category]?.correct + 1 || 1
          : newStats[q.category]?.correct || 0,
        asked: newStats[q.category]?.asked + 1 || 1,
      };
      newStats.total.asked += 1;
    });
    setStats((prev) => {
      const newArray = [];
      const untouched = prev.filter(
        (item) => !Object.prototype.hasOwnProperty.call(newStats, item.category)
      );
      const toBeEdited = prev.filter((item) =>
        Object.prototype.hasOwnProperty.call(newStats, item.category)
      );
      for (const [key, value] of Object.entries(newStats)) {
        const toUpdate = toBeEdited.find((item) => item.category === key);
        newArray.push(
          toUpdate
            ? {
                ...toUpdate,
                correct: toUpdate.correct + value.correct,
                answered: toUpdate.answered + value.asked,
              }
            : {
                category: key,
                correct: value.correct,
                answered: value.asked,
              }
        );
      }
      return [...newArray, ...untouched];
    });
  }

  function endRound() {
    const needAnswers = checkSelections();
    if (needAnswers.length) {
      sendWarnings(needAnswers);
      return;
    }
    gatherStats();
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
      <div className='blob-container'>
        <Blob position='top right' color='#fffad1' />
        <Blob position='bottom left' color='#DEEBF8' />
      </div>
      {!start &&
        (dbEmpty ? (
          <DBempty
            mustEdit={settingsEditRequired}
            displaySettings={() => setShowSettings(true)}
            reset={() => setTokensRequested((prev) => prev + 1)}
          />
        ) : isLoading ? (
          <Loading />
        ) : showStats ? (
          <Stats stats={stats} reset={hardReset} close={() => setShowStats(false)}/>
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
            <button
              className='open-stats-button'
              type='button'
              onClick={() => setShowStats((prev) => !prev)}
            >
              <img src={statsIcon} alt='stats icon' />
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
