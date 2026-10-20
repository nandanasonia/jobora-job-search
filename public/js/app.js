/**
 * Jobora — app.js
 * Frontend application logic using Vanilla JavaScript and jQuery.
 *
 * Key concepts demonstrated:
 * - jQuery AJAX ($.ajax, $.get, $.post) for backend communication
 * - DOM manipulation: rendering job cards, application entries, modals
 * - Event handling: search, filters, save/unsave, modal open/close, CRUD
 * - SPA-style navigation between views without page reload
 */

'use strict';

// ─────────────────────────────────────────────────────────────
//  CONSTANTS & CONFIG
// ─────────────────────────────────────────────────────────────
const API_BASE = ''; // Routes relative to same origin (Express serves frontend too)

// Application statuses for display
const STATUS_EMOJI = {
  'Interested':        '💡',
  'Preparing to Apply':'📝',
  'Applied':           '📨',
  'Assessment':        '🧪',
  'Interview':         '🎤',
  'Offer':             '🎉',
  'Rejected':          '❌',
  'Withdrawn':         '🚫'
};

// Status badge CSS class map
const STATUS_CLASS = {
  'Interested':        'status-badge--Interested',
  'Preparing to Apply':'status-badge--Preparing',
  'Applied':           'status-badge--Applied',
  'Assessment':        'status-badge--Assessment',
  'Interview':         'status-badge--Interview',
  'Offer':             'status-badge--Offer',
  'Rejected':          'status-badge--Rejected',
  'Withdrawn':         'status-badge--Withdrawn'
};

// Motivational messages — one is shown at random in the sidebar
const MOTIVATIONS = [
  '"Every expert was once a beginner. Keep applying."',
  '"Your skills are your superpower. Let the world see them."',
  '"One application at a time — you\'re closer than you think."',
  '"Opportunities don\'t happen, you create them."',
  '"Believe in yourself and your journey."',
  '"The best time to start was yesterday. The next best time is now."'
];

// ─────────────────────────────────────────────────────────────
//  APPLICATION STATE
// ─────────────────────────────────────────────────────────────
const State = {
  currentView: 'discover',        // Active sidebar view
  savedJobIds: new Set(),         // Set of job ObjectIds the user has saved
  currentFilters: {               // Active search/filter parameters
    search: '',
    location: '',
    company: '',
    type: '',
    workMode: '',
    experienceLevel: '',
    sort: 'newest'
  },
  currentJobModal: null,          // Job object currently shown in modal
  appStatusFilter: '',            // Filter tab selected in My Applications
  isSearching: false              // Prevent duplicate search requests
};

// ─────────────────────────────────────────────────────────────
//  UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Safely escapes a string to prevent XSS when inserting into HTML.
 * We use this whenever rendering user-supplied or database text.
 */
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Format a date string as a human-readable relative or absolute date.
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date)) return '';

  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Format a date for display in full (e.g., 20 Oct 2026)
 */
function formatFullDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date)) return '';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Format salary into a readable Indian currency string.
 */
function formatSalary(job) {
  if (!job.salaryMin && !job.salaryMax) return null;
  const currency = job.currency || 'INR';

  const fmt = (val) => {
    if (currency === 'INR') {
      if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
      return `₹${val.toLocaleString('en-IN')}`;
    }
    return `${currency} ${val.toLocaleString()}`;
  };

  if (job.salaryMin && job.salaryMax) return `${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}`;
  if (job.salaryMin) return `From ${fmt(job.salaryMin)}`;
  if (job.salaryMax) return `Up to ${fmt(job.salaryMax)}`;
  return null;
}

/**
 * Get the 1–2 letter abbreviation for company name (for badge display).
 */
function getCompanyInitials(company) {
  if (!company) return '?';
  const words = company.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

// ─────────────────────────────────────────────────────────────
//  TOAST NOTIFICATIONS
// ─────────────────────────────────────────────────────────────

/**
 * Show a toast notification.
 * @param {string} message - Text to display
 * @param {'success'|'error'|'info'} type - Toast style
 * @param {number} duration - Auto-dismiss after ms (default 3500)
 */
function showToast(message, type = 'info', duration = 3500) {
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  const $toast = $(`
    <div class="toast toast--${type}" role="alert">
      <span>${icon}</span>
      <span>${escapeHtml(message)}</span>
    </div>
  `);

  $('#toast-container').append($toast);

  setTimeout(() => {
    $toast.fadeOut(300, function () { $(this).remove(); });
  }, duration);
}

// ─────────────────────────────────────────────────────────────
//  SPA VIEW NAVIGATION
// ─────────────────────────────────────────────────────────────

/**
 * Switch the main content area to the specified view.
 * Updates sidebar active state and loads the appropriate data.
 */
function navigateToView(viewName) {
  if (State.currentView === viewName) return;

  // Deactivate all views
  $('.view').removeClass('active').prop('hidden', true);
  $('.nav-item').removeClass('active').removeAttr('aria-current');

  // Activate target view
  $(`#view-${viewName}`).addClass('active').prop('hidden', false);
  $(`#nav-${viewName}`).addClass('active').attr('aria-current', 'page');

  State.currentView = viewName;

  // Close sidebar on mobile
  closeMobileSidebar();

  // Load the appropriate data for the view
  if (viewName === 'discover') {
    fetchJobs();
    fetchDashboard();
  } else if (viewName === 'saved') {
    fetchSavedJobs();
  } else if (viewName === 'applications') {
    fetchApplications();
  } else if (viewName === 'profile') {
    fetchProfile();
  }
}

// ─────────────────────────────────────────────────────────────
//  MOBILE SIDEBAR
// ─────────────────────────────────────────────────────────────

function openMobileSidebar() {
  $('#sidebar').addClass('open');
  $('#sidebar-backdrop').addClass('visible');
  $('#hamburger-btn').attr('aria-expanded', 'true');
}

function closeMobileSidebar() {
  $('#sidebar').removeClass('open');
  $('#sidebar-backdrop').removeClass('visible');
  $('#hamburger-btn').attr('aria-expanded', 'false');
}

// ─────────────────────────────────────────────────────────────
//  DASHBOARD
// ─────────────────────────────────────────────────────────────

/**
 * Fetch dashboard summary counts from the backend and update all counters.
 * Called on page load and after save/unsave or application CRUD.
 */
function fetchDashboard() {
  $.ajax({
    url: `${API_BASE}/api/dashboard`,
    method: 'GET',
    success: function (res) {
      if (!res.success) return;
      const d = res.data;

      // Update dashboard cards
      $('#dash-total-jobs').text(d.totalJobs);
      $('#dash-saved').text(d.savedCount);
      $('#dash-applications').text(d.totalApplications);
      $('#dash-interviews').text(d.interviews + d.offers);

      // Update sidebar stats
      $('#sidebar-stat-saved').text(d.savedCount);
      $('#sidebar-stat-tracking').text(d.totalApplications);
      $('#sidebar-stat-interviews').text(d.interviews + d.offers);

      // Update sidebar nav badges
      $('#sidebar-saved-count').text(d.savedCount);
      $('#sidebar-app-count').text(d.totalApplications);
    },
    error: function () {
      // Non-critical — don't show an error, just leave counts as-is
    }
  });
}

// ─────────────────────────────────────────────────────────────
//  JOB LISTINGS — FETCH & RENDER
// ─────────────────────────────────────────────────────────────

/**
 * Fetch job listings from the backend, applying current search filters.
 * Uses jQuery AJAX to send a GET request with query parameters.
 */
function fetchJobs() {
  if (State.isSearching) return;
  State.isSearching = true;

  // Show loading state, hide others
  $('#jobs-loading').show();
  $('#jobs-error').hide();
  $('#jobs-empty').hide();
  $('#job-grid').empty();
  $('#results-count-text').text('Searching…');

  // Build query string from current filters
  const params = {};
  if (State.currentFilters.search)        params.search = State.currentFilters.search;
  if (State.currentFilters.location)      params.location = State.currentFilters.location;
  if (State.currentFilters.company)       params.company = State.currentFilters.company;
  if (State.currentFilters.type)          params.type = State.currentFilters.type;
  if (State.currentFilters.workMode)      params.workMode = State.currentFilters.workMode;
  if (State.currentFilters.experienceLevel) params.experienceLevel = State.currentFilters.experienceLevel;
  if (State.currentFilters.sort)          params.sort = State.currentFilters.sort;

  $.ajax({
    url: `${API_BASE}/api/jobs`,
    method: 'GET',
    data: params,
    success: function (res) {
      $('#jobs-loading').hide();
      State.isSearching = false;

      if (!res.success) {
        showJobsError('Server returned an error. Please try again.');
        return;
      }

      const jobs = res.data || [];
      const total = res.total || 0;

      // Update results count text
      const countText = total === 0
        ? 'No jobs found'
        : `Showing ${jobs.length} of ${total} job${total !== 1 ? 's' : ''}`;
      $('#results-count-text').text(countText);

      if (jobs.length === 0) {
        $('#jobs-empty').show();
        return;
      }

      // Render each job card
      jobs.forEach(job => renderJobCard(job, '#job-grid'));
    },
    error: function (xhr) {
      $('#jobs-loading').hide();
      State.isSearching = false;
      const msg = xhr.responseJSON?.message || 'Could not connect to the server. Is it running?';
      showJobsError(msg);
    }
  });
}

function showJobsError(msg) {
  $('#jobs-error-msg').text(msg);
  $('#jobs-error').show();
  $('#results-count-text').text('Error loading jobs');
}

// ─────────────────────────────────────────────────────────────
//  JOB CARD RENDERING
// ─────────────────────────────────────────────────────────────

/**
 * Build and append a job card to the specified grid container.
 * Uses escapeHtml() to safely render any text content.
 */
function renderJobCard(job, gridSelector) {
  const isSaved = State.savedJobIds.has(String(job._id));
  const salary = formatSalary(job);
  const initials = getCompanyInitials(job.company);
  const postedDate = formatDate(job.postedAt || job.createdAt);

  // Build skills chips (show up to 5)
  const skillsHtml = (job.skills || []).slice(0, 5).map(skill =>
    `<span class="skill-chip">${escapeHtml(skill)}</span>`
  ).join('');

  const moreSkills = (job.skills || []).length > 5
    ? `<span class="skill-chip">+${job.skills.length - 5} more</span>` : '';

  const cardHtml = `
    <article class="job-card ${isSaved ? 'is-saved' : ''}" data-job-id="${escapeHtml(job._id)}" role="listitem">
      <div class="job-card-header">
        <div class="company-badge" aria-hidden="true">${escapeHtml(initials)}</div>
        <div class="job-card-header-right">
          ${job.isDemo ? '<span class="badge-demo" title="This is a demo listing, not a real vacancy">📋 Demo</span>' : ''}
          <button
            class="save-btn ${isSaved ? 'saved' : ''}"
            data-job-id="${escapeHtml(job._id)}"
            aria-label="${isSaved ? 'Unsave this job' : 'Save this job'}"
            title="${isSaved ? 'Remove from saved' : 'Save job'}"
          >${isSaved ? '🔖' : '🔖'}</button>
        </div>
      </div>

      <div>
        <h3 class="job-card-title">${escapeHtml(job.title)}</h3>
        <p class="job-card-company">${escapeHtml(job.company)}</p>
      </div>

      <div class="job-tags">
        ${job.location ? `<span class="job-tag job-tag--location">📍 ${escapeHtml(job.location)}</span>` : ''}
        ${job.employmentType ? `<span class="job-tag job-tag--type">${escapeHtml(job.employmentType)}</span>` : ''}
        ${job.workMode ? `<span class="job-tag job-tag--mode">${escapeHtml(job.workMode)}</span>` : ''}
        ${job.experienceLevel ? `<span class="job-tag job-tag--level">${escapeHtml(job.experienceLevel)}</span>` : ''}
      </div>

      ${salary ? `<div class="job-salary">💰 ${escapeHtml(salary)} / year</div>` : ''}

      <p class="job-description-snippet">${escapeHtml(job.description)}</p>

      ${skillsHtml ? `<div class="job-skills">${skillsHtml}${moreSkills}</div>` : ''}

      <div class="job-card-footer">
        <span class="job-posted-date">${escapeHtml(postedDate)}</span>
        <div class="job-card-actions">
          <button class="btn btn--ghost btn--sm view-details-btn" data-job-id="${escapeHtml(job._id)}" aria-label="View details for ${escapeHtml(job.title)}">
            Details
          </button>
          <button class="btn btn--primary btn--sm track-btn" data-job-id="${escapeHtml(job._id)}" aria-label="Track application for ${escapeHtml(job.title)}">
            + Track
          </button>
        </div>
      </div>
    </article>
  `;

  $(gridSelector).append(cardHtml);
}

// ─────────────────────────────────────────────────────────────
//  SAVE / UNSAVE JOB
// ─────────────────────────────────────────────────────────────

/**
 * Toggle the saved state of a job.
 * Uses POST to save and DELETE to unsave, persisting in MongoDB.
 */
function toggleSaveJob(jobId, $btn) {
  const isSaved = State.savedJobIds.has(jobId);

  // Disable button while request is in flight
  $btn.prop('disabled', true);

  if (isSaved) {
    // Unsave: DELETE /api/saved-jobs/:jobId
    $.ajax({
      url: `${API_BASE}/api/saved-jobs/${jobId}`,
      method: 'DELETE',
      success: function (res) {
        if (res.success) {
          State.savedJobIds.delete(jobId);
          updateSaveBtnUI(jobId, false);
          showToast('Job removed from saved list.', 'info');
          fetchDashboard();
          // If in saved view, remove the card
          if (State.currentView === 'saved') {
            $(`[data-job-id="${jobId}"]`).closest('.job-card').fadeOut(300, function () {
              $(this).remove();
              checkSavedEmpty();
            });
          }
        } else {
          showToast(res.message || 'Could not unsave job.', 'error');
        }
        $btn.prop('disabled', false);
      },
      error: function (xhr) {
        const msg = xhr.responseJSON?.message || 'Could not unsave job. Please try again.';
        showToast(msg, 'error');
        $btn.prop('disabled', false);
      }
    });
  } else {
    // Save: POST /api/saved-jobs
    $.ajax({
      url: `${API_BASE}/api/saved-jobs`,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ jobId }),
      success: function (res) {
        if (res.success) {
          State.savedJobIds.add(jobId);
          updateSaveBtnUI(jobId, true);
          showToast('Job saved! Find it in Saved Jobs.', 'success');
          fetchDashboard();
        } else {
          showToast(res.message || 'Could not save job.', 'error');
        }
        $btn.prop('disabled', false);
      },
      error: function (xhr) {
        const msg = xhr.responseJSON?.message || 'Could not save job. Please try again.';
        showToast(msg, 'error');
        $btn.prop('disabled', false);
      }
    });
  }
}

/**
 * Update all save buttons on the page for a given jobId.
 */
function updateSaveBtnUI(jobId, isSaved) {
  $(`.save-btn[data-job-id="${jobId}"]`).each(function () {
    const $btn = $(this);
    if (isSaved) {
      $btn.addClass('saved').attr('aria-label', 'Unsave this job').attr('title', 'Remove from saved');
    } else {
      $btn.removeClass('saved').attr('aria-label', 'Save this job').attr('title', 'Save job');
    }
  });

  // Update the parent card's saved class
  $(`.job-card[data-job-id="${jobId}"]`).toggleClass('is-saved', isSaved);
}

/**
 * Fetch saved job IDs from the backend to populate State.savedJobIds.
 * Called on page load so save button states are accurate from the start.
 */
function fetchSavedJobIds() {
  $.ajax({
    url: `${API_BASE}/api/saved-jobs`,
    method: 'GET',
    success: function (res) {
      if (res.success && Array.isArray(res.data)) {
        State.savedJobIds.clear();
        res.data.forEach(sj => {
          if (sj.job && sj.job._id) {
            State.savedJobIds.add(String(sj.job._id));
          }
        });
        // After loading saved IDs, update any already-rendered cards
        State.savedJobIds.forEach(id => updateSaveBtnUI(id, true));
      }
    }
  });
}

// ─────────────────────────────────────────────────────────────
//  SAVED JOBS VIEW
// ─────────────────────────────────────────────────────────────

function fetchSavedJobs() {
  $('#saved-loading').show();
  $('#saved-error').hide();
  $('#saved-empty').hide();
  $('#saved-grid').empty();

  $.ajax({
    url: `${API_BASE}/api/saved-jobs`,
    method: 'GET',
    success: function (res) {
      $('#saved-loading').hide();
      if (!res.success) {
        showSavedError(res.message || 'Could not load saved jobs.');
        return;
      }

      const savedJobs = res.data || [];

      if (savedJobs.length === 0) {
        $('#saved-empty').show();
        return;
      }

      savedJobs.forEach(sj => {
        if (sj.job) renderJobCard(sj.job, '#saved-grid');
      });

      // Update saved IDs from response
      State.savedJobIds.clear();
      savedJobs.forEach(sj => {
        if (sj.job) State.savedJobIds.add(String(sj.job._id));
      });
      State.savedJobIds.forEach(id => updateSaveBtnUI(id, true));
    },
    error: function (xhr) {
      $('#saved-loading').hide();
      const msg = xhr.responseJSON?.message || 'Could not load saved jobs.';
      showSavedError(msg);
    }
  });
}

function showSavedError(msg) {
  $('#saved-error-msg').text(msg);
  $('#saved-error').show();
}

function checkSavedEmpty() {
  if ($('#saved-grid .job-card').length === 0) {
    $('#saved-empty').show();
  }
}

// ─────────────────────────────────────────────────────────────
//  JOB DETAIL MODAL
// ─────────────────────────────────────────────────────────────

/**
 * Fetch a job's full details from the API and open the detail modal.
 */
function openJobModal(jobId) {
  // Show modal with a loading skeleton
  const $overlay = $('#job-modal-overlay');
  $overlay.prop('hidden', false);
  $('#modal-body').html('<div class="state-panel state--loading"><div class="spinner"></div><p>Loading job details…</p></div>');
  $('#modal-footer').empty();
  $('#modal-company-badge').text('…');
  $('#modal-job-title').text('Loading…');
  $('#modal-company-name').text('');

  // Trap focus in modal
  $('#modal-close-btn').focus();

  $.ajax({
    url: `${API_BASE}/api/jobs/${jobId}`,
    method: 'GET',
    success: function (res) {
      if (!res.success || !res.data) {
        $('#modal-body').html('<div class="state-panel state--error"><p>Could not load job details.</p></div>');
        return;
      }
      const job = res.data;
      State.currentJobModal = job;
      renderJobModal(job);
    },
    error: function (xhr) {
      const msg = xhr.responseJSON?.message || 'Could not load job details.';
      $('#modal-body').html(`<div class="state-panel state--error"><div class="state-icon">⚠️</div><p>${escapeHtml(msg)}</p></div>`);
    }
  });
}

/**
 * Populate the modal with full job details.
 */
function renderJobModal(job) {
  const isSaved = State.savedJobIds.has(String(job._id));
  const salary = formatSalary(job);
  const postedDate = formatFullDate(job.postedAt || job.createdAt);
  const deadline = job.applicationDeadline ? formatFullDate(job.applicationDeadline) : null;
  const initials = getCompanyInitials(job.company);

  // Header
  $('#modal-company-badge').text(initials);
  $('#modal-job-title').text(job.title);
  $('#modal-company-name').text(job.company);

  // Build body HTML
  let bodyHtml = '';

  // Tags row
  bodyHtml += `<div class="modal-tags-row">`;
  if (job.location) bodyHtml += `<span class="job-tag job-tag--location">📍 ${escapeHtml(job.location)}</span>`;
  if (job.employmentType) bodyHtml += `<span class="job-tag job-tag--type">${escapeHtml(job.employmentType)}</span>`;
  if (job.workMode) bodyHtml += `<span class="job-tag job-tag--mode">${escapeHtml(job.workMode)}</span>`;
  if (job.experienceLevel) bodyHtml += `<span class="job-tag job-tag--level">${escapeHtml(job.experienceLevel)}</span>`;
  if (job.isDemo) bodyHtml += `<span class="badge-demo">📋 Demo Listing</span>`;
  bodyHtml += `</div>`;

  // Salary
  if (salary) {
    bodyHtml += `<div class="modal-section"><p class="salary-display">💰 ${escapeHtml(salary)} / year</p></div>`;
  }

  // Description
  bodyHtml += `<div class="modal-section">
    <p class="modal-section-title">About this Role</p>
    <div class="modal-section-content">${escapeHtml(job.description)}</div>
  </div>`;

  // Responsibilities
  if (job.responsibilities && job.responsibilities.trim()) {
    bodyHtml += `<div class="modal-section">
      <p class="modal-section-title">Responsibilities</p>
      <div class="modal-section-content">${escapeHtml(job.responsibilities)}</div>
    </div>`;
  }

  // Qualifications
  if (job.qualifications && job.qualifications.trim()) {
    bodyHtml += `<div class="modal-section">
      <p class="modal-section-title">Qualifications</p>
      <div class="modal-section-content">${escapeHtml(job.qualifications)}</div>
    </div>`;
  }

  // Skills
  if (job.skills && job.skills.length > 0) {
    const chips = job.skills.map(s => `<span class="skill-chip">${escapeHtml(s)}</span>`).join('');
    bodyHtml += `<div class="modal-section">
      <p class="modal-section-title">Required Skills</p>
      <div class="job-skills">${chips}</div>
    </div>`;
  }

  // Company Info
  if (job.companyInfo && job.companyInfo.trim()) {
    bodyHtml += `<div class="modal-section">
      <p class="modal-section-title">About the Company</p>
      <div class="modal-section-content">${escapeHtml(job.companyInfo)}</div>
    </div>`;
  }

  // Meta info
  bodyHtml += `<div class="modal-section">
    <p class="modal-section-title">Details</p>
    <div style="display:flex; flex-direction:column; gap:8px; font-size:13px; color: var(--text-secondary);">
      ${postedDate ? `<span>📅 Posted: ${escapeHtml(postedDate)}</span>` : ''}
      ${deadline ? `<span class="deadline-badge">⏳ Deadline: ${escapeHtml(deadline)}</span>` : ''}
      ${job.source ? `<span>🔗 Source: ${escapeHtml(job.source)}</span>` : ''}
    </div>
  </div>`;

  // Demo notice
  if (job.isDemo) {
    bodyHtml += `<div class="info-banner">
      <span class="info-banner-icon">ℹ️</span>
      <span>This is a <strong>demo listing</strong> created for classroom demonstration. It does not represent a real job vacancy. Do not submit real personal information.</span>
    </div>`;
  }

  $('#modal-body').html(bodyHtml);

  // Build footer actions
  let footerHtml = '';

  // Save button
  footerHtml += `<button class="btn ${isSaved ? 'btn--ghost' : 'btn--secondary'} save-btn ${isSaved ? 'saved' : ''}"
    data-job-id="${escapeHtml(job._id)}"
    id="modal-save-btn"
    aria-label="${isSaved ? 'Unsave this job' : 'Save this job'}">
    ${isSaved ? '🔖 Saved' : '🔖 Save Job'}
  </button>`;

  // Track button
  footerHtml += `<button class="btn btn--primary track-btn" data-job-id="${escapeHtml(job._id)}" id="modal-track-btn">
    📋 Track Application
  </button>`;

  // External apply button — only if a valid URL is provided
  if (job.applicationUrl) {
    footerHtml += `<a href="${escapeHtml(job.applicationUrl)}" target="_blank" rel="noopener noreferrer"
      class="btn btn--success"
      aria-label="Apply externally on company website (opens new tab)">
      🚀 Apply Externally ↗
    </a>`;
  }

  $('#modal-footer').html(footerHtml);
}

function closeJobModal() {
  $('#job-modal-overlay').prop('hidden', true);
  State.currentJobModal = null;
}

// ─────────────────────────────────────────────────────────────
//  APPLICATION TRACKER — FETCH & RENDER
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all tracked applications from the backend and render them.
 */
function fetchApplications() {
  $('#apps-loading').show();
  $('#apps-error').hide();
  $('#apps-empty').hide();
  $('#applications-list').empty();

  $.ajax({
    url: `${API_BASE}/api/applications`,
    method: 'GET',
    success: function (res) {
      $('#apps-loading').hide();
      if (!res.success) {
        showAppsError(res.message || 'Could not load applications.');
        return;
      }

      let apps = res.data || [];

      // Apply status filter tab
      if (State.appStatusFilter) {
        apps = apps.filter(a => a.status === State.appStatusFilter);
      }

      if (apps.length === 0) {
        $('#apps-empty').show();
        return;
      }

      apps.forEach(app => renderApplicationCard(app));
    },
    error: function (xhr) {
      $('#apps-loading').hide();
      const msg = xhr.responseJSON?.message || 'Could not load applications.';
      showAppsError(msg);
    }
  });
}

/**
 * Render a single application card in the tracker view.
 */
function renderApplicationCard(app) {
  const job = app.job || {};
  const jobTitle = job.title || 'Unknown Job';
  const company = job.company || 'Unknown Company';
  const dateAdded = formatDate(app.dateAdded);
  const appliedAt = app.appliedAt ? formatFullDate(app.appliedAt) : null;
  const statusClass = STATUS_CLASS[app.status] || '';
  const statusEmoji = STATUS_EMOJI[app.status] || '•';

  const cardHtml = `
    <article class="app-card" data-app-id="${escapeHtml(app._id)}" role="listitem">
      <div class="app-card-main">
        <h3 class="app-card-title">${escapeHtml(jobTitle)}</h3>
        <p class="app-card-company">🏢 ${escapeHtml(company)}</p>
        <div class="app-card-meta">
          <span class="status-badge ${escapeHtml(statusClass)}">${escapeHtml(statusEmoji)} ${escapeHtml(app.status)}</span>
          <span class="app-card-date">Added ${escapeHtml(dateAdded)}</span>
          ${appliedAt ? `<span class="app-card-date">Applied: ${escapeHtml(appliedAt)}</span>` : ''}
        </div>
        ${app.notes ? `<div class="app-card-notes">${escapeHtml(app.notes)}</div>` : ''}
      </div>
      <div class="app-card-actions">
        <button class="btn btn--ghost btn--sm edit-app-btn" data-app-id="${escapeHtml(app._id)}" aria-label="Edit application for ${escapeHtml(jobTitle)}">
          ✏️ Edit
        </button>
        ${job._id ? `<button class="btn btn--ghost btn--sm view-details-btn" data-job-id="${escapeHtml(job._id)}" aria-label="View job details for ${escapeHtml(jobTitle)}">
          👁 Details
        </button>` : ''}
        <button class="btn btn--danger btn--sm delete-app-btn" data-app-id="${escapeHtml(app._id)}" aria-label="Delete application for ${escapeHtml(jobTitle)}">
          🗑 Delete
        </button>
      </div>
    </article>
  `;

  $('#applications-list').append(cardHtml);
}

function showAppsError(msg) {
  $('#apps-error-msg').text(msg);
  $('#apps-error').show();
}

// ─────────────────────────────────────────────────────────────
//  ADD TO APPLICATION TRACKER
// ─────────────────────────────────────────────────────────────

/**
 * Add a job to the application tracker with an 'Interested' status.
 * Called when user clicks "Track Application" or "+ Track" button.
 */
function addToTracker(jobId, $btn) {
  $btn.prop('disabled', true).text('Adding…');

  $.ajax({
    url: `${API_BASE}/api/applications`,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ jobId: jobId, status: 'Interested' }),
    success: function (res) {
      if (res.success) {
        showToast('Added to your application tracker! Update its status in "My Applications".', 'success', 5000);
        fetchDashboard();
        closeJobModal();
      } else {
        showToast(res.message || 'Could not add to tracker.', 'error');
      }
      $btn.prop('disabled', false).text('+ Track');
    },
    error: function (xhr) {
      const msg = xhr.responseJSON?.message || 'Could not add to tracker. Please try again.';
      showToast(msg, 'error');
      $btn.prop('disabled', false).text('+ Track');
    }
  });
}

// ─────────────────────────────────────────────────────────────
//  EDIT APPLICATION MODAL
// ─────────────────────────────────────────────────────────────

/**
 * Fetch application details and open the edit modal.
 */
function openEditAppModal(appId) {
  $.ajax({
    url: `${API_BASE}/api/applications/${appId}`,
    method: 'GET',
    success: function (res) {
      if (!res.success || !res.data) {
        showToast('Could not load application details.', 'error');
        return;
      }
      const app = res.data;

      // Populate the edit form
      $('#edit-app-id').val(app._id);
      $('#edit-status').val(app.status);
      $('#edit-notes').val(app.notes || '');

      if (app.appliedAt) {
        // Format date as YYYY-MM-DD for the date input
        const d = new Date(app.appliedAt);
        const formatted = d.toISOString().substring(0, 10);
        $('#edit-applied-at').val(formatted);
      } else {
        $('#edit-applied-at').val('');
      }

      $('#edit-app-feedback').text('').removeClass('success error');
      $('#edit-app-modal-overlay').prop('hidden', false);
      $('#edit-status').focus();
    },
    error: function () {
      showToast('Could not load application details.', 'error');
    }
  });
}

function closeEditAppModal() {
  $('#edit-app-modal-overlay').prop('hidden', true);
}

// ─────────────────────────────────────────────────────────────
//  DELETE APPLICATION
// ─────────────────────────────────────────────────────────────

function deleteApplication(appId, $card) {
  if (!confirm('Delete this application from your tracker? This cannot be undone.')) return;

  $.ajax({
    url: `${API_BASE}/api/applications/${appId}`,
    method: 'DELETE',
    success: function (res) {
      if (res.success) {
        $card.fadeOut(300, function () {
          $(this).remove();
          // Show empty state if no cards left
          if ($('#applications-list .app-card').length === 0) {
            $('#apps-empty').show();
          }
        });
        showToast('Application removed from tracker.', 'info');
        fetchDashboard();
      } else {
        showToast(res.message || 'Could not delete application.', 'error');
      }
    },
    error: function (xhr) {
      const msg = xhr.responseJSON?.message || 'Could not delete application. Please try again.';
      showToast(msg, 'error');
    }
  });
}

// ─────────────────────────────────────────────────────────────
//  PROFILE — FETCH & SAVE
// ─────────────────────────────────────────────────────────────

/**
 * Fetch profile data from the backend and populate the profile form.
 */
function fetchProfile() {
  $('#profile-feedback').text('').removeClass('success error');

  $.ajax({
    url: `${API_BASE}/api/profile`,
    method: 'GET',
    success: function (res) {
      if (!res.success) return;
      const p = res.data;

      $('#profile-name').val(p.displayName || '');
      $('#profile-roles').val((p.preferredRoles || []).join(', '));
      $('#profile-locations').val((p.preferredLocations || []).join(', '));
      $('#profile-skills').val((p.skills || []).join(', '));
      $('#profile-exp-level').val(p.experienceLevel || '');
      $('#profile-work-mode').val(p.preferredWorkMode || '');

      // Set checkboxes
      $('input[name="preferredEmploymentTypes"]').prop('checked', false);
      (p.preferredEmploymentTypes || []).forEach(type => {
        $(`input[name="preferredEmploymentTypes"][value="${type}"]`).prop('checked', true);
      });
    }
  });
}

/**
 * Save the profile form data to the backend using a PUT request.
 */
function saveProfile() {
  const $btn = $('#save-profile-btn');
  $btn.prop('disabled', true).text('Saving…');
  $('#profile-feedback').text('').removeClass('success error');

  // Collect form data
  const displayName = $('#profile-name').val().trim();
  const preferredRoles = parseCommaSeparated($('#profile-roles').val());
  const preferredLocations = parseCommaSeparated($('#profile-locations').val());
  const skills = parseCommaSeparated($('#profile-skills').val());
  const experienceLevel = $('#profile-exp-level').val();
  const preferredWorkMode = $('#profile-work-mode').val();

  // Collect checked employment types
  const preferredEmploymentTypes = [];
  $('input[name="preferredEmploymentTypes"]:checked').each(function () {
    preferredEmploymentTypes.push($(this).val());
  });

  $.ajax({
    url: `${API_BASE}/api/profile`,
    method: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify({
      displayName,
      preferredRoles,
      preferredLocations,
      skills,
      experienceLevel,
      preferredWorkMode,
      preferredEmploymentTypes
    }),
    success: function (res) {
      $btn.prop('disabled', false).text('Save Profile');
      if (res.success) {
        $('#profile-feedback').text('✅ Profile saved successfully!').addClass('success');
        showToast('Profile updated.', 'success');
      } else {
        $('#profile-feedback').text('❌ ' + (res.message || 'Could not save profile.')).addClass('error');
      }
    },
    error: function (xhr) {
      $btn.prop('disabled', false).text('Save Profile');
      const msg = xhr.responseJSON?.message || 'Could not save profile. Please try again.';
      $('#profile-feedback').text('❌ ' + msg).addClass('error');
    }
  });
}

/**
 * Parse a comma-separated string into a clean array of trimmed, non-empty strings.
 */
function parseCommaSeparated(str) {
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

// ─────────────────────────────────────────────────────────────
//  SEARCH & FILTER HANDLERS
// ─────────────────────────────────────────────────────────────

/**
 * Read all search inputs and filter selects, update State.currentFilters,
 * and fetch matching jobs from the backend.
 */
function applyFiltersAndSearch() {
  State.currentFilters.search        = $('#search-keyword').val().trim();
  State.currentFilters.location      = $('#search-location').val().trim();
  State.currentFilters.company       = $('#search-company').val().trim();
  State.currentFilters.type          = $('#filter-type').val();
  State.currentFilters.workMode      = $('#filter-mode').val();
  State.currentFilters.experienceLevel = $('#filter-level').val();
  State.currentFilters.sort          = $('#filter-sort').val();

  fetchJobs();
}

/**
 * Clear all search fields and filters, then reload jobs.
 */
function clearFilters() {
  $('#search-keyword').val('');
  $('#search-location').val('');
  $('#search-company').val('');
  $('#filter-type').val('');
  $('#filter-mode').val('');
  $('#filter-level').val('');
  $('#filter-sort').val('newest');

  State.currentFilters = {
    search: '', location: '', company: '',
    type: '', workMode: '', experienceLevel: '', sort: 'newest'
  };

  fetchJobs();
}

// ─────────────────────────────────────────────────────────────
//  EVENT BINDING (jQuery)
// ─────────────────────────────────────────────────────────────

/**
 * Bind all event handlers using jQuery.
 * Uses event delegation for dynamically-rendered elements.
 */
function bindEvents() {

  // ── Navigation ──
  // Sidebar nav buttons (discover, saved, applications, profile)
  $(document).on('click', '.nav-item[data-view]', function () {
    navigateToView($(this).data('view'));
  });

  // Buttons with data-view attribute elsewhere (e.g., empty state "Browse Jobs" buttons)
  $(document).on('click', 'button[data-view]', function () {
    navigateToView($(this).data('view'));
  });

  // ── Mobile Sidebar ──
  $('#hamburger-btn').on('click', function () {
    if ($('#sidebar').hasClass('open')) {
      closeMobileSidebar();
    } else {
      openMobileSidebar();
    }
  });

  $('#sidebar-backdrop').on('click', closeMobileSidebar);

  // Close sidebar with Escape key
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') {
      if ($('#sidebar').hasClass('open')) {
        closeMobileSidebar();
      }
      if (!$('#job-modal-overlay').prop('hidden')) {
        closeJobModal();
      }
      if (!$('#edit-app-modal-overlay').prop('hidden')) {
        closeEditAppModal();
      }
    }
  });

  // ── Search Form ──
  $('#search-form').on('submit', function (e) {
    e.preventDefault(); // Prevent page reload
    applyFiltersAndSearch();
  });

  // ── Filter Changes — fire search automatically ──
  $('#filter-type, #filter-mode, #filter-level, #filter-sort').on('change', function () {
    applyFiltersAndSearch();
  });

  // ── Clear Filters ──
  $('#clear-filters-btn, #empty-clear-btn').on('click', function () {
    clearFilters();
  });

  // ── Save / Unsave Button (event delegation — works for dynamically rendered cards) ──
  $(document).on('click', '.save-btn', function (e) {
    e.stopPropagation();
    const jobId = $(this).data('job-id');
    if (jobId) toggleSaveJob(String(jobId), $(this));
  });

  // ── View Job Details ──
  $(document).on('click', '.view-details-btn', function () {
    const jobId = $(this).data('job-id');
    if (jobId) openJobModal(String(jobId));
  });

  // ── Track Application (from card or modal) ──
  $(document).on('click', '.track-btn', function () {
    const jobId = $(this).data('job-id');
    if (jobId) addToTracker(String(jobId), $(this));
  });

  // ── Modal Close ──
  $('#modal-close-btn').on('click', closeJobModal);

  // Close modal when clicking the overlay background
  $('#job-modal-overlay').on('click', function (e) {
    if ($(e.target).is('#job-modal-overlay')) closeJobModal();
  });

  // ── Application Status Tabs ──
  $(document).on('click', '.status-tab', function () {
    $('.status-tab').removeClass('active').attr('aria-selected', 'false');
    $(this).addClass('active').attr('aria-selected', 'true');
    State.appStatusFilter = $(this).data('status');
    fetchApplications();
  });

  // ── Edit Application ──
  $(document).on('click', '.edit-app-btn', function () {
    const appId = $(this).data('app-id');
    if (appId) openEditAppModal(String(appId));
  });

  // ── Edit Application Modal Close ──
  $('#edit-modal-close-btn, #edit-modal-cancel-btn').on('click', closeEditAppModal);

  $('#edit-app-modal-overlay').on('click', function (e) {
    if ($(e.target).is('#edit-app-modal-overlay')) closeEditAppModal();
  });

  // ── Edit Application Form Submit ──
  $('#edit-app-form').on('submit', function (e) {
    e.preventDefault();
    const appId = $('#edit-app-id').val();
    const status = $('#edit-status').val();
    const notes = $('#edit-notes').val().trim();
    const appliedAt = $('#edit-applied-at').val() || null;

    if (!appId) return;

    const $saveBtn = $('#edit-app-save-btn');
    $saveBtn.prop('disabled', true).text('Saving…');
    $('#edit-app-feedback').text('').removeClass('success error');

    $.ajax({
      url: `${API_BASE}/api/applications/${appId}`,
      method: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({ status, notes, appliedAt }),
      success: function (res) {
        $saveBtn.prop('disabled', false).text('Save Changes');
        if (res.success) {
          showToast('Application updated!', 'success');
          closeEditAppModal();
          fetchApplications();
          fetchDashboard();
        } else {
          $('#edit-app-feedback').text(res.message || 'Could not update.').addClass('error');
        }
      },
      error: function (xhr) {
        $saveBtn.prop('disabled', false).text('Save Changes');
        const msg = xhr.responseJSON?.message || 'Could not update application.';
        $('#edit-app-feedback').text(msg).addClass('error');
      }
    });
  });

  // ── Delete Application ──
  $(document).on('click', '.delete-app-btn', function () {
    const appId = $(this).data('app-id');
    const $card = $(this).closest('.app-card');
    if (appId) deleteApplication(String(appId), $card);
  });

  // ── Retry Buttons ──
  $('#jobs-retry-btn').on('click', fetchJobs);
  $('#saved-retry-btn').on('click', fetchSavedJobs);
  $('#apps-retry-btn').on('click', fetchApplications);

  // ── Profile Form Submit ──
  $('#profile-form').on('submit', function (e) {
    e.preventDefault();
    saveProfile();
  });
}

// ─────────────────────────────────────────────────────────────
//  INITIAL SETUP
// ─────────────────────────────────────────────────────────────

/**
 * Set the current date in the header.
 */
function renderCurrentDate() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  $('#current-date').text(dateStr);
}

/**
 * Show a random motivational message in the sidebar.
 */
function renderMotivation() {
  const msg = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
  $('#motivation-msg').text(msg);
}

/**
 * Main initialisation function — called when the DOM is ready.
 */
function init() {
  renderCurrentDate();
  renderMotivation();
  bindEvents();

  // Load initial data
  fetchSavedJobIds();   // Load saved job IDs first (for button states)
  fetchJobs();          // Load job listings for discover view
  fetchDashboard();     // Load dashboard counts

  // Make discover view active
  navigateToView('discover');
}

// ─────────────────────────────────────────────────────────────
//  JQUERY DOCUMENT READY — Entry Point
// ─────────────────────────────────────────────────────────────

$(document).ready(function () {
  init();
});
