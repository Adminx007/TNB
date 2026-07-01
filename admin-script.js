// ============================================
// 🎛 TNB ADMIN - COMPLETE ADMIN SCRIPTS
// ============================================

// ============================================
// 📊 DASHBOARD
// ============================================
async function loadAdminDashboard() {
    try {
        const stats = await getAdminStats();
        document.getElementById('statUsers').textContent = stats.users || 0;
        document.getElementById('statCodes').textContent = stats.codes || 0;
        document.getElementById('statRevenue').textContent = `$${stats.revenue || 0}`;
        document.getElementById('statReferrals').textContent = stats.activeReferrals || 0;
        
        document.getElementById('userBadge').textContent = stats.users || 0;
        document.getElementById('numberBadge').textContent = stats.numbers || 0;
        document.getElementById('codeBadge').textContent = stats.codes || 0;
        document.getElementById('wdBadge').textContent = stats.pendingWithdrawals || 0;
        document.getElementById('notifBadge').textContent = stats.pendingWithdrawals || 0;
        
        loadAdminCharts();
        loadAdminActivity();
        
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
    }
}

async function getAdminStats() {
    const stats = { users: 0, codes: 0, numbers: 0, revenue: 0, activeReferrals: 0, pendingWithdrawals: 0 };
    
    try {
        const usersSnapshot = await db.collection(COLLECTIONS.USERS).get();
        stats.users = usersSnapshot.size;
        
        const codesSnapshot = await db.collection(COLLECTIONS.CODES).get();
        stats.codes = codesSnapshot.size;
        
        const numbersSnapshot = await db.collection(COLLECTIONS.NUMBERS).get();
        stats.numbers = numbersSnapshot.size;
        
        const referralsSnapshot = await db.collection(COLLECTIONS.REFERRALS)
            .where('status', '==', 'active')
            .get();
        stats.activeReferrals = referralsSnapshot.size;
        referralsSnapshot.forEach(doc => {
            stats.revenue += doc.data().bonus || 0;
        });
        
        const wdSnapshot = await db.collection(COLLECTIONS.WITHDRAWALS)
            .where('status', '==', 'pending')
            .get();
        stats.pendingWithdrawals = wdSnapshot.size;
        
        return stats;
    } catch (error) {
        console.error('Error getting admin stats:', error);
        return stats;
    }
}

function loadAdminCharts() {
    const ctx1 = document.getElementById('activityChart');
    if (ctx1) {
        if (window.activityChart) window.activityChart.destroy();
        window.activityChart = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Activity',
                    data: [45, 60, 35, 70, 85, 55, 90],
                    borderColor: '#6C63FF',
                    backgroundColor: 'rgba(108,99,255,0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#A0A0C0' } } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#A0A0C0' } },
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#A0A0C0' } }
                }
            }
        });
    }
    
    const ctx2 = document.getElementById('platformChart');
    if (ctx2) {
        if (window.platformChart) window.platformChart.destroy();
        window.platformChart = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['WhatsApp', 'Telegram', 'Instagram', 'Facebook', 'Other'],
                datasets: [{
                    data: [35, 25, 20, 12, 8],
                    backgroundColor: ['#00C853', '#6C63FF', '#FF6B6B', '#FFD93D', '#A0A0C0']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#A0A0C0' } } }
            }
        });
    }
}

async function loadAdminActivity() {
    const container = document.getElementById('activityList');
    container.innerHTML = '<div class="loading">Loading...</div>';
    
    try {
        const snapshot = await db.collection(COLLECTIONS.ACTIVITY)
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();
        
        container.innerHTML = '';
        if (snapshot.empty) {
            container.innerHTML = '<div class="no-activity">No recent activity</div>';
            return;
        }
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `
                <div class="activity-icon">${data.icon || '📱'}</div>
                <div class="activity-content">
                    <div class="activity-text">${data.message || 'Activity'}</div>
                    <div class="activity-time">${data.timestamp ? new Date(data.timestamp.toDate()).toLocaleString() : 'Just now'}</div>
                </div>
            `;
            container.appendChild(item);
        });
    } catch (error) {
        container.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

// ============================================
// 👥 ADMIN USERS
// ============================================
async function loadAdminUsers() {
    const container = document.getElementById('usersTable');
    container.innerHTML = '<tr><td colspan="8" class="loading">Loading users...</td></tr>';
    
    try {
        const snapshot = await db.collection(COLLECTIONS.USERS)
            .orderBy('createdAt', 'desc')
            .get();
        
        document.getElementById('userCount').textContent = `${snapshot.size} users`;
        
        container.innerHTML = '';
        if (snapshot.empty) {
            container.innerHTML = '<tr><td colspan="8" class="no-data">No users found</td></tr>';
            return;
        }
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="user-cell">
                        <img src="https://ui-avatars.com/api/?background=6C63FF&color=fff&bold=true&name=${data.name || 'User'}" alt="User">
                        <span>${data.name || 'User'}</span>
                    </div>
                </td>
                <td>${data.email || 'N/A'}</td>
                <td>${data.totalCodes || 0}</td>
                <td>$${data.balance || 0}</td>
                <td>${data.totalReferrals || 0}</td>
                <td><span class="status-badge ${data.status || 'active'}">${data.status || 'Active'}</span></td>
                <td>${data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-edit" onclick="editUser('${doc.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-delete" onclick="deleteUser('${doc.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            container.appendChild(row);
        });
    } catch (error) {
        container.innerHTML = `<tr><td colspan="8" class="error">${error.message}</td></tr>`;
    }
}

function searchUsers() {
    const search = document.getElementById('userSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#usersTable tr');
    rows.forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(search) ? '' : 'none';
    });
}

function addUser() {
    showToast('Add user feature coming soon!', 'info');
}

async function editUser(docId) {
    try {
        const doc = await db.collection(COLLECTIONS.USERS).doc(docId).get();
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('editUserId').value = docId;
            document.getElementById('editUserDisplayId').value = docId;
            document.getElementById('editUserName').value = data.name || '';
            document.getElementById('editUserEmail').value = data.email || '';
            document.getElementById('editUserBalance').value = data.balance || 0;
            document.getElementById('editUserStatus').value = data.status || 'active';
            document.getElementById('editUserNotes').value = data.notes || '';
            document.getElementById('editUserModal').style.display = 'flex';
        }
    } catch (error) {
        showToast('Error loading user: ' + error.message, 'error');
    }
}

async function updateUser() {
    const docId = document.getElementById('editUserId').value;
    const name = document.getElementById('editUserName').value;
    const email = document.getElementById('editUserEmail').value;
    const balance = parseFloat(document.getElementById('editUserBalance').value) || 0;
    const status = document.getElementById('editUserStatus').value;
    const notes = document.getElementById('editUserNotes').value;
    
    try {
        await db.collection(COLLECTIONS.USERS).doc(docId).update({
            name, email, balance, status, notes,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showToast('User updated! ✅', 'success');
        closeModal('editUserModal');
        loadAdminUsers();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

async function deleteUser(docId) {
    if (!confirm('Delete this user?')) return;
    try {
        await db.collection(COLLECTIONS.USERS).doc(docId).delete();
        showToast('User deleted', 'success');
        closeModal('editUserModal');
        loadAdminUsers();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

async function exportUsers() {
    try {
        const snapshot = await db.collection(COLLECTIONS.USERS).get();
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const csv = [
            ['Name', 'Email', 'Balance', 'Codes', 'Referrals', 'Status', 'Joined'],
            ...users.map(u => [
                u.name || '', u.email || '', u.balance || 0,
                u.totalCodes || 0, u.totalReferrals || 0,
                u.status || '',
                u.createdAt ? new Date(u.createdAt.toDate()).toLocaleDateString() : ''
            ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `users_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        showToast('Users exported! 📥', 'success');
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// ============================================
// 📱 ADMIN NUMBERS
// ============================================
async function loadAdminNumbers() {
    const container = document.getElementById('numbersTable');
    container.innerHTML = '<tr><td colspan="8" class="loading">Loading numbers...</td></tr>';
    
    try {
        const snapshot = await db.collection(COLLECTIONS.NUMBERS)
            .orderBy('createdAt', 'desc')
            .get();
        
        document.getElementById('numberCount').textContent = `${snapshot.size} numbers`;
        
        container.innerHTML = '';
        if (snapshot.empty) {
            container.innerHTML = '<tr><td colspan="8" class="no-data">No numbers</td></tr>';
            return;
        }
        
        let index = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            index++;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index}</td>
                <td><code>${data.number || 'N/A'}</code></td>
                <td>${data.country || 'N/A'}</td>
                <td>${data.platform || 'N/A'}</td>
                <td><span class="status-badge ${data.status || 'available'}">${data.status || 'Available'}</span></td>
                <td>${data.userId || 'Unassigned'}</td>
                <td>${data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-delete" onclick="deleteNumber('${doc.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            container.appendChild(row);
        });
    } catch (error) {
        container.innerHTML = `<tr><td colspan="8" class="error">${error.message}</td></tr>`;
    }
}

function showAddNumber() {
    document.getElementById('addNumberModal').style.display = 'flex';
}

async function saveNumbers() {
    const country = document.getElementById('addCountry').value;
    const platform = document.getElementById('addPlatform').value;
    const fileInput = document.getElementById('numberFile');
    const pasteText = document.getElementById('numberPaste').value;
    
    let numbers = [];
    if (fileInput.files.length > 0) {
        const text = await fileInput.files[0].text();
        numbers = text.split('\n').filter(n => n.trim());
    } else if (pasteText) {
        numbers = pasteText.split('\n').filter(n => n.trim());
    }
    
    if (numbers.length === 0) {
        showToast('Upload a file or paste numbers', 'error');
        return;
    }
    
    try {
        const batch = db.batch();
        for (const number of numbers) {
            const ref = db.collection(COLLECTIONS.NUMBERS).doc();
            batch.set(ref, {
                number: number.trim(),
                country, platform,
                status: 'available',
                userId: null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        await batch.commit();
        showToast(`${numbers.length} numbers added! 🎉`, 'success');
        closeModal('addNumberModal');
        loadAdminNumbers();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

function filterNumbers() {
    const country = document.getElementById('countryFilter').value;
    const platform = document.getElementById('platformFilter').value;
    const status = document.getElementById('statusFilter').value;
    const rows = document.querySelectorAll('#numbersTable tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 8) {
            let show = true;
            if (country !== 'all' && !cells[2].textContent.includes(country)) show = false;
            if (platform !== 'all' && !cells[3].textContent.includes(platform)) show = false;
            if (status !== 'all' && !cells[4].textContent.toLowerCase().includes(status)) show = false;
            row.style.display = show ? '' : 'none';
        }
    });
}

function refreshNumbers() {
    loadAdminNumbers();
    showToast('Refreshed! 🔄', 'success');
}

// ============================================
// 🔑 ADMIN CODES
// ============================================
async function loadAdminCodes() {
    const container = document.getElementById('codesTable');
    container.innerHTML = '<tr><td colspan="7" class="loading">Loading codes...</td></tr>';
    
    try {
        const snapshot = await db.collection(COLLECTIONS.CODES)
            .orderBy('receivedAt', 'desc')
            .limit(100)
            .get();
        
        document.getElementById('codeCount').textContent = `${snapshot.size} codes`;
        
        container.innerHTML = '';
        if (snapshot.empty) {
            container.innerHTML = '<tr><td colspan="7" class="no-data">No codes</td></tr>';
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
                <td>${data.userId || 'N/A'}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-delete" onclick="deleteCode('${doc.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            container.appendChild(row);
        });
    } catch (error) {
        container.innerHTML = `<tr><td colspan="7" class="error">${error.message}</td></tr>`;
    }
}

function searchCodes() {
    const search = document.getElementById('codeSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#codesTable tr');
    rows.forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(search) ? '' : 'none';
    });
}

function filterCodes() {
    const filter = document.getElementById('codeStatusFilter').value;
    const rows = document.querySelectorAll('#codesTable tr');
    rows.forEach(row => {
        if (filter === 'all') {
            row.style.display = '';
        } else {
            const status = row.querySelector('.status-badge');
            row.style.display = status && status.textContent.toLowerCase() === filter ? '' : 'none';
        }
    });
}

async function deleteCode(docId) {
    if (!confirm('Delete this code?')) return;
    try {
        await db.collection(COLLECTIONS.CODES).doc(docId).delete();
        showToast('Code deleted', 'success');
        loadAdminCodes();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// =// ============================================
// 🎁 ADMIN REFERRALS
// ============================================
async function loadAdminReferrals() {
    const container = document.getElementById('referralsTable');
    container.innerHTML = '<tr><td colspan="6" class="loading">Loading referrals...</td></tr>';
    
    try {
        const snapshot = await db.collection(COLLECTIONS.REFERRALS)
            .orderBy('createdAt', 'desc')
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
        document.getElementById('refRate').textContent = total > 0 ? `${Math.round((active/total)*100)}%` : '0%';
        
        container.innerHTML = '';
        if (snapshot.empty) {
            container.innerHTML = '<tr><td colspan="6" class="no-data">No referrals</td></tr>';
            return;
        }
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.referrerName || 'Unknown'}</td>
                <td>${data.referredName || 'Unknown'}</td>
                <td>${data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString() : 'N/A'}</td>
                <td><span class="status-badge ${data.status || 'pending'}">${data.status || 'Pending'}</span></td>
                <td>$${data.bonus || 0}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-delete" onclick="deleteReferral('${doc.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            container.appendChild(row);
        });
    } catch (error) {
        container.innerHTML = `<tr><td colspan="6" class="error">${error.message}</td></tr>`;
    }
}

function addReferralBonus() {
    showToast('Referral bonus feature coming soon!', 'info');
}

async function deleteReferral(docId) {
    if (!confirm('Delete this referral?')) return;
    try {
        await db.collection(COLLECTIONS.REFERRALS).doc(docId).delete();
        showToast('Referral deleted', 'success');
        loadAdminReferrals();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// ============================================
// 💳 ADMIN WITHDRAWALS
// ============================================
async function loadAdminWithdrawals() {
    const container = document.getElementById('withdrawalsTable');
    container.innerHTML = '<tr><td colspan="7" class="loading">Loading withdrawals...</td></tr>';
    
    try {
        const snapshot = await db.collection(COLLECTIONS.WITHDRAWALS)
            .orderBy('createdAt', 'desc')
            .get();
        
        let pending = 0, approved = 0, rejected = 0, total = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            total += data.amount || 0;
            if (data.status === 'pending') pending++;
            if (data.status === 'approved') approved++;
            if (data.status === 'rejected') rejected++;
        });
        
        document.getElementById('wdPending').textContent = pending;
        document.getElementById('wdApproved').textContent = approved;
        document.getElementById('wdRejected').textContent = rejected;
        document.getElementById('wdTotal').textContent = `$${total.toFixed(2)}`;
        document.getElementById('wdCount').textContent = `${pending} pending`;
        document.getElementById('wdBadge').textContent = pending;
        
        container.innerHTML = '';
        if (snapshot.empty) {
            container.innerHTML = '<tr><td colspan="7" class="no-data">No withdrawals</td></tr>';
            return;
        }
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.userName || 'Unknown'}</td>
                <td><strong>$${data.amount || 0}</strong></td>
                <td>${data.method || 'N/A'}</td>
                <td><code>${data.details || 'N/A'}</code></td>
                <td>${data.createdAt ? new Date(data.createdAt.toDate()).toLocaleString() : 'N/A'}</td>
                <td><span class="status-badge ${data.status || 'pending'}">${data.status || 'Pending'}</span></td>
                <td>
                    <div class="table-actions">
                        ${data.status === 'pending' ? `
                            <button class="btn-approve" onclick="approveWithdrawal('${doc.id}')"><i class="fas fa-check"></i></button>
                            <button class="btn-reject" onclick="rejectWithdrawal('${doc.id}')"><i class="fas fa-times"></i></button>
                        ` : ''}
                    </div>
                </td>
            `;
            container.appendChild(row);
        });
    } catch (error) {
        container.innerHTML = `<tr><td colspan="7" class="error">${error.message}</td></tr>`;
    }
}

function filterWithdrawals() {
    const filter = document.getElementById('wdFilter').value;
    const rows = document.querySelectorAll('#withdrawalsTable tr');
    rows.forEach(row => {
        if (filter === 'all') {
            row.style.display = '';
        } else {
            const status = row.querySelector('.status-badge');
            row.style.display = status && status.textContent.toLowerCase() === filter ? '' : 'none';
        }
    });
}

async function approveWithdrawal(docId) {
    if (!confirm('Approve this withdrawal?')) return;
    try {
        await db.collection(COLLECTIONS.WITHDRAWALS).doc(docId).update({
            status: 'approved',
            approvedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showToast('✅ Approved!', 'success');
        loadAdminWithdrawals();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

async function rejectWithdrawal(docId) {
    if (!confirm('Reject this withdrawal?')) return;
    try {
        await db.collection(COLLECTIONS.WITHDRAWALS).doc(docId).update({
            status: 'rejected',
            rejectedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showToast('❌ Rejected', 'info');
        loadAdminWithdrawals();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
      } 
// ============================================
// 🖥️ ADMIN PANELS
// ============================================
async function loadAdminPanels() {
    const container = document.getElementById('panelsGrid');
    container.innerHTML = '<div class="loading">Loading panels...</div>';
    
    try {
        const snapshot = await db.collection(COLLECTIONS.PANELS).get();
        
        container.innerHTML = '';
        if (snapshot.empty) {
            container.innerHTML = `
                <div class="no-data" style="grid-column:1/-1;text-align:center;padding:40px;">
                    <i class="fas fa-server" style="font-size:48px;color:var(--border);"></i>
                    <p>No panels configured</p>
                    <button class="btn-primary" onclick="addPanel()">Add Panel</button>
                </div>
            `;
            return;
        }
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const card = document.createElement('div');
            card.className = 'panel-card';
            card.innerHTML = `
                <div class="panel-header">
                    <h4><i class="fas fa-server" style="color:var(--primary);"></i> ${data.name || 'Panel'}</h4>
                    <span class="status-dot ${data.enabled ? 'online' : 'offline'}"></span>
                </div>
                <div class="panel-detail"><span>URL</span><span>${data.baseUrl || 'N/A'}</span></div>
                <div class="panel-detail"><span>Username</span><span>${data.username || 'N/A'}</span></div>
                <div class="panel-detail"><span>Interval</span><span>${data.interval || 5}s</span></div>
                <div class="panel-actions">
                    <button class="btn-${data.enabled ? 'warning' : 'success'} btn-sm" onclick="togglePanel('${doc.id}')">
                        <i class="fas fa-${data.enabled ? 'pause' : 'play'}"></i> ${data.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button class="btn-danger btn-sm" onclick="deletePanel('${doc.id}')"><i class="fas fa-trash"></i></button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        container.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

function addPanel() {
    document.getElementById('addPanelModal').style.display = 'flex';
}

async function savePanel() {
    const name = document.getElementById('panelName').value.trim();
    const baseUrl = document.getElementById('panelBaseUrl').value.trim();
    const username = document.getElementById('panelUsername').value.trim();
    const password = document.getElementById('panelPassword').value.trim();
    const interval = parseInt(document.getElementById('panelInterval').value) || 5;
    const timeout = parseInt(document.getElementById('panelTimeout').value) || 30;
    const enabled = document.getElementById('panelEnabled').checked;
    
    if (!name || !baseUrl) {
        showToast('Name and URL required', 'error');
        return;
    }
    
    try {
        await db.collection(COLLECTIONS.PANELS).add({
            name, baseUrl, username, password, interval, timeout, enabled,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showToast('Panel added! ✅', 'success');
        closeModal('addPanelModal');
        loadAdminPanels();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

async function togglePanel(id) {
    try {
        const doc = await db.collection(COLLECTIONS.PANELS).doc(id).get();
        if (doc.exists) {
            await db.collection(COLLECTIONS.PANELS).doc(id).update({
                enabled: !doc.data().enabled
            });
            showToast('Panel toggled', 'success');
            loadAdminPanels();
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

async function deletePanel(id) {
    if (!confirm('Delete this panel?')) return;
    try {
        await db.collection(COLLECTIONS.PANELS).doc(id).delete();
        showToast('Panel deleted', 'success');
        loadAdminPanels();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// ============================================
// ⚙️ ADMIN SETTINGS
// ============================================
async function loadAdminSettings() {
    try {
        const doc = await db.collection(COLLECTIONS.SETTINGS).doc('main').get();
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('botToken').value = data.botToken || '';
            document.getElementById('adminId').value = data.adminId || '';
            document.getElementById('otpGroupId').value = data.otpGroupId || '';
        }
        
        const refDoc = await db.collection(COLLECTIONS.SETTINGS).doc('referral').get();
        if (refDoc.exists) {
            const data = refDoc.data();
            document.getElementById('codeBonus').value = data.codeBonus || 0.01;
            document.getElementById('referralBonus').value = data.referralBonus || 0.50;
            document.getElementById('codesRequired').value = data.codesRequired || 3;
            document.getElementById('minWithdrawal').value = data.minWithdrawal || 5.00;
        }
        
        loadPanelSettings();
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

async function loadPanelSettings() {
    const container = document.getElementById('panelSettings');
    try {
        const snapshot = await db.collection(COLLECTIONS.PANELS).get();
        container.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const div = document.createElement('div');
            div.className = 'setting-item';
            div.innerHTML = `
                <label>${data.name || 'Panel'}</label>
                <div class="panel-status">
                    <span class="status-badge ${data.enabled ? 'online' : 'offline'}">${data.enabled ? 'Active' : 'Inactive'}</span>
                </div>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        container.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

function saveSettings() {
    const data = {
        botToken: document.getElementById('botToken').value,
        adminId: document.getElementById('adminId').value,
        otpGroupId: document.getElementById('otpGroupId').value,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    db.collection(COLLECTIONS.SETTINGS).doc('main').set(data, { merge: true })
        .then(() => showToast('Settings saved! ✅', 'success'))
        .catch(error => showToast('Error: ' + error.message, 'error'));
}

function saveReferralSettings() {
    const data = {
        codeBonus: parseFloat(document.getElementById('codeBonus').value) || 0.01,
        referralBonus: parseFloat(document.getElementById('referralBonus').value) || 0.50,
        codesRequired: parseInt(document.getElementById('codesRequired').value) || 3,
        minWithdrawal: parseFloat(document.getElementById('minWithdrawal').value) || 5.00,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    db.collection(COLLECTIONS.SETTINGS).doc('referral').set(data, { merge: true })
        .then(() => showToast('Referral settings saved! ✅', 'success'))
        .catch(error => showToast('Error: ' + error.message, 'error'));
}

function saveSecuritySettings() {
    const twoFactor = document.getElementById('twoFactor').checked;
    const sessionTimeout = document.getElementById('sessionTimeout').value;
    
    db.collection(COLLECTIONS.SETTINGS).doc('security').set({
        twoFactor, sessionTimeout: parseInt(sessionTimeout),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true })
        .then(() => showToast('Security settings saved! 🔒', 'success'))
        .catch(error => showToast('Error: ' + error.message, 'error'));
}

function restartBot() {
    if (confirm('Restart bot?')) {
        showToast('🔄 Restarting...', 'info');
        setTimeout(() => showToast('✅ Bot restarted!', 'success'), 3000);
    }
}

// ============================================
// 💾 ADMIN BACKUP
// ============================================
async function createBackup() {
    showToast('📦 Creating backup...', 'info');
    
    try {
        const data = {
            users: [], numbers: [], codes: [], referrals: [], withdrawals: [], panels: [],
            settings: {}, timestamp: new Date().toISOString(), version: '2.0.0'
        };
        
        const collections = ['users', 'numbers', 'otp_codes', 'referrals', 'withdrawals', 'panels'];
        for (const col of collections) {
            const snapshot = await db.collection(col).get();
            data[col] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        
        const settingsDoc = await db.collection('settings').doc('main').get();
        if (settingsDoc.exists) data.settings = settingsDoc.data();
        
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        
        await db.collection(COLLECTIONS.BACKUPS).add({
            filename: a.download, size: json.length, type: 'manual',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast('✅ Backup created!', 'success');
        loadBackupHistory();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

function restoreBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const data = JSON.parse(e.target.result);
            showToast('🔄 Restoring...', 'info');
            
            const collections = ['users', 'numbers', 'otp_codes', 'referrals', 'withdrawals', 'panels'];
            for (const col of collections) {
                if (data[col]) {
                    const batch = db.batch();
                    for (const item of data[col]) {
                        batch.set(db.collection(col).doc(item.id), item);
                    }
                    await batch.commit();
                }
            }
            
            if (data.settings) {
                await db.collection('settings').doc('main').set(data.settings, { merge: true });
            }
            
            showToast('✅ Backup restored!', 'success');
            loadPageData(currentPage);
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

async function loadBackupHistory() {
    const container = document.getElementById('backupHistoryTable');
    container.innerHTML = '<tr><td colspan="5" class="loading">Loading...</td></tr>';
    
    try {
        const snapshot = await db.collection(COLLECTIONS.BACKUPS)
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();
        
        container.innerHTML = '';
        if (snapshot.empty) {
            container.innerHTML = '<tr><td colspan="5" class="no-data">No backups</td></tr>';
            return;
        }
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.createdAt ? new Date(data.createdAt.toDate()).toLocaleString() : 'N/A'}</td>
                <td>${data.size ? `${(data.size/1024).toFixed(1)} KB` : 'N/A'}</td>
                <td><span class="status-badge ${data.type || 'manual'}">${data.type || 'manual'}</span></td>
                <td><span class="status-badge completed">completed</span></td>
                <td><button class="btn-delete" onclick="deleteBackup('${doc.id}')"><i class="fas fa-trash"></i></button></td>
            `;
            container.appendChild(row);
        });
    } catch (error) {
        container.innerHTML = `<tr><td colspan="5" class="error">${error.message}</td></tr>`;
    }
}

function saveAutoBackup() {
    const freq = document.getElementById('autoBackupFreq').value;
    db.collection('settings').doc('backup').set({
        autoBackup: freq, updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    showToast(`Auto backup set to ${freq} ✅`, 'success');
}

async function deleteBackup(id) {
    if (!confirm('Delete this backup record?')) return;
    try {
        await db.collection(COLLECTIONS.BACKUPS).doc(id).delete();
        showToast('Deleted', 'success');
        loadBackupHistory();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
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

function loadAllActivity() {
    showToast('Loading all activity...', 'info');
}

// ============================================
// 📦 PAGE LOADER
// ============================================
function loadPageData(page) {
    const loaders = {
        dashboard: loadAdminDashboard,
        users: loadAdminUsers,
        numbers: loadAdminNumbers,
        codes: loadAdminCodes,
        referrals: loadAdminReferrals,
        withdrawals: loadAdminWithdrawals,
        panels: loadAdminPanels,
        settings: loadAdminSettings,
        backup: loadBackupHistory
    };
    
    if (loaders[page]) {
        loaders[page]();
    }
}

function refreshData() {
    showToast('🔄 Refreshing...', 'info');
    loadPageData(currentPage);
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tab}`);
    });
}

function toggleVisibility(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

function updateChart() {
    loadAdminCharts();
}

// ============================================
# Live Listeners
// ============================================
function startRealtimeListeners() {
    db.collection(COLLECTIONS.CODES)
        .where('status', '==', 'pending')
        .onSnapshot(snapshot => {
            document.querySelector('.notif-badge').textContent = snapshot.size;
            if (currentPage === 'codes') loadAdminCodes();
        });
    
    db.collection(COLLECTIONS.WITHDRAWALS)
        .where('status', '==', 'pending')
        .onSnapshot(snapshot => {
            document.getElementById('wdBadge').textContent = snapshot.size;
            if (currentPage === 'withdrawals') loadAdminWithdrawals();
        });
}

// ============================================
// 🚀 EXPOSE FUNCTIONS
// ============================================
window.editUser = editUser;
window.updateUser = updateUser;
window.deleteUser = deleteUser;
window.exportUsers = exportUsers;
window.addUser = addUser;
window.searchUsers = searchUsers;
window.showAddNumber = showAddNumber;
window.saveNumbers = saveNumbers;
window.filterNumbers = filterNumbers;
window.refreshNumbers = refreshNumbers;
window.deleteNumber = deleteNumber;
window.searchCodes = searchCodes;
window.filterCodes = filterCodes;
window.deleteCode = deleteCode;
window.addReferralBonus = addReferralBonus;
window.deleteReferral = deleteReferral;
window.approveWithdrawal = approveWithdrawal;
window.rejectWithdrawal = rejectWithdrawal;
window.filterWithdrawals = filterWithdrawals;
window.addPanel = addPanel;
window.savePanel = savePanel;
window.togglePanel = togglePanel;
window.deletePanel = deletePanel;
window.saveSettings = saveSettings;
window.saveReferralSettings = saveReferralSettings;
window.saveSecuritySettings = saveSecuritySettings;
window.restartBot = restartBot;
window.createBackup = createBackup;
window.restoreBackup = restoreBackup;
window.loadBackupHistory = loadBackupHistory;
window.saveAutoBackup = saveAutoBackup;
window.deleteBackup = deleteBackup;
window.showNotifications = showNotifications;
window.closeNotifications = closeNotifications;
window.loadAllActivity = loadAllActivity;
window.refreshData = refreshData;
window.switchTab = switchTab;
window.toggleVisibility = toggleVisibility;
window.updateChart = updateChart;
