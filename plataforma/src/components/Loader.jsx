export default function Loader({ texto = 'Cargando…' }) {
  return (
    <div className="loader">
      <div className="loader__spin" />
      <p>{texto}</p>
    </div>
  );
}
