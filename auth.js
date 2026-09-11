/**
 * WEBLITEX AUTHENTICATION & SINGLE-DEVICE SECURITY ENGINE
 * Provides secure client-side storage, device fingerprinting, strict single-device session locking,
 * user credential generation, and WhatsApp message formatting.
 */

(function(window) {
  'use strict';

  const DB_KEY = 'weblitex_auth_db_v1';
  const SESSION_KEY = 'weblitex_active_session';
  const DEVICE_UUID_KEY = 'weblitex_device_uuid';

  // 1. Generate or retrieve stable device fingerprint UUID
  function getDeviceId() {
    let uuid = localStorage.getItem(DEVICE_UUID_KEY);
    if (!uuid) {
      const entropy = [
        navigator.userAgent,
        screen.width + 'x' + screen.height,
        screen.colorDepth,
        navigator.language || 'en',
        new Date().getTimezoneOffset(),
        Math.random().toString(36).substring(2, 15)
      ].join('||');
      
      // Simple stable hash
      let hash = 0;
      for (let i = 0; i < entropy.length; i++) {
        const char = entropy.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
      }
      uuid = 'DEV-' + Math.abs(hash).toString(16).toUpperCase() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();
      localStorage.setItem(DEVICE_UUID_KEY, uuid);
    }
    return uuid;
  }

  // Get readable device info (e.g., "Chrome on Windows")
  function getDeviceReadableName() {
    const ua = navigator.userAgent;
    let browser = 'Browser';
    let os = 'Device';

    if (ua.includes('Edg/')) browser = 'Edge';
    else if (ua.includes('Chrome/')) browser = 'Chrome';
    else if (ua.includes('Firefox/')) browser = 'Firefox';
    else if (ua.includes('Safari/')) browser = 'Safari';

    if (ua.includes('Windows')) os = 'Windows PC';
    else if (ua.includes('Macintosh')) os = 'Mac';
    else if (ua.includes('Android')) os = 'Android Phone';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS Device';
    else if (ua.includes('Linux')) os = 'Linux';

    return `${browser} on ${os}`;
  }

  // 2. Initialize default database
  function initDB() {
    let db = null;
    try {
      db = JSON.parse(localStorage.getItem(DB_KEY));
    } catch (e) {
      db = null;
    }

    if (!db || !db.admin) {
      db = {
        version: '1.0',
        admin: {
          username: 'admin',
          password: 'Admin@Weblitex2026',
          name: 'Rizwan Rahi (Admin)',
          email: 'rizwanrahi286@gmail.com',
          role: 'admin'
        },
        settings: {
          singleDevicePolicy: 'takeover', // 'takeover' (kick out previous device) or 'block' (prevent new device)
          allowSelfRegistration: false
        },
        users: []
      };
      saveDB(db);
    } else if (db && db.users) {
      // Purge any previously seeded demo users
      const prevLength = db.users.length;
      db.users = db.users.filter(u => !u.id.startsWith('USR-DEMO'));
      if (db.users.length !== prevLength) {
        saveDB(db);
      }
    }
    return db;
  }

  function getDB() {
    return initDB();
  }

  function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    // Trigger cross-window storage event listener
  }

  // 3. Session Utilities
  function getActiveSession() {
    try {
      const sess = JSON.parse(localStorage.getItem(SESSION_KEY));
      return sess || null;
    } catch (e) {
      return null;
    }
  }

  function setSession(sess) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  // 4. Authentication: Login with Single-Device Enforcement
  function login(username, password) {
    const db = getDB();
    const cleanUser = (username || '').trim().toLowerCase();
    const currentDeviceId = getDeviceId();
    const currentDeviceName = getDeviceReadableName();

    // Check Admin Login
    if (cleanUser === db.admin.username.toLowerCase()) {
      if (password === db.admin.password) {
        const token = 'ADM-TKN-' + Math.random().toString(36).substring(2) + Date.now();
        const session = {
          userId: 'admin',
          username: db.admin.username,
          name: db.admin.name,
          role: 'admin',
          deviceId: currentDeviceId,
          deviceName: currentDeviceName,
          token: token,
          loginAt: new Date().toISOString()
        };
        setSession(session);
        return { success: true, role: 'admin', redirect: 'admin.html' };
      } else {
        return { success: false, message: 'Invalid Admin password. Please check your credentials.' };
      }
    }

    // Check Standard User Login
    const user = db.users.find(u => u.username.toLowerCase() === cleanUser);
    if (!user) {
      return { success: false, message: 'Username not found. Please contact Admin to create your account.' };
    }

    if (user.status !== 'active') {
      return { success: false, message: 'Your account has been suspended by Admin. Please contact support.' };
    }

    if (user.password !== password) {
      return { success: false, message: 'Incorrect password. Please verify and try again.' };
    }

    // STRICT SINGLE-DEVICE POLICY ENFORCEMENT
    if (user.activeDeviceId && user.activeDeviceId !== currentDeviceId) {
      if (db.settings.singleDevicePolicy === 'block') {
        return {
          success: false,
          isDeviceBlocked: true,
          message: `This account is currently active on another device (${user.activeDeviceName || 'Active Session'}). Single-device policy is strictly enforced. Please log out from that device or ask Admin to reset your device session.`
        };
      }
      // In 'takeover' mode: New device takes over, previous device session token is invalidated
    }

    // Generate new unique session token
    const token = 'USR-TKN-' + Math.random().toString(36).substring(2) + '-' + Date.now();
    
    // Update user record with active device
    user.activeDeviceId = currentDeviceId;
    user.activeDeviceName = currentDeviceName;
    user.activeSessionToken = token;
    user.lastLoginAt = new Date().toISOString();
    saveDB(db);

    const session = {
      userId: user.id,
      username: user.username,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      deviceId: currentDeviceId,
      deviceName: currentDeviceName,
      token: token,
      loginAt: new Date().toISOString()
    };
    setSession(session);

    return { success: true, role: 'user', redirect: 'portal.html' };
  }

  // 5. Verify Current Session (Enforcing Single-Device Realtime Lockout)
  function verifySession(requiredRole = null) {
    const session = getActiveSession();
    if (!session) {
      return { valid: false, reason: 'no_session' };
    }

    const currentDeviceId = getDeviceId();
    const db = getDB();

    // Verify Admin
    if (session.role === 'admin') {
      if (requiredRole && requiredRole !== 'admin') {
        return { valid: false, reason: 'role_mismatch' };
      }
      return { valid: true, user: db.admin, session: session };
    }

    // Verify Standard User
    const user = db.users.find(u => u.id === session.userId);
    if (!user) {
      clearSession();
      return { valid: false, reason: 'user_deleted' };
    }

    if (user.status !== 'active') {
      clearSession();
      return { valid: false, reason: 'user_suspended', message: 'Your account is suspended by Administrator.' };
    }

    // Check if session token or device ID was changed (e.g. another device logged in or admin reset)
    if (user.activeSessionToken !== session.token || user.activeDeviceId !== currentDeviceId) {
      clearSession();
      return {
        valid: false,
        reason: 'device_conflict',
        message: 'Your account was logged in from another device or your device session was reset by Administrator. Single-device security policy is strictly active.'
      };
    }

    if (requiredRole && session.role !== requiredRole && requiredRole !== 'user') {
      return { valid: false, reason: 'role_mismatch' };
    }

    return { valid: true, user: user, session: session };
  }

  function logout() {
    const session = getActiveSession();
    if (session && session.role !== 'admin') {
      const db = getDB();
      const user = db.users.find(u => u.id === session.userId);
      if (user && user.activeSessionToken === session.token) {
        user.activeSessionToken = null;
        user.activeDeviceId = null;
        user.activeDeviceName = null;
        saveDB(db);
      }
    }
    clearSession();
    window.location.href = 'login.html';
  }

  // 6. Admin User Management Operations
  function adminCreateUser({ name, username, password, phone, email, role }) {
    const db = getDB();
    const cleanUser = (username || '').trim().toLowerCase();

    if (!name || !cleanUser || !password) {
      return { success: false, message: 'Name, Username, and Password are required.' };
    }

    if (cleanUser === db.admin.username.toLowerCase()) {
      return { success: false, message: 'Cannot use reserved admin username.' };
    }

    if (db.users.some(u => u.username.toLowerCase() === cleanUser)) {
      return { success: false, message: 'This username is already taken. Please choose another.' };
    }

    const newUser = {
      id: 'USR-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      username: cleanUser,
      password: password.trim(),
      name: name.trim(),
      phone: (phone || '').trim(),
      email: (email || '').trim(),
      role: role || 'Client Portal',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
      activeDeviceId: null,
      activeDeviceName: null,
      activeSessionToken: null
    };

    db.users.unshift(newUser);
    saveDB(db);

    const waMessage = formatWhatsAppMessage(newUser);

    return {
      success: true,
      user: newUser,
      waMessage: waMessage,
      message: `User "${newUser.username}" created successfully!`
    };
  }

  function adminUpdateUser(id, updates) {
    const db = getDB();
    const user = db.users.find(u => u.id === id);
    if (!user) return { success: false, message: 'User not found.' };

    if (updates.username && updates.username.toLowerCase() !== user.username.toLowerCase()) {
      const newClean = updates.username.trim().toLowerCase();
      if (db.users.some(u => u.id !== id && u.username.toLowerCase() === newClean)) {
        return { success: false, message: 'Username already taken.' };
      }
      user.username = newClean;
    }

    if (updates.name) user.name = updates.name.trim();
    if (updates.password) user.password = updates.password.trim();
    if (updates.phone !== undefined) user.phone = updates.phone.trim();
    if (updates.email !== undefined) user.email = updates.email.trim();
    if (updates.role) user.role = updates.role;
    if (updates.status) user.status = updates.status;

    saveDB(db);
    return { success: true, user: user, message: 'User updated successfully.' };
  }

  function adminDeleteUser(id) {
    const db = getDB();
    const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1) return { success: false, message: 'User not found.' };

    db.users.splice(idx, 1);
    saveDB(db);
    return { success: true, message: 'User deleted successfully.' };
  }

  function adminToggleUserStatus(id) {
    const db = getDB();
    const user = db.users.find(u => u.id === id);
    if (!user) return { success: false, message: 'User not found.' };

    user.status = user.status === 'active' ? 'suspended' : 'active';
    if (user.status === 'suspended') {
      user.activeSessionToken = null;
      user.activeDeviceId = null;
      user.activeDeviceName = null;
    }
    saveDB(db);
    return { success: true, user: user, message: `User status changed to ${user.status}.` };
  }

  // Force Logout & Reset Single-Device Session
  function adminResetDeviceSession(id) {
    const db = getDB();
    const user = db.users.find(u => u.id === id);
    if (!user) return { success: false, message: 'User not found.' };

    user.activeDeviceId = null;
    user.activeDeviceName = null;
    user.activeSessionToken = null;
    saveDB(db);

    return {
      success: true,
      message: `Device session for "${user.name}" has been reset. The user can now log in from any new device.`
    };
  }

  function adminUpdateCredentials(newUsername, newPassword, newName, newEmail) {
    const db = getDB();
    if (newUsername) db.admin.username = newUsername.trim();
    if (newPassword) db.admin.password = newPassword.trim();
    if (newName) db.admin.name = newName.trim();
    if (newEmail) db.admin.email = newEmail.trim();
    saveDB(db);
    return { success: true, message: 'Admin credentials updated successfully.' };
  }

  // 7. WhatsApp Message Template Formatter
  function formatWhatsAppMessage(user) {
    // Determine dynamic portal URL
    const origin = window.location.origin;
    let portalUrl = origin.includes('http') ? `${origin}/login.html` : 'http://localhost:3000/login.html';
    if (window.location.protocol === 'file:') {
      portalUrl = 'http://localhost:3000/login.html';
    }

    const msg = 
`━━━━━━━━━━━━━━━━━━━━━━━
🌟 *WELCOME TO WEBLITEX PORTAL* 🌟
━━━━━━━━━━━━━━━━━━━━━━━

Dear *${user.name}*,
Aapka personalized client portal account create kar diya gaya hai. Aap apne account se projects, services aur exclusive access manage kar sakte hain.

🔐 *APKI LOGIN CREDENTIALS:*
• 🌐 *Login Portal:* ${portalUrl}
• 👤 *Username:* \`${user.username}\`
• 🔑 *Password:* \`${user.password}\`
• 🎖️ *Access Level:* ${user.role}

⚠️ *SECURITY & SINGLE-DEVICE NOTICE:*
• Security policy ke mutabiq yeh account ek waqt mein *sirf 1 Device* par active rahega.
• Doosri device par login karne par pehli device lock ho jayegi.
• Apni login details kisi ke sath share na karein.

Need help? Contact Administrator Rizwan Rahi directly.
Thank you for partnering with *Weblitex*! 🚀`;

    return msg;
  }

  // Random Password Generator Utility
  function generateSecurePassword(length = 10) {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghjkmnpqrstuvwxyz';
    const numbers = '23456789';
    const special = '@#$%&*!';
    const all = upper + lower + numbers + special;

    let pwd = '';
    pwd += upper[Math.floor(Math.random() * upper.length)];
    pwd += lower[Math.floor(Math.random() * lower.length)];
    pwd += numbers[Math.floor(Math.random() * numbers.length)];
    pwd += special[Math.floor(Math.random() * special.length)];

    for (let i = 4; i < length; i++) {
      pwd += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle
    return pwd.split('').sort(() => 0.5 - Math.random()).join('');
  }

  // Export module to global scope
  window.WeblitexAuth = {
    getDeviceId,
    getDeviceReadableName,
    getDB,
    saveDB,
    login,
    logout,
    verifySession,
    getActiveSession,
    adminCreateUser,
    adminUpdateUser,
    adminDeleteUser,
    adminToggleUserStatus,
    adminResetDeviceSession,
    adminUpdateCredentials,
    formatWhatsAppMessage,
    generateSecurePassword
  };

})(window);
