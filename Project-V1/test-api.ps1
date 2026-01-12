$base = 'http://localhost:3001/api'

Write-Host "Testing students CRUD and new endpoints"

# Create a test student
$studentPayload = @{
  FirstName = 'Test'
  LastName  = 'Student'
  EnrollmentDate = (Get-Date).AddYears(-1).ToString('yyyy-MM-dd')
  BirthDate = (Get-Date).AddYears(-6).ToString('yyyy-MM-dd')
  IsActive = 1
} | ConvertTo-Json

$created = Invoke-RestMethod -Method Post -Uri "$base/students" -Body $studentPayload -ContentType 'application/json'
$studentId = $created.StudentID
Write-Host "Created student id=$studentId"

# Get study-time, age, birthday-countdown
$study = Invoke-RestMethod -Method Get -Uri "$base/students/$studentId/study-time"
Write-Host "study-time:" (ConvertTo-Json $study -Depth 3)
$age = Invoke-RestMethod -Method Get -Uri "$base/students/$studentId/age"
Write-Host "age:" (ConvertTo-Json $age -Depth 3)
$bd = Invoke-RestMethod -Method Get -Uri "$base/students/$studentId/birthday-countdown"
Write-Host "birthday-countdown:" (ConvertTo-Json $bd -Depth 3)

# Attendance example (optional)
Write-Host "Attendance (last month):"
$from = (Get-Date).AddMonths(-1).ToString('yyyy-MM-dd')
$to = (Get-Date).ToString('yyyy-MM-dd')
$att = Invoke-RestMethod -Method Get -Uri "$base/students/$studentId/attendance?from=$from&to=$to"
Write-Host (ConvertTo-Json $att -Depth 4)

# Attendance report grouped by student
Write-Host "Attendance report (group by student):"
$report = Invoke-RestMethod -Method Get -Uri "$base/attendance/report?from=$from&to=$to&groupBy=student"
Write-Host (ConvertTo-Json $report -Depth 5)

# Payments (if any)
Write-Host "Payments and summary:"
$payments = Invoke-RestMethod -Method Get -Uri "$base/students/$studentId/payments"
Write-Host (ConvertTo-Json $payments -Depth 3)
$summary = Invoke-RestMethod -Method Get -Uri "$base/students/$studentId/payments/summary"
Write-Host (ConvertTo-Json $summary -Depth 3)

# Guardian / Student relations (requires an existing guardian or created one)
Write-Host "Guardians for student:" 
$g = Invoke-RestMethod -Method Get -Uri "$base/students/$studentId/guardians"
Write-Host (ConvertTo-Json $g -Depth 3)

Write-Host "Students for guardian (example id=1):"
$sForG = Invoke-RestMethod -Method Get -Uri "$base/guardians/1/students"
Write-Host (ConvertTo-Json $sForG -Depth 3)

# Cleanup: logically deactivate created student
Invoke-RestMethod -Method Delete -Uri "$base/students/$studentId"
Write-Host "Student deactivated"

# New checks: progress report, late arrivals, activities by staff
Write-Host "Student progress report (last 30 days):"
$from = (Get-Date).AddDays(-30).ToString('yyyy-MM-dd')
$to = (Get-Date).ToString('yyyy-MM-dd')
$prog = Invoke-RestMethod -Method Get -Uri "$base/students/$studentId/progress-report?from=$from&to=$to"
Write-Host (ConvertTo-Json $prog -Depth 5)

Write-Host "Late arrivals today:"
$today = (Get-Date).ToString('yyyy-MM-dd')
$late = Invoke-RestMethod -Method Get -Uri "$base/attendance/late?date=$today&thresholdMinutes=15"
Write-Host (ConvertTo-Json $late -Depth 5)

Write-Host "Activities for staff id=1 (example):"
$acts = Invoke-RestMethod -Method Get -Uri "$base/activities/staff/1"
Write-Host (ConvertTo-Json $acts -Depth 4)
