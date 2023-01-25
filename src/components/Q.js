function Answer({ selected, correct, content, userSelect, showResults }) {
  const styles = {};
  if (showResults) {
    styles.cursor = 'default';
    if (correct) {
      styles.backgroundColor = '#94D7A2';
      styles.border = '1px solid #94D7A2';
    } else if (selected && !correct) {
      styles.backgroundColor = '#F8BCBC';
      styles.border = '1px solid #F8BCBC';
      styles.color = '#8f95af';
    } else {
      styles.backgroundColor = 'none';
      styles.border = '1px solid #8f95af';
      styles.color = '#8f95af';
    }
  } else if (selected) {
    styles.backgroundColor = '#d6dbf5';
    styles.border = '1px solid #d6dbf5';
  }

  return (
    <button
      onClick={userSelect}
      className='answer-button'
      style={styles}
      type='button'
    >
      {content}
    </button>
  );
}

export default function Q({ item, userSelect, showResults }) {
  return (
    <div className='q'>
      {item.warning && <div className='warning'>* input required</div>}
      <p className='questions--ask'>{item.question}</p>
      <div className='answers'>
        {item.answers.map((ans) => (
          <Answer
            key={ans.id}
            userSelect={() => userSelect(item.id, ans.id)}
            content={ans.text}
            selected={ans.selected}
            correct={ans.correct}
            showResults={showResults}
          />
        ))}
      </div>
    </div>
  );
}
