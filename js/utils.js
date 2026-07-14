        function formatCurrentDate() {
            const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            
            const now = new Date();
            const day = days[now.getDay()];
            const date = now.getDate();
            const month = months[now.getMonth()];
            const year = now.getFullYear();
            
            return `${day}, ${date} ${month} ${year}`;
        }

        function formatDateForStorage() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        function formatDateForDisplay(dateString) {
            if (!dateString) return '';
            const parts = dateString.split('-');
            if (parts.length !== 3) return dateString;
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }

        function getMonthName(monthNumber) {
            const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            return months[parseInt(monthNumber) - 1];
        }

        function getDaysInMonth(year, month) {
            return new Date(year, month, 0).getDate();
        }

        function parseCSV(csvText) {
            const lines = csvText.split('\n');
            if (lines.length === 0) return [];
            
            const headers = lines[0].split(',').map(header => header.trim());
            
            const result = [];
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                let values = [];
                let inQuotes = false;
                let currentValue = '';
                
                for (let j = 0; j < lines[i].length; j++) {
                    const char = lines[i][j];
                    
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        values.push(currentValue);
                        currentValue = '';
                    } else {
                        currentValue += char;
                    }
                }

                values.push(currentValue);

                if (values.length !== headers.length) {
                    values = lines[i].split(',');
                }
                
                const entry = {};
                for (let j = 0; j < headers.length; j++) {
                    let value = j < values.length ? values[j] : '';
                    if (value.startsWith('"') && value.endsWith('"')) {
                        value = value.substring(1, value.length - 1);
                    }
                    entry[headers[j]] = value.trim();
                }
                
                result.push(entry);
            }
            
            return result;
        }

        function isAttendanceRecorded(studentName, date = null) {
            const checkDate = date || formatDateForStorage();

            const record = attendanceData.find(record => 
                record.date === checkDate && 
                record.teacher === selectedTeacher && 
                record.student === studentName
            );
            
            return record !== undefined;
        }

        function getAttendanceRecord(studentName, date = null) {
            const checkDate = date || formatDateForStorage();
            return attendanceData.find(record => 
                record.date === checkDate && 
                record.teacher === selectedTeacher && 
                record.student === studentName
            );
        }

        function extractClassNumber(className) {
            if (!className) return null;
            const match = className.match(/\d+/);
            return match ? match[0] : null;
        }

        function isSimpleClassNumber(className) {
            if (!className) return false;
            return /^\d+$/.test(className);
        }

        function isComplexClassName(className) {
            if (!className) return false;
            return /\d/.test(className) && /[a-zA-Z]/.test(className);
        }

        function addCacheBuster(url) {
            const cacheBuster = `cache=${Date.now()}`;
            return url.includes('?') ? `${url}&${cacheBuster}` : `${url}?${cacheBuster}`;
        }

        function getTodayDate() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        function getFilteredStudents() {
        const filteredStudents = studentsData.filter(student => {
        const studentClass = student.kelas;
        const studentClassNumber = extractClassNumber(studentClass);

        return (
            student['nama guru'] === selectedTeacher &&
            studentClassNumber === selectedClass
        );
    });

    filteredStudents.sort((a, b) =>
        a['nama siswa'].localeCompare(b['nama siswa'])
    );

    return filteredStudents;
}