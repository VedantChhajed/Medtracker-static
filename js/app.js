// Navigation
function navigateToPage(pageId) {
    // If we're on landing page and clicking dashboard, or clicking home/dashboard from anywhere
    if ((document.querySelector('.page.active').id === 'landing-page' && pageId === 'dashboard') ||
        (pageId === 'home' || pageId === 'dashboard')) {
        pageId = 'dashboard';
    }

    const currentPage = document.querySelector('.page.active');
    const targetPage = document.getElementById(`${pageId}-page`);
    
    if (!targetPage || currentPage === targetPage) return;

    // Hide all pages first
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });

    // Show target page
    targetPage.style.display = 'flex';
    setTimeout(() => {
        targetPage.classList.add('active');
    }, 10);

    // Initialize charts if needed
    if (pageId === 'dashboard') {
        setTimeout(() => {
            initializeChart();
            document.querySelector('.metrics-chart')?.classList.add('visible');
        }, 100);
    } else if (pageId === 'health') {
        setTimeout(() => {
            initializeHealthChart();
            document.querySelector('.metrics-chart')?.classList.add('visible');
        }, 100);
    } else if (pageId === 'medications') {
        setTimeout(() => {
            // Ensure medications are loaded and displayed
            updateMedicationsUI();
            updateAdherenceRate();
        }, 100);
    }

    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageId || (link.dataset.page === 'home' && pageId === 'dashboard')) {
            link.classList.add('active');
        }
    });
}

// Chart initialization
function initializeChart() {
    const ctx = document.getElementById('metricsChart');
    if (!ctx) return;
    const appData = loadAppData();
    const healthMetrics = appData.healthMetrics || {};
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    // Get labels for last 7 days
    const labels = Array.from({length: 7}, (_, i) => {
        const date = new Date(lastWeek);
        date.setDate(date.getDate() + i);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    });
    
    // Process data for each metric type
    const datasets = [];
    
    // Blood Pressure data
    if (healthMetrics.bloodPressure && healthMetrics.bloodPressure.length > 0) {
        const bpData = getMetricDataForLastWeek(healthMetrics.bloodPressure, 'systolic');
        datasets.push({
            label: 'Blood Pressure',
            data: bpData,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            hidden: false
        });
    } else {
        // Mock blood pressure data if none exists
        datasets.push({
            label: 'Blood Pressure',
            data: [125, 128, 120, 118, 122, 119, 117],
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            hidden: false
        });
    }
    
    // Glucose data
    if (healthMetrics.glucose && healthMetrics.glucose.length > 0) {
        const glucoseData = getMetricDataForLastWeek(healthMetrics.glucose);
        datasets.push({
            label: 'Glucose',
            data: glucoseData,
            borderColor: '#22C55E',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4,
            fill: true,
            hidden: false
        });
    } else {
        // Mock glucose data if none exists
        datasets.push({
            label: 'Glucose',
            data: [114, 118, 107, 110, 105, 102, 100],
            borderColor: '#22C55E',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4,
            fill: true,
            hidden: false
        });
    }
    
    // Weight data
    if (healthMetrics.weight && healthMetrics.weight.length > 0) {
        const weightData = getMetricDataForLastWeek(healthMetrics.weight);
        datasets.push({
            label: 'Weight',
            data: weightData,
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4,
            fill: true,
            hidden: false
        });
    } else {
        // Mock weight data if none exists
        datasets.push({
            label: 'Weight',
            data: [76.5, 76.2, 76.0, 75.8, 75.5, 75.2, 75.0],
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4,
            fill: true,
            hidden: false
        });
    }
    
    // Temperature data
    if (healthMetrics.temperature && healthMetrics.temperature.length > 0) {
        const tempData = getMetricDataForLastWeek(healthMetrics.temperature);
        datasets.push({
            label: 'Temperature',
            data: tempData,
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true,
            hidden: false
        });
    } else {
        // Mock temperature data if none exists
        datasets.push({
            label: 'Temperature',
            data: [36.8, 36.9, 36.7, 36.6, 36.7, 36.5, 36.6],
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true,
            hidden: false
        });
    }
    
    // Create or update chart
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
        existingChart.destroy();
    }
    const newChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 10
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94A3B8'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94A3B8'
                    }
                }
            }
        }
    });
    
    // Add click handlers for metric tabs
    const tabs = document.querySelectorAll('.metrics-tabs button');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const metric = tab.textContent.trim();
            datasets.forEach(dataset => {
                if (metric === 'All Metrics') {
                    dataset.hidden = false;
                } else {
                    dataset.hidden = dataset.label !== metric;
                }
            });
            newChart.update();
        });
    });
}

// Metrics tabs
function initializeMetricsTabs() {
    const tabs = document.querySelectorAll('.metrics-tabs button');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            // Update chart based on selected metric (not implemented in this demo)
        });
    });
}

// BMI Calculator
function calculateBMI(height, weight, unit = 'metric') {
    if (unit === 'metric') {
        // Convert height from cm to meters
        const heightInMeters = height / 100;
        return weight / (heightInMeters * heightInMeters);
    } else {
        // Imperial formula: (weight in pounds * 703) / (height in inches * height in inches)
        return (weight * 703) / (height * height);
    }
}

function getBMICategory(bmi) {
    if (bmi < 18.5) return { category: 'Underweight', color: '#3B82F6' };
    if (bmi < 25) return { category: 'Normal', color: '#22C55E' };
    if (bmi < 30) return { category: 'Overweight', color: '#F59E0B' };
    return { category: 'Obese', color: '#EF4444' };
}

function handleBMICalculation(e) {
    e.preventDefault(); // Important: prevent form submission
    e.stopPropagation(); // Stop event from bubbling up
    
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);

    if (!height || !weight) {
        alert('Please enter both height and weight');
        return;
    }

    // Calculate BMI
    const bmi = calculateBMI(height, weight);
    const { category, color } = getBMICategory(bmi);
    
    // Update UI
    const resultElement = document.querySelector('.bmi-result');
    resultElement.innerHTML = `
        <div class="result-value" style="color: ${color}">
            ${bmi.toFixed(1)}
        </div>
        <div class="result-category" style="color: ${color}">
            ${category}
        </div>
        <div class="result-explanation">
            Your BMI indicates that you are in the ${category.toLowerCase()} range.
        </div>
    `;
    resultElement.style.display = 'block';

    // Save to local storage
    const appData = JSON.parse(localStorage.getItem('healthAppData')) || {};
    const healthLogs = appData.healthLogs || [];
    
    healthLogs.push({
        date: new Date().toISOString(),
        type: 'BMI',
        value: parseFloat(bmi.toFixed(1)),
        category: category,
        measurements: { height, weight }
    });
    
    appData.healthLogs = healthLogs;
    localStorage.setItem('healthAppData', JSON.stringify(appData));

    // Update BMI metric display
    const bmiMetric = document.querySelector('.metric-bmi .metric-value');
    if (bmiMetric) {
        bmiMetric.textContent = bmi.toFixed(1);
    }
}

// Update BMI calculator UI based on selected unit system
function updateBMICalculator() {
    const appData = loadAppData();
    const unit = appData.settings?.units || 'metric';
    
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    const heightLabel = document.querySelector('label[for="height"]');
    const weightLabel = document.querySelector('label[for="weight"]');
    
    if (!heightInput || !weightInput || !heightLabel || !weightLabel) return;
    
    if (unit === 'metric') {
        heightInput.placeholder = 'Enter height in cm';
        weightInput.placeholder = 'Enter weight in kg';
        heightLabel.innerHTML = '<i data-lucide="ruler"></i> Height (cm)';
        weightLabel.innerHTML = '<i data-lucide="weight"></i> Weight (kg)';
        
        // Set reasonable min/max values for metric
        heightInput.min = '100';
        heightInput.max = '250';
        weightInput.min = '30';
        weightInput.max = '300';
    } else {
        heightInput.placeholder = 'Enter height in inches';
        weightInput.placeholder = 'Enter weight in lbs';
        heightLabel.innerHTML = '<i data-lucide="ruler"></i> Height (in)';
        weightLabel.innerHTML = '<i data-lucide="weight"></i> Weight (lbs)';
        
        // Set reasonable min/max values for imperial
        heightInput.min = '40';
        heightInput.max = '100';
        weightInput.min = '66';
        weightInput.max = '660';
    }

    // Clear any existing values and results
    heightInput.value = '';
    weightInput.value = '';
    const resultElement = document.querySelector('.bmi-result');
    if (resultElement) {
        resultElement.style.display = 'none';
    }

    // Refresh Lucide icons
    lucide.createIcons();
}

// Add to your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    // ... existing initialization code ...

    // Initialize BMI calculator
    const bmiForm = document.getElementById('bmiForm');
    if (bmiForm) {
        bmiForm.addEventListener('submit', handleBMICalculation);
        updateBMICalculator(); // Initialize the calculator with correct units
    }
});

function updateHealthMetrics() {
    const appData = loadAppData();
    const healthLogs = appData.healthLogs;
    
    // Get latest BMI
    const latestBMI = healthLogs
        .filter(log => log.type === 'BMI')
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    if (latestBMI) {
        const bmiElement = document.querySelector('.metric-bmi .metric-value');
        if (bmiElement) {
            bmiElement.textContent = latestBMI.value.toFixed(1);
        }
    }

    // Update health chart
    const healthChart = Chart.getChart('healthChart');
    if (healthChart) {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const recentLogs = healthLogs
            .filter(log => new Date(log.date) > lastWeek)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const labels = recentLogs.map(log => 
            new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' })
        );

        const bmiData = recentLogs
            .filter(log => log.type === 'BMI')
            .map(log => log.value);

        healthChart.data.labels = labels;
        healthChart.data.datasets[0].data = bmiData;
        healthChart.update();
    }
}

// Data Management
async function loadAppData() {
    // Always load local data first
    const localData = JSON.parse(localStorage.getItem('healthAppData')) || initializeSampleData();
    
    // If user is signed in, try to merge with cloud data
    const user = firebase.auth().currentUser;
    if (user) {
        try {
            const doc = await db.collection('users').doc(user.uid).get();
            if (doc.exists) {
                const cloudData = doc.data();
                // Merge cloud data with local data, preferring cloud data
                return { ...localData, ...cloudData };
            }
        } catch (error) {
            console.error('Error loading cloud data:', error);
        }
    }
    
    return localData;
}

async function saveAppData(data) {
    // Always save to localStorage
    localStorage.setItem('healthAppData', JSON.stringify(data));
    
    // If user is signed in, also save to cloud
    const user = firebase.auth().currentUser;
    if (user) {
        try {
            await db.collection('users').doc(user.uid).set({
                ...data,
                lastUpdated: new Date()
            }, { merge: true });
        } catch (error) {
            console.error('Error saving to cloud:', error);
        }
    }
}

// Health Chart Initialization
function initializeHealthChart() {
    const ctx = document.getElementById('healthChart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
        existingChart.destroy();
    }

    const healthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'BMI',
                data: [],
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 10
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94A3B8'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94A3B8'
                    }
                }
            }
        }
    });

    // Update with existing data
    updateHealthMetrics();
}

// Settings Management
function initializeSettings() {
    const appData = loadAppData();
    appData.settings = appData.settings || {};
    
    // Initialize notification toggles
    document.getElementById('medicationNotifications').checked = appData.settings.medicationNotifications ?? true;
    document.getElementById('healthAlerts').checked = appData.settings.healthAlerts ?? true;
    document.getElementById('appointmentReminders').checked = appData.settings.appointmentReminders ?? true;
    
    // Initialize preferences
    const darkModeToggle = document.getElementById('darkMode');
    if (darkModeToggle) {
        darkModeToggle.checked = appData.settings.darkMode ?? true;
        darkModeToggle.addEventListener('change', (e) => {
            const isDark = e.target.checked;
            applyTheme(isDark);
        });
    }
    
    const unitsSelect = document.getElementById('units');
    if (unitsSelect) {
        unitsSelect.value = appData.settings.units ?? 'metric';
    }
    
    // Add event listeners for settings changes
    document.querySelectorAll('.settings-list input[type="checkbox"]').forEach(toggle => {
        if (toggle.id !== 'darkMode') { // Skip darkMode toggle as it's handled separately
            toggle.addEventListener('change', handleSettingChange);
        }
    });
    
    document.querySelectorAll('.settings-list select').forEach(select => {
        select.addEventListener('change', handleSettingChange);
    });
    
    // Add event listeners for data management
    const exportBtn = document.querySelector('.setting-item .btn-secondary');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    const clearBtn = document.querySelector('.setting-item .btn-danger');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearData);
    }

    // Apply current settings
    applyTheme(appData.settings.darkMode ?? true);
    applyUnits(appData.settings.units ?? 'metric');
}

function handleSettingChange(e) {
    const setting = e.target.id;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    
    const appData = loadAppData();
    appData.settings = appData.settings || {};
    appData.settings[setting] = value;
    saveAppData(appData);
    
    // Apply setting changes immediately
    switch(setting) {
        case 'darkMode':
            applyTheme(value);
            break;
        case 'units':
            applyUnits(value);
            updateBMICalculator(); // Update BMI calculator when units change
            break;
        case 'medicationNotifications':
        case 'healthAlerts':
        case 'appointmentReminders':
            updateNotificationSettings();
            break;
    }
}

// Theme Management
function applyTheme(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
    document.body.classList.toggle('light-mode', !isDark);
    
    const root = document.documentElement;
    if (isDark) {
        root.style.setProperty('--background-dark', '#0F172A');
        root.style.setProperty('--card-dark', '#1E293B');
        root.style.setProperty('--text-light', '#F8FAFC');
        root.style.setProperty('--text-muted', '#94A3B8');
        root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
        root.style.setProperty('--hover-bg', 'rgba(255, 255, 255, 0.05)');
    } else {
        root.style.setProperty('--background-dark', '#F8FAFC');
        root.style.setProperty('--card-dark', '#FFFFFF');
        root.style.setProperty('--text-light', '#1E293B');
        root.style.setProperty('--text-muted', '#64748B');
        root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.1)');
        root.style.setProperty('--hover-bg', 'rgba(0, 0, 0, 0.05)');
    }

    // Update chart colors
    const dashboardChart = Chart.getChart('metricsChart');
    if (dashboardChart) {
        dashboardChart.options.scales.y.grid.color = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        dashboardChart.options.scales.x.grid.color = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        dashboardChart.options.scales.y.ticks.color = isDark ? '#94A3B8' : '#64748B';
        dashboardChart.options.scales.x.ticks.color = isDark ? '#94A3B8' : '#64748B';
        dashboardChart.update();
    }

    const healthChart = Chart.getChart('healthChart');
    if (healthChart) {
        healthChart.options.scales.y.grid.color = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        healthChart.options.scales.x.grid.color = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        healthChart.options.scales.y.ticks.color = isDark ? '#94A3B8' : '#64748B';
        healthChart.options.scales.x.ticks.color = isDark ? '#94A3B8' : '#64748B';
        healthChart.update();
    }

    // Save theme preference
    const appData = loadAppData();
    appData.settings = appData.settings || {};
    appData.settings.darkMode = isDark;
    saveAppData(appData);
}

function applyUnits(unit) {
    const appData = loadAppData();
    appData.settings.units = unit;
    saveAppData(appData);

    // Update all displayed measurements
    updateHealthMetricsUI();
    updateBMICalculator();
}

function convertWeight(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) return value;
    return fromUnit === 'metric' 
        ? value * 2.20462  // kg to lb
        : value / 2.20462; // lb to kg
}

function convertHeight(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) return value;
    return fromUnit === 'metric'
        ? value / 2.54    // cm to in
        : value * 2.54;   // in to cm
}

function convertTemperature(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) return value;
    return fromUnit === 'metric'
        ? (value * 9/5) + 32  // C to F
        : (value - 32) * 5/9; // F to C
}

function exportData(format = 'pdf') {
    const appData = loadAppData();
    
    if (format === 'pdf') {
        // Create PDF content
        const content = {
            content: [
                { text: 'Health Journey Report', style: 'header' },
                { text: new Date().toLocaleDateString(), alignment: 'right' },
                { text: '\n\nMedications', style: 'subheader' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', '*', '*'],
                        body: [
                            ['Name', 'Dosage', 'Times', 'Instructions'],
                            ...appData.medications.map(med => [
                                med.name,
                                med.dosage,
                                med.times.join(', '),
                                med.instructions
                            ])
                        ]
                    }
                },
                { text: '\n\nHealth Metrics', style: 'subheader' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', '*'],
                        body: [
                            ['Date', 'Type', 'Value'],
                            ...Object.entries(appData.healthMetrics).flatMap(([type, metrics]) =>
                                metrics.map(metric => [
                                    new Date(metric.date).toLocaleDateString(),
                                    type,
                                    JSON.stringify(metric.value)
                                ])
                            )
                        ]
                    }
                }
            ],
            styles: {
                header: {
                    fontSize: 22,
                    bold: true,
                    margin: [0, 0, 0, 10]
                },
                subheader: {
                    fontSize: 16,
                    bold: true,
                    margin: [0, 10, 0, 5]
                }
            }
        };

        // Generate and download PDF
        pdfMake.createPdf(content).download('health-journey-report.pdf');
    } else if (format === 'excel') {
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Add medications worksheet
        const medicationsData = [
            ['Name', 'Dosage', 'Times', 'Instructions', 'Status', 'Date Added'],
            ...appData.medications.map(med => [
                med.name,
                med.dosage,
                med.times.join('; '),
                med.instructions,
                med.status,
                med.dateAdded
            ])
        ];
        const medicationsWS = XLSX.utils.aoa_to_sheet(medicationsData);
        XLSX.utils.book_append_sheet(wb, medicationsWS, 'Medications');
        
        // Add health metrics worksheet
        const metricsData = [
            ['Date', 'Type', 'Value'],
            ...Object.entries(appData.healthMetrics).flatMap(([type, metrics]) =>
                metrics.map(metric => [
                    new Date(metric.date).toLocaleDateString(),
                    type,
                    JSON.stringify(metric.value)
                ])
            )
        ];
        const metricsWS = XLSX.utils.aoa_to_sheet(metricsData);
        XLSX.utils.book_append_sheet(wb, metricsWS, 'Health Metrics');
        
        // Generate and download Excel file
        XLSX.writeFile(wb, 'health-journey-report.xlsx');
    }
}

function clearData() {
    if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
        const appData = loadAppData();
        const settings = appData.settings; // Preserve settings
        localStorage.setItem('healthAppData', JSON.stringify({
            medications: [],
            healthLogs: [],
            appointments: [],
            healthMetrics: {
                bloodPressure: [],
                weight: [],
                temperature: []
            },
            settings: settings
        }));
        window.location.reload();
    }
}

function updateNotificationSettings() {
    const appData = loadAppData();
    
    // Re-initialize notifications with new settings
    if (Notification.permission === 'granted') {
        // Reschedule all medication reminders
        appData.medications.forEach(med => {
            if (med.status === 'active') {
                scheduleMedicationReminders(med);
            }
        });
        
        // Reschedule all appointment reminders
        appData.appointments.forEach(apt => {
            if (apt.status === 'upcoming') {
                scheduleAppointmentReminders(apt);
            }
        });
    }
}

// Wellness Score Calculation
function calculateWellnessScore() {
    let score = 85; // Base score
    
    try {
        const appData = loadAppData();
        if (!appData) return score;

        let factors = 0;
        
        // Check medication adherence
        if (appData.medications.length > 0) {
            const adherenceRate = calculateMedicationAdherence();
            score += (adherenceRate - 50) / 10; // Adjust score based on adherence
            factors++;
        }
        
        // Check appointment attendance
        if (appData.appointments.length > 0) {
            const attendanceRate = calculateAppointmentAttendance();
            score += (attendanceRate - 50) / 10;
            factors++;
        }
        
        // Check health metrics
        const healthMetrics = appData.healthMetrics;
        if (healthMetrics.bloodPressure.length > 0) {
            const lastBP = healthMetrics.bloodPressure[healthMetrics.bloodPressure.length - 1];
            if (lastBP.systolic < 120 && lastBP.diastolic < 80) score += 5;
            else if (lastBP.systolic > 140 || lastBP.diastolic > 90) score -= 5;
            factors++;
        }
        
        // Normalize score
        if (factors > 0) {
            score = Math.min(100, Math.max(0, score));
        }
        
        return Math.round(score);
    } catch (error) {
        console.error('Error calculating wellness score:', error);
        return score;
    }
}

// Appointment Management
async function addAppointment(appointmentData) {
    const appData = await loadAppData();
    const newAppointment = {
        id: Date.now(),
        ...appointmentData,
        status: 'upcoming'
    };
    
    appData.appointments = appData.appointments || [];
    appData.appointments.push(newAppointment);
    await saveAppData(appData);
    
    // Schedule reminders for the new appointment
    scheduleAppointmentReminders(newAppointment);
    
    updateAppointmentsUI();
}

function editAppointment(id, updatedData) {
    const appData = loadAppData();
    const index = appData.appointments.findIndex(apt => apt.id === id);
    
    if (index !== -1) {
        appData.appointments[index] = {
            ...appData.appointments[index],
            ...updatedData
        };
        saveAppData(appData);
        updateAppointmentsUI();
    }
}

async function deleteAppointment(id) {
    const user = firebase.auth().currentUser;
    if (!user) return;

    if (confirm('Are you sure you want to delete this appointment?')) {
        try {
            const doc = await db.collection('users').doc(user.uid).get();
            const userData = doc.data() || {};
            const appointments = userData.appointments || [];

            // Filter out the deleted appointment
            const updatedAppointments = appointments.filter(apt => apt.id !== id);

            // Update Firestore
            await db.collection('users').doc(user.uid).update({
                appointments: updatedAppointments
            });

            await updateAppointmentsUI(); // Refresh UI
        } catch (error) {
            console.error('Error deleting appointment:', error);
            alert('Failed to delete appointment. Please try again.');
        }
    }
}

async function updateAppointmentsUI() {
    const appointmentList = document.querySelector('.appointment-list');
    if (!appointmentList) return;

    const user = firebase.auth().currentUser;
    if (!user) return;

    try {
        const doc = await db.collection('users').doc(user.uid).get();
        const userData = doc.data() || {};
        const appointments = userData.appointments || [];

        // Filter upcoming appointments and sort by date
        const upcomingAppointments = appointments
            .filter(apt => apt.status === 'upcoming')
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (upcomingAppointments.length === 0) {
            appointmentList.innerHTML = '<p class="text-muted">No upcoming appointments</p>';
            return;
        }

        appointmentList.innerHTML = upcomingAppointments
            .map(apt => `
                <div class="appointment" data-id="${apt.id}">
                    <div class="appointment-info">
                        <h4>${apt.doctorName}</h4>
                        <p>${apt.specialty}</p>
                        <p><i data-lucide="calendar"></i> ${apt.date}</p>
                        <p><i data-lucide="clock"></i> ${apt.time}</p>
                        <p><i data-lucide="map-pin"></i> ${apt.location}</p>
                    </div>
                    <div class="appointment-actions">
                        <button class="btn-icon edit-appointment" onclick="editAppointment(${apt.id})">
                            <i data-lucide="edit-2"></i>
                        </button>
                        <button class="btn-icon delete delete-appointment" onclick="deleteAppointment(${apt.id})">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
            `)
            .join('');

        // Reinitialize icons
        lucide.createIcons();
    } catch (error) {
        console.error('Error updating appointments UI:', error);
    }
}

// Health Metrics Management
async function addHealthMetric(type, value, date = new Date()) {
    const appData = await loadAppData();
    appData.healthMetrics = appData.healthMetrics || {};
    appData.healthMetrics[type] = appData.healthMetrics[type] || [];
    
    const newMetric = {
        id: Date.now(),
        type,
        value,
        date: date.toISOString()
    };
    
    appData.healthMetrics[type].push(newMetric);
    await saveAppData(appData);
    updateHealthMetricsUI();
    calculateWellnessScore(); // Use calculateWellnessScore instead
}

function updateHealthMetricsUI() {
    const appData = loadAppData();
    const healthMetrics = appData.healthMetrics || {};
    
    // Update individual metric displays
    if (healthMetrics.bloodPressure && healthMetrics.bloodPressure.length > 0) {
        const latest = healthMetrics.bloodPressure[healthMetrics.bloodPressure.length - 1];
        const bpElement = document.querySelector('.metric:nth-child(2) .metric-value');
        if (bpElement) {
            bpElement.textContent = `${latest.value.systolic}/${latest.value.diastolic}`;
        }
    }

    if (healthMetrics.weight && healthMetrics.weight.length > 0) {
        const latest = healthMetrics.weight[healthMetrics.weight.length - 1];
        const weightElement = document.querySelector('.metric:nth-child(3) .metric-value');
        if (weightElement) {
            weightElement.textContent = `${latest.value} kg`;
        }
    }

    if (healthMetrics.temperature && healthMetrics.temperature.length > 0) {
        const latest = healthMetrics.temperature[healthMetrics.temperature.length - 1];
        const tempElement = document.querySelector('.metric:nth-child(4) .metric-value');
        if (tempElement) {
            tempElement.textContent = `${latest.value}°C`;
        }
    }

    // Update charts
    updateHealthCharts();
}

function updateHealthCharts() {
    const appData = loadAppData();
    const healthMetrics = appData.healthMetrics || {};
    
    // Update dashboard chart
    const dashboardChart = Chart.getChart('metricsChart');
    if (dashboardChart) {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        
        const labels = Array.from({length: 7}, (_, i) => {
            const date = new Date(lastWeek);
            date.setDate(date.getDate() + i);
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        });

        const datasets = [];
        
        if (healthMetrics.bloodPressure) {
            const bpData = getMetricDataForLastWeek(healthMetrics.bloodPressure, 'systolic');
            datasets.push({
                label: 'Blood Pressure',
                data: bpData,
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            });
        }

        if (healthMetrics.weight) {
            const weightData = getMetricDataForLastWeek(healthMetrics.weight);
            datasets.push({
                label: 'Weight',
                data: weightData,
                borderColor: '#F59E0B',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4,
                fill: true
            });
        }

        if (healthMetrics.temperature) {
            const tempData = getMetricDataForLastWeek(healthMetrics.temperature);
            datasets.push({
                label: 'Temperature',
                data: tempData,
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                fill: true
            });
        }

        dashboardChart.data.labels = labels;
        dashboardChart.data.datasets = datasets;
        dashboardChart.update();
    }

    // Update health page chart
    const healthChart = Chart.getChart('healthChart');
    if (healthChart) {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        
        const labels = Array.from({length: 7}, (_, i) => {
            const date = new Date(lastWeek);
            date.setDate(date.getDate() + i);
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        });

        const datasets = Object.entries(healthMetrics).map(([type, data]) => {
            const color = getMetricColor(type);
            return {
                label: getMetricLabel(type),
                data: getMetricDataForLastWeek(data),
                borderColor: color,
                backgroundColor: `${color}1A`,
                tension: 0.4,
                fill: true
            };
        });

        healthChart.data.labels = labels;
        healthChart.data.datasets = datasets;
        healthChart.update();
    }
}

function getMetricDataForLastWeek(metricData, valueKey = null) {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const dailyData = Array(7).fill(null);
    
    metricData.forEach(metric => {
        const date = new Date(metric.date);
        if (date >= lastWeek) {
            const dayIndex = Math.floor((date - lastWeek) / (1000 * 60 * 60 * 24));
            if (dayIndex >= 0 && dayIndex < 7) {
                dailyData[dayIndex] = valueKey ? metric.value[valueKey] : metric.value;
            }
        }
    });
    
    return dailyData;
}

function getMetricColor(type) {
    switch (type) {
        case 'bloodPressure': return '#3B82F6';
        case 'weight': return '#F59E0B';
        case 'temperature': return '#EF4444';
        default: return '#94A3B8';
    }
}

function getMetricLabel(type) {
    switch (type) {
        case 'bloodPressure': return 'Blood Pressure';
        case 'weight': return 'Weight';
        case 'temperature': return 'Temperature';
        default: return type;
    }
}

function formatMetricValue(type, value) {
    switch (type) {
        case 'bloodPressure':
            return `${value.systolic}/${value.diastolic}`;
        case 'glucose':
            return `${value} mg/dL`;
        case 'weight':
            return `${value} kg`;
        case 'temperature':
            return `${value}°C`;
        case 'heartRate':
            return `${value} bpm`;
        default:
            return value;
    }
}

// Initialize dashboard functionality
function initializeDashboard() {
    // Add appointment button
    const addAppointmentBtn = document.querySelector('.appointments .btn-icon');
    if (addAppointmentBtn) {
        addAppointmentBtn.addEventListener('click', () => {
            showAppointmentModal();
        });
    }

    // Initialize metrics tabs
    initializeMetricsTabs();
    
    // Update UI elements
    updateHealthMetricsUI();
    updateAppointmentsUI();
    
    // Initialize chart
    initializeChart();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Hide all pages except landing
    document.querySelectorAll('.page').forEach(page => {
        if (page.id !== 'landing-page') {
            page.classList.remove('active');
            page.style.display = 'none';
        }
    });

    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.dataset.page;
            navigateToPage(pageId);
        });
    });

    // Get Started button
    const getStartedBtn = document.querySelector('.hero .btn-primary');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            navigateToPage('dashboard');
        });
    }

    // Initialize modals
    initializeModals();

    // Load initial data
    const appData = loadAppData();
    
    // Force immediate load of medications data - ensure it's available right away
    updateMedicationsUI();
    
    // Initialize other UI elements
    updateAppointmentsUI();
    updateHealthMetricsUI();
    updateAdherenceRate();
    
    // Add click handlers for buttons
    const addAppointmentBtn = document.querySelector('.appointments .btn-icon');
    if (addAppointmentBtn) {
        addAppointmentBtn.addEventListener('click', () => {
            showModal('appointmentModal');
        });
    }

    const addHealthLogBtn = document.querySelector('.add-health-log');
    if (addHealthLogBtn) {
        addHealthLogBtn.addEventListener('click', () => {
            showModal('healthLogModal');
            updateMetricFields();
        });
    }

    // Initialize the dashboard if it's the active page
    if (document.getElementById('dashboard-page').classList.contains('active')) {
        initializeChart();
    }
    
    // Check if medications page is active and initialize if needed
    if (document.getElementById('medications-page').classList.contains('active')) {
        updateMedicationsUI();
        updateAdherenceRate();
    }
});

// Modal Management
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Reset form if exists
    const form = modal.querySelector('form');
    if (form) {
        form.reset();
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('active');
    document.body.style.overflow = '';

    // Reset form if exists
    const form = modal.querySelector('form');
    if (form) {
        form.reset();
    }
}

// Appointment Form Handling
async function handleAppointmentSubmit(e) {
    e.preventDefault();
    const user = firebase.auth().currentUser;
    if (!user) return;

    try {
        const appointmentData = {
            doctorName: document.getElementById('doctorName').value,
            specialty: document.getElementById('specialty').value,
            date: document.getElementById('appointmentDate').value,
            time: document.getElementById('appointmentTime').value,
            location: document.getElementById('location').value,
            status: 'upcoming',
            createdAt: new Date().toISOString(),
            userId: user.uid
        };

        // Get current appointments array
        const doc = await db.collection('users').doc(user.uid).get();
        const userData = doc.data() || {};
        const appointments = userData.appointments || [];
        
        // Add new appointment
        appointments.push({
            id: Date.now(),
            ...appointmentData
        });

        // Update Firestore
        await db.collection('users').doc(user.uid).update({
            appointments: appointments
        });

        hideModal('appointmentModal');
        await updateAppointmentsUI(); // Refresh UI
    } catch (error) {
        console.error('Error adding appointment:', error);
        alert('Failed to add appointment. Please try again.');
    }
}

// Health Log Form Handling
async function handleHealthLogSubmit(e) {
    e.preventDefault();
    
    const metricType = document.getElementById('metricType').value;
    const date = document.getElementById('metricDate').value;
    let value;

    switch (metricType) {
        case 'bloodPressure':
            value = {
                systolic: parseInt(document.getElementById('systolic').value),
                diastolic: parseInt(document.getElementById('diastolic').value)
            };
            break;
        case 'weight':
            value = parseFloat(document.getElementById('weightValue').value);
            break;
        case 'temperature':
            value = parseFloat(document.getElementById('temperatureValue').value);
            break;
    }

    await addHealthMetric(metricType, value, new Date(date));
    hideModal('healthLogModal');
    updateHealthMetricsUI();
}

function updateMetricFields() {
    const metricType = document.getElementById('metricType').value;
    const metricFields = document.getElementById('metricFields');
    
    let fieldsHTML = '';
    switch (metricType) {
        case 'bloodPressure':
            fieldsHTML = `
                <div class="bp-inputs">
                    <div class="form-group">
                        <label>Systolic (mmHg)</label>
                        <input type="number" id="systolic" required min="70" max="200">
                    </div>
                    <div class="form-group">
                        <label>Diastolic (mmHg)</label>
                        <input type="number" id="diastolic" required min="40" max="130">
                    </div>
                </div>
            `;
            break;
        case 'glucose':
            fieldsHTML = `
                <div class="form-group">
                    <label>Blood Glucose (mg/dL)</label>
                    <input type="number" id="glucoseValue" required min="20" max="600">
                </div>
            `;
            break;
        case 'weight':
            fieldsHTML = `
                <div class="form-group">
                    <label>Weight (kg)</label>
                    <input type="number" id="weightValue" required step="0.1" min="20" max="300">
                </div>
            `;
            break;
        case 'temperature':
            fieldsHTML = `
                <div class="form-group">
                    <label>Temperature (°C)</label>
                    <input type="number" id="temperatureValue" required step="0.1" min="35" max="42">
                </div>
            `;
            break;
        case 'heartRate':
            fieldsHTML = `
                <div class="form-group">
                    <label>Heart Rate (bpm)</label>
                    <input type="number" id="heartRateValue" required min="40" max="200">
                </div>
            `;
            break;
    }
    
    metricFields.innerHTML = fieldsHTML;
}

// Initialize modal functionality
function initializeModals() {
    // Close modal buttons
    document.querySelectorAll('.close-modal, .cancel-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            hideModal(modal.id);
        });
    });

    // Close on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });

    // Form submissions
    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', handleAppointmentSubmit);
    }

    const medicationForm = document.getElementById('medicationForm');
    if (medicationForm) {
        medicationForm.addEventListener('submit', handleMedicationSubmit);
    }

    const healthLogForm = document.getElementById('healthLogForm');
    if (healthLogForm) {
        healthLogForm.addEventListener('submit', handleHealthLogSubmit);
    }

    // Metric type change handler
    const metricTypeSelect = document.getElementById('metricType');
    if (metricTypeSelect) {
        metricTypeSelect.addEventListener('change', updateMetricFields);
        // Initialize fields for default metric type
        updateMetricFields();
    }
}

// Add to your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    // Initialize modals
    initializeModals();

    // Add click handler for add appointment button
    const addAppointmentBtn = document.querySelector('.appointments .btn-icon');
    if (addAppointmentBtn) {
        addAppointmentBtn.addEventListener('click', () => {
            showModal('appointmentModal');
        });
    }

    // Add click handler for add health log button
    const addHealthLogBtn = document.querySelector('.actions .btn-secondary:first-child');
    if (addHealthLogBtn) {
        addHealthLogBtn.addEventListener('click', () => {
            showModal('healthLogModal');
            updateMetricFields(); // Initialize fields for default metric type
        });
    }
});

// Add event listener for the "Add Reading" button
document.addEventListener('DOMContentLoaded', () => {
    // ... existing code ...

    // Add blood pressure reading button
    const addBPButton = document.querySelector('.add-bp');
    if (addBPButton) {
        addBPButton.addEventListener('click', () => {
            showModal('healthLogModal');
            const metricTypeSelect = document.getElementById('metricType');
            metricTypeSelect.value = 'bloodPressure';
            updateMetricFields();
        });
    }
});

// Medication Management - Fixed
async function addMedication(medicationData) {
    const appData = await loadAppData();
    const newMedication = {
        id: Date.now(),
        name: medicationData.name,
        dosage: medicationData.dosage,
        times: medicationData.times.map(t => t.trim()),
        instructions: medicationData.instructions,
        status: 'active',
        dateAdded: new Date().toISOString()
    };
    
    appData.medications.push(newMedication);
    await saveAppData(appData);
    
    // Schedule reminders for the new medication
    scheduleMedicationReminders(newMedication);
    
    updateMedicationsUI();
    updateAdherenceRate();
}

async function handleMedicationSubmit(e) {
    e.preventDefault();
    
    const user = firebase.auth().currentUser;
    if (!user) {
        alert('Please sign in to add medications');
        return;
    }

    try {
        const medicationData = {
            name: document.getElementById('medicationName').value,
            dosage: document.getElementById('dosage').value,
            times: document.getElementById('times').value.split(',').map(t => t.trim()),
            instructions: document.getElementById('instructions').value,
            status: 'active',
            dateAdded: new Date().toISOString()
        };

        // Get current medications array
        const doc = await db.collection('users').doc(user.uid).get();
        const userData = doc.data() || {};
        const medications = userData.medications || [];

        // Add new medication
        medications.push({
            id: Date.now(),
            ...medicationData
        });

        // Update Firestore
        await db.collection('users').doc(user.uid).update({
            medications: medications
        });

        // Close modal and refresh UI
        hideModal('medicationModal');
        await updateMedicationsUI();
    } catch (error) {
        console.error('Error adding medication:', error);
        alert('Failed to add medication. Please try again.');
    }
}

async function deleteMedication(id) {
    const user = firebase.auth().currentUser;
    if (!user) return;

    if (confirm('Are you sure you want to delete this medication?')) {
        try {
            const doc = await db.collection('users').doc(user.uid).get();
            const userData = doc.data() || {};
            const medications = userData.medications || [];

            // Filter out the deleted medication
            const updatedMedications = medications.filter(med => med.id !== id);

            // Update Firestore
            await db.collection('users').doc(user.uid).update({
                medications: updatedMedications
            });

            // Refresh UI
            await updateMedicationsUI();
        } catch (error) {
            console.error('Error deleting medication:', error);
            alert('Failed to delete medication. Please try again.');
        }
    }
}

function updateMedicationsUI() {
    const medicationList = document.querySelector('.medications-container');
    if (!medicationList) return;

    // Load from localStorage first
    const localData = JSON.parse(localStorage.getItem('healthAppData')) || {};
    let medications = localData.medications || [];

    // If signed in, merge with cloud data
    const user = firebase.auth().currentUser;
    if (user) {
        db.collection('users').doc(user.uid).get()
            .then(doc => {
                if (doc.exists) {
                    const cloudData = doc.data();
                    medications = [...medications, ...(cloudData.medications || [])];
                }
                renderMedications(medications);
            })
            .catch(error => {
                console.error('Error loading cloud medications:', error);
                renderMedications(medications);
            });
    } else {
        renderMedications(medications);
    }
}

// Helper function to render medications
function renderMedications(medications) {
    const medicationList = document.querySelector('.medications-container');
    if (!medicationList) return;

    if (medications.length === 0) {
        medicationList.innerHTML = '<p class="text-muted">No medications added yet.</p>';
        return;
    }

    medicationList.innerHTML = medications
        .map(med => `
            <div class="medication" data-id="${med.id}">
                <div class="medication-info">
                    <h4>${med.name || ''}</h4>
                    <p class="dosage">${med.dosage || ''}</p>
                    <div class="schedule">
                        ${Array.isArray(med.times) ? med.times.map(time => `<span class="time">${time}</span>`).join('') : ''}
                    </div>
                    <p class="instructions">${med.instructions || ''}</p>
                </div>
                <div class="medication-actions">
                    <button class="btn-icon delete delete-medication" onclick="deleteMedication(${med.id})">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `)
        .join('');

    lucide.createIcons();
    updateAdherenceRate(medications);
}

// Reset medications
function resetMedications() {
    if (confirm('Are you sure you want to reset all medications? This cannot be undone.')) {
        const appData = JSON.parse(localStorage.getItem('healthAppData')) || {};
        appData.medications = [];
        localStorage.setItem('healthAppData', JSON.stringify(appData));
        updateMedicationsUI();
        updateAdherenceRate();
    }
}

// Calculate adherence rate based on medication logs
function updateAdherenceRate() {
    const appData = JSON.parse(localStorage.getItem('healthAppData')) || {};
    const medications = appData.medications || [];
    
    // Calculate adherence based on medication times
    let totalTimes = 0;
    let takenTimes = 0;
    
    medications.forEach(med => {
        if (med.times) {
            totalTimes += med.times.length;
            if (med.status === 'active') {
                takenTimes += med.times.length;
            }
        }
    });
    
    const adherenceRate = totalTimes > 0 ? (takenTimes / totalTimes) * 100 : 0;
    
    // Update UI
    const rateElement = document.querySelector('.adherence-rate .rate');
    const progressBar = document.querySelector('.adherence .progress');
    
    if (rateElement) rateElement.textContent = `${adherenceRate.toFixed(1)}%`;
    if (progressBar) progressBar.style.width = `${adherenceRate}%`;
    
    // Update weekly tracker
    updateWeeklyTracker(medications);
}

function updateWeeklyTracker(medications) {
    const days = document.querySelectorAll('.days .day');
    const today = new Date();
    
    days.forEach((day, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        
        // Check if any medication was taken on this date
        const takenOnDate = medications.some(med => {
            return med.status === 'active' && 
                   new Date(med.dateAdded).toDateString() === date.toDateString();
        });
        
        day.classList.toggle('taken', takenOnDate);
    });
}

// Initialize medication functionality
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing medication functionality');
    
    // Add medication button
    const addMedicationBtn = document.querySelector('.quick-actions .btn-primary');
    if (addMedicationBtn) {
        addMedicationBtn.addEventListener('click', () => {
            console.log('Add medication button clicked');
            showModal('medicationModal');
        });
    }

    // Reset medications button
    const resetMedicationsBtn = document.querySelector('.reset-medications');
    if (resetMedicationsBtn) {
        resetMedicationsBtn.addEventListener('click', resetMedications);
    }

    // Medication form
    const medicationForm = document.getElementById('medicationForm');
    if (medicationForm) {
        // Remove any existing event listeners
        const newForm = medicationForm.cloneNode(true);
        medicationForm.parentNode.replaceChild(newForm, medicationForm);
        newForm.addEventListener('submit', handleMedicationSubmit);
    }

    // Initialize medications list and adherence rate
    updateMedicationsUI();
    updateAdherenceRate();
});

// Notification System
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
    }

    let permission = await Notification.requestPermission();
    return permission === 'granted';
}

function scheduleNotification(title, options, timestamp) {
    const delay = timestamp - Date.now();
    if (delay < 0) return; // Don't schedule past notifications

    setTimeout(() => {
        showNotification(title, options);
    }, delay);
}

function showNotification(title, options) {
    if (Notification.permission === 'granted') {
        new Notification(title, options);
    }
}

function scheduleMedicationReminders(medication) {
    if (!medication.times || !Array.isArray(medication.times)) return;

    const appData = loadAppData();
    if (!appData.settings.medicationNotifications) return;

    medication.times.forEach(timeStr => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const now = new Date();
        const scheduleTime = new Date(now);
        scheduleTime.setHours(hours, minutes, 0, 0);

        // If time has passed for today, schedule for tomorrow
        if (scheduleTime < now) {
            scheduleTime.setDate(scheduleTime.getDate() + 1);
        }

        scheduleNotification(
            'Medication Reminder',
            {
                body: `Time to take ${medication.name} - ${medication.dosage}\n${medication.instructions}`,
                icon: '/icon.png',
                tag: `medication-${medication.id}-${scheduleTime.getTime()}`
            },
            scheduleTime.getTime()
        );
    });
}

function scheduleAppointmentReminders(appointment) {
    const appData = loadAppData();
    if (!appData.settings.appointmentReminders) return;

    const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
    const oneDayBefore = new Date(appointmentDate);
    oneDayBefore.setDate(oneDayBefore.getDate() - 1);
    oneDayBefore.setHours(9, 0, 0, 0); // 9 AM the day before

    // One day before reminder
    scheduleNotification(
        'Appointment Tomorrow',
        {
            body: `You have an appointment with ${appointment.doctorName} tomorrow at ${appointment.time}`,
            icon: '/icon.png',
            tag: `appointment-${appointment.id}-dayBefore`
        },
        oneDayBefore.getTime()
    );

    // One hour before reminder
    const oneHourBefore = new Date(appointmentDate);
    oneHourBefore.setHours(oneHourBefore.getHours() - 1);

    scheduleNotification(
        'Upcoming Appointment',
        {
            body: `Your appointment with ${appointment.doctorName} is in 1 hour at ${appointment.location}`,
            icon: '/icon.png',
            tag: `appointment-${appointment.id}-hourBefore`
        },
        oneHourBefore.getTime()
    );
}

// Update addMedication function
async function addMedication(medicationData) {
    const appData = await loadAppData();
    const newMedication = {
        id: Date.now(),
        name: medicationData.name,
        dosage: medicationData.dosage,
        times: medicationData.times.map(t => t.trim()),
        instructions: medicationData.instructions,
        status: 'active',
        dateAdded: new Date().toISOString()
    };
    
    appData.medications.push(newMedication);
    await saveAppData(appData);
    
    // Schedule reminders for the new medication
    scheduleMedicationReminders(newMedication);
    
    updateMedicationsUI();
    updateAdherenceRate();
}

// Update addAppointment function
async function addAppointment(appointmentData) {
    const appData = await loadAppData();
    const newAppointment = {
        id: Date.now(),
        ...appointmentData,
        status: 'upcoming'
    };
    
    appData.appointments = appData.appointments || [];
    appData.appointments.push(newAppointment);
    await saveAppData(appData);
    
    // Schedule reminders for the new appointment
    scheduleAppointmentReminders(newAppointment);
    
    updateAppointmentsUI();
}

// Initialize notification system
async function initializeNotifications() {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
        console.log('Notification permission not granted');
        return;
    }

    const appData = loadAppData();
    
    // Schedule reminders for all active medications
    if (appData.medications) {
        appData.medications.forEach(med => {
            if (med.status === 'active') {
                scheduleMedicationReminders(med);
            }
        });
    }
    
    // Schedule reminders for all upcoming appointments
    if (appData.appointments) {
        appData.appointments.forEach(apt => {
            if (apt.status === 'upcoming') {
                scheduleAppointmentReminders(apt);
            }
        });
    }
}

// Add to your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    // ... existing initialization code ...

    // Initialize notifications
    initializeNotifications();
});

// Add this function to initialize sample data
function initializeSampleData() {
    // Generate dates for the last 30 days
    const dates = Array.from({length: 30}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString();
    });

    // Generate realistic blood pressure trend (showing controlled hypertension)
    const generateBPTrend = () => {
        return dates.map((date, i) => ({
            date: date,
            value: {
                systolic: Math.round(138 - (i * 0.6) + Math.sin(i * 0.5) * 3), // Trending down from 138 to 120
                diastolic: Math.round(88 - (i * 0.4) + Math.sin(i * 0.5) * 2)  // Trending down from 88 to 76
            }
        }));
    };

    // Generate realistic glucose trend (showing improved control)
    const generateGlucoseTrend = () => {
        return dates.map((date, i) => ({
            date: date,
            value: Math.round(142 - (i * 1.4) + Math.sin(i * 0.3) * 5) // Trending down from 142 to 100
        }));
    };

    // Generate realistic weight trend (showing weight loss progress)
    const generateWeightTrend = () => {
        return dates.map((date, i) => ({
            date: date,
            value: Number((78.5 - (i * 0.123)).toFixed(1)) // Gradual weight loss from 78.5 to 74.8
        }));
    };

    const appData = {
        medications: [
            {
                id: 1,
                name: "Lisinopril",
                dosage: "10mg",
                times: ["09:00", "21:00"],
                instructions: "Take with water, before meals",
                status: "active",
                adherence: 0.95,
                dateAdded: dates[0]
            },
            {
                id: 2,
                name: "Metformin",
                dosage: "500mg",
                times: ["08:00", "14:00", "20:00"],
                instructions: "Take with food",
                status: "active",
                adherence: 0.92,
                dateAdded: dates[1]
            },
            {
                id: 3,
                name: "Vitamin D3",
                dosage: "2000 IU",
                times: ["10:00"],
                instructions: "Take with breakfast",
                status: "active",
                adherence: 0.98,
                dateAdded: dates[2]
            },
            {
                id: 4,
                name: "Aspirin",
                dosage: "81mg",
                times: ["08:00"],
                instructions: "Take with breakfast",
                status: "active",
                adherence: 0.97,
                dateAdded: dates[3]
            }
        ],
        healthMetrics: {
            bloodPressure: generateBPTrend(),
            glucose: generateGlucoseTrend(),
            weight: generateWeightTrend(),
            temperature: dates.map((date, i) => ({
                date: date,
                value: Number((36.6 + Math.sin(i * 0.2) * 0.2).toFixed(1))
            }))
        },
        appointments: [
            {
                id: 1,
                doctorName: "Dr. Sarah Johnson",
                specialty: "Cardiologist",
                date: "2024-01-15",
                time: "10:00",
                location: "Heart Care Center",
                status: "completed",
                notes: "Blood pressure improving. Continue current medication."
            },
            {
                id: 2,
                doctorName: "Dr. Michael Chen",
                specialty: "General Physician",
                date: "2024-02-01",
                time: "14:30",
                location: "Medical Plaza",
                status: "completed",
                notes: "General health improving. Weight loss progressing well."
            },
            {
                id: 3,
                doctorName: "Dr. Emily Rodriguez",
                specialty: "Endocrinologist",
                date: "2024-03-15",
                time: "11:15",
                location: "Diabetes Care Clinic",
                status: "upcoming",
                notes: "Follow-up on glucose levels"
            },
            {
                id: 4,
                doctorName: "Dr. James Wilson",
                specialty: "Nutritionist",
                date: "2024-03-20",
                time: "15:45",
                location: "Wellness Center",
                status: "upcoming",
                notes: "Diet plan review"
            }
        ],
        healthLogs: dates.map((date, i) => ({
            date: date,
            type: "BMI",
            value: Number((26.8 - (i * 0.087)).toFixed(1)), // Trending down from 26.8 to 24.2
            category: i < 15 ? "Overweight" : "Normal",
            measurements: {
                height: 175,
                weight: Number((78.5 - (i * 0.123)).toFixed(1)),
                unit: "metric"
            }
        })),
        settings: {
            notifications: true,
            medicationNotifications: true,
            healthAlerts: true,
            appointmentReminders: true,
            darkMode: true,
            units: "metric"
        }
    };

    // Generate realistic adherence history (showing improvement over time)
    const adherenceHistory = dates.map((date, i) => ({
        date: date,
        adherence: Math.min(100, 75 + (i * 0.8) + Math.sin(i * 0.3) * 3) // Trending up from 75% to 95%
    }));
    appData.adherenceHistory = adherenceHistory;

    // Add medication logs for the past 30 days
    appData.medicationLogs = dates.flatMap(date => 
        appData.medications.map(med => ({
            medicationId: med.id,
            date: date,
            scheduled: med.times,
            taken: med.times.filter(() => Math.random() < med.adherence),
            status: 'completed'
        }))
    );

    // Calculate and store wellness score history
    appData.wellnessHistory = dates.map((date, i) => ({
        date: date,
        score: Math.round(70 + (i * 0.5) + Math.sin(i * 0.3) * 2) // Trending up from 70 to 85
    }));

    localStorage.setItem('healthAppData', JSON.stringify(appData));
    return appData;
}

// Update loadAppData function to initialize sample data if no data exists
async function loadAppData() {
    // Always load local data first
    const localData = JSON.parse(localStorage.getItem('healthAppData')) || initializeSampleData();
    
    // If user is signed in, try to merge with cloud data
    const user = firebase.auth().currentUser;
    if (user) {
        try {
            const doc = await db.collection('users').doc(user.uid).get();
            if (doc.exists) {
                const cloudData = doc.data();
                // Merge cloud data with local data, preferring cloud data
                return { ...localData, ...cloudData };
            }
        } catch (error) {
            console.error('Error loading cloud data:', error);
        }
    }
    
    return localData;
}

// Add to your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    // Initialize sample data if needed
    const appData = loadAppData();
    
    // Update UI elements
    updateMedicationsUI();
    updateHealthMetricsUI();
    updateAppointmentsUI();
    updateAdherenceRate();
    calculateWellnessScore();
    
    // Initialize charts
    if (document.getElementById('dashboard-page').classList.contains('active')) {
        initializeChart();
    }
    
    // Initialize other functionality
    initializeModals();
    initializeSettings();
    initializeNotifications();
    
    // ... rest of your initialization code ...
});

// Add auth state observer
firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        console.log('User is signed in:', user.email);
        await initializeUI(); // Load user's data when they sign in
    } else {
        console.log('User is signed out');
        // Clear UI or show guest view
    }
});

// Add this near the top of the file
async function initializeUI() {
    try {
        const appData = await loadAppData();
        updateMedicationsUI();
        updateHealthMetricsUI();
        updateAppointmentsUI();
        updateAdherenceRate();
        calculateWellnessScore();
        
        // Initialize charts
        if (document.getElementById('dashboard-page').classList.contains('active')) {
            initializeChart();
        }
    } catch (error) {
        console.error('Error initializing UI:', error);
    }
}

// Update loadAppData function
async function loadAppData() {
    // Always load local data first
    const localData = JSON.parse(localStorage.getItem('healthAppData')) || initializeSampleData();
    
    // If user is signed in, try to merge with cloud data
    const user = firebase.auth().currentUser;
    if (user) {
        try {
            const doc = await db.collection('users').doc(user.uid).get();
            if (doc.exists) {
                const cloudData = doc.data();
                // Merge cloud data with local data, preferring cloud data
                return { ...localData, ...cloudData };
            }
        } catch (error) {
            console.error('Error loading cloud data:', error);
        }
    }
    
    return localData;
}

// Update saveAppData function
async function saveAppData(data) {
    // Always save to localStorage
    localStorage.setItem('healthAppData', JSON.stringify(data));
    
    // If user is signed in, also save to cloud
    const user = firebase.auth().currentUser;
    if (user) {
        try {
            await db.collection('users').doc(user.uid).set({
                ...data,
                lastUpdated: new Date()
            }, { merge: true });
        } catch (error) {
            console.error('Error saving to cloud:', error);
        }
    }
}

// Update calculateWellnessScore function
function calculateWellnessScore() {
    let score = 85; // Base score
    
    try {
        const appData = loadAppData();
        if (!appData) return score;

        let factors = 0;
        
        // Rest of your existing calculateWellnessScore code...
    } catch (error) {
        console.error('Error calculating wellness score:', error);
        return score;
    }
}

// Add auth state observer
document.addEventListener('DOMContentLoaded', () => {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            console.log('User is signed in:', user.email);
            await initializeUI();
        } else {
            console.log('User is signed out');
            // Show landing page or login prompt
            navigateToPage('landing');
        }
    });
});

// Add real-time data listener
function initializeRealtimeUpdates() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    // Listen for document changes
    db.collection('users').doc(user.uid)
        .onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                updateUIWithData(data);
            }
        }, (error) => {
            console.error("Error listening to updates:", error);
        });
}

// Update UI with data
function updateUIWithData(data) {
    // Update medications
    if (data.medications) {
        const medicationContainer = document.querySelector('.medications-container');
        if (medicationContainer) {
            medicationContainer.innerHTML = data.medications.map(med => `
                <div class="medication" data-id="${med.id}">
                    <div class="medication-info">
                        <h4>${med.name}</h4>
                        <p class="dosage">${med.dosage}</p>
                        <div class="schedule">
                            ${med.times.map(time => `<span class="time">${time}</span>`).join('')}
                        </div>
                        <p class="instructions">${med.instructions}</p>
                    </div>
                    <div class="medication-actions">
                        <button class="btn-icon delete delete-medication">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
            `).join('');
            lucide.createIcons();
            attachMedicationEventListeners();
        }
    }

    // Update appointments
    if (data.appointments) {
        const appointmentList = document.querySelector('.appointment-list');
        if (appointmentList) {
            appointmentList.innerHTML = data.appointments
                .filter(apt => apt.status === 'upcoming')
                .map(apt => `
                    <div class="appointment" data-id="${apt.id}">
                        <div class="appointment-info">
                            <h4>${apt.doctorName}</h4>
                            <p>${apt.specialty}</p>
                            <p><i data-lucide="calendar"></i> ${apt.date}</p>
                            <p><i data-lucide="clock"></i> ${apt.time}</p>
                            <p><i data-lucide="map-pin"></i> ${apt.location}</p>
                        </div>
                        <div class="appointment-actions">
                            <button class="btn-icon edit-appointment">
                                <i data-lucide="edit-2"></i>
                            </button>
                            <button class="btn-icon delete delete-appointment">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            lucide.createIcons();
            attachAppointmentEventListeners();
        }
    }

    // Update health metrics
    if (data.healthMetrics) {
        updateHealthMetricsDisplay(data.healthMetrics);
    }
}

// Modify initializeUI function
async function initializeUI() {
    try {
        const user = firebase.auth().currentUser;
        if (!user) return;

        // Initialize real-time updates
        initializeRealtimeUpdates();

        // Initial data load
        const doc = await db.collection('users').doc(user.uid).get();
        if (doc.exists) {
            updateUIWithData(doc.data());
        }

        // Initialize charts
        if (document.getElementById('dashboard-page').classList.contains('active')) {
            initializeChart();
        }
    } catch (error) {
        console.error('Error initializing UI:', error);
    }
}

// Update the addMedication function
async function addMedication(medicationData) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            console.error('No user signed in');
            return;
        }

        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data() || {};
        const medications = userData.medications || [];

        const newMedication = {
            id: Date.now(),
            ...medicationData,
            status: 'active',
            dateAdded: new Date().toISOString()
        };

        medications.push(newMedication);

        await db.collection('users').doc(user.uid).update({
            medications: medications
        });

        // UI will be updated automatically through the realtime listener
        hideModal('medicationModal');
    } catch (error) {
        console.error('Error adding medication:', error);
        alert('Failed to add medication. Please try again.');
    }
}

// Similar updates for addAppointment and addHealthMetric functions
// ... rest of your existing code ...

// Add these functions for appointment management
async function handleAppointmentSubmit(e) {
    e.preventDefault();
    const user = firebase.auth().currentUser;
    if (!user) return;

    try {
        const appointmentData = {
            doctorName: document.getElementById('doctorName').value,
            specialty: document.getElementById('specialty').value,
            date: document.getElementById('appointmentDate').value,
            time: document.getElementById('appointmentTime').value,
            location: document.getElementById('location').value,
            status: 'upcoming',
            createdAt: new Date().toISOString(),
            userId: user.uid
        };

        // Get current appointments array
        const doc = await db.collection('users').doc(user.uid).get();
        const userData = doc.data() || {};
        const appointments = userData.appointments || [];
        
        // Add new appointment
        appointments.push({
            id: Date.now(),
            ...appointmentData
        });

        // Update Firestore
        await db.collection('users').doc(user.uid).update({
            appointments: appointments
        });

        hideModal('appointmentModal');
        await updateAppointmentsUI(); // Refresh UI
    } catch (error) {
        console.error('Error adding appointment:', error);
        alert('Failed to add appointment. Please try again.');
    }
}

// Update the appointments UI function
async function updateAppointmentsUI() {
    const appointmentList = document.querySelector('.appointment-list');
    if (!appointmentList) return;

    const user = firebase.auth().currentUser;
    if (!user) return;

    try {
        const doc = await db.collection('users').doc(user.uid).get();
        const userData = doc.data() || {};
        const appointments = userData.appointments || [];

        // Filter upcoming appointments and sort by date
        const upcomingAppointments = appointments
            .filter(apt => apt.status === 'upcoming')
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (upcomingAppointments.length === 0) {
            appointmentList.innerHTML = '<p class="text-muted">No upcoming appointments</p>';
            return;
        }

        appointmentList.innerHTML = upcomingAppointments
            .map(apt => `
                <div class="appointment" data-id="${apt.id}">
                    <div class="appointment-info">
                        <h4>${apt.doctorName}</h4>
                        <p>${apt.specialty}</p>
                        <p><i data-lucide="calendar"></i> ${apt.date}</p>
                        <p><i data-lucide="clock"></i> ${apt.time}</p>
                        <p><i data-lucide="map-pin"></i> ${apt.location}</p>
                    </div>
                    <div class="appointment-actions">
                        <button class="btn-icon edit-appointment" onclick="editAppointment(${apt.id})">
                            <i data-lucide="edit-2"></i>
                        </button>
                        <button class="btn-icon delete delete-appointment" onclick="deleteAppointment(${apt.id})">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
            `)
            .join('');

        // Reinitialize icons
        lucide.createIcons();
    } catch (error) {
        console.error('Error updating appointments UI:', error);
    }
}

// Update delete appointment function
async function deleteAppointment(id) {
    const user = firebase.auth().currentUser;
    if (!user) return;

    if (confirm('Are you sure you want to delete this appointment?')) {
        try {
            const doc = await db.collection('users').doc(user.uid).get();
            const userData = doc.data() || {};
            const appointments = userData.appointments || [];

            // Filter out the deleted appointment
            const updatedAppointments = appointments.filter(apt => apt.id !== id);

            // Update Firestore
            await db.collection('users').doc(user.uid).update({
                appointments: updatedAppointments
            });

            await updateAppointmentsUI(); // Refresh UI
        } catch (error) {
            console.error('Error deleting appointment:', error);
            alert('Failed to delete appointment. Please try again.');
        }
    }
}

// Add real-time listener for appointments
function initializeAppointmentsListener() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    // Listen for changes to the user's document
    db.collection('users').doc(user.uid)
        .onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                if (data.appointments) {
                    updateAppointmentsUI();
                }
            }
        }, (error) => {
            console.error("Error listening to appointment updates:", error);
        });
}

// Update initialization
async function initializeUI() {
    try {
        const user = firebase.auth().currentUser;
        if (!user) return;

        // Initialize real-time updates for appointments
        initializeAppointmentsListener();

        // Initial load of appointments
        await updateAppointmentsUI();

        // Initialize other UI elements...
        // ...existing initialization code...
    } catch (error) {
        console.error('Error initializing UI:', error);
    }
}

// Keep BMI calculator using local storage
function handleBMICalculation(e) {
    // ...existing BMI calculation code...
    // This can stay the same as it uses local storage
}

// Update the event listeners
document.addEventListener('DOMContentLoaded', () => {
    // ...existing code...

    // Update appointment form listener
    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', handleAppointmentSubmit);
    }

    // Add appointment button
    const addAppointmentBtn = document.querySelector('.appointments .btn-icon');
    if (addAppointmentBtn) {
        addAppointmentBtn.addEventListener('click', () => {
            showModal('appointmentModal');
        });
    }
});

// BMI Calculator initialization - Specific fix for redirect issue
document.addEventListener('DOMContentLoaded', () => {
    // Find the BMI form
    const bmiForm = document.getElementById('bmiForm');
    
    // Remove any existing event listeners and attach a new one
    if (bmiForm) {
        // Create a new cloned form element to remove any existing event listeners
        const newForm = bmiForm.cloneNode(true);
        bmiForm.parentNode.replaceChild(newForm, bmiForm);
        
        // Add our event listener with strong prevention of default behavior
        newForm.addEventListener('submit', function(e) {
            // First immediately prevent default behavior
            e.preventDefault();
            e.stopPropagation();
            
            // Get form values
            const height = parseFloat(document.getElementById('height').value);
            const weight = parseFloat(document.getElementById('weight').value);
            
            // Validate input
            if (!height || !weight) {
                alert('Please enter both height and weight');
                return;
            }
            
            // Get the current unit system
            const appData = loadAppData();
            const unit = appData.settings?.units || 'metric';
            
            // Calculate BMI
            const bmi = calculateBMI(height, weight, unit);
            const { category, color } = getBMICategory(bmi);
            
            // Update UI
            const resultElement = document.querySelector('.bmi-result');
            if (resultElement) {
                resultElement.innerHTML = `
                    <div class="result-value" style="color: ${color}">
                        ${bmi.toFixed(1)}
                    </div>
                    <div class="result-category" style="color: ${color}">
                        ${category}
                    </div>
                    <div class="result-explanation">
                        Your BMI indicates that you are in the ${category.toLowerCase()} range.
                    </div>
                `;
                resultElement.style.display = 'block';
            }
            
            // Save to local storage
            const healthLogs = appData.healthLogs || [];
            
            healthLogs.push({
                date: new Date().toISOString(),
                type: 'BMI',
                value: parseFloat(bmi.toFixed(1)),
                category: category,
                measurements: { height, weight }
            });
            
            appData.healthLogs = healthLogs;
            localStorage.setItem('healthAppData', JSON.stringify(appData));
            
            // Update BMI metric display
            const bmiMetric = document.querySelector('.metric-bmi .metric-value');
            if (bmiMetric) {
                bmiMetric.textContent = bmi.toFixed(1);
            }
            
            // Return false to be extra safe
            return false;
        });
        
        console.log("BMI calculator initialized with redirect prevention");
    }
});

// Add these notification functions at the end of the file

// Notification System
let notifications = [];
const notificationTypes = {
    MEDICATION: 'medication',
    HEALTH: 'health',
    APPOINTMENT: 'appointment'
};

// Initialize notification system
function initializeNotifications() {
    // Load existing notifications from localStorage
    loadNotifications();
    
    // Setup notification toggle button
    const notificationToggleBtn = document.getElementById('notification-toggle');
    const closeNotificationsBtn = document.getElementById('close-notifications');
    const notificationCenter = document.getElementById('notification-center');
    
    if (notificationToggleBtn) {
        notificationToggleBtn.addEventListener('click', () => {
            notificationCenter.classList.toggle('active');
            updateNotificationBadge(0); // Clear badge when opening notifications
        });
    }
    
    if (closeNotificationsBtn) {
        closeNotificationsBtn.addEventListener('click', () => {
            notificationCenter.classList.remove('active');
        });
    }
    
    // Generate sample notifications for demo
    generateSampleNotifications();
    
    // Schedule notification checks
    setInterval(checkForDueNotifications, 60000); // Check every minute
}

// Load notifications from localStorage
function loadNotifications() {
    try {
        const savedNotifications = localStorage.getItem('healthAppNotifications');
        if (savedNotifications) {
            notifications = JSON.parse(savedNotifications);
            renderNotifications();
            updateNotificationBadge();
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

// Save notifications to localStorage
function saveNotifications() {
    try {
        localStorage.setItem('healthAppNotifications', JSON.stringify(notifications));
    } catch (error) {
        console.error('Error saving notifications:', error);
    }
}

// Add a new notification
function addNotification(type, title, message, time = new Date(), actions = [], id = Date.now()) {
    const notification = {
        id,
        type,
        title,
        message,
        time: time instanceof Date ? time.toISOString() : time,
        read: false,
        actions
    };
    
    notifications.unshift(notification); // Add to the beginning
    
    // Limit to 20 notifications to prevent storage issues
    if (notifications.length > 20) {
        notifications = notifications.slice(0, 20);
    }
    
    saveNotifications();
    renderNotifications();
    updateNotificationBadge();
    
    // Show a system notification if supported
    showSystemNotification(title, message);
    
    return notification;
}

// Mark a notification as read
function markNotificationAsRead(id) {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
        notification.read = true;
        saveNotifications();
        renderNotifications();
        updateNotificationBadge();
    }
}

// Delete a notification
function deleteNotification(id) {
    notifications = notifications.filter(n => n.id !== id);
    saveNotifications();
    renderNotifications();
    updateNotificationBadge();
}

// Render notifications in the notification center
function renderNotifications() {
    const notificationList = document.querySelector('.notification-list');
    if (!notificationList) return;
    
    if (notifications.length === 0) {
        notificationList.innerHTML = '<div class="notification-empty">No notifications</div>';
        return;
    }
    
    notificationList.innerHTML = notifications
        .map(notification => {
            const date = new Date(notification.time);
            const timeFormatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateFormatted = date.toLocaleDateString();
            
            const actionsHtml = notification.actions.length > 0 
                ? `<div class="actions">${notification.actions.map(action => 
                    `<button class="btn btn-sm" data-action="${action.action}" data-id="${notification.id}">${action.label}</button>`
                  ).join('')}</div>` 
                : '';
            
            return `
                <div class="notification-item ${notification.type} ${notification.read ? 'read' : ''}" data-id="${notification.id}">
                    <div class="title">${notification.title}</div>
                    <div class="message">${notification.message}</div>
                    <div class="time">${timeFormatted} - ${dateFormatted}</div>
                    ${actionsHtml}
                    <button class="btn-icon delete-notification" data-id="${notification.id}">
                        <i data-lucide="trash-2" width="16" height="16"></i>
                    </button>
                </div>
            `;
        })
        .join('');
    
    // Add event listeners for notification actions
    document.querySelectorAll('.notification-item').forEach(item => {
        // Mark as read on click
        item.addEventListener('click', () => {
            markNotificationAsRead(parseInt(item.dataset.id));
        });
    });
    
    // Delete notification buttons
    document.querySelectorAll('.delete-notification').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering the parent click
            deleteNotification(parseInt(btn.dataset.id));
        });
    });
    
    // Action buttons
    document.querySelectorAll('.notification-item .actions button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering the parent click
            const action = btn.dataset.action;
            const id = parseInt(btn.dataset.id);
            handleNotificationAction(id, action);
        });
    });
    
    // Re-initialize Lucide icons
    lucide.createIcons();
}

// Update the notification badge
function updateNotificationBadge(count) {
    const badge = document.querySelector('.notification-badge');
    if (!badge) return;
    
    const unreadCount = count !== undefined ? count : notifications.filter(n => !n.read).length;
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// Show a system notification if supported
function showSystemNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
            icon: '/favicon.ico'
        });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(title, {
                    body: message,
                    icon: '/favicon.ico'
                });
            }
        });
    }
}

// Handle notification action buttons
function handleNotificationAction(id, action) {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;
    
    switch (action) {
        case 'take-medication':
            // Mark medication as taken
            markNotificationAsRead(id);
            alert(`Marked ${notification.title} as taken`);
            break;
            
        case 'view-appointment':
            // Navigate to appointments page
            markNotificationAsRead(id);
            navigateToPage('dashboard');
            break;
            
        case 'view-health':
            // Navigate to health page
            markNotificationAsRead(id);
            navigateToPage('health');
            break;
            
        case 'dismiss':
            // Just mark as read
            markNotificationAsRead(id);
            break;
    }
}

// Generate medication reminder notification
function createMedicationReminder(medicationName, dosage, time) {
    const now = new Date();
    const reminderTime = time || now;
    
    return addNotification(
        notificationTypes.MEDICATION,
        'Medication Reminder',
        `Time to take ${medicationName} - ${dosage}`,
        reminderTime,
        [
            { label: 'Take Now', action: 'take-medication' },
            { label: 'Dismiss', action: 'dismiss' }
        ]
    );
}

// Generate health alert notification
function createHealthAlert(metricType, value, threshold, alertType = 'high') {
    const now = new Date();
    
    let message = '';
    switch (metricType) {
        case 'bloodPressure':
            message = `Your blood pressure reading of ${value} is ${alertType} than recommended. Please check with your doctor.`;
            break;
        case 'glucose':
            message = `Your glucose reading of ${value} mg/dL is ${alertType} than the normal range. Monitor closely.`;
            break;
        case 'weight':
            message = `Your weight has changed by ${Math.abs(value)} kg. This is a ${alertType} fluctuation.`;
            break;
        case 'temperature':
            message = `Your temperature of ${value}°C is ${alertType === 'high' ? 'elevated' : 'low'}. Monitor for other symptoms.`;
            break;
        default:
            message = `Your ${metricType} reading is outside the normal range.`;
    }
    
    return addNotification(
        notificationTypes.HEALTH,
        `Health Alert: ${metricType.charAt(0).toUpperCase() + metricType.slice(1)}`,
        message,
        now,
        [
            { label: 'View Details', action: 'view-health' },
            { label: 'Dismiss', action: 'dismiss' }
        ]
    );
}

// Generate appointment reminder notification
function createAppointmentReminder(doctorName, speciality, date, time, location) {
    const appointmentDate = new Date(`${date}T${time}`);
    const now = new Date();
    
    // Calculate days until appointment
    const daysUntil = Math.ceil((appointmentDate - now) / (1000 * 60 * 60 * 24));
    let message = '';
    
    if (daysUntil > 1) {
        message = `You have an appointment with Dr. ${doctorName} (${speciality}) in ${daysUntil} days on ${new Date(date).toLocaleDateString()} at ${time}.`;
    } else if (daysUntil === 1) {
        message = `You have an appointment with Dr. ${doctorName} (${speciality}) tomorrow at ${time}.`;
    } else {
        const hoursUntil = Math.ceil((appointmentDate - now) / (1000 * 60 * 60));
        if (hoursUntil > 1) {
            message = `You have an appointment with Dr. ${doctorName} (${speciality}) in ${hoursUntil} hours at ${location}.`;
        } else {
            message = `You have an appointment with Dr. ${doctorName} (${speciality}) in less than an hour at ${location}.`;
        }
    }
    
    return addNotification(
        notificationTypes.APPOINTMENT,
        'Appointment Reminder',
        message,
        now,
        [
            { label: 'View Details', action: 'view-appointment' },
            { label: 'Dismiss', action: 'dismiss' }
        ]
    );
}

// Generate sample notifications for demo
function generateSampleNotifications() {
    // Only generate sample notifications if we don't have any yet
    if (notifications.length === 0) {
        // Medication reminders
        createMedicationReminder('Lisinopril', '10mg');
        
        setTimeout(() => {
            createMedicationReminder('Metformin', '500mg');
        }, 500);
        
        // Health alerts
        setTimeout(() => {
            createHealthAlert('bloodPressure', '145/92', 140, 'high');
        }, 1000);
        
        // Appointment reminder
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        setTimeout(() => {
            createAppointmentReminder('Sarah Johnson', 'Cardiologist', tomorrowStr, '10:30', 'Heart Care Center');
        }, 1500);
    }
}

// Check for notifications that should be triggered based on time
function checkForDueNotifications() {
    const appData = JSON.parse(localStorage.getItem('healthAppData')) || {};
    const now = new Date();
    
    // Check for medication times
    if (appData.medications) {
        appData.medications.forEach(med => {
            if (med.status === 'active' && med.times) {
                med.times.forEach(timeStr => {
                    const [hours, minutes] = timeStr.split(':').map(Number);
                    
                    // Is it time for this medication?
                    if (now.getHours() === hours && now.getMinutes() === minutes) {
                        createMedicationReminder(med.name, med.dosage);
                    }
                });
            }
        });
    }
    
    // Check for upcoming appointments
    if (appData.appointments) {
        appData.appointments.forEach(apt => {
            if (apt.status === 'upcoming') {
                const aptDate = new Date(`${apt.date}T${apt.time}`);
                const hoursDiff = (aptDate - now) / (1000 * 60 * 60);
                
                // Notify 24 hours before
                if (hoursDiff <= 24 && hoursDiff >= 23) {
                    createAppointmentReminder(apt.doctorName, apt.specialty, apt.date, apt.time, apt.location);
                }
                // Notify 1 hour before
                else if (hoursDiff <= 1 && hoursDiff >= 0) {
                    createAppointmentReminder(apt.doctorName, apt.specialty, apt.date, apt.time, apt.location);
                }
            }
        });
    }
    
    // Check for health alerts
    if (appData.healthMetrics) {
        // Blood pressure alert
        if (appData.healthMetrics.bloodPressure && appData.healthMetrics.bloodPressure.length >= 2) {
            const latest = appData.healthMetrics.bloodPressure[appData.healthMetrics.bloodPressure.length - 1];
            const systolic = latest.value.systolic;
            
            if (systolic > 140) {
                createHealthAlert('bloodPressure', `${systolic}/${latest.value.diastolic}`, 140, 'high');
            }
        }
        
        // Weight change alert
        if (appData.healthMetrics.weight && appData.healthMetrics.weight.length >= 2) {
            const latest = appData.healthMetrics.weight[appData.healthMetrics.weight.length - 1];
            const previous = appData.healthMetrics.weight[appData.healthMetrics.weight.length - 2];
            
            const weightChange = latest.value - previous.value;
            if (Math.abs(weightChange) >= 2) { // Alert if weight change is 2kg or more
                createHealthAlert('weight', weightChange, 2, weightChange > 0 ? 'high' : 'low');
            }
        }
        
        // Temperature alert
        if (appData.healthMetrics.temperature && appData.healthMetrics.temperature.length >= 1) {
            const latest = appData.healthMetrics.temperature[appData.healthMetrics.temperature.length - 1];
            
            if (latest.value >= 38) {
                createHealthAlert('temperature', latest.value, 38, 'high');
            }
        }
    }
}

// Add this to DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // ... existing initialization code ...

    // Initialize notifications
    initializeNotifications();
});