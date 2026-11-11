export default function Estrellas({ valor = 0, onChange, tam = 'md' }) {
  return (
    <span className={`stars stars--${tam} ${onChange ? 'stars--input' : ''}`} role={onChange ? 'radiogroup' : 'img'}
      aria-label={onChange ? 'Calificación' : `${valor} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" disabled={!onChange} tabIndex={onChange ? 0 : -1}
          className={n <= Math.round(valor) ? 'is-on' : ''} onClick={() => onChange?.(n)} aria-label={`${n} estrellas`}>★</button>
      ))}
    </span>
  );
}
