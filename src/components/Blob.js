export default function Blob({position, color}) {
  const [position1, position2] = position.split(' ');
  const styles = {
    [position1]: '-100px',
    [position2]: '-100px',
    backgroundColor: color,
  }
  return (
    <div style={styles} className='blob' />
  )
}