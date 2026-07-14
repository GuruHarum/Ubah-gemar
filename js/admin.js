function filterAttendanceData() {
            const month = filterMonth.value;
            const teacher = filterTeacher.value;
            const classNumber = filterClassNumber.value;
            const className = filterClassName.value;
            const kelasDipilih = filterClassNumber.value || filterClassName.value;
            const adminPanelDataAbsensi = document.querySelectorAll('.admin-panel.mb-8')[1];

    if (!kelasDipilih) {
        adminPanelDataAbsensi.style.display = 'none';

        let notice = document.getElementById('absensiNotice');
        if (!notice) {
            notice = document.createElement('div');
            notice.id = 'absensiNotice';
            notice.className = 'text-center text-gray-500 my-4';
            notice.innerText = 'Silakan pilih Kelas untuk melihat data absensi.';
            adminPanelDataAbsensi.parentNode.insertBefore(notice, adminPanelDataAbsensi);
        }
        notice.style.display = '';
        return;
    } else {
        adminPanelDataAbsensi.style.display = '';
        const notice = document.getElementById('absensiNotice');
        if (notice) notice.style.display = 'none';
    }

            const showMonthlyReport = month && (classNumber || className);
            
            if (showMonthlyReport) {
                generateMonthlyReport(month, teacher, classNumber, className);
                reportContainer.style.display = 'block';
            } else {
                reportContainer.style.display = 'none';
            }

filteredAttendanceData = attendanceData.filter(record => {
    if (record.date !== getTodayDate()) return false;
    if (month && !record.date.startsWith(`${new Date().getFullYear()}-${month}`)) return false;
    if (teacher && record.teacher !== teacher) return false;
    if (className && className !== '') {
        if (record.class.toLowerCase() !== className.toLowerCase()) return false;
    } else if (classNumber && classNumber !== '') {
        const recordClassNumber = extractClassNumber(record.class);
        if (recordClassNumber !== classNumber) return false;
    }

    return true;
});

    console.log('filteredAttendanceData:', filteredAttendanceData);        

            filteredAttendanceData.sort((a, b) => {
                if (a.date > b.date) return -1;
                if (a.date < b.date) return 1;
                return 0;
            });

            currentPage = 1;

            recordCount.textContent = filteredAttendanceData.length;

            renderAdminData();
        }

function renderAdminData() {
            const startIndex = (currentPage - 1) * recordsPerPage;
            const endIndex = Math.min(startIndex + recordsPerPage, filteredAttendanceData.length);
            const currentRecords = filteredAttendanceData.slice(startIndex, endIndex);

            pageIndicator.textContent = currentPage;

            prevPageBtn.disabled = currentPage === 1;
            nextPageBtn.disabled = endIndex >= filteredAttendanceData.length;
            
            if (currentRecords.length === 0) {
                adminDataList.innerHTML = `
                    <tr>
                        <td colspan="6" class="py-8 text-center text-gray-500">
                            Tidak ada data absensi tersedia.
                        </td>
                    </tr>
                `;
                return;
            }
            
            adminDataList.innerHTML = currentRecords.map(record => `
                <tr class="hover:bg-blue-50 transition-all">
                    <td class="py-3 px-4">${formatDateForDisplay(record.date)}</td>
                    <td class="py-3 px-4">${record.teacher}</td>
                    <td class="py-3 px-4">${record.class}</td>
                    <td class="py-3 px-4">${record.student}</td>
                    <td class="py-3 px-4">
                        <span class="status-badge ${record.status}">
                            ${
                                record.status === 'hadir' ? '✅ Hadir' : 
                                record.status === 'sakit' ? '🤒 Sakit' : 
                                record.status === 'izin' ? '📝 Izin' : 
                                '❌ Alpha'
                            }
                        </span>
                    </td>
                    <td class="py-3 px-4">${record.note || '-'}</td>
                </tr>
            `).join('');
        }
