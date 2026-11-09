'use client';

export default function PluginModalNotice({ notice }) {
  if (!notice?.message) return null;

  return (
    <p
      className={`plugin-modal-notice plugin-modal-notice--${notice.type}`}
      role="status"
    >
      {notice.message}
    </p>
  );
}
