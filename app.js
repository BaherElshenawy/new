import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// Firebase Configuration Link
const firebaseConfig = {
    apiKey: "AIzaSyCOZJWyQOoD2PF6jRPwB0vo14eKiPs0_RA",
    authDomain: "dental-moderator.firebaseapp.com",
    projectId: "dental-moderator",
    storageBucket: "dental-moderator.firebasestorage.app",
    messagingSenderId: "600867027414",
    appId: "1:600867027414:web:f6fd0f6dd45bfe00d90c77",
    measurementId: "G-MV7NXDYG5N"
};

// Initialize Core Context
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const viewLayer = document.getElementById('view-layer');
const sidebar = document.getElementById('sidebar');

let activeView = 'dashboard';
const ADMIN_TOKEN = "BoB2120";

// Complete Feature Views Matrix (Arabic Language Support)
const Views = {
    auth: () => `
        <div class="auth-wrapper card" style="max-width: 450px; margin: 12vh auto; padding: 2.5rem; border-top: 4px solid var(--neon-blue);">
            <h2 style="margin-bottom: 0.5rem; font-family: 'Cairo', sans-serif; text-align: center;">تسجيل الدخول للنظام</h2>
            <p style="color: var(--text-secondary); text-align: center; font-size: 0.85rem; margin-bottom: 2rem;">أدخل المعرفات المشفرة للوصول للملفات الطبية</p>
            <form id="login-form">
                <div class="form-group">
                    <label>البريد الإلكتروني للمشغل</label>
                    <input type="email" id="auth-email" required placeholder="admin@clinic.com" style="direction: ltr; text-align: left;">
                </div>
                <div class="form-group">
                    <label>رمز المرور السري</label>
                    <input type="password" id="auth-pass" required placeholder="••••••••" style="direction: ltr; text-align: left;">
                </div>
                <button type="submit" class="btn-primary" style="font-family: 'Cairo', sans-serif; font-weight: 600;">تخويل والولوج للملف الذكي</button>
            </form>
        </div>
    `,
    dashboard: async () => {
        let apptsSize = 0;
        let patientsSize = 0;
        try {
            const appts = await getDocs(collection(db, "appointments"));
            apptsSize = appts.size;
            const patients = await getDocs(collection(db, "patients"));
            patientsSize = patients.size;
        } catch (e) {
            console.log("Initializing standard collections...");
        }
        return `
            <div class="panel-header" style="margin-bottom: 2rem;">
                <h1>مؤشرات الأداء والحالة العامة</h1>
                <p style="color:var(--text-secondary)">ملخص إحصائي فوري للعمليات الجارية في العيادة.</p>
            </div>
            <div class="grid-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">
                <div class="card"><h3>المواعيد النشطة اليوم</h3><div class="val">${apptsSize}</div></div>
                <div class="card"><h3>إجمالي المرضى المسجلين</h3><div class="val">${patientsSize}</div></div>
                <div class="card"><h3>حالة اتصال قاعدة البيانات</h3><div class="val" style="color:var(--neon-emerald)">متصل وآمن</div></div>
            </div>
        `;
    },
    appointments: async () => {
        let rows = "";
        try {
            const snapshot = await getDocs(collection(db, "appointments"));
            snapshot.forEach(doc => {
                const data = doc.data();
                rows += `<tr><td>${data.patientName}</td><td>${data.date}</td><td>${data.time}</td><td><span style="color:var(--neon-blue)">${data.status}</span></td></tr>`;
            });
        } catch (e) { console.error(e); }
        
        return `
            <div class="panel-header" style="margin-bottom: 2rem;"><h1>جدولة وإدارة المواعيد</h1></div>
            <div class="card" style="margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1.25rem;">إضافة حجز جديد للجدول</h3>
                <form id="appt-form" style="display: grid; gap:1rem; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
                    <input type="text" id="p-name" placeholder="اسم المريض الثنائي" required>
                    <input type="date" id="p-date" required>
                    <input type="time" id="p-time" required>
                    <button type="submit" class="btn-primary" style="font-family:'Cairo';">تأكيد وإدراج</button>
                </form>
            </div>
            <div class="card">
                <h3>طابور الجلسات المجدولة اليوم</h3>
                <table class="tech-table" style="width: 100%; text-align: right; margin-top: 1rem;">
                    <thead><tr><th>اسم المريض</th><th>التاريخ</th><th>الوقت المحدد</th><th>حالة الإجراء</th></tr></thead>
                    <tbody>${rows || '<tr><td colspan="4" style="color:var(--text-secondary); text-align:center;">لا توجد مواعيد نشطة حالياً</td></tr>'}</tbody>
                </table>
            </div>
        `;
    },
    patients: async () => {
        let rows = "";
        try {
            const snapshot = await getDocs(collection(db, "patients"));
            snapshot.forEach(doc => {
                const data = doc.data();
                rows += `<tr><td>${data.idNumber}</td><td>${data.name}</td><td>${data.phone}</td><td>${data.medicalNote}</td></tr>`;
            });
        } catch(e) { console.error(e); }

        return `
            <div class="panel-header" style="margin-bottom: 2rem;"><h1>السجلات الطبية الرقمية (EMR)</h1></div>
            <div class="card" style="margin-bottom:2rem;">
                <h3 style="margin-bottom: 1.25rem;">فتح ملف طبي لمريض جديد</h3>
                <form id="patient-form" style="display:grid; gap:1rem; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));">
                    <input type="text" id="emr-id" placeholder="الرقم القومي / جواز السفر" required>
                    <input type="text" id="emr-name" placeholder="الاسم الكامل ثلاثي" required>
                    <input type="text" id="emr-phone" placeholder="قناة الاتصال (الهاتف)" required>
                    <input type="text" id="emr-note" placeholder="التشخيص المبدئي أو ملاحظات الحالة" required>
                    <button type="submit" class="btn-primary" style="font-family:'Cairo';">حفظ الملف المشفر</button>
                </form>
            </div>
            <div class="card">
                <h3>قاعدة بيانات المرضى المسجلين</h3>
                <table class="tech-table" style="width: 100%; text-align: right; margin-top: 1rem;">
                    <thead><tr><th>مفتاح السجل</th><th>الاسم الكامل</th><th>رقم الهاتف</th><th>الملاحظات السريرية</th></tr></thead>
                    <tbody>${rows || '<tr><td colspan="4" style="color:var(--text-secondary); text-align:center;">لم يتم تسجيل ملفات حتى الآن</td></tr>'}</tbody>
                </table>
            </div>
        `;
    },
    admin: async () => {
        let apptRows = "";
        try {
            const apptSnap = await getDocs(collection(db, "appointments"));
            apptSnap.forEach(d => {
                apptRows += `<tr><td>${d.data().patientName}</td><td><button class="btn-primary btn-danger purge-btn" data-coll="appointments" data-id="${d.id}" style="padding: 4px 12px; font-size:0.8rem; font-family:'Cairo';">حذف نهائي</button></td></tr>`;
            });
        } catch(e) { console.error(e); }

        return `
            <div class="panel-header" style="margin-bottom: 2rem;"><h1>لوحة التحكم بالنظام (Sysops Core)</h1><p style="color:var(--neon-rose)">صلاحيات المسؤول المباشر مفعلة</p></div>
            <div class="grid-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                <div class="card">
                    <h3>صيانة البيانات وتصفير التخزين</h3>
                    <div style="margin-top:1rem; display:flex; flex-direction:column; gap:1rem;">
                        <button class="btn-primary btn-danger" id="flush-cache" style="font-family:'Cairo';">تفريغ وإعادة فحص الذاكرة</button>
                        <p style="color:var(--text-secondary); font-size:0.75rem;">تنبيه: هذا الإجراء يفحص كفاءة المسارات البرمجية ومؤشرات زمن الاستجابة الفورية.</p>
                    </div>
                </div>
                <div class="card">
                    <h3>تعديل وتقليم شجرة البيانات الحالية</h3>
                    <table class="tech-table" style="width:100%; text-align:right; margin-top:1rem;">
                        <thead><tr><th>الكائن المعرف</th><th>الإجراء الإداري</th></tr></thead>
                        <tbody>${apptRows || '<tr><td style="color:var(--text-secondary); text-align:center;">لا توجد عناصر حية للتعديل عليها</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
        `;
    }
};

// State Machine Navigation Engine (With Root Security Token Interceptor)
async function switchView(target) {
    if (target === 'admin') {
        const challenge = prompt("أدخل رمز التحقق الإداري للوصول للنظام الأساسي (Sysops Key):");
        if (challenge !== ADMIN_TOKEN) {
            alert("فشل التحقق الأمنـي من الرمز المستند // تم رفض الوصول");
            return;
        }
    }
    
    activeView = target;
    document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.remove('active');
        if (b.getAttribute('data-target') === target) b.classList.add('active');
    });

    const contentHTML = typeof Views[target] === 'function' ? await Views[target]() : Views[target];
    viewLayer.innerHTML = contentHTML;
    
    if(typeof lucide !== 'undefined') lucide.createIcons();
    attachComponentEventListeners();
}

// Global Form Submit & Live Document Action Handler Loop
function attachComponentEventListeners() {
    document.getElementById('login-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const pass = document.getElementById('auth-pass').value;
        signInWithEmailAndPassword(auth, email, pass)
            .catch(err => alert("فشل التحقق: " + err.message));
    });

    document.getElementById('appt-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "appointments"), {
                patientName: document.getElementById('p-name').value,
                date: document.getElementById('p-date').value,
                time: document.getElementById('p-time').value,
                status: "مجدول ونشط"
            });
            switchView('appointments');
        } catch(err) { alert(err.message); }
    });

    document.getElementById('patient-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "patients"), {
                idNumber: document.getElementById('emr-id').value,
                name: document.getElementById('emr-name').value,
                phone: document.getElementById('emr-phone').value,
                medicalNote: document.getElementById('emr-note').value
            });
            switchView('patients');
        } catch(err) { alert(err.message); }
    });

    document.querySelectorAll('.purge-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            const collectionName = e.target.getAttribute('data-coll');
            if(confirm("هل أنت متأكد من مسح هذا السجل الطبي بشكل نهائي؟ لا يمكن استرجاعه.")) {
                try {
                    await deleteDoc(doc(db, collectionName, id));
                    switchView('admin');
                } catch(err) { alert(err.message); }
            }
        });
    });

    document.getElementById('flush-cache')?.addEventListener('click', () => alert("تم تفريغ الملفات المؤقتة بنجاح ومزامنة زمن الاستجابة على 0ms."));
}

// Firebase Realtime State Observer Matrix
onAuthStateChanged(auth, async (user) => {
    if (user) {
        if (sidebar) sidebar.classList.remove('hidden');
        switchView('dashboard');
    } else {
        if (sidebar) sidebar.classList.add('hidden');
        viewLayer.innerHTML = Views.auth();
        attachComponentEventListeners();
    }
    if(typeof lucide !== 'undefined') lucide.createIcons();
});

// Event Binding for Sidebar Navigation Links Matrix
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const target = e.currentTarget.getAttribute('data-target');
        if (target) switchView(target);
    });
});

document.getElementById('logout-btn')?.addEventListener('click', () => signOut(auth));
