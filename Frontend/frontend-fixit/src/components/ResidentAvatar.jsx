import { useEffect, useState } from 'react';
import { loadResidentAvatar } from './residentAvatarEvents';

const ResidentAvatar = ({ name = 'Resident', className = '', imageClassName = '', fallbackClassName = '' }) => {
  const token = localStorage.getItem('fixitToken') || localStorage.getItem('token') || '';
  const fallback = name.trim().charAt(0).toUpperCase() || 'R';
  const [avatarUrl, setAvatarUrl] = useState('');
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const onAvatarUpdated = (event) => {
      setAvatarUrl(event.detail || '');
      setImageFailed(false);
    };
    window.addEventListener('fixit-avatar-updated', onAvatarUpdated);
    loadResidentAvatar(token).then((url) => {
      if (active) {
        setAvatarUrl(url);
        setImageFailed(false);
      }
    });
    return () => {
      active = false;
      window.removeEventListener('fixit-avatar-updated', onAvatarUpdated);
    };
  }, [token]);

  return (
    <span className={`resident-avatar ${className}`} aria-label={`${name} profile picture`}>
      {avatarUrl && !imageFailed ? (
        <img className={`resident-avatar-image ${imageClassName}`} src={avatarUrl} alt="" onError={() => setImageFailed(true)} />
      ) : (
        <span className={`resident-avatar-fallback ${fallbackClassName}`} aria-hidden="true">{fallback}</span>
      )}
    </span>
  );
};

export default ResidentAvatar;
