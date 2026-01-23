import { attendanceRepository } from '../repositories/AttendanceRepository.js';
import { AttendanceReportService } from '../services/AttendanceReportService.js';
import { AttendanceReportPDF } from '../utils/AttendanceReportPDF.js';

const reportService = new AttendanceReportService(attendanceRepository);

export const getAttendanceReport = async (req, res) => {
    try {
        const filters = extractFilters(req.query);
        const reportData = await reportService.generateReport(filters);

        if (req.query.format === 'pdf') {
            return generatePDFResponse(res, reportData, filters);
        }

        res.json(reportData);
    } catch (error) {
        handleError(res, error);
    }
};

const extractFilters = (query) => ({
    from: query.from,
    to: query.to,
    studentId: query.studentId || null,
    gradeId: query.gradeId || null
});

const generatePDFResponse = (res, reportData, filters) => {
    const pdfReport = new AttendanceReportPDF(
        reportData.stats,
        reportData.records,
        filters
    );
    pdfReport.generate(res);
};

const handleError = (res, error) => {
    res.status(500).json({ error: error.message });
};

export const getStudentProgressReport = async (req, res) => {
    const { id } = req.params;
    const { from, to } = req.query;

    try {
        const progressData = await reportService.generateStudentProgress(id, from, to);
        res.json(progressData);
    } catch (error) {
        handleError(res, error);
    }
};
