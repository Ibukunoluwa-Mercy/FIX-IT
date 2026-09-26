const WizardStepPhotos = ({ photos, onChoosePhotos, onRemovePhoto }) => {
  return (
    <>
      <label>Add photos to show the issue</label>
      <div className="drop-zone">
        <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 28, color: '#94a3b8' }}></i>
        <strong>Drag and drop photos here</strong>
        <small>JPG, PNG, WEBP. Max 5MB each.</small>
        <label className="choose-files">
          Choose Files
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={onChoosePhotos}
          />
        </label>
      </div>

      <div className="photo-grid">
        {photos.map((photo, index) => (
          <div key={`${photo.preview}-${index}`}>
            <img src={photo.preview} alt="Report preview" />
            <button
              type="button"
              onClick={() => onRemovePhoto(index)}
            >
              <i className="fa-solid fa-xmark" style={{ fontSize: 12 }}></i>
            </button>
          </div>
        ))}

        <label className="add-photo">
          <i className="fa-solid fa-plus" style={{ fontSize: 18 }}></i>
          <small>Add more</small>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={onChoosePhotos}
          />
        </label>
      </div>
    </>
  );
};

export default WizardStepPhotos;
