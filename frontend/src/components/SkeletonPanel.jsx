import React from 'react';

function SkeletonPanel() {
  return (
    <div className="skeleton-panel">
      <div className="skeleton-header">
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line skeleton-badge" />
      </div>

      <div className="skeleton-section">
        <div className="skeleton-line skeleton-label" />
        <div className="skeleton-tags">
          <div className="skeleton-line skeleton-tag" />
          <div className="skeleton-line skeleton-tag" />
          <div className="skeleton-line skeleton-tag" />
        </div>
      </div>

      <div className="skeleton-section">
        <div className="skeleton-line skeleton-label" />
        <div className="skeleton-line skeleton-content short" />
        <div className="skeleton-line skeleton-content medium" />
      </div>

      <div className="skeleton-section">
        <div className="skeleton-line skeleton-label" />
        <div className="skeleton-line skeleton-content" />
      </div>

      <div className="skeleton-section">
        <div className="skeleton-line skeleton-label" />
        <div className="skeleton-line skeleton-content" />
        <div className="skeleton-line skeleton-content medium" />
        <div className="skeleton-line skeleton-content short" />
      </div>

      <div className="skeleton-section">
        <div className="skeleton-line skeleton-label" />
        <div className="skeleton-line skeleton-box" />
      </div>
    </div>
  );
}

export default SkeletonPanel;
