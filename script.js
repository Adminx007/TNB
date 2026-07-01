// ============================================
// 📱 TNB - COMPLETE USER SCRIPTS
// ============================================

// ============================================
// 🌐 GLOBALS
// ============================================
let currentUser = null;
let currentPage = 'dashboard';
let activityChart = null;
let platformChart = null;
let allData = {
    numbers: [],
    codes: [],
    referrals: [],
    history: []
};

// ============================================
// 🚀 INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 TNB User Panel Initialized');
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            navigateTo(page);
        });
    });
});

// ============================================
// 🔐 AUTH FUNCTIONS
// ============================================
function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            showToast('Welcome back! 👋', 'success');
        })
        .catch(error => {
            showToast(error.message, 'error');
        });
    return false;
}

function registerUser() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const referral = document.getElementById('registerReferral').value;
    
    auth.createUserWithEmailAndPassword(email, password)
        .then(result => {
            return db.collection(COLLECTIONS.USERS).doc(result.user.uid).set({
                name: name,
                email: email,
                role: 'user',
                balance: 0,
                totalCodes: 0,
                totalReferrals: 0,
                referralCode: generateRefCode(),
                referredBy: referral || null,
                status: 'active',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            showToast('Account created! 🎉', 'success');
            closeModal('registerModal');
        })
        .catch(error => {
            showToast(error.message, 'error');
        });
}

function logoutUser() {
    auth.signOut()
        .then(() => {
            showToast('Logged out successfully', 'info');
        })
        .catch(error => {
            showToast(error.message, 'error');
        });
}

function generateRefCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ============================================
# User Data Loader
// ============================================
function loadUserData(uid) {
    db.collection(COLLECTIONS.USERS).doc(uid).get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            currentUser = data;
            document.getElementById('userName').textContent = data.name || 'User';
            document.getElementById('userEmail').textContent = data.email || '';
            document.getElementById('userAvatar').src = 
                `https://ui-avatars.com/api/?background=6C63FF&color=fff&bold=true&name=${data.name || 'User'}`;
            document.getElementById('profileName').textContent = data.name || 'User';
            document.getElementById('profileEmail').textContent = data.email || '';
            document.getElementById('profileJoined').textContent = data.createdAt ? 
                new Date(data.createdAt.toDate()).toLocaleDateString() : 'N/A';
            document.getElementById('editName').value = data.name || '';
            document.getElementById('editEmail').value = data.email || '';
            
            // Referral
            document.getElementById('refCode').textContent = data.referralCode || 'N/A';
            document.getElementById('refLink').value = `${window.location.origin}/?ref=${data.referralCode}`;
            
            loadReferralData(uid);
        }
    });
}

// ============================================
// 📱 UI FUNCTIONS
// ============================================
function hideSplash() {
    const splash = document.getElementById('splashScreen');
    if (splash) {
        splash.style.opacity = '0';
        setTimeout(() => { splash.style.display = 'none'; }, 500);
    }
    document.getElementById('mainApp').style.display = 'block';
}

function showApp() {
    document.getElementById('mainApp').style.display = 'block';
}

function navigateTo(page) {
    currentPage = page;
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });
    document.querySelectorAll('.page').forEach(p => {
        p.classList.toggle('active', p.id === `page-${page}`);
    });
    
    const titles = {
        dashboard: 'Dashboard',
        numbers: 'My Numbers',
        referral: 'Referral Program',
        history: 'OTP History',
        profile: 'Profile'
    };
    document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';
    
    loadPageData(page);
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const icon = document.querySelector('.theme-toggle i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

// ============================================
// 📊 DASHBOARD
// ============================================
async function loadDashboard() {
    try {
        const uid = auth.currentUser.uid;
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(uid).get();
        const userData = userDoc.data();
        
        // Stats
        document.getElementById('totalNumbers').textContent = userData.totalNumbers || 0;
        document.getElementById('totalCodes').textContent = userData.totalCodes || 0;
        document.getElementById('totalBalance').textContent = `$${userData.balance || 0}`;
        document.getElementById('totalReferrals').textContent = userData.totalReferrals || 0;
        
        // Charts
        loadCharts();
        
        // Recent codes
        loadRecentCodes();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function loadCharts() {
    // Activity Chart
    const ctx1 = document.getElementById('activityChart');
    if (ctx1) {
        if (activityChart) activityChart.destroy();
        activityChart = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'OTP Received',
                    data: [3, 5, 2, 7, 4, 6, 8],
                    borderColor: '#6C63FF',
                    backgroundColor: 'rgba(108,99,255,0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#A0A0C0' } }
                },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#A0A0C0' } },
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#A0A0C0' } }
                }
            }
        });
    }
    
    // Platform Chart
    const ctx2 = document.getElementById('platformChart');
    if (ctx2) {
        if (platformChart) platformChart.destroy();
        platformChart = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['WhatsApp', 'Telegram', 'Instagram', 'Other'],
                datasets: [{
                    data: [40, 30, 20, 10],
                    backgroundColor: ['#00C853', '#6C63FF', '#FF6B6B', '#A0A0C0']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#A0A0C0' } }
                }
            }
        });
    }
}

async function loadRecentCodes() {
    const container = document.getElementById('recentCodes');
    if (!container) return;
    
    try {
        const uid = auth.currentUser.uid;
        const snapshot = await db.collection(COLLECTIONS.CODES)
            .where('userId', '==', uid)
            .orderBy('receivedAt', 'desc')
            .limit(5)
            .get();
        
        container.innerHTML = '';
        if (snapshot.empty) {
            container.innerHTML = '<div class="no-data">No OTPs received yet</div>';
            return;
        }
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `
                <div class="activity-icon">🔑</div>
                <div class="activity-content">
                    <div class="activity-text"><strong>${data.code || 'N/A'}</strong> - ${data.service || 'Unknown'}</div>
                    <div class="activity-time">${data.receivedAt ? new Date(data.receivedAt.toDate()).toLocaleString() : 'N/A'}</div>
                </div>
                <span class="status-badge ${data.status || 'pending'}">${data.status || 'Pending'}</span>
            `;
            container.appendChild(item);
        });
    } catch (error) {
        container.innerHTML = '<div class="error">Error loading codes</div>';
    }
}

// ============================================
// 📱 NUMBERS
// ============================================
async function loadNumbers() {
    const container = document.getElementById('numbersGrid');
    container.innerHTML = '<div class="loading">Loading numbers...</div>';
    
    try {
        const uid = auth.currentUser.uid;
        const snapshot = await db.collection(COLLECTIONS.NUMBERS)
            .where('userId', '==', uid)
            .get();
        
        document.getElementById('numberCount').textContent = `${snapshot.size} numbers`;
        
        container.innerHTML = '';
        if (snapshot.empty) {
            container.innerHTML = `
                <div class="no-data" style="grid-column:1/-1;text-align:center;padding:40px;">
                    <i class="fas fa-phone" style="font-size:48px;color:var(--border);"></i>
                    <p>No numbers yet</p>
                    <button class="btn-primary" onclick="getNewNumber()">
                        <i class="fas fa-plus"></i> Get New Number
                    </button>
                </div>
            `;
            return;
        }
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const card = document.createElement('div');
            card.className = 'number-card';
            card.innerHTML = `
                <div class="number">${data.number || 'N/A'}</div>
                <div class="details">
                    <span>📍 ${data.country || 'N/A'}</span>
                    <span>📱 ${data.platform || 'N/A'}</span>
                </div>
                <span class="status-badge ${data.status || 'active'}">${data.status || 'Active'}</span>
                <div style="margin-top:12px;">
                    <button class="btn-danger btn-sm" onclick="releaseNumber('${doc.id}')">
                        <i class="fas fa-times"></i> Release
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        container.innerHTML = `<div class="error">Error loading numbers: ${error.message}</div>`;
    }
}

function getNewNumber() {
    document.getElementById('getNumberModal').style.display = 'flex';
    // Load current bonus rate
    db.collection('settings').doc('referral').get().then(doc => {
        if (doc.exists) {
            document.getElementById('newCodeBonus').textContent = `$${doc.data().codeBonus || 0.01}`;
        }
    });
}

async function requestNumber() {
    const country = document.getElementById('newCountry').value;
    const platform = document.getElementById('newPlatform').value;
    const uid = auth.currentUser.uid;
    
    try {
        // Find available number
        const snapshot = await db.collection(COLLECTIONS.NUMBERS)
            .where('status', '==', 'available')
            .where('country', '==', country)
            .where('platform', '==', platform)
            .limit(1)
            .get();
        
        if (snapshot.empty) {
            showToast('No numbers available for this selection', 'error');
            return;
        }
        
        const doc = snapshot.docs[0];
        await db.collection(COLLECTIONS.NUMBERS).doc(doc.id).update({
            status: 'assigned',
            userId: uid,
            assignedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update user count
        await db.collection(COLLECTIONS.USERS).doc(uid).update({
            totalNumbers: firebase.firestore.FieldValue.increment(1)
        });
        
        showToast('Number assigned successfully! 📱', 'success');
        closeModal('getNumberModal');
        loadNumbers();
        loadDashboard();
    } catch (error) {
        showToast('Error getting number: ' + error.message, 'error');
    }
}

async function releaseNumber(docId) {
    if (!confirm('Release this number?')) return;
    
    try {
        await db.collection(COLLECTIONS.NUMBERS).doc(docId).update({
            status: 'available',
            userId: null,
            releasedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showToast('Number released', 'success');
        loadNumbers();
    } catch (error) {
        showToast('Error releasing number: ' + error.message, 'error');
    }
}

// ============================================
// 🎁 REFERRAL
// ============================================
async function loadReferralData(uid) {
    try {
        const snapshot = await db.collection(COLLECTIONS.REFERRALS)
            .where('referrerId', '==', uid)
            .get();
        
        let total = 0, active = 0, bonus = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            total++;
            if (data.status === 'active') active++;
            bonus += data.bonus || 0;
        });
        
        document.getElementById('refTotal').textContent = total;
        document.getElementById('refActive').textContent = active;
        document.getElementById('refBonus').textContent = `$${bonus.toFixed(2)}`;
        
        // Load referral history
        loadReferralHistory(uid);
        
    } catch (error) {
        console.error('Error loading referral data:', error);
    }
}

async function loadReferralHistory(uid) {
    const container = document.getElementById('refHistoryTable');
    if (!container) return;
    
    try {
        const snapshot = await db.collection(COLLECTIONS.REFERRALS)
            .where('referrerId', '==', uid)
            .orderBy('createdAt', 'desc')
            .get();
        
        container.innerHTML = '';
        if (snapshot.empty) {
            container.innerHTML = '<tr><td colspan="4" class="no-data">No referral history</td></tr>';
            return;
        }
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.referredName || 'Unknown'}</td>
                <td>${data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString() : 'N/A'}</td>
                <td><span class="status-badge ${data.status || 'pending'}">${data.status || 'Pending'}</span></td>
                <td>$${data.bonus || 0}</td>
            `;
            container.appendChild(row);
        });
    } catch (error) {
        container.innerHTML = `<tr><td colspan="4" class="error">${error.message}</td></tr>`;
    }
}

function copyRefCode() {
    const code = document.getElementById('refCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        showToast('Referral code copied! 📋', 'success');
    });
}

function copyRefLink() {
    const link = document.getElementById('refLink').value;
    navigator.clipboard.writeText(link).then(() => {
        showToast('Referral link copied! 📋', 'success');
    });
}

function shareRefLink() {
    const link = document.getElementById('refLink').value;
    if (navigator.share) {
        navigator.share({
            title: 'Join TNB - Temporary Number Bot',
            text: 'Get temporary numbers instantly with TNB! Use my referral link:',
            url: link
        }).catch(() => {});
    } else {
        copyRefLink();
    }
}

// ============================================
// 📋 HISTORY
// ============================================
async function loadHistory() {
    const container = document.getElementById('historyTable');
    container.innerHTML = '<tr><td colspan="5" class="loading">Loading history...</td></tr>';
    
    try {
        const uid = auth.currentUser.uid;
        const snapshot = await db.collection(COLLECTIONS.CODES)
            .where('userId', '==', uid)
            .orderBy('receivedAt', 'desc')
            .limit(100)
            .get();
        
        container.innerHTML = '';
        if (snapshot.empty) {
            container.innerHTML = '<tr><td colspan="5" class="no-data">No OTP history</td></tr>';
            return;
        }
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${data.code || 'N/A'}</strong></td>
                <td><code>${data.number || 'N/A'}</code></td>
                <td>${data.service || 'Unknown'}</td>
                <td>${data.receivedAt ? new Date(data.receivedAt.toDate()).toLocaleString() : 'N/A'}</td>
                <td><span class="status-badge ${data.status || 'pending'}">${data.status || 'Pending'}</span></td>
            `;
            container.appendChild(row);
        });
    } catch (error) {
        container.innerHTML = `<tr><td colspan="5" class="error">${error.message}</td></tr>`;
    }
}

function searchHistory() {
    const search = document.getElementById('historySearch').value.toLowerCase();
    const rows = document.querySelectorAll('#historyTable tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(search) ? '' : 'none';
    });
}

// 
// ============================================
// 👤 PROFILE
// ============================================
function updateProfile() {
    const name = document.getElementById('editName').value;
    const email = document.getElementById('editEmail').value;
    const uid = auth.currentUser.uid;
    
    db.collection(COLLECTIONS.USERS).doc(uid).update({
        name: name,
        email: email,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        showToast('Profile updated successfully! ✅', 'success');
        loadUserData(uid);
    }).catch(error => {
        showToast('Error updating profile: ' + error.message, 'error');
    });
}

function changeAvatar() {
    showToast('Avatar feature coming soon! 🎨', 'info');
}

// ============================================
// 🔔 NOTIFICATIONS
// ============================================
function showNotifications() {
    document.getElementById('notificationPanel').classList.toggle('open');
}

function closeNotifications() {
    document.getElementById('notificationPanel').classList.remove('open');
}

// ============================================
// 🍞 TOASTS
// ============================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// ============================================
// 📦 PAGE LOADER
// ============================================
function loadPageData(page) {
    const loaders = {
        dashboard: loadDashboard,
        numbers: loadNumbers,
        referral: () => {
            if (auth.currentUser) loadReferralData(auth.currentUser.uid);
        },
        history: loadHistory,
        profile: () => {
            if (auth.currentUser) loadUserData(auth.currentUser.uid);
        }
    };
    
    if (loaders[page]) {
        loaders[page]();
    }
}

// ============================================
// 🔄 REALTIME LISTENERS
// ============================================
function startRealtimeListeners() {
    const uid = auth.currentUser.uid;
    
    // Listen for new OTP codes
    db.collection(COLLECTIONS.CODES)
        .where('userId', '==', uid)
        .where('status', '==', 'pending')
        .onSnapshot(snapshot => {
            const count = snapshot.size;
            document.getElementById('notifBadge').textContent = count;
            if (currentPage === 'dashboard') loadRecentCodes();
            if (currentPage === 'history') loadHistory();
        });
}

// ============================================
// 🚀 EXPOSE FUNCTIONS
// ============================================
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logoutUser = logoutUser;
window.toggleSidebar = toggleSidebar;
window.toggleTheme = toggleTheme;
window.togglePassword = togglePassword;
window.closeModal = closeModal;
window.navigateTo = navigateTo;
window.getNewNumber = getNewNumber;
window.requestNumber = requestNumber;
window.releaseNumber = releaseNumber;
window.copyRefCode = copyRefCode;
window.copyRefLink = copyRefLink;
window.shareRefLink = shareRefLink;
window.searchHistory = searchHistory;
window.updateProfile = updateProfile;
window.changeAvatar = changeAvatar;
window.showNotifications = showNotifications;
window.closeNotifications = closeNotifications;
window.showToast = showToast;
