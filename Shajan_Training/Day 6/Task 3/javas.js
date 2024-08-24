let students = [];

        function addStudent() {
            const name = document.getElementById('studentName').value;
            const grade = parseFloat(document.getElementById('grade').value);
            
            const nameRegex = /^[a-zA-Z\s'.,-]+$/;
            if (name && nameRegex.test(name) && !isNaN(grade) && grade >= 0 && grade <= 100) {
                students.push({name, grade});
                document.getElementById('studentName').value = '';
                document.getElementById('grade').value = '';
            } else {
                alert('Please enter a valid name and grade (0-100).');
            }
        }


        function displayGrades() {
            const gradesList = document.getElementById('gradesList');
            gradesList.innerHTML = '<h3>Grades List:</h3>';
            students.forEach((student, index) => {
                gradesList.innerHTML += `<p>${index + 1}. ${student.name} - ${student.grade}</p>`;
            });
        }

        function calculateAverage() {
            if (students.length === 0) {
                alert('No students added yet.');
                return;
            }
            const sum = students.reduce((acc, student) => acc + student.grade, 0);
            const average = sum / students.length;
            document.getElementById('averageGrade').innerHTML = `<h3>Average Grade: ${average.toFixed(2)}</h3>`;
        }        
        
