export class AttendanceReportService {
    constructor(repository) {
        this.repository = repository;
    }

    async generateReport(filters) {
        const records = await this.repository.findByDateRange(
            filters.from,
            filters.to,
            filters.studentId
        );

        const filteredRecords = this.applyGradeFilter(records, filters.gradeId);
        const stats = this.calculateStatistics(filteredRecords);

        return { stats, records: filteredRecords };
    }

    applyGradeFilter(records, gradeId) {
        if (!gradeId) return records;
        return records.filter(r => r.student?.GradeID == gradeId);
    }

    calculateStatistics(records) {
        return {
            total: records.length,
            present: records.filter(r => r.Status === 'Present').length,
            absent: records.filter(r => r.Status === 'Absent').length,
            late: records.filter(r => r.IsLate === 1).length
        };
    }
}
