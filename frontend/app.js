const BACKEND_URL = "YOUR_RENDER_BACKEND_URL";

const FRONTEND_PASSWORD_HASH = "d41d8cd98f00b204e9800998ecf8427e";

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

async function handlePasswordSubmit() {
    const input = document.getElementById('password-input');
    const errorEl = document.getElementById('password-error');
    const password = input.value;

    if (!password) {
        errorEl.classList.remove('hidden');
        return;
    }

    const hash = await hashPassword(password);

    if (hash === FRONTEND_PASSWORD_HASH) {
        document.getElementById('password-modal').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
    } else {
        errorEl.classList.remove('hidden');
        input.value = '';
    }
}

async function triggerPageChange() {
    const labelCodesInput = document.getElementById('labelcodes-1');
    const pageInput = document.getElementById('page-1');
    const button = document.getElementById('btn-1');
    
    const labelCodes = labelCodesInput.value.trim();
    const page = pageInput.value.trim();

    if (!labelCodes) {
        showToast('Please enter label codes', 'error');
        return;
    }

    if (!page || parseInt(page) < 1) {
        showToast('Please enter a valid page number', 'error');
        return;
    }

    button.disabled = true;
    button.textContent = 'Loading...';

    try {
        const response = await fetch(`${BACKEND_URL}/api/trigger-1`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                labelCodes: labelCodes.split(',').map(s => s.trim()).filter(s => s),
                page: parseInt(page)
            }),
        });

        const data = await response.json();

        if (data.status === 'success') {
            showToast(data.message || 'Page change completed successfully', 'success');
        } else {
            showToast(data.message || 'Page change failed', 'error');
        }
    } catch (error) {
        showToast(`Connection error: ${error.message}`, 'error');
    } finally {
        button.disabled = false;
        button.textContent = 'Execute Page Change';
    }
}

async function triggerLedBlink() {
    const labelCodesInput = document.getElementById('labelcodes-2');
    const colorSelect = document.getElementById('color-2');
    const durationSelect = document.getElementById('duration-2');
    const button = document.getElementById('btn-2');
    
    const labelCodes = labelCodesInput.value.trim();
    const color = colorSelect.value;
    const duration = durationSelect.value;

    if (!labelCodes) {
        showToast('Please enter label codes', 'error');
        return;
    }

    button.disabled = true;
    button.textContent = 'Loading...';

    try {
        const response = await fetch(`${BACKEND_URL}/api/trigger-2`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                labelCodes: labelCodes.split(',').map(s => s.trim()).filter(s => s),
                color: color,
                duration: duration
            }),
        });

        const data = await response.json();

        if (data.status === 'success') {
            showToast(data.message || 'LED blink completed successfully', 'success');
        } else {
            showToast(data.message || 'LED blink failed', 'error');
        }
    } catch (error) {
        showToast(`Connection error: ${error.message}`, 'error');
    } finally {
        button.disabled = false;
        button.textContent = 'Execute LED Blink';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('password-submit').addEventListener('click', handlePasswordSubmit);
    document.getElementById('password-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handlePasswordSubmit();
    });

    document.getElementById('btn-1').addEventListener('click', triggerPageChange);
    document.getElementById('btn-2').addEventListener('click', triggerLedBlink);
});
