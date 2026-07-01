// ============================================
// 🔥 FIREBASE CONFIGURATION
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyDmYflApsEXMMY_PyjcMNF5fOkz7JWijLI",
  authDomain: "tnbo-80fc8.firebaseapp.com",
  projectId: "tnbo-80fc8",
  storageBucket: "tnbo-80fc8.firebasestorage.app",
  messagingSenderId: "146710661145",
  appId: "1:146710661145:web:607ca7bbc5ee1254998288",
  measurementId: "G-QEW836ZJL1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Enable offline persistence
db.enablePersistence()
    .then(() => console.log('🔥 Firebase offline persistence enabled'))
    .catch(err => console.log('⚠️ Firebase persistence error:', err));

// ============================================
// 📋 COLLECTIONS
// ============================================
const COLLECTIONS = {
    USERS: 'users',
    NUMBERS: 'numbers',
    CODES: 'otp_codes',
    REFERRALS: 'referrals',
    WITHDRAWALS: 'withdrawals',
    SETTINGS: 'settings',
    ACTIVITY: 'activity',
    PANELS: 'panels',
    BACKUPS: 'backups'
};

// ============================================
// 🔐 AUTH STATE
// ============================================
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('✅ User logged in:', user.uid);
        hideSplash();
        showApp();
        loadUserData(user.uid);
        loadDashboard();
        startRealtimeListeners();
        
        // Check if admin
        db.collection(COLLECTIONS.USERS).doc(user.uid).get().then(doc => {
            if (doc.exists && doc.data().role === 'admin') {
                document.querySelector('.sidebar-logo span').textContent = 'TNB Admin';
                document.querySelector('.sidebar-logo i').className = 'fas fa-shield-alt';
            }
        });
    } else {
        console.log('❌ No user logged in');
        window.location.href = 'login.html';
    }
});
