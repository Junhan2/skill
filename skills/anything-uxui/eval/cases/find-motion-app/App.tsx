// Document editor shell.
import { useEffect, useState } from 'react';
import { CommandPalette } from './CommandPalette';
import { Toolbar } from './Toolbar';
import { TrialBanner } from './TrialBanner';

export function App() {
  const [doc, setDoc] = useState({ title: 'Untitled', published: false });
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/billing/trial')
      .then((res) => res.json())
      .then((trial: { daysLeft: number }) => setDaysLeft(trial.daysLeft));
  }, []);

  const commands = [
    { id: 'publish', label: 'Publish document', run: () => setDoc((d) => ({ ...d, published: true })) },
    { id: 'duplicate', label: 'Duplicate document', run: () => setDoc((d) => ({ ...d, title: `${d.title} copy` })) },
    { id: 'rename', label: 'Rename document', run: () => setDoc((d) => ({ ...d, title: 'Renamed' })) },
  ];

  return (
    <main>
      {daysLeft !== null && <TrialBanner daysLeft={daysLeft} onUpgrade={() => undefined} />}
      <Toolbar
        onPublish={() => setDoc((d) => ({ ...d, published: true }))}
        onDuplicate={() => setDoc((d) => ({ ...d, title: `${d.title} copy` }))}
      />
      <h1>{doc.title}</h1>
      <p>{doc.published ? 'Published' : 'Draft'}</p>
      <CommandPalette commands={commands} />
    </main>
  );
}
