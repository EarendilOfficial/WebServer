// script.js

// 1. Get DOM Elements
const prevButton = document.getElementById('prev-month');
const nextButton = document.getElementById('next-month');
const monthYearDisplay = document.getElementById('current-month-year');
const calendarGrid = document.querySelector('.calendar-grid');

// Hardcoded student ID for this example
const studentId = 'student123';

// 2. State Management
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// 3. Fetch Data Function
async function getAttendanceData(month, year) {
    try {
        const response = await fetch(`/api/attendance/${studentId}?month=${month + 1}&year=${year}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching attendance data:', error);
        return [];
    }
}

// 4. Render Calendar Function
async function renderCalendar() {
    const data = await getAttendanceData(currentMonth, currentYear);
    console.log("Attendance Data: ", data);
    const attendanceMap = new Map(data.map(record => [new Date(record.date).getDate(), record.status]));

    // Clear previous days
    calendarGrid.innerHTML = `
        <div class="day-name">Dom</div>
        <div class="day-name">Lun</div>
        <div class="day-name">Mar</div>
        <div class="day-name">Mié</div>
        <div class="day-name">Jue</div>
        <div class="day-name">Vie</div>
        <div class="day-name">Sáb</div>
    `;

    // Cambia el texto de la seleccion del mes 
    monthYearDisplay.textContent = new Date(currentYear, currentMonth).toLocaleString('es-ES', { month: 'long', year: 'numeric' });


    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Add empty divs for preceding days to align the calendar
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('day', 'empty');
        calendarGrid.appendChild(emptyDiv);
    }

    // Add day divs and apply attendance status
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
        dayDiv.textContent = day;

        const status = attendanceMap.get(day);
        if (status) {
            dayDiv.classList.add(status); // 'present', 'absent', or 'late'
        }
        calendarGrid.appendChild(dayDiv);
    }
}

// 5. Add Event Listeners
prevButton.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
});

nextButton.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
});

// 6. Initial Load
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
});