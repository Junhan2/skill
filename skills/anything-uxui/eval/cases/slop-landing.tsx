// Marketing landing page.

const styles = `
.page {
  font-family: Inter, sans-serif;
  text-align: center;
}

.hero__title {
  background: linear-gradient(90deg, #3b82f6, #a855f7);
  -webkit-background-clip: text;
  color: transparent;
  font-size: 56px;
}

.cta {
  background: linear-gradient(90deg, #3b82f6, #a855f7);
  color: white;
  border-radius: 8px;
  padding: 12px 24px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
}
`;

const FEATURES = [
  { icon: '⚡', title: 'Lightning fast', body: 'Ship in seconds, not hours.' },
  { icon: '🚀', title: 'Scales with you', body: 'From first user to millionth.' },
  { icon: '✨', title: 'Delightful by default', body: 'Beautiful out of the box.' },
];

export function Landing() {
  return (
    <>
      <style>{styles}</style>
      <main className="page">
        <span className="badge">✨ Now in public beta</span>
        <h1 className="hero__title">Build anything, faster</h1>
        <p>The all-in-one platform for modern teams.</p>
        <button className="cta">Get started free</button>

        <section className="cards">
          {FEATURES.map((f) => (
            <article className="card" key={f.title}>
              <div style={{ fontSize: 32 }}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
