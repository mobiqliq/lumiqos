"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceStatus = exports.ExamStatus = exports.InvoiceStatus = exports.HomeworkStatus = exports.StudentMarksStatus = exports.StudentStatus = exports.EnrollmentStatus = exports.AcademicYearStatus = void 0;
var AcademicYearStatus;
(function (AcademicYearStatus) {
    AcademicYearStatus["ACTIVE"] = "active";
    AcademicYearStatus["INACTIVE"] = "inactive";
    AcademicYearStatus["UPCOMING"] = "upcoming";
    AcademicYearStatus["COMPLETED"] = "completed";
})(AcademicYearStatus || (exports.AcademicYearStatus = AcademicYearStatus = {}));
var EnrollmentStatus;
(function (EnrollmentStatus) {
    EnrollmentStatus["ACTIVE"] = "active";
    EnrollmentStatus["INACTIVE"] = "inactive";
    EnrollmentStatus["WITHDRAWN"] = "withdrawn";
    EnrollmentStatus["GRADUATED"] = "graduated";
    EnrollmentStatus["SUSPENDED"] = "suspended";
    EnrollmentStatus["PROMOTED"] = "promoted";
    EnrollmentStatus["COMPLETED"] = "completed";
})(EnrollmentStatus || (exports.EnrollmentStatus = EnrollmentStatus = {}));
var StudentStatus;
(function (StudentStatus) {
    StudentStatus["ACTIVE"] = "active";
    StudentStatus["INACTIVE"] = "inactive";
    StudentStatus["ARCHIVED"] = "archived";
    StudentStatus["PENDING"] = "pending";
})(StudentStatus || (exports.StudentStatus = StudentStatus = {}));
var StudentMarksStatus;
(function (StudentMarksStatus) {
    StudentMarksStatus["SUBMITTED"] = "submitted";
    StudentMarksStatus["PUBLISHED"] = "published";
    StudentMarksStatus["PENDING"] = "pending";
    StudentMarksStatus["MISSING"] = "missing";
    StudentMarksStatus["ENTERED"] = "entered";
})(StudentMarksStatus || (exports.StudentMarksStatus = StudentMarksStatus = {}));
var HomeworkStatus;
(function (HomeworkStatus) {
    HomeworkStatus["PENDING"] = "pending";
    HomeworkStatus["SUBMITTED"] = "submitted";
    HomeworkStatus["GRADED"] = "graded";
    HomeworkStatus["LATE"] = "late";
})(HomeworkStatus || (exports.HomeworkStatus = HomeworkStatus = {}));
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["PAID"] = "paid";
    InvoiceStatus["PARTIAL"] = "partial";
    InvoiceStatus["PENDING"] = "pending";
    InvoiceStatus["OVERDUE"] = "overdue";
    InvoiceStatus["CANCELLED"] = "cancelled";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
var ExamStatus;
(function (ExamStatus) {
    ExamStatus["DRAFT"] = "draft";
    ExamStatus["SCHEDULED"] = "scheduled";
    ExamStatus["ONGOING"] = "ongoing";
    ExamStatus["COMPLETED"] = "completed";
    ExamStatus["PUBLISHED"] = "published";
})(ExamStatus || (exports.ExamStatus = ExamStatus = {}));
var AttendanceStatus;
(function (AttendanceStatus) {
    AttendanceStatus["PRESENT"] = "present";
    AttendanceStatus["ABSENT"] = "absent";
    AttendanceStatus["LATE"] = "late";
    AttendanceStatus["EXCUSED"] = "excused";
})(AttendanceStatus || (exports.AttendanceStatus = AttendanceStatus = {}));
//# sourceMappingURL=enums.js.map