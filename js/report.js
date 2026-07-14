function formatTanggalCetak(dateObj) {
    const hari = String(dateObj.getDate()).padStart(2, '0');
    const bulanIndex = dateObj.getMonth(); // 0-11
    const tahun = dateObj.getFullYear();
    const namaBulan = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ][bulanIndex];
    return `${hari} ${namaBulan} ${tahun}`;
}

function generateMonthlyReport(year, month, teacher, classNumber, className) {
    const daysInMonth = getDaysInMonth(year, parseInt(month));
    const monthName = getMonthName(month);

    reportMonth.textContent = `${monthName} ${year}`;
    reportTeacher.textContent = teacher || 'Semua Guru';
    reportClass.textContent = className || (classNumber ? `Kelas ${classNumber}` : 'Semua Kelas');

    let filteredStudents = studentsData;

    if (teacher) {
        filteredStudents = filteredStudents.filter(student => student['nama guru'] === teacher);
    }

    if (className && className !== '') {
        filteredStudents = filteredStudents.filter(student => student.kelas === className);
    }

    else if (classNumber && classNumber !== '') {
        filteredStudents = filteredStudents.filter(student => {
            const studentClassNumber = extractClassNumber(student.kelas);
            return studentClassNumber === classNumber;
        });
    }

    filteredStudents.sort((a, b) => a['nama siswa'].localeCompare(b['nama siswa']));

    let tableHTML = '<thead><tr>';
    tableHTML += '<th class="student-name">Nama Siswa</th>';

    for (let day = 1; day <= daysInMonth; day++) {
        tableHTML += `<th class="date-header">${day}</th>`;
    }

    tableHTML += '<th class="summary-header">H</th>';
    tableHTML += '<th class="summary-header">S</th>';
    tableHTML += '<th class="summary-header">I</th>';
    tableHTML += '<th class="summary-header">A</th>';
    tableHTML += '<th class="summary-header">%</th>';
    tableHTML += '</tr></thead><tbody>';

    let totalPercent = 0;

    filteredStudents.forEach(student => {
        const studentName = student['nama siswa'];
        const studentClass = student.kelas;

        tableHTML += `<tr><td class="student-name">${studentName}</td>`;

        let hadirCount = 0;
        let sakitCount = 0;
        let izinCount = 0;
        let alphaCount = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${month}-${String(day).padStart(2, '0')}`;
            const today = new Date();
            const currentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const dateToCheck = new Date(dateStr);

            if (dateStr > currentDate) {
                tableHTML += `<td></td>`;
                continue;
            }

            let record = null;

            if (className && className !== '') {
                record = attendanceData.find(r => 
                    r.date === dateStr && 
                    r.student === studentName &&
                    (teacher ? r.teacher === teacher : true) &&
                    r.class.toLowerCase() === className.toLowerCase()
                );
            } else if (classNumber && classNumber !== '') {
                record = attendanceData.find(r => 
                    r.date === dateStr && 
                    r.student === studentName &&
                    (teacher ? r.teacher === teacher : true) &&
                    extractClassNumber(r.class) === classNumber
                );
            } else {
                record = attendanceData.find(r => 
                    r.date === dateStr && 
                    r.student === studentName &&
                    (teacher ? r.teacher === teacher : true)
                );
            }

            let statusCode = '-';
            let statusClass = 'status--';

            if (record) {
                if (record.status === 'hadir') {
                    statusCode = 'H';
                    statusClass = 'status-H';
                    hadirCount++;
                } else if (record.status === 'sakit') {
                    statusCode = 'S';
                    statusClass = 'status-S';
                    sakitCount++;
                } else if (record.status === 'izin') {
                    statusCode = 'I';
                    statusClass = 'status-I';
                    izinCount++;
                } else if (record.status === 'alpha') {
                    statusCode = '-';
                    statusClass = 'status--';
                    alphaCount++;
                }
            } else {
                if (dateToCheck <= today) {
                    alphaCount++;
                }
            }

            tableHTML += `<td class="${statusClass}">${statusCode}</td>`;
        }

        const totalDays = hadirCount + sakitCount + izinCount + alphaCount;
        const attendancePercentage = totalDays > 0 ? Math.round((hadirCount / totalDays) * 100) : 0;

        totalPercent += attendancePercentage;

        tableHTML += `<td class="summary-cell">${hadirCount}</td>`;
        tableHTML += `<td class="summary-cell">${sakitCount}</td>`;
        tableHTML += `<td class="summary-cell">${izinCount}</td>`;
        tableHTML += `<td class="summary-cell">${alphaCount}</td>`;
        tableHTML += `<td class="percentage-cell">${attendancePercentage}%</td>`;

        tableHTML += '</tr>';
    });

    tableHTML += '</tbody>';

    const averagePercent = filteredStudents.length > 0 ? (totalPercent / filteredStudents.length) : 0;
    const reportAverageElem = document.getElementById('reportAverage');
    if (reportAverageElem) {
        reportAverageElem.textContent = `${averagePercent.toFixed(2)}%`;
    }

    monthlyReportTable.innerHTML = tableHTML;
}

function printAttendanceReport() {
    const year = filterYear.value;
    const month = filterMonth.value;
    const teacher = filterTeacher.value;
    const classNumber = filterClassNumber.value;
    const className = filterClassName.value;
    const monthName = getMonthName(month);
    const now = new Date();
    const tanggalCetak = formatTanggalCetak(now);
    const reportTeacherText = teacher || 'Semua Guru';
    const reportClassText = className || (classNumber ? `Kelas ${classNumber}` : 'Semua Kelas');

    let filteredStudents = studentsData;
    if (teacher) filteredStudents = filteredStudents.filter(student => student['nama guru'] === teacher);
    if (className) {
        filteredStudents = filteredStudents.filter(student => student.kelas.toLowerCase() === className.toLowerCase());
    } else if (classNumber) {
        filteredStudents = filteredStudents.filter(student => {
            const studentClassNumber = extractClassNumber(student.kelas);
            return studentClassNumber === classNumber;
        });
    }
    filteredStudents.sort((a, b) => a['nama siswa'].localeCompare(b['nama siswa']));
    const daysInMonth = getDaysInMonth(year, parseInt(month));

    const headers = ['Nama Siswa'];
    for (let day = 1; day <= daysInMonth; day++) {
        headers.push(day.toString());
    }
    headers.push('H', 'S', 'I', 'A', '%');

    const rows = [];
    let totalPercent = 0;
    filteredStudents.forEach(student => {
        const studentName = student['nama siswa'];
        const row = [studentName];
        let hadirCount = 0, sakitCount = 0, izinCount = 0, alphaCount = 0;
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${month}-${String(day).padStart(2, '0')}`;
            const today = new Date();
            const currentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const dateToCheck = new Date(dateStr);
            if (dateStr > currentDate) {
                row.push('');
                continue;
            }
            let record = null;
            if (className && className !== '') {
                record = attendanceData.find(r =>
                    r.date === dateStr &&
                    r.student === studentName &&
                    (teacher ? r.teacher === teacher : true) &&
                    r.class.toLowerCase() === className.toLowerCase()
                );
            } else if (classNumber && classNumber !== '') {
                record = attendanceData.find(r =>
                    r.date === dateStr &&
                    r.student === studentName &&
                    (teacher ? r.teacher === teacher : true) &&
                    extractClassNumber(r.class) === classNumber
                );
            } else {
                record = attendanceData.find(r =>
                    r.date === dateStr &&
                    r.student === studentName &&
                    (teacher ? r.teacher === teacher : true)
                );
            }
            let statusCode = '-';
            if (record) {
                if (record.status === 'hadir') {
                    statusCode = 'H'; hadirCount++;
                } else if (record.status === 'sakit') {
                    statusCode = 'S'; sakitCount++;
                } else if (record.status === 'izin') {
                    statusCode = 'I'; izinCount++;
                } else if (record.status === 'alpha') {
                    statusCode = '-'; alphaCount++;
                }
            } else {
                if (dateToCheck <= today) alphaCount++;
            }
            row.push(statusCode);
        }
        const totalDays = hadirCount + sakitCount + izinCount + alphaCount;
        const attendancePercentage = totalDays > 0 ? Math.round((hadirCount / totalDays) * 100) : 0;
        totalPercent += attendancePercentage;
        row.push(hadirCount.toString(), sakitCount.toString(), izinCount.toString(), alphaCount.toString(), `${attendancePercentage}%`);
        rows.push(row);
    });
    const averagePercent = filteredStudents.length > 0 ? (totalPercent / filteredStudents.length) : 0;

    let html = `
    <div id="print-area" style="font-family:helvetica,sans-serif;">
      <div style="text-align:center; margin-bottom:5px;">
        <h2 style="margin:0; font-size:16pt;">REKAP ABSENSI BULANAN GEMAR MENGAJI</h2>
        <div style="font-size:12pt;">SDIT Harapan Umat Karawang</div>
        <div style="font-size:10pt;">Jl. Pakuncen No. 01, Desa Sukaharja, Kec. Teluk Jambe Timur</div>
        <hr>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:11pt; margin-bottom:1px;">
        <div>Guru: ${reportTeacherText}</div>
        <div>Kelas: ${reportClassText}</div>
        <div>Bulan: ${monthName} ${year}</div>
      </div>
      <div style="font-size:11pt; margin-bottom:10px;">Rata-rata Kehadiran: ${averagePercent.toFixed(2)}%</div>
      <table border="1" cellpadding="2" cellspacing="0" style="width:100%; font-size:9pt; border-collapse:collapse; margin-bottom:15px;">
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `<tr>${row.map((cell, idx) => `<td style="text-align:${idx === 0 ? 'left' : 'center'}">${cell}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
      <div style="font-size:10pt; margin-bottom:15px;">Keterangan: H = Hadir, S = Sakit, I = Izin, - = Alpha</div>
      <div style="display:flex; justify-content:space-between; margin-top:40px; font-size:11pt;">
        <div style="width:40%; text-align:center;">
            Mengetahui,<br>
            Kepala SDIT<br><br><br>
            <div style="height:12px;"></div>
            <div style="margin-top:15px;">(<span style="border-bottom:2px dotted #000; padding:0 30px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>)</div>
        </div>
        <div style="width:40%; text-align:center;">
            Karawang, ${tanggalCetak}<br><br>
            Guru Bidang Studi<br><br><br>
            <div style="height:12px;"></div>
            <div style="margin-top:15px;">(<span style="border-bottom:2px dotted #000; padding:0 30px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>)</div>
        </div>
        </div>
    </div>
    `;

    const win = window.open('', 'PrintReport', 'width=1000,height=700');
    if (!win) {
        showNotification('error', 'Jendela cetak diblokir browser. Izinkan pop-up lalu coba lagi.');
        return;
    }

    win.document.open();
    win.document.write('<!DOCTYPE html><html><head><title>Cetak Rekap Absensi</title>');
    win.document.write('<style>@page { size: A4 landscape; margin: 10mm; } body { margin: 0; } #print-area { width: 100%; } table { font-size: 9pt; } thead { display: table-header-group; } tr { page-break-inside: avoid; }</style>');
    win.document.write('</head><body>' + html + '</body></html>');
    win.onload = function() {
        win.focus();
        win.print();
    };
    win.document.close();
}

function getSemesterAttendanceSummary(year, semester) {
    const attendanceIndex = createSemesterAttendanceIndex(year, semester);
    const groups = new Map();

    function ensureGroup(teacher, className) {
        const classNumber = extractClassNumber(className);
        const classKey = classNumber || className;
        const classLabel = classNumber ? `Kelas ${classNumber}` : className;
        const groupKey = `${teacher}|||${classKey}`;
        if (!groups.has(groupKey)) {
            groups.set(groupKey, {
                teacher,
                className: classLabel,
                classKey,
                students: new Map()
            });
        }
        return groups.get(groupKey);
    }

    studentsData.forEach(student => {
        const teacher = student['nama guru'];
        const className = student.kelas;
        const studentName = student['nama siswa'];
        if (!teacher || !className || !studentName) return;

        const group = ensureGroup(teacher, className);
        if (!group.students.has(studentName)) {
            group.students.set(studentName, { present: 0, total: 0 });
        }
    });

    return Array.from(groups.values())
        .map(group => {
            const percentages = Array.from(group.students.keys())
                .map(studentName => calculateSemesterStudentPercentage(year, semester, group, studentName, attendanceIndex));
            return {
                teacher: group.teacher,
                className: group.className,
                studentCount: percentages.length,
                average: percentages.reduce((total, value) => total + value, 0) / (percentages.length || 1)
            };
        })
        .sort((a, b) => a.teacher.localeCompare(b.teacher, 'id') || a.className.localeCompare(b.className, 'id', { numeric: true }));
}

function normalizeAttendanceValue(value) {
    return String(value || '').trim().toLocaleLowerCase('id-ID');
}

function createSemesterAttendanceIndex(year, semester) {
    const firstMonth = semester === '1' ? '07' : '01';
    const lastMonth = semester === '1' ? '12' : '06';
    const firstDate = `${year}-${firstMonth}-01`;
    const lastDate = `${year}-${lastMonth}-31`;
    const index = new Map();

    attendanceData.forEach(record => {
        const date = String(record.date || '');
        if (date < firstDate || date > lastDate) return;

        const key = [
            date,
            normalizeAttendanceValue(record.teacher),
            normalizeAttendanceValue(extractClassNumber(record.class) || record.class),
            normalizeAttendanceValue(record.student)
        ].join('|');

        // Menjaga perilaku sebelumnya: bila ada data ganda, gunakan catatan pertama.
        if (!index.has(key)) index.set(key, normalizeAttendanceValue(record.status));
    });

    return index;
}

function calculateSemesterStudentPercentage(year, semester, group, studentName, attendanceIndex) {
    const firstMonth = semester === '1' ? 7 : 1;
    const lastMonth = semester === '1' ? 12 : 6;
    const today = new Date();
    const currentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    let hadirCount = 0;
    let sakitCount = 0;
    let izinCount = 0;
    let alphaCount = 0;
    const normalizedTeacher = normalizeAttendanceValue(group.teacher);
    const normalizedClass = normalizeAttendanceValue(group.classKey);
    const normalizedStudent = normalizeAttendanceValue(studentName);

    for (let month = firstMonth; month <= lastMonth; month++) {
        const monthValue = String(month).padStart(2, '0');
        const daysInMonth = getDaysInMonth(year, month);

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${monthValue}-${String(day).padStart(2, '0')}`;
            if (dateStr > currentDate) continue;

            const recordKey = [dateStr, normalizedTeacher, normalizedClass, normalizedStudent].join('|');
            const status = attendanceIndex.get(recordKey);

            if (status) {
                if (status === 'hadir') hadirCount++;
                else if (status === 'sakit') sakitCount++;
                else if (status === 'izin') izinCount++;
                else if (status === 'alpha') alphaCount++;
            } else {
                alphaCount++;
            }
        }
    }

    const totalDays = hadirCount + sakitCount + izinCount + alphaCount;
    return totalDays > 0 ? (hadirCount / totalDays) * 100 : 0;
}

function exportSemesterAttendanceSummary() {
    const { jsPDF } = window.jspdf;
    const year = filterYear.value;
    const semester = document.getElementById('semesterSelect').value;
    const summary = getSemesterAttendanceSummary(year, semester);

    if (summary.length === 0) {
        showNotification('info', `Belum ada data absensi untuk Semester ${semester} tahun ${year}.`);
        return;
    }

    const period = semester === '1' ? 'Juli - Desember' : 'Januari - Juni';
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(15);
    doc.text('LAPORAN RATA-RATA KEHADIRAN SEMESTER', pageWidth / 2, 18, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`Semester ${semester} Tahun ${year} (${period})`, pageWidth / 2, 26, { align: 'center' });
    doc.text('SDIT Harapan Umat Karawang', pageWidth / 2, 33, { align: 'center' });

    doc.autoTable({
        head: [['No.', 'Guru', 'Kelas', 'Jumlah Siswa', 'Rata-rata Kehadiran']],
        body: summary.map((item, index) => [
            index + 1,
            item.teacher,
            item.className,
            item.studentCount,
            `${item.average.toFixed(2)}%`
        ]),
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
        columnStyles: { 0: { halign: 'center', cellWidth: 12 }, 3: { halign: 'center' }, 4: { halign: 'right' } }
    });

    doc.save(`laporan_kehadiran_semester_${semester}_${year}.pdf`);
    showNotification('success', 'Laporan rata-rata kehadiran semester berhasil diunduh.');
}

function exportAttendanceToPDF() {
    const { jsPDF } = window.jspdf;
    const year = filterYear.value;
    const month = filterMonth.value;
    const teacher = filterTeacher.value;
    const classNumber = filterClassNumber.value;
    const className = filterClassName.value;

    const monthName = getMonthName(month);
    const now = new Date();
    const tanggalCetak = `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}`;
    const reportTeacherText = teacher || 'Semua Guru';
    const reportClassText = className || (classNumber ? `Kelas ${classNumber}` : 'Semua Kelas');

    let filteredStudents = studentsData;
    if (teacher) filteredStudents = filteredStudents.filter(student => student['nama guru'] === teacher);
    if (className) {
        filteredStudents = filteredStudents.filter(student => student.kelas.toLowerCase() === className.toLowerCase());
    } else if (classNumber) {
        filteredStudents = filteredStudents.filter(student => {
            const studentClassNumber = extractClassNumber(student.kelas);
            return studentClassNumber === classNumber;
        });
    }
    filteredStudents.sort((a, b) => a['nama siswa'].localeCompare(b['nama siswa']));
    const daysInMonth = getDaysInMonth(year, parseInt(month));
    const headers = ['Nama Siswa'];
    for (let day = 1; day <= daysInMonth; day++) {
        headers.push(day.toString());
    }
    headers.push('H', 'S', 'I', 'A', '%');

    const rows = [];
    let totalPercent = 0;

    filteredStudents.forEach(student => {
        const studentName = student['nama siswa'];
        const row = [studentName];

        let hadirCount = 0;
        let sakitCount = 0;
        let izinCount = 0;
        let alphaCount = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${month}-${String(day).padStart(2, '0')}`;
            const today = new Date();
            const currentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const dateToCheck = new Date(dateStr);

            if (dateStr > currentDate) {
                row.push('');
                continue;
            }

            let record = null;
            if (className && className !== '') {
                record = attendanceData.find(r =>
                    r.date === dateStr &&
                    r.student === studentName &&
                    (teacher ? r.teacher === teacher : true) &&
                    r.class.toLowerCase() === className.toLowerCase()
                );
            } else if (classNumber && classNumber !== '') {
                record = attendanceData.find(r =>
                    r.date === dateStr &&
                    r.student === studentName &&
                    (teacher ? r.teacher === teacher : true) &&
                    extractClassNumber(r.class) === classNumber
                );
            } else {
                record = attendanceData.find(r =>
                    r.date === dateStr &&
                    r.student === studentName &&
                    (teacher ? r.teacher === teacher : true)
                );
            }

            let statusCode = '-';
            if (record) {
                if (record.status === 'hadir') {
                    statusCode = 'H';
                    hadirCount++;
                } else if (record.status === 'sakit') {
                    statusCode = 'S';
                    sakitCount++;
                } else if (record.status === 'izin') {
                    statusCode = 'I';
                    izinCount++;
                } else if (record.status === 'alpha') {
                    statusCode = '-';
                    alphaCount++;
                }
            } else {
                if (dateToCheck <= today) {
                    alphaCount++;
                }
            }
            row.push(statusCode);
        }

        const totalDays = hadirCount + sakitCount + izinCount + alphaCount;
        const attendancePercentage = totalDays > 0 ? Math.round((hadirCount / totalDays) * 100) : 0;
        totalPercent += attendancePercentage;

        row.push(hadirCount.toString());
        row.push(sakitCount.toString());
        row.push(izinCount.toString());
        row.push(alphaCount.toString());
        row.push(`${attendancePercentage}%`);

        rows.push(row);
    });

    const averagePercent = filteredStudents.length > 0 ? (totalPercent / filteredStudents.length) : 0;
    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFontSize(16);
    doc.text('REKAP ABSENSI BULANAN GEMAR MENGAJI', pageWidth/2, 18, { align: 'center' });
    doc.setFontSize(12);
    doc.text('SDIT Harapan Umat Karawang', pageWidth/2, 26, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Jl. Pakuncen No. 01, Desa Sukaharja, Kec. Teluk Jambe Timur', pageWidth/2, 32, { align: 'center' });
    doc.line(15, 36, pageWidth-15, 36);

    let infoY = 44;
    doc.setFontSize(11);
    doc.text(`Guru: ${reportTeacherText}`, 20, infoY);
    doc.text(`Kelas: ${reportClassText}`, pageWidth/2 - 25, infoY);
    doc.text(`Bulan: ${monthName} ${year}`, pageWidth-65, infoY);
    doc.text(`Rata-rata Kehadiran: ${averagePercent.toFixed(2)}%`, 20, infoY + 8);

    doc.autoTable({
        head: [headers],
        body: rows,
        startY: infoY + 15,
        theme: 'grid',
        margin: { left: 10, right: 10 },
        tableWidth: 'auto',
        styles: {
            fontSize: 7,
            cellPadding: 1,
            halign: 'center',
            valign: 'middle'
        },
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
        },
        columnStyles: {
            0: { cellWidth: 40, halign: 'left' },
        },
        pageBreak: 'auto',
        didDrawPage: function (data) {
    const doc = data.doc;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let footerHeight = 30;
    let yFooter = pageHeight - footerHeight;

    doc.setFontSize(11);
    doc.text('Mengetahui,', 30, yFooter);
    doc.text('Kepala Sekolah', 30, yFooter + 7);
    doc.text('(.............................)', 30, yFooter + 25);

    doc.text(`Karawang, ${tanggalCetak}`, pageWidth - 67, yFooter);
    doc.line(pageWidth - 77, yFooter + 28, pageWidth - 17, yFooter + 28);
},
    });
    
    const filename = `rekap_absensi_${monthName.toLowerCase()}_${year}_${reportClassText.replace(/\s+/g, '_').toLowerCase()}.pdf`;
    doc.save(filename);

    showNotification('success', 'Laporan berhasil diunduh dalam format PDF!');
}
