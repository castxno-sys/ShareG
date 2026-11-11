export default function Logo({ claro = false }) {
  return (
    <span className={`logo ${claro ? 'logo--claro' : ''}`}>
      <img src={`${import.meta.env.BASE_URL}img/logo.png`} alt="" width="38" height="38" />
      <span>Share<b>.G</b></span>
    </span>
  );
}
