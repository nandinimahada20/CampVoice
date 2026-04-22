/**
 * Function to switch between different screens
 * @param {string} pageId - The ID of the div to show
 */
function showPage(pageId) {
    // Hide every single screen
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.add('hidden');
    });

    // Show only the one we clicked on
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }

    // Scroll to top
    window.scrollTo(0, 0);

    // Refresh data if entering dashboards
    if (pageId === 'page-student-dash' || pageId === 'page-admin-dash') {
        renderComplaints();
    }
}

/**
 * Handle Complaint Submission
 */
function submitComplaint() {
    // Get form values
    const title = document.getElementById('c-title').value;
    const desc = document.getElementById('c-desc').value;
    const cat = document.getElementById('c-cat').value;

    // Validate
    if (title.trim() === '' || desc.trim() === '' || cat === 'Select category') {
        alert("Please fill out all fields and select a category.");
        return;
    }

    // Get existing complaints from LocalStorage
    let complaints = JSON.parse(localStorage.getItem('campus_complaints')) || [];

    // Create new complaint object
    const newComplaint = {
        id: Date.now(), // Unique ID based on timestamp
        title: title,
        description: desc,
        category: cat,
        status: 'Pending',
        date: new Date().toLocaleDateString()
    };

    // Save to LocalStorage
    complaints.push(newComplaint);
    localStorage.setItem('campus_complaints', JSON.stringify(complaints));

    // Clear form inputs
    document.getElementById('c-title').value = '';
    document.getElementById('c-desc').value = '';
    document.getElementById('c-cat').value = 'Select category';

    alert('Complaint Submitted Successfully!');
    
    // Update the UI immediately
    renderComplaints();
}

/**
 * Render complaints on both Student and Admin Dashboards
 */
function renderComplaints() {
    let complaints = JSON.parse(localStorage.getItem('campus_complaints')) || [];
    
    const studentFeed = document.getElementById('student-feed');
    const adminFeed = document.getElementById('admin-feed');
    
    // Reverse array so newest complaints show up first
    complaints = complaints.reverse();

    // Check if empty
    if (complaints.length === 0) {
        const emptyState = `
            <div class="empty-state">
                <i class="fas fa-inbox" style="font-size: 40px; margin-bottom: 10px; color: #ccc;"></i>
                <p>No complaints found</p>
                <span style="font-size: 12px;">Submit a new complaint to see it here.</span>
            </div>
        `;
        if (studentFeed) studentFeed.innerHTML = emptyState;
        if (adminFeed) adminFeed.innerHTML = emptyState;
        return;
    }

    let studentHTML = '';
    let adminHTML = '';

    complaints.forEach(c => {
        const statusClass = c.status === 'Pending' ? 'pending' : 'resolved';
        
        // Base structure of the card
        const cardContent = `
            <div class="complaint-header">
                <h4>${c.title}</h4>
                <span class="status-badge ${statusClass}">${c.status}</span>
            </div>
            <p style="font-size: 14px; color: #555; margin-bottom: 15px;">${c.description}</p>
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #888;">
                <span><strong>Category:</strong> ${c.category}</span>
                <span><strong>Date:</strong> ${c.date}</span>
            </div>
        `;

        // Student Card (No admin buttons)
        studentHTML += `<div class="complaint-card">${cardContent}</div>`;

        // Admin Card (Has "Resolve" button if pending)
        adminHTML += `<div class="complaint-card">
            ${cardContent}
            ${c.status === 'Pending' ? `<button class="resolve-btn" onclick="markResolved(${c.id})"><i class="fas fa-check"></i> Mark as Resolved</button>` : ''}
        </div>`;
    });

    if (studentFeed) studentFeed.innerHTML = studentHTML;
    if (adminFeed) adminFeed.innerHTML = adminHTML;
}

/**
 * Admin action to mark a complaint as resolved
 */
function markResolved(id) {
    let complaints = JSON.parse(localStorage.getItem('campus_complaints')) || [];
    
    // Find the complaint and change status
    complaints = complaints.map(c => {
        if (c.id === id) {
            c.status = 'Resolved';
        }
        return c;
    });

    // Save back to LocalStorage
    localStorage.setItem('campus_complaints', JSON.stringify(complaints));
    
    // Refresh the view
    renderComplaints();
}

// Initial render when the script loads
document.addEventListener('DOMContentLoaded', () => {
    renderComplaints();
});