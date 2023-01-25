import Q from './Q';

export default function Questions({ data, userSelect, showResults }) {
  return (
    <div className='questions'>
      {data.map((q) => (
        <Q item={q} key={q.id} userSelect={userSelect} showResults={showResults} />
      ))}
    </div>
  );
}
