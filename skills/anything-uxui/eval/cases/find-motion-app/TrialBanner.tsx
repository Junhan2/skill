// Trial countdown notice, shown once the trial drops under a week.
const styles = `
.trial-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  background: #fef3c7;
  color: #713f12;
}

.trial-banner__action {
  min-height: 44px;
  padding-inline: 16px;
  border: 0;
  border-radius: 6px;
  background: #713f12;
  color: white;
}
`;

type TrialBannerProps = {
  daysLeft: number;
  onUpgrade: () => void;
};

export function TrialBanner({ daysLeft, onUpgrade }: TrialBannerProps) {
  if (daysLeft > 7) return null;

  return (
    <>
      <style>{styles}</style>
      <div className="trial-banner" role="status">
        <p>
          Your trial ends in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}.
        </p>
        <button type="button" className="trial-banner__action" onClick={onUpgrade}>
          Upgrade
        </button>
      </div>
    </>
  );
}
