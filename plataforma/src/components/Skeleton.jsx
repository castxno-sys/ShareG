export function SkeletonGrid({ n = 8 }) {
  return (
    <div className="grid" aria-busy="true" aria-label="Cargando productos">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="card product skeleton">
          <div className="product__media sk" />
          <div className="product__body">
            <div className="sk sk--line" style={{ width: '70%' }} />
            <div className="sk sk--line" style={{ width: '45%' }} />
            <div className="sk sk--line" style={{ width: '55%', height: 28, marginTop: 12 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
