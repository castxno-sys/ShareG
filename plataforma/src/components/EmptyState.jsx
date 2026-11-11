export default function EmptyState({ icono = '🌾', titulo, texto, children }) {
  return (
    <div className="empty">
      <div className="empty__icon">{icono}</div>
      <h3>{titulo}</h3>
      {texto && <p>{texto}</p>}
      {children}
    </div>
  );
}
