        function showLoading() {
            loadingIndicator.classList.add('show');
        }

        function hideLoading() {
            loadingIndicator.classList.remove('show');
        }

        function showNotification(type, message) {
            const notificationContent = document.getElementById('notificationContent');
            if (type === 'success') {
                notificationContent.innerHTML = `
                    <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 w-full">
                        <div class="flex items-center">
                            <svg class="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <p>${message}</p>
                        </div>
                    </div>
                `;
            } else if (type === 'info') {
                notificationContent.innerHTML = `
                    <div class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 w-full">
                        <div class="flex items-center">
                            <svg class="h-6 w-6 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>${message}</p>
                        </div>
                    </div>
                `;
            } else {
                notificationContent.innerHTML = `
                    <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 w-full">
                        <div class="flex items-center">
                            <svg class="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <p>${message}</p>
                        </div>
                    </div>
                `;
            }
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        function showThankYouModal() {
            thankYouModal.classList.add('show');
        }

        function hideThankYouModal() {
            thankYouModal.classList.remove('show');
        }

        function populateTeacherDropdown() {
            const dropdown = document.getElementById('filterTeacher');
            while (dropdown.options.length > 1) {
                dropdown.remove(1);
            }
            
            teachersData.forEach(teacher => {
                const option = document.createElement('option');
                option.value = teacher.nama;
                option.textContent = teacher.nama;
                dropdown.appendChild(option);
            });
        }

        function populateClassFilters() {
            const classNumberDropdown = document.getElementById('filterClassNumber');
            while (classNumberDropdown.options.length > 1) {
                classNumberDropdown.remove(1);
            }

            Array.from(classesData.keys())
                .sort((a, b) => parseInt(a) - parseInt(b))
                .forEach(classNumber => {
                    const option = document.createElement('option');
                    option.value = classNumber;
                    option.textContent = `Kelas ${classNumber}`;
                    classNumberDropdown.appendChild(option);
                });

            classNumberDropdown.addEventListener('change', function() {
                const selectedClassNumber = this.value;
                updateClassNameDropdown(selectedClassNumber);
            });
            
            filterClassNameContainer.style.display = 'none';
        }

        function updateClassNameDropdown(classNumber) {
            const classNameDropdown = document.getElementById('filterClassName');
            while (classNameDropdown.options.length > 1) {
                classNameDropdown.remove(1);
            }
            
            if (!classNumber) {
                filterClassNameContainer.style.display = 'none';
                return;
            }

            const classNames = classNamesByNumber.get(classNumber);
            
            if (!classNames || classNames.size === 0) {
                filterClassNameContainer.style.display = 'none';
                return;
            }

            filterClassNameContainer.style.display = 'block';
            Array.from(classNames)
                .sort()
                .forEach(className => {
                    const option = document.createElement('option');
                    option.value = className;
                    option.textContent = className;
                    classNameDropdown.appendChild(option);
                });
        }

        function renderTeachers() {
            if (teachersData.length === 0) {
                teacherGrid.innerHTML = `
                    <div class="col-span-full text-center p-8">
                        <p class="text-gray-500">Tidak ada data guru tersedia.</p>
                    </div>
                `;
                return;
            }
            
            teacherGrid.innerHTML = teachersData.map((teacher, index) => `
                <div class="teacher-card bg-white rounded-lg shadow-md p-6 text-center cursor-pointer hover:shadow-lg" data-index="${index}">
                    <div class="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden shadow-md transform transition-transform hover:scale-105">
                        <img src="${teacher.foto}" alt="${teacher.nama}" class="w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/150?text=${encodeURIComponent(teacher.nama)}'; this.onerror=null;">
                    </div>
                    <h3 class="text-lg font-semibold text-blue-800">${teacher.nama}</h3>
                </div>
            `).join('');
            document.querySelectorAll('.teacher-card').forEach(card => {
                card.addEventListener('click', function() {
                    const index = this.getAttribute('data-index');
                    selectedTeacher = teachersData[index].nama;
                    const teacherClassNumbers = new Set();
studentsData.forEach(student => {
    if (student['nama guru'] === selectedTeacher) {
        const classNumber = extractClassNumber(student.kelas);
        if (classNumber) teacherClassNumbers.add(classNumber);
    }
});

renderClassOptions(Array.from(teacherClassNumbers));
                    
                    openClassModal();
                });
            });
        }

        function renderClassOptions(classes) {
            if (classes.length === 0) {
                classOptions.innerHTML = `
                    <div class="col-span-2 text-center p-4">
                        <p class="text-gray-500">Tidak ada kelas tersedia untuk guru ini.</p>
                    </div>
                `;
                return;
            }

            classes.sort((a, b) => parseInt(a) - parseInt(b));
            
            classOptions.innerHTML = classes.map(classNumber => `
                <button class="class-option bg-blue-50 hover:bg-blue-100 text-blue-800 font-medium py-4 px-6 rounded-lg transition duration-300 shadow-sm transform hover:scale-105" data-class="${classNumber}">
                    Kelas ${classNumber}
                </button>
            `).join('');

            document.querySelectorAll('.class-option').forEach(button => {
                button.addEventListener('click', function() {
                    selectedClass = this.getAttribute('data-class');
                    closeClassModal();
                    showPage(2);
                    fetchAttendanceData().then(() => {
                        renderStudents();
                        
                    });
                });
            });
        }

function getAttendanceBadge(status) {

    switch(status){

        case 'hadir':
            return {
                className:'bg-green-100 text-green-800',
                icon:'✅ Hadir'
            };

        case 'sakit':
            return {
                className:'bg-yellow-100 text-yellow-800',
                icon:'🤒 Sakit'
            };

        case 'izin':
            return {
                className:'bg-blue-100 text-blue-800',
                icon:'📝 Izin'
            };

        default:
            return {
                className:'bg-red-100 text-red-800',
                icon:'❌ Alpha'
            };

    }

}

function bindAttendanceOptionEvents() {
    document.querySelectorAll('.attendance-option').forEach(button => {
        button.addEventListener('click', function() {
            const studentName = this.getAttribute('data-student');
            const status = this.getAttribute('data-status');
            const card = this.closest('.student-card');
            const noteContainer = card.querySelector('.note-container');
            const noteInput = card.querySelector('.note-input');
            const isSelected = this.classList.contains('selected-option');

            card.querySelectorAll('.attendance-option').forEach(opt => {
                opt.classList.remove('selected-option');
            });

            if (isSelected) {
                noteContainer.style.display = 'none';
                delete selectedStudentStatus[studentName];
                return;
            }

            this.classList.add('selected-option');
            selectedStudentStatus[studentName] = status;

            noteContainer.style.display = 'block';

            if (status === 'hadir') {
                noteInput.placeholder = 'Contoh: Buku 1 Halaman 1, Tahfidz Surah Al-Fatihah (Jangan Gunakan Enter)';
            } else if (status === 'sakit') {
                noteInput.placeholder = 'Contoh: Demam';
            } else if (status === 'izin') {
                noteInput.placeholder = 'Contoh: Acara Keluarga';
            } else if (status === 'alpha') {
                noteInput.placeholder = 'Tidak Perlu Diisi';
            }

            noteContainer.style.display = 'block';
        });
    });
}

function bindSaveButtonEvents(filteredStudents) {

    document.querySelectorAll('.save-btn').forEach((saveBtn) => {

        saveBtn.onclick = function() {

            const card = this.closest('.student-card');
            const noteInput = card.querySelector('.note-input');
            const note = noteInput.value.trim();

            const idx = parseInt(this.getAttribute('data-student-index'));

            const studentData = filteredStudents[idx];

            const status = selectedStudentStatus[studentData['nama siswa']];

            if (note === '') {
                showNotification('error', 'Catatan wajib diisi!');
                return;
            }

            saveAttendanceXHR(
                studentData['nama siswa'],
                status,
                note,
                studentData.kelas
            ).then(success => {

                if (success) {

                    const studentContent =
                        card.querySelector('.student-content');

                    studentContent.innerHTML = `...`;

                    showThankYouModal();

                    setTimeout(() => {

                        hideThankYouModal();

                        setTimeout(() => {
                            showPage(1);
                        },500);

                    },3000);

                } else {

                    showNotification(
                        'error',
                        'Gagal menyimpan absensi. Silakan coba lagi.'
                    );

                }

            });

        };

    });

}

        function showPage(pageNumber) {
            page1.classList.add('hidden');
            page2.classList.add('hidden');
            page3.classList.add('hidden');
            
            if (pageNumber === 1) {
                page1.classList.remove('hidden');
                page1.classList.add('fade-in');
                fetchTeachers();

                if (autoSubmitTimer) {
                    clearTimeout(autoSubmitTimer);
                    autoSubmitTimer = null;
                }
            } else if (pageNumber === 2) {
                page2.classList.remove('hidden');
                page2.classList.add('fade-in');
                Promise.all([fetchAttendanceData(), fetchStudents()]).then(() => {
                    renderStudents();
                });
            
            } else if (pageNumber === 3) {
                page3.classList.remove('hidden');
                page3.classList.add('fade-in');

                if (!filterMonth.value) {
                    const today = new Date();
                    const month = String(today.getMonth() + 1).padStart(2, '0');
                    filterMonth.value = month;
                }

                if (!adminDataFetched) {
                    Promise.all([
                        fetchAttendanceData(),
                        fetchStudents(),
                        fetchTeachers()
                    ]).then(() => {
                        adminDataFetched = true;
                        filterAttendanceData();
                    });
                } else {
                    filterAttendanceData();
                }
            }
        }

        function openLoginModal() {
            loginModal.style.display = 'block';
            setTimeout(() => {
                loginModal.classList.add('show');
                document.getElementById('username').focus();
            }, 10);
        }

        function closeLoginModal() {
            loginModal.classList.remove('show');
            setTimeout(() => {
                loginModal.style.display = 'none';
                document.getElementById('username').value = '';
                document.getElementById('password').value = '';
            }, 300);
        }

        function openClassModal() {
            classModal.style.display = 'block';
            setTimeout(() => {
                classModal.classList.add('show');
            }, 10);
        }

        function closeClassModal() {
            classModal.classList.remove('show');
            setTimeout(() => {
                classModal.style.display = 'none';
            }, 300);
        }

        function startRefreshAnimation(button) {
            const icon = button.querySelector('.refresh-icon');
            icon.classList.add('spinning');
        }

        function stopRefreshAnimation(button) {
            const icon = button.querySelector('.refresh-icon');
            icon.classList.remove('spinning');
        }