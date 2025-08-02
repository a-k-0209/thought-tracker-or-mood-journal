// Global variables
let currentEditEntryId = null;
let currentDeleteEntryId = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Auto-resize textarea
    const textarea = document.querySelector('.thought-input');
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    }

    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to submit form
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const form = document.querySelector('.thought-form');
            if (form && document.activeElement.tagName === 'TEXTAREA') {
                form.submit();
            }
        }

        // Escape to close modals
        if (e.key === 'Escape') {
            closeEditModal();
            closeDeleteModal();
        }
    });

    // Add hover effects for entry cards
    const entryCards = document.querySelectorAll('.entry-card');
    entryCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Initialize tooltips
    initializeTooltips();
});

// Load random quote
function loadRandomQuote() {
    fetch('/api/random-quote')
        .then(response => response.json())
        .then(data => {
            const quoteDisplay = document.getElementById('quote-display');
            const quoteText = document.getElementById('quote-text');
            
            quoteText.textContent = data.quote;
            quoteDisplay.classList.remove('hidden');
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                hideQuote();
            }, 10000);
        })
        .catch(error => {
            console.error('Error loading quote:', error);
        });
}

// Hide quote display
function hideQuote() {
    const quoteDisplay = document.getElementById('quote-display');
    quoteDisplay.classList.add('hidden');
}

// Like entry functionality
function likeEntry(entryId) {
    fetch(`/like/${entryId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        // Update the like count in the UI
        const likeBtn = document.querySelector(`[onclick="likeEntry(${entryId})"]`);
        const likeCount = likeBtn.querySelector('.like-count');
        if (likeCount) {
            likeCount.textContent = data.likes;
        }
        
        // Add visual feedback
        likeBtn.style.transform = 'scale(1.2)';
        setTimeout(() => {
            likeBtn.style.transform = 'scale(1)';
        }, 200);
    })
    .catch(error => {
        console.error('Error liking entry:', error);
    });
}

// Edit entry functionality
function editEntry(entryId) {
    currentEditEntryId = entryId;
    
    // Find the entry text
    const entryCard = document.querySelector(`[data-entry-id="${entryId}"]`);
    const entryText = entryCard.querySelector('.entry-text').textContent;
    
    // Populate the edit modal
    const editTextarea = document.getElementById('edit-textarea');
    editTextarea.value = entryText;
    
    // Update form action
    const editForm = document.getElementById('edit-form');
    editForm.action = `/edit/${entryId}`;
    
    // Show modal
    const editModal = document.getElementById('edit-modal');
    editModal.classList.remove('hidden');
    
    // Focus on textarea
    editTextarea.focus();
    editTextarea.setSelectionRange(editTextarea.value.length, editTextarea.value.length);
}

// Close edit modal
function closeEditModal() {
    const editModal = document.getElementById('edit-modal');
    editModal.classList.add('hidden');
    currentEditEntryId = null;
}

// Delete entry functionality
function deleteEntry(entryId) {
    currentDeleteEntryId = entryId;
    
    // Update form action
    const deleteForm = document.getElementById('delete-form');
    deleteForm.action = `/delete/${entryId}`;
    
    // Show modal
    const deleteModal = document.getElementById('delete-modal');
    deleteModal.classList.remove('hidden');
}

// Close delete modal
function closeDeleteModal() {
    const deleteModal = document.getElementById('delete-modal');
    deleteModal.classList.add('hidden');
    currentDeleteEntryId = null;
}

// Initialize tooltips
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            tooltip.style.cssText = `
                position: absolute;
                background: #1f2937;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 0.85rem;
                z-index: 1000;
                pointer-events: none;
                white-space: nowrap;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
            
            this.tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', function() {
            if (this.tooltip) {
                this.tooltip.remove();
                this.tooltip = null;
            }
        });
    });
}

// Add smooth animations for page transitions
function addPageTransitions() {
    const links = document.querySelectorAll('a[href^="/"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.href !== window.location.href) {
                e.preventDefault();
                
                // Add loading state
                document.body.style.opacity = '0.7';
                
                // Navigate after brief delay
                setTimeout(() => {
                    window.location.href = this.href;
                }, 150);
            }
        });
    });
}

// Add search functionality with debouncing
function initializeSearch() {
    const searchInput = document.querySelector('input[name="search"]');
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            
            searchTimeout = setTimeout(() => {
                // Auto-submit form after 500ms of no typing
                this.closest('form').submit();
            }, 500);
        });
    }
}

// Add filter functionality
function initializeFilters() {
    const filterSelects = document.querySelectorAll('select[name="tag"], select[name="mood"]');
    
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            this.closest('form').submit();
        });
    });
}

// Add auto-save functionality for textarea
function initializeAutoSave() {
    const textarea = document.querySelector('.thought-input');
    if (textarea) {
        let autoSaveTimeout;
        
        textarea.addEventListener('input', function() {
            clearTimeout(autoSaveTimeout);
            
            // Save to localStorage after 2 seconds of no typing
            autoSaveTimeout = setTimeout(() => {
                localStorage.setItem('thoughtDraft', this.value);
            }, 2000);
        });
        
        // Restore draft on page load
        const savedDraft = localStorage.getItem('thoughtDraft');
        if (savedDraft && !textarea.value) {
            textarea.value = savedDraft;
        }
        
        // Clear draft after successful submission
        const form = textarea.closest('form');
        form.addEventListener('submit', function() {
            localStorage.removeItem('thoughtDraft');
        });
    }
}

// Add keyboard navigation
function initializeKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // Tab navigation for entry cards
        if (e.key === 'Tab') {
            const entryCards = document.querySelectorAll('.entry-card');
            const currentIndex = Array.from(entryCards).findIndex(card => 
                card.contains(document.activeElement)
            );
            
            if (e.shiftKey && currentIndex > 0) {
                // Navigate to previous card
                entryCards[currentIndex - 1].focus();
                e.preventDefault();
            } else if (!e.shiftKey && currentIndex < entryCards.length - 1) {
                // Navigate to next card
                entryCards[currentIndex + 1].focus();
                e.preventDefault();
            }
        }
    });
}

// Add copy functionality
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show success message
        showNotification('Copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy: ', err);
        showNotification('Failed to copy to clipboard', 'error');
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#68d391' : type === 'error' ? '#f56565' : '#4fd1c7'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1001;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize all functionality
document.addEventListener('DOMContentLoaded', function() {
    addPageTransitions();
    initializeSearch();
    initializeFilters();
    initializeAutoSave();
    initializeKeyboardNavigation();
});

// Add click outside to close modals
document.addEventListener('click', function(e) {
    const editModal = document.getElementById('edit-modal');
    const deleteModal = document.getElementById('delete-modal');
    
    if (e.target === editModal) {
        closeEditModal();
    }
    
    if (e.target === deleteModal) {
        closeDeleteModal();
    }
});

// Add form validation
function validateForm(form) {
    const textarea = form.querySelector('textarea[name="thought"]');
    if (textarea && textarea.value.trim().length < 3) {
        showNotification('Please enter at least 3 characters', 'error');
        return false;
    }
    return true;
}

// Add form submission handler
document.addEventListener('submit', function(e) {
    if (e.target.classList.contains('thought-form')) {
        if (!validateForm(e.target)) {
            e.preventDefault();
        }
    }
});

// Add loading states
function addLoadingState(element) {
    element.disabled = true;
    element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
}

function removeLoadingState(element, originalText) {
    element.disabled = false;
    element.innerHTML = originalText;
}

// Add error handling for AJAX requests
function handleAjaxError(error, userMessage = 'An error occurred') {
    console.error('AJAX Error:', error);
    showNotification(userMessage, 'error');
}

// Add success handling for AJAX requests
function handleAjaxSuccess(message = 'Operation completed successfully') {
    showNotification(message, 'success');
}

// Category Detail Modal Functions
function openCategoryDetail(categoryName, entries) {
    const modal = document.getElementById('categoryModal');
    const title = document.getElementById('categoryDetailTitle');
    const count = document.getElementById('categoryDetailCount');
    const icon = document.getElementById('categoryDetailIcon');
    const entriesContainer = document.getElementById('categoryEntries');

    // Set category info
    title.textContent = categoryName;
    count.textContent = `${entries.length} thought${entries.length !== 1 ? 's' : ''}`;

    // Set icon based on category
    const iconClass = getCategoryIcon(categoryName);
    icon.innerHTML = `<i class="${iconClass}"></i>`;

    // Populate entries
    entriesContainer.innerHTML = entries.map(entry => `
        <div class="category-entry" data-entry-id="${entry.id}">
            <div class="category-entry-header">
                <div class="category-entry-meta">
                    <div class="category-entry-time">${entry.timestamp}</div>
                    <div class="category-entry-mood">${entry.mood}</div>
                </div>
                <div class="category-entry-actions">
                    <button class="category-action-btn like-btn" onclick="likeEntry(${entry.id})" title="Like">
                        <i class="fas fa-heart"></i>
                        <span class="like-count">${entry.likes || 0}</span>
                    </button>
                    <button class="category-action-btn edit-btn" onclick="editEntry(${entry.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="category-action-btn delete-btn" onclick="deleteEntry(${entry.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="category-entry-content">
                <p class="category-entry-text">${entry.text}</p>
            </div>
            <div class="category-entry-tags">
                ${entry.tags.map(tag => `<span class="category-tag-badge">${tag}</span>`).join('')}
            </div>
        </div>
    `).join('');

    // Show modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeCategoryDetail() {
    const modal = document.getElementById('categoryModal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function getCategoryIcon(categoryName) {
    const iconMap = {
        'Work': 'fas fa-briefcase',
        'Personal Growth': 'fas fa-seedling',
        'Idea': 'fas fa-lightbulb',
        'To-Do': 'fas fa-tasks',
        'Urgent': 'fas fa-exclamation-triangle',
        'Personal': 'fas fa-user',
        'Shopping': 'fas fa-shopping-cart',
        'Reminder': 'fas fa-bell',
        'Health': 'fas fa-heartbeat',
        'Finance': 'fas fa-dollar-sign',
        'Tech': 'fas fa-laptop-code',
        'Home': 'fas fa-home'
    };
    return iconMap[categoryName] || 'fas fa-tag';
}

// Create floating particles for visual appeal
function createFloatingParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'floating-particles';
    document.body.appendChild(particlesContainer);

    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Add pulse animation to interactive elements
function addPulseAnimation() {
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('pulse');
        });
        card.addEventListener('mouseleave', () => {
            card.classList.remove('pulse');
        });
    });
}

// Add ripple effect to category cards
function addRippleEffect() {
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Initialize new interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Create floating particles
    createFloatingParticles();
    
    // Add pulse animations
    addPulseAnimation();
    
    // Add ripple effects
    addRippleEffect();
    
    // Add click outside to close category modal
    document.addEventListener('click', function(e) {
        const categoryModal = document.getElementById('categoryModal');
        if (e.target === categoryModal) {
            closeCategoryDetail();
        }
    });
    
    // Add escape key to close category modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeCategoryDetail();
        }
    });
}); 