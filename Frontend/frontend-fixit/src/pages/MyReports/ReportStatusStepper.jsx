import './ReportDetails.css';

const stages = ['Reported', 'In Progress', 'Resolved', 'Closed'];

// A separate stepper keeps status progression reusable when staff-driven timestamps become available.
const ReportStatusStepper = ({ status = 'reported', timestamps = {} }) => {
  const normalizedStatus = String(status).toLowerCase().replace(/[_-]+/g, ' ').trim();
  const activeStage = normalizedStatus === 'new' || normalizedStatus === 'pending'
    ? 0
    : stages.findIndex((stage) => stage.toLowerCase() === normalizedStatus);
  const activeIndex = Math.max(0, activeStage);

  return (
    <ol className="report-status-steps">
      {stages.map((stage, index) => {
        const isComplete = index <= activeIndex;
        const timestamp = timestamps[stage] || timestamps[stage.toLowerCase()];
        return (
          <li className={`report-status-step ${isComplete ? 'is-complete' : ''}`} key={stage}>
            <span className="report-status-marker" aria-hidden="true">
              {isComplete ? <i className="fa-solid fa-check" /> : null}
            </span>
            <div>
              <strong>{stage}</strong>
              {isComplete && timestamp && <time>{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(timestamp))}</time>}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default ReportStatusStepper;