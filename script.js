   let currentDate = new Date();
        let selectedDate = null;
        let habitData = {};

        const months = [
            'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
            'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
        ];

        // Load data from localStorage
        function loadData() {
            try {
                const saved = localStorage.getItem('habitTrackerData');
                habitData = saved ? JSON.parse(saved) : {};
            } catch {
                habitData = {};
            }
        }

        // Save data to localStorage
        function saveData() {
            try {
                localStorage.setItem('habitTrackerData', JSON.stringify(habitData));
            } catch (e) {
                console.error('Məlumat saxlana bilmədi:', e);
            }
        }

        function getDateKey(date) {
            return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        }

        function toggleTheme() {
            const body = document.body;
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            body.setAttribute('data-theme', newTheme);
        }

        function renderCalendar() {
            const grid = document.getElementById('calendarGrid');
            const monthYear = document.getElementById('monthYear');
            
            monthYear.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
            
            const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            const startDate = new Date(firstDay);
            const dayOfWeek = firstDay.getDay();
            startDate.setDate(startDate.getDate() - dayOfWeek);
            
            grid.innerHTML = '';
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            for (let i = 0; i < 42; i++) {
                const cellDate = new Date(startDate);
                cellDate.setDate(startDate.getDate() + i);
                
                const dayCell = document.createElement('div');
                dayCell.className = 'day-cell';
                
                const isCurrentMonth = cellDate.getMonth() === currentDate.getMonth();
                const isToday = cellDate.getTime() === today.getTime();
                
                if (!isCurrentMonth) {
                    dayCell.classList.add('other-month');
                }
                
                if (isToday) {
                    dayCell.classList.add('today');
                }
                
                const dayNumber = document.createElement('div');
                dayNumber.className = 'day-number';
                dayNumber.textContent = cellDate.getDate();
                
                const dayStatus = document.createElement('div');
                dayStatus.className = 'day-status';
                
                const dateKey = getDateKey(cellDate);
                const dayData = habitData[dateKey] || {};
                
                if (dayData.smoke === 'free') {
                    const dot = document.createElement('div');
                    dot.className = 'status-dot smoke-free';
                    dayStatus.appendChild(dot);
                }
                
                if (dayData.smoke === 'smoked') {
                    const dot = document.createElement('div');
                    dot.className = 'status-dot smoked';
                    dayStatus.appendChild(dot);
                }
                
                if (dayData.workout === 'yes') {
                    const dot = document.createElement('div');
                    dot.className = 'status-dot workout';
                    dayStatus.appendChild(dot);
                }
                
                if (dayData.workout === 'no') {
                    const dot = document.createElement('div');
                    dot.className = 'status-dot no-workout';
                    dayStatus.appendChild(dot);
                }
                
                dayCell.appendChild(dayNumber);
                dayCell.appendChild(dayStatus);
                
                if (isCurrentMonth) {
                    dayCell.addEventListener('click', () => openDayControls(cellDate));
                }
                
                grid.appendChild(dayCell);
            }
            
            updateStats();
        }

        function updateStats() {
            let smokeFreeCount = 0;
            let workoutCount = 0;
            
            Object.values(habitData).forEach(day => {
                if (day.smoke === 'free') smokeFreeCount++;
                if (day.workout === 'yes') workoutCount++;
            });
            
            document.getElementById('smokeFreeCount').textContent = smokeFreeCount;
            document.getElementById('workoutCount').textContent = workoutCount;
        }

        function changeMonth(direction) {
            currentDate.setMonth(currentDate.getMonth() + direction);
            renderCalendar();
        }

        function openDayControls(date) {
            selectedDate = date;
            const overlay = document.getElementById('overlay');
            const controls = document.getElementById('dayControls');
            const dateHeader = document.getElementById('controlsDate');
            
            dateHeader.textContent = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
            
            overlay.classList.remove('hidden');
            controls.classList.remove('hidden');
            
            // Update button states
            const dateKey = getDateKey(date);
            const dayData = habitData[dateKey] || {};
            
            document.querySelectorAll('.control-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            if (dayData.smoke === 'free') {
                document.querySelector('[data-type="smoke-free"]').classList.add('active', 'smoke-free');
            }
            if (dayData.smoke === 'smoked') {
                document.querySelector('[data-type="smoked"]').classList.add('active', 'smoked');
            }
            if (dayData.workout === 'yes') {
                document.querySelector('[data-type="workout-yes"]').classList.add('active', 'workout-yes');
            }
            if (dayData.workout === 'no') {
                document.querySelector('[data-type="workout-no"]').classList.add('active', 'workout-no');
            }
        }

        function closeDayControls() {
            document.getElementById('overlay').classList.add('hidden');
            document.getElementById('dayControls').classList.add('hidden');
        }

        function toggleStatus(category, value) {
            if (!selectedDate) return;
            
            const dateKey = getDateKey(selectedDate);
            if (!habitData[dateKey]) {
                habitData[dateKey] = {};
            }
            
            // Toggle logic: if same value is clicked, remove it; otherwise set it
            if (category === 'smoke') {
                if (habitData[dateKey].smoke === value) {
                    delete habitData[dateKey].smoke;
                } else {
                    habitData[dateKey].smoke = value;
                }
            } else if (category === 'workout') {
                if (habitData[dateKey].workout === value) {
                    delete habitData[dateKey].workout;
                } else {
                    habitData[dateKey].workout = value;
                }
            }
            
            // Clean up empty entries
            if (Object.keys(habitData[dateKey]).length === 0) {
                delete habitData[dateKey];
            }
            
            saveData();
            renderCalendar();
            openDayControls(selectedDate); // Refresh the controls
        }

        // Initialize
        loadData();
        renderCalendar();
