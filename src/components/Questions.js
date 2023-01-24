import { nanoid } from 'nanoid';
import Q from './Q';

export default function Questions({ data, userSelect }) {
  return (
    <div className='questions'>
      {data.map((q) => (
        <Q item={q} key={nanoid()} userSelect={userSelect} />
      ))}
    </div>
  );
}
