// Team members panel for the workspace settings screen.
import { useEffect, useState } from 'react';

type Member = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
};

function MemberRow({ member }: { member: Member }) {
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 12, height: 64 }}>
      <img src={member.avatarUrl} alt="" width={40} height={40} style={{ borderRadius: '50%' }} />
      <div>
        <div style={{ fontWeight: 600 }}>{member.name}</div>
        <div style={{ color: '#666', fontSize: 13 }}>{member.email}</div>
      </div>
    </li>
  );
}

function MemberSkeleton() {
  return (
    <div>
      <div style={{ height: 12, background: '#eee', marginBottom: 8 }} />
      <div style={{ height: 12, background: '#eee', marginBottom: 8 }} />
      <div style={{ height: 12, background: '#eee' }} />
    </div>
  );
}

export function MemberList({ teamId }: { teamId: string }) {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Cached endpoint, typically answers in ~200ms.
    setIsLoading(true);
    fetch(`/api/teams/${teamId}/members`)
      .then((res) => res.json())
      .then((data: Member[]) => {
        setMembers(data);
        setIsLoading(false);
      });
  }, [teamId]);

  return (
    <section>
      <h2>Team members</h2>
      {isLoading ? (
        <div role="status" aria-live="polite">
          <MemberSkeleton />
          <span>Loading members…</span>
        </div>
      ) : (
        <ul>{members?.map((m) => <MemberRow key={m.id} member={m} />)}</ul>
      )}
    </section>
  );
}
