export default function Footer({ roundEnd, endRound, results, playAgain }) {
  function tallyScore() {
    let correct = 0;
    let numberQuestions = 0;
    results.forEach(q => {
      numberQuestions += 1;
      if (q.answers.some(a => a.correct && a.selected)) {
        correct += 1;
      }
    })
    return {correct, numberQuestions}
  }

  if (roundEnd) {
    const score = tallyScore();
    return (
      <div className='play-again-footer'>
        <p>You scored <span className='footer--score'>{score.correct}/{score.numberQuestions}</span> correct answers</p>
        <button type='button' className='play-again-button' onClick={playAgain}>More questions!</button>
      </div>

    )
  }
    return (
      <button type='button' className='check-button' onClick={endRound}>
        Check answers
      </button>
    );
  
}
