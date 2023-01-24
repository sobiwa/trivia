function Answer({ selected, content, userSelect }) {
  return (
    <button
      onClick={userSelect}
      className={`answer-button ${selected ? 'selected' : ''}`}
      type='button'
    >
      {content}
    </button>
  );
}

export default function Q({ item, userSelect }) {

  return (
    <div className='q'>
      <p className='questions--ask'>{item.question}</p>
      <div className='answers'>
        {item.answers.map((ans) => (
          <Answer key={ans.id} userSelect={() => userSelect(item.id, ans.id)} content={ans.text} selected={ans.selected} />
        ))}
      </div>
    </div>
  );
}
