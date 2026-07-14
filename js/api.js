async function saveAttendanceXHR(studentName, status, note, studentClass) {
            showLoading('Menyimpan data absensi...');
            addDebugLog('Saving attendance with XHR', { studentName, status, note });
            
            const today = getTodayDate();
            const record = {
                date: today,
                teacher: selectedTeacher,
                class: studentClass,
                student: studentName,
                status: status,
                note: note || ''
            };
            
            return new Promise((resolve) => {
                const xhr = new XMLHttpRequest();
                const formData = new FormData();
                formData.append('action', 'saveAttendance');
                for (const [key, value] of Object.entries(record)) {
                    formData.append(key, value);
                }
                
                xhr.open('POST', SCRIPT_URL, true);
                
                xhr.onload = function() {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        attendanceData.push(record);
                        addDebugLog('XHR Attendance saved successfully', record);
                        hideLoading();
                        resolve(true);
                    } else {
                        addDebugLog('XHR Error saving attendance', xhr.responseText);
                        hideLoading();
                        resolve(false);
                    }
                };
                
                xhr.onerror = function() {
                    addDebugLog('XHR Network error saving attendance');
                    hideLoading();
                    resolve(false);
                };
                
                xhr.send(formData);
            });
        }

async function saveAttendance(studentName, status, note, studentClass) {
            showLoading('Menyimpan data absensi...');
            addDebugLog('Saving attendance', { studentName, status, note });
            
            const today = formatDateForStorage();
            const record = {
                date: today,
                teacher: selectedTeacher,
                class: studentClass,
                student: studentName,
                status: status,
                note: note || ''
            };
            
            try {
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = SCRIPT_URL;
                form.target = 'hidden-iframe';
                form.style.display = 'none';

                const actionInput = document.createElement('input');
                actionInput.type = 'hidden';
                actionInput.name = 'action';
                actionInput.value = 'saveAttendance';
                form.appendChild(actionInput);

                for (const [key, value] of Object.entries(record)) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = value;
                    form.appendChild(input);
                }

                let iframe = document.getElementById('hidden-iframe');
                if (!iframe) {
                    iframe = document.createElement('iframe');
                    iframe.name = 'hidden-iframe';
                    iframe.id = 'hidden-iframe';
                    iframe.style.display = 'none';
                    document.body.appendChild(iframe);
                }

                document.body.appendChild(form);

                const submissionPromise = new Promise((resolve) => {
                    iframe.onload = () => {
                        resolve(true);
                    };

                    setTimeout(() => {
                        resolve(true);
                    }, 3000);
                });
                
                form.submit();
                
                await submissionPromise;
                
                document.body.removeChild(form);
                
                attendanceData.push(record);
                
                addDebugLog('Attendance saved successfully', record);
                hideLoading();
                return true;
            } catch (error) {
                console.error('Error saving attendance:', error);
                addDebugLog('Error saving attendance', error.toString());
                hideLoading();
                return false;
            }
        }

        async function fetchTeachers() {
            try {
                showLoading();
                
                const response = await fetch(addCacheBuster(TEACHERS_CSV_URL));
                if (!response.ok) {
                    throw new Error('Failed to fetch teachers data');
                }
                
                const csvText = await response.text();
                teachersData = parseCSV(csvText);
                
                renderTeachers();
                populateTeacherDropdown();
                hideLoading();
            } catch (error) {
                console.error('Error fetching teachers:', error);
                showNotification('error', 'Gagal memuat data guru. Silakan coba lagi.');
                teacherGrid.innerHTML = `
                    <div class="col-span-full text-center p-8">
                        <p class="text-red-500">Gagal memuat data guru. Silakan refresh halaman.</p>
                    </div>
                `;
                hideLoading();
            }
        }

        async function fetchStudents() {
            try {
                showLoading();
                
                const response = await fetch(addCacheBuster(STUDENTS_CSV_URL));
                if (!response.ok) {
                    throw new Error('Failed to fetch students data');
                }
                
                const csvText = await response.text();
                studentsData = parseCSV(csvText);
                classesData.clear();
                classNamesByNumber.clear();
                studentsData.forEach(student => {
                    const className = student.kelas;
                    const classNumber = extractClassNumber(className);
                    
                    if (classNumber) {
                        if (!classesData.has(classNumber)) {
                            classesData.set(classNumber, new Set());
                        }
                        
                        classesData.get(classNumber).add(className);
                        if (isComplexClassName(className)) {
                            if (!classNamesByNumber.has(classNumber)) {
                                classNamesByNumber.set(classNumber, new Set());
                            }
                            classNamesByNumber.get(classNumber).add(className);
                        }
                    }
                });
                
                populateClassFilters();
                hideLoading();
                if (!page2.classList.contains('hidden')) {
                    renderStudents();
                }
            } catch (error) {
                console.error('Error fetching students:', error);
                showNotification('error', 'Gagal memuat data siswa. Silakan coba lagi.');
                hideLoading();
            }
        }

        async function fetchAttendanceData() {
            showLoading();
            
            try {
                const response = await fetch(addCacheBuster(ATTENDANCE_CSV_URL));
                if (!response.ok) {
                    throw new Error('Failed to fetch attendance data');
                }
                
                const csvText = await response.text();
                attendanceData = parseCSV(csvText);

                console.log('attendanceData:', attendanceData);
                attendanceData = attendanceData.map(record => ({
                    date: record.date || record.tanggal || record.Tanggal || '',
                    teacher: record.teacher || record.guru || record.Guru || '',
                    class: record.class || record.kelas || record.Kelas || '',
                    student: record.student || record.siswa || record['nama siswa'] || record['Nama Siswa'] || '',
                    status: record.status || record.Status || '',
                    note: record.note || record.catatan || record.Catatan || ''
                }));
                populateYearFilter();
                
                if (isAdmin) {
                    renderAdminData();
                    checkAndUpdateMonthlyReport();
                }
                if (!page2.classList.contains('hidden')) {
                    renderStudents();
                }
                
                hideLoading();
            } catch (error) {
                console.error('Error fetching attendance data:', error);
                showNotification('error', 'Gagal memuat data absensi. Silakan coba lagi.');
                hideLoading();
            }
        }

        function checkAndUpdateMonthlyReport() {
            const year = filterYear.value;
            const month = filterMonth.value;
            const teacher = filterTeacher.value;
            const classNumber = filterClassNumber.value;
            const className = filterClassName.value;
            const showMonthlyReport = month && (classNumber || className);
            
            if (showMonthlyReport && reportContainer.style.display !== 'none') {
                generateMonthlyReport(year, month, teacher, classNumber, className);
            }
        }
