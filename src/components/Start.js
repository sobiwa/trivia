export default function Start({begin}) {
  return (
    <div className='start'>
      <h1 className='start--title'>Trivia Time!</h1>
      <p className='start--text'>Time for your trivia</p>
      <button type='button' onClick={begin}>Begin!</button>
    </div>
  )
}