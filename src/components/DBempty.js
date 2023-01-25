export default function DBempty({reset, changeCategory}) {
  return (
    <div className='db-empty-screen'>
      <p>
        The database cannot provide any new questions. Either all of them have
         been asked, or there are not enough to fulfill the number of
        questions requested. Please choose how you would like to proceed...
      </p>
      <button type='button' onClick={reset}>Reset questions</button>
      <button type='button' onClick={changeCategory}>Change category</button>
    </div>
  );
}
