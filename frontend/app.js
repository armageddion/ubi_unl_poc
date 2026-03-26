const BACKEND_URL = "https://ubi-unl-poc.onrender.com";

const FRONTEND_PASSWORD_HASH = "33d29b02c975065df42a23f560ece8602ed872cf24240fb1e36cd29494e40c96";

let customCsvText = null;

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

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length < headers.length) continue;
        
        const row = {};
        for (let j = 0; j < headers.length; j++) {
            row[headers[j].trim()] = values[j] ? values[j].trim() : '';
        }
        result.push(row);
    }
    
    return result;
}

function loadScenarioData(csvData, scenarioNum) {
    const pageCol = `Scenario${scenarioNum}_page`;
    const ledCol = `Scenario${scenarioNum}_led`;
    
    const pageGroups = {};
    const ledGroups = { RED: [], GREEN: [] };
    
    for (const row of csvData) {
        const labelCode = row.LabelCode;
        const pageValue = row[pageCol];
        const ledValue = row[ledCol];
        
        if (!labelCode) continue;
        
        if (pageValue) {
            const pageNum = parseInt(pageValue, 10);
            if (!isNaN(pageNum)) {
                if (!pageGroups[pageNum]) {
                    pageGroups[pageNum] = [];
                }
                pageGroups[pageNum].push(labelCode);
            }
        }
        
        if (ledValue && (ledValue === 'RED' || ledValue === 'GREEN')) {
            ledGroups[ledValue].push(labelCode);
        }
    }
    
    return { pageGroups, ledGroups };
}

async function triggerPageChangeBatch(labelCodes, page) {
    if (!labelCodes || labelCodes.length === 0) return;
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/trigger-1`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ labelCodes, page }),
        });
        
        const data = await response.json();
        if (data.status !== 'success') {
            throw new Error(data.message || 'Page change failed');
        }
    } catch (error) {
        throw error;
    }
}

async function triggerLedBlinkBatch(labelCodes, color, duration) {
    if (!labelCodes || labelCodes.length === 0) return;
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/trigger-2`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ labelCodes, color, duration }),
        });
        
        const data = await response.json();
        if (data.status !== 'success') {
            throw new Error(data.message || 'LED blink failed');
        }
    } catch (error) {
        throw error;
    }
}

function handleCsvUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        customCsvText = e.target.result;
        showToast('Custom CSV loaded - will be used for scenarios', 'success');
    };
    reader.onerror = () => {
        showToast('Failed to read file', 'error');
    };
    reader.readAsText(file);
}

async function runScenario(scenarioNum) {
    const buttonMap = { 1: 'btn-scenario-1', 2: 'btn-scenario-2', 3: 'btn-scenario-3', 4: 'btn-scenario-4' };
    const button = document.getElementById(buttonMap[scenarioNum]);
    
    button.disabled = true;
    button.textContent = 'Running...';
    
    try {
        let csvText;
        
        if (customCsvText) {
            csvText = customCsvText;
        } else {
            const response = await fetch('Scenarios.csv');
            if (!response.ok) throw new Error('Failed to fetch CSV');
            csvText = await response.text();
        }
        
        const csvData = parseCSV(csvText);
        const { pageGroups, ledGroups } = loadScenarioData(csvData, scenarioNum);
        
        const hasPageData = Object.keys(pageGroups).length > 0;
        const hasLedData = ledGroups.RED.length > 0 || ledGroups.GREEN.length > 0;
        
        if (!hasPageData && !hasLedData) {
            showToast('No page or LED data', 'error');
            return;
        }
        
        const sortedPages = Object.keys(pageGroups).map(Number).sort((a, b) => a - b);
        
        for (const page of sortedPages) {
            await triggerPageChangeBatch(pageGroups[page], page);
        }
        
        if (ledGroups.RED.length > 0) {
            await triggerLedBlinkBatch(ledGroups.RED, 'RED', '30s');
        }
        
        if (ledGroups.GREEN.length > 0) {
            await triggerLedBlinkBatch(ledGroups.GREEN, 'GREEN', '30s');
        }
        
        showToast(`Scenario ${scenarioNum} completed successfully`, 'success');
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    } finally {
        button.disabled = false;
        button.textContent = `Scenario ${scenarioNum}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('password-submit').addEventListener('click', handlePasswordSubmit);
    document.getElementById('password-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handlePasswordSubmit();
    });

    document.getElementById('btn-1').addEventListener('click', triggerPageChange);
    document.getElementById('btn-2').addEventListener('click', triggerLedBlink);
    
    document.getElementById('csv-upload').addEventListener('change', handleCsvUpload);
    
    document.getElementById('btn-scenario-1').addEventListener('click', () => runScenario(1));
    document.getElementById('btn-scenario-2').addEventListener('click', () => runScenario(2));
    document.getElementById('btn-scenario-3').addEventListener('click', () => runScenario(3));
    document.getElementById('btn-scenario-4').addEventListener('click', () => runScenario(4));
});
