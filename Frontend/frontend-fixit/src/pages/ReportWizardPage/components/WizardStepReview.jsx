const WizardStepReview = ({ form, photos }) => {
  return (
    <>
      <div className="review-list">
        <p>
          <b>Issue Type</b>
          <span>{form.category}</span>
        </p>
        <p>
          <b>Location</b>
          <span>{form.address}</span>
        </p>
        <p>
          <b>Description</b>
          <span>{form.description}</span>
        </p>
        <p>
          <b>Severity</b>
          <span className={`review-severity ${form.severity.toLowerCase()}`}>
            {form.severity}
          </span>
        </p>
      </div>

      {photos.length > 0 && (
        <div className="review-photos">
          {photos.map((photo, index) => (
            <img
              key={`${photo.preview}-${index}`}
              src={photo.preview}
              alt="Report preview"
            />
          ))}
        </div>
      )}
    </>
  );
};

export default WizardStepReview;
