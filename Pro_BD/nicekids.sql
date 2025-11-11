-- phpMyAdmin SQL Dump
-- version 4.9.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 11-11-2025 a las 22:15:40
-- Versión del servidor: 8.0.17
-- Versión de PHP: 7.3.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `nicekids`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `activity`
--

CREATE TABLE `activity` (
  `ActivityID` int(11) NOT NULL,
  `Name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `GradeID` int(11) DEFAULT NULL,
  `EmpID` int(11) DEFAULT NULL COMMENT 'Docente responsable',
  `ScheduledDate` date DEFAULT NULL,
  `StartTime` time DEFAULT NULL,
  `EndTime` time DEFAULT NULL,
  `Location` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Arte, Música, Deporte, Académico, etc.',
  `Status` enum('Planned','In Progress','Completed','Cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Planned',
  `ImagePath` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CreatedBy` int(11) DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `activity_media`
--

CREATE TABLE `activity_media` (
  `MediaID` int(11) NOT NULL,
  `ActivityID` int(11) NOT NULL,
  `MediaType` enum('Image','Video','Document') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Image',
  `FilePath` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `FileSize` int(11) DEFAULT NULL COMMENT 'Tamaño en bytes',
  `Caption` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `UploadedBy` int(11) DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `attendance`
--

CREATE TABLE `attendance` (
  `AttendanceID` int(11) NOT NULL,
  `StudentID` int(11) NOT NULL,
  `Date` date NOT NULL,
  `CheckInTime` time DEFAULT NULL,
  `CheckOutTime` time DEFAULT NULL,
  `Status` enum('Present','Absent','Late','Excused','Sick') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Present',
  `IsLate` tinyint(1) DEFAULT '0',
  `LateMinutes` int(11) DEFAULT '0',
  `Notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `CheckedInBy` int(11) DEFAULT NULL,
  `CheckedOutBy` int(11) DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `audit_log`
--

CREATE TABLE `audit_log` (
  `LogID` int(11) NOT NULL,
  `UserID` int(11) DEFAULT NULL,
  `Action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `TableName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `RecordID` int(11) DEFAULT NULL,
  `OldData` json DEFAULT NULL,
  `NewData` json DEFAULT NULL,
  `IPAddress` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `UserAgent` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `employee`
--

CREATE TABLE `employee` (
  `EmpID` int(11) NOT NULL,
  `FirstName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `LastName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `DocumentNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Position` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Maestra, Asistente, Administrador, etc.',
  `Email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PhoneNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `HireDate` date DEFAULT NULL,
  `TerminationDate` date DEFAULT NULL,
  `Salary` decimal(10,2) DEFAULT NULL,
  `BankAccount` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `EmergencyContact` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `EmergencyPhone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Qualifications` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Títulos, certificaciones',
  `ProfilePicture` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `UserID` int(11) DEFAULT NULL COMMENT 'Usuario del sistema asociado',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `employee_task`
--

CREATE TABLE `employee_task` (
  `TaskID` int(11) NOT NULL,
  `EmpID` int(11) NOT NULL,
  `TaskName` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `DueDate` date DEFAULT NULL,
  `Status` enum('Pending','In Progress','Completed','Cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `Priority` enum('Low','Medium','High','Urgent') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Medium',
  `CompletedDate` date DEFAULT NULL,
  `CreatedBy` int(11) DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grade`
--

CREATE TABLE `grade` (
  `GradeID` int(11) NOT NULL,
  `GradeName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `AgeRangeMin` int(11) DEFAULT NULL,
  `AgeRangeMax` int(11) DEFAULT NULL,
  `MaxCapacity` int(11) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `guardian`
--

CREATE TABLE `guardian` (
  `GuardianID` int(11) NOT NULL,
  `FirstName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `LastName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `DocumentNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Relationship` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Padre, Madre, Tutor, Abuelo, etc.',
  `PhoneNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Occupation` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `WorkPhone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `IsEmergencyContact` tinyint(1) DEFAULT '0',
  `IsAuthorizedPickup` tinyint(1) DEFAULT '1',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `invoice`
--

CREATE TABLE `invoice` (
  `InvoiceID` int(11) NOT NULL,
  `InvoiceNumber` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `InvoiceType` enum('Student','Teacher') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Student',
  `ReferenceID` int(11) NOT NULL COMMENT 'StudentPaymentID o TeacherPaymentID',
  `IssueDate` date NOT NULL,
  `DueDate` date DEFAULT NULL,
  `TotalAmount` decimal(10,2) NOT NULL,
  `TaxAmount` decimal(10,2) DEFAULT '0.00',
  `DiscountAmount` decimal(10,2) DEFAULT '0.00',
  `FinalAmount` decimal(10,2) NOT NULL,
  `Description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Status` enum('Draft','Issued','Paid','Cancelled','Overdue') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `FilePath` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ruta del PDF generado',
  `CreatedBy` int(11) DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notification`
--

CREATE TABLE `notification` (
  `NotificationID` int(11) NOT NULL,
  `SenderID` int(11) DEFAULT NULL,
  `ReceiverID` int(11) NOT NULL,
  `Type` enum('Message','Alert','Reminder','System') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Message',
  `Priority` enum('Low','Normal','High','Urgent') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Normal',
  `Subject` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `IsRead` tinyint(1) DEFAULT '0',
  `ReadAt` datetime DEFAULT NULL,
  `RelatedModule` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'students, payments, attendance, etc.',
  `RelatedID` int(11) DEFAULT NULL COMMENT 'ID del registro relacionado',
  `ExpiresAt` datetime DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `notification`
--
DELIMITER $$
CREATE TRIGGER `trg_mark_read_notification` BEFORE UPDATE ON `notification` FOR EACH ROW BEGIN
    IF NEW.IsRead = 1 AND OLD.IsRead = 0 THEN
        SET NEW.ReadAt = NOW();
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `permission`
--

CREATE TABLE `permission` (
  `PermissionID` int(11) NOT NULL,
  `PermissionName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Module` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Action` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Link` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `permission`
--

INSERT INTO `permission` (`PermissionID`, `PermissionName`, `Module`, `Action`, `Description`, `CreatedAt`, `Link`, `Icon`) VALUES
(1, 'View Students', 'students', 'view', 'Ver lista de estudiantes', '2025-11-06 15:17:16', 'students/students.html', 'fa-users'),
(2, 'Create Student', 'students', 'create', 'Crear nuevo estudiante', '2025-11-06 15:17:16', 'students/add-student.html', 'fa-user-plus'),
(3, 'Edit Student', 'students', 'update', 'Editar información de estudiante', '2025-11-06 15:17:16', 'students/students.html', 'fa-user-edit'),
(4, 'Delete Student', 'students', 'delete', 'Eliminar estudiante', '2025-11-06 15:17:16', 'students/students.html', 'fa-user-times'),
(5, 'View Teachers', 'teachers', 'view', 'Ver lista de docentes', '2025-11-06 15:17:16', 'staff/teachers.html', 'fa-chalkboard-teacher'),
(6, 'Manage Teachers', 'teachers', 'manage', 'Gestionar docentes (crear/editar/eliminar)', '2025-11-06 15:17:16', 'staff/teachers.html', 'fa-chalkboard-teacher'),
(7, 'View Attendance', 'attendance', 'view', 'Ver registros de asistencia', '2025-11-06 15:17:16', 'attendance/attendance.html', 'fa-clipboard-list'),
(8, 'Mark Attendance', 'attendance', 'mark', 'Marcar asistencia', '2025-11-06 15:17:16', 'attendance/attendance.html', 'fa-calendar-check'),
(9, 'View Activities', 'activities', 'view', 'Ver actividades', '2025-11-06 15:17:16', 'activities/activities.html', 'fa-calendar-alt'),
(10, 'Manage Activities', 'activities', 'manage', 'Gestionar actividades', '2025-11-06 15:17:16', 'activities/activities.html', 'fa-calendar-plus'),
(11, 'View Payments', 'payments', 'view', 'Ver pagos', '2025-11-06 15:17:16', 'payments/student-payments.html', 'fa-dollar-sign'),
(12, 'Process Payments', 'payments', 'process', 'Procesar pagos de estudiantes', '2025-11-06 15:17:16', 'payments/student-payments.html', 'fa-credit-card'),
(13, 'Process Payroll', 'payroll', 'process', 'Procesar nómina de docentes', '2025-11-06 15:17:16', 'payments/teacher-payments.html', 'fa-file-invoice-dollar'),
(14, 'View Reports', 'reports', 'view', 'Ver reportes', '2025-11-06 15:17:16', 'reports/reports.html', 'fa-chart-bar'),
(15, 'Send Messages', 'communication', 'send', 'Enviar mensajes', '2025-11-06 15:17:16', 'communication/communication.html', 'fa-envelope'),
(16, 'Manage Users', 'users', 'manage', 'Gestionar usuarios y roles', '2025-11-06 15:17:16', 'users/users-roles.html', 'fa-user-shield'),
(17, 'View Audit Logs', 'audit', 'view', 'Ver registros de auditoría', '2025-11-06 15:17:16', 'audit/audit-logs.html', 'fa-book');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `role`
--

CREATE TABLE `role` (
  `RoleID` int(11) NOT NULL,
  `RoleName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `role`
--

INSERT INTO `role` (`RoleID`, `RoleName`, `Description`, `IsActive`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'Director', 'Director de la guardería', 1, '2025-11-06 15:17:16', NULL),
(2, 'Teacher', 'Docente/Maestra', 1, '2025-11-06 15:17:16', NULL),
(3, 'Parent', 'Padre/Madre/Tutor', 1, '2025-11-06 15:17:16', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `role_permission`
--

CREATE TABLE `role_permission` (
  `RolePermissionID` int(11) NOT NULL,
  `RoleID` int(11) NOT NULL,
  `PermissionID` int(11) NOT NULL,
  `GrantedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `role_permission`
--

INSERT INTO `role_permission` (`RolePermissionID`, `RoleID`, `PermissionID`, `GrantedAt`) VALUES
(1, 1, 9, '2025-11-06 15:17:16'),
(2, 1, 10, '2025-11-06 15:17:16'),
(3, 1, 7, '2025-11-06 15:17:16'),
(4, 1, 8, '2025-11-06 15:17:16'),
(5, 1, 17, '2025-11-06 15:17:16'),
(6, 1, 15, '2025-11-06 15:17:16'),
(7, 1, 11, '2025-11-06 15:17:16'),
(8, 1, 12, '2025-11-06 15:17:16'),
(9, 1, 13, '2025-11-06 15:17:16'),
(10, 1, 14, '2025-11-06 15:17:16'),
(11, 1, 1, '2025-11-06 15:17:16'),
(12, 1, 2, '2025-11-06 15:17:16'),
(13, 1, 3, '2025-11-06 15:17:16'),
(14, 1, 4, '2025-11-06 15:17:16'),
(15, 1, 5, '2025-11-06 15:17:16'),
(16, 1, 6, '2025-11-06 15:17:16'),
(17, 1, 16, '2025-11-06 15:17:16');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `session`
--

CREATE TABLE `session` (
  `SessionID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `Token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `IPAddress` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `UserAgent` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ExpiresAt` datetime NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `session`
--

INSERT INTO `session` (`SessionID`, `UserID`, `Token`, `IPAddress`, `UserAgent`, `ExpiresAt`, `CreatedAt`) VALUES
(1, 1, '479f932c81c1b8b2ad82b2fc3db2c5f67f7af7922bd98fa14c9096b114ad7a77', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-18 08:20:42', '2025-11-11 13:20:42'),
(2, 1, 'e132a4f8d7a28416918467a018ad07bb81a92f34d5097446edc2bd48ca8beea3', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-18 08:46:19', '2025-11-11 13:46:19'),
(3, 1, '5504b2778bbec4447e937fdf5f610e04e337fc9974c67b96df88d4f8bbe3904c', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-18 08:51:26', '2025-11-11 13:51:26'),
(4, 1, '66d695380ee2b453053c5b6399c5e747199bae9f1d99a05aa9119fd7200a4a7f', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-18 08:53:54', '2025-11-11 13:53:54'),
(5, 1, '784702c26788484ef44ba6311c38d47da111600b79a1d6be5e672bc2a9da6d43', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-18 08:55:39', '2025-11-11 13:55:39'),
(6, 1, 'a1cd9872011ece4af33751f727253b3e793929fc111dbd6fcc07c6c1813dd23f', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-18 09:10:54', '2025-11-11 14:10:54'),
(7, 1, '5d4d19fcc2725a7210e269e40ebf0d15319ad827fdb17773a646412c031c0139', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-18 09:23:51', '2025-11-11 14:23:51'),
(8, 1, '9c8ab8c8ee95323b40fd10585fc590e6d91fd4c28978523f7abdd9e78ee8358e', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-18 09:26:00', '2025-11-11 14:26:00'),
(9, 1, '3ae468bab69fec4af9a4db854d53ed9beb5f9b5189b083ced0da77b200d2d9f3', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-18 10:05:53', '2025-11-11 15:05:53');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `student`
--

CREATE TABLE `student` (
  `StudentID` int(11) NOT NULL,
  `FirstName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `LastName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `BirthDate` date NOT NULL,
  `Gender` enum('M','F','Other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `DocumentNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PhoneNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `GradeID` int(11) DEFAULT NULL,
  `ProfilePicture` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `MedicalInfo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Alergias, medicamentos, condiciones',
  `EmergencyContact` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `EmergencyPhone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `IsRecurrent` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=Recurrente, 0=Ocasional',
  `EnrollmentDate` date DEFAULT NULL,
  `WithdrawalDate` date DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `student_guardian`
--

CREATE TABLE `student_guardian` (
  `StudentGuardianID` int(11) NOT NULL,
  `StudentID` int(11) NOT NULL,
  `GuardianID` int(11) NOT NULL,
  `IsPrimary` tinyint(1) DEFAULT '0' COMMENT 'Contacto principal',
  `Priority` int(11) DEFAULT '1' COMMENT 'Orden de contacto en emergencias',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `student_observation`
--

CREATE TABLE `student_observation` (
  `ObservationID` int(11) NOT NULL,
  `StudentID` int(11) NOT NULL,
  `EmpID` int(11) NOT NULL COMMENT 'Docente que realiza la observación',
  `ObservationDate` date NOT NULL,
  `Category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Comportamiento, Aprendizaje, Social, Salud, etc.',
  `Observation` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `IsPositive` tinyint(1) DEFAULT NULL COMMENT '1=Positivo, 0=Negativo, NULL=Neutral',
  `RequiresAction` tinyint(1) DEFAULT '0' COMMENT 'Requiere seguimiento',
  `ActionTaken` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `IsPrivate` tinyint(1) DEFAULT '0' COMMENT 'Visible solo para personal autorizado',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `student_payment`
--

CREATE TABLE `student_payment` (
  `StudentPaymentID` int(11) NOT NULL,
  `StudentID` int(11) NOT NULL,
  `ServiceType` enum('Hourly','Monthly','Daily','Event') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Monthly',
  `Hours` decimal(5,2) DEFAULT NULL COMMENT 'Solo para tipo Hourly',
  `RatePerHour` decimal(10,2) DEFAULT NULL COMMENT 'Solo para tipo Hourly',
  `MonthlyFee` decimal(10,2) DEFAULT NULL COMMENT 'Solo para tipo Monthly',
  `DailyFee` decimal(10,2) DEFAULT NULL COMMENT 'Solo para tipo Daily',
  `TotalAmount` decimal(10,2) NOT NULL,
  `PaidAmount` decimal(10,2) DEFAULT '0.00',
  `BalanceRemaining` decimal(10,2) DEFAULT '0.00',
  `PaymentDate` date DEFAULT NULL,
  `DueDate` date NOT NULL,
  `PaymentMethod` enum('Cash','Credit Card','Debit Card','Transfer','Check','Other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Status` enum('Paid','Pending','Overdue','Partial','Cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `IsRecurrent` tinyint(1) DEFAULT '1' COMMENT '1=Recurrente (mensualidad), 0=Ocasional (por horas/día)',
  `StartDate` date DEFAULT NULL COMMENT 'Fecha inicio del servicio',
  `EndDate` date DEFAULT NULL COMMENT 'Fecha fin del servicio',
  `InvoiceNumber` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TransactionReference` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Referencia bancaria o transacción',
  `Notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ProcessedBy` int(11) DEFAULT NULL,
  `CreatedBy` int(11) DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `student_payment`
--
DELIMITER $$
CREATE TRIGGER `trg_student_payment_balance_insert` BEFORE INSERT ON `student_payment` FOR EACH ROW BEGIN
    SET NEW.BalanceRemaining = NEW.TotalAmount - NEW.PaidAmount;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_student_payment_balance_update` BEFORE UPDATE ON `student_payment` FOR EACH ROW BEGIN
    SET NEW.BalanceRemaining = NEW.TotalAmount - NEW.PaidAmount;
    
    -- Actualizar estado automáticamente
    IF NEW.BalanceRemaining = 0 THEN
        SET NEW.Status = 'Paid';
    ELSEIF NEW.PaidAmount > 0 AND NEW.BalanceRemaining > 0 THEN
        SET NEW.Status = 'Partial';
    ELSEIF NEW.DueDate < CURDATE() AND NEW.Status != 'Paid' THEN
        SET NEW.Status = 'Overdue';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `teacher_payment`
--

CREATE TABLE `teacher_payment` (
  `TeacherPaymentID` int(11) NOT NULL,
  `EmpID` int(11) NOT NULL,
  `PaymentPeriod` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ejemplo: 2025-11, 2025-Q4, 2025-W45',
  `PeriodStartDate` date NOT NULL,
  `PeriodEndDate` date NOT NULL,
  `BaseSalary` decimal(10,2) NOT NULL,
  `Bonuses` decimal(10,2) DEFAULT '0.00' COMMENT 'Bonificaciones',
  `Overtime` decimal(10,2) DEFAULT '0.00' COMMENT 'Horas extra',
  `Deductions` decimal(10,2) DEFAULT '0.00' COMMENT 'Deducciones (impuestos, préstamos, etc.)',
  `TotalAmount` decimal(10,2) NOT NULL,
  `PaymentDate` date NOT NULL,
  `PaymentMethod` enum('Cash','Transfer','Check','Other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Transfer',
  `Status` enum('Paid','Pending','Processing','Cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `TransactionReference` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ProcessedBy` int(11) DEFAULT NULL,
  `CreatedBy` int(11) DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user`
--

CREATE TABLE `user` (
  `UserID` int(11) NOT NULL,
  `UserName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `PasswordHash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `FirstName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `LastName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `LastLogin` datetime DEFAULT NULL,
  `PasswordResetToken` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PasswordResetExpires` datetime DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `user`
--

INSERT INTO `user` (`UserID`, `UserName`, `PasswordHash`, `Email`, `FirstName`, `LastName`, `Phone`, `Address`, `IsActive`, `LastLogin`, `PasswordResetToken`, `PasswordResetExpires`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'admin', '$2y$10$RB3GHK0tnk3XOBhlgYgpx.osqFJVAGTjvvdIVe.edey3Vlv3DbOOu', 'admin@gmail.com', 'Administrador', 'Principal', '0999999999', 'Dirección principal', 1, '2025-11-11 10:05:53', NULL, NULL, '2025-11-11 04:14:06', '2025-11-11 15:05:53');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_role`
--

CREATE TABLE `user_role` (
  `UserRoleID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `RoleID` int(11) NOT NULL,
  `AssignedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `AssignedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `user_role`
--

INSERT INTO `user_role` (`UserRoleID`, `UserID`, `RoleID`, `AssignedAt`, `AssignedBy`) VALUES
(1, 1, 1, '2025-11-11 04:16:08', NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `activity`
--
ALTER TABLE `activity`
  ADD PRIMARY KEY (`ActivityID`),
  ADD KEY `GradeID` (`GradeID`),
  ADD KEY `EmpID` (`EmpID`),
  ADD KEY `CreatedBy` (`CreatedBy`),
  ADD KEY `idx_activity_date` (`ScheduledDate`),
  ADD KEY `idx_activity_status` (`Status`);

--
-- Indices de la tabla `activity_media`
--
ALTER TABLE `activity_media`
  ADD PRIMARY KEY (`MediaID`),
  ADD KEY `ActivityID` (`ActivityID`),
  ADD KEY `UploadedBy` (`UploadedBy`);

--
-- Indices de la tabla `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`AttendanceID`),
  ADD UNIQUE KEY `unique_student_date` (`StudentID`,`Date`),
  ADD KEY `CheckedInBy` (`CheckedInBy`),
  ADD KEY `CheckedOutBy` (`CheckedOutBy`),
  ADD KEY `idx_attendance_date` (`Date`),
  ADD KEY `idx_attendance_status` (`Status`),
  ADD KEY `idx_attendance_student_date` (`StudentID`,`Date`);

--
-- Indices de la tabla `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`LogID`),
  ADD KEY `UserID` (`UserID`),
  ADD KEY `idx_audit_action` (`Action`),
  ADD KEY `idx_audit_table` (`TableName`),
  ADD KEY `idx_audit_date` (`CreatedAt`);

--
-- Indices de la tabla `employee`
--
ALTER TABLE `employee`
  ADD PRIMARY KEY (`EmpID`),
  ADD KEY `UserID` (`UserID`),
  ADD KEY `idx_employee_name` (`FirstName`,`LastName`),
  ADD KEY `idx_employee_active` (`IsActive`),
  ADD KEY `idx_document` (`DocumentNumber`);

--
-- Indices de la tabla `employee_task`
--
ALTER TABLE `employee_task`
  ADD PRIMARY KEY (`TaskID`),
  ADD KEY `EmpID` (`EmpID`),
  ADD KEY `CreatedBy` (`CreatedBy`),
  ADD KEY `idx_task_status` (`Status`),
  ADD KEY `idx_task_due_date` (`DueDate`);

--
-- Indices de la tabla `grade`
--
ALTER TABLE `grade`
  ADD PRIMARY KEY (`GradeID`),
  ADD KEY `idx_grade_active` (`IsActive`);

--
-- Indices de la tabla `guardian`
--
ALTER TABLE `guardian`
  ADD PRIMARY KEY (`GuardianID`),
  ADD KEY `idx_guardian_name` (`FirstName`,`LastName`),
  ADD KEY `idx_document` (`DocumentNumber`);

--
-- Indices de la tabla `invoice`
--
ALTER TABLE `invoice`
  ADD PRIMARY KEY (`InvoiceID`),
  ADD UNIQUE KEY `InvoiceNumber` (`InvoiceNumber`),
  ADD KEY `CreatedBy` (`CreatedBy`),
  ADD KEY `idx_invoice_type` (`InvoiceType`),
  ADD KEY `idx_invoice_reference` (`ReferenceID`),
  ADD KEY `idx_invoice_status` (`Status`),
  ADD KEY `idx_invoice_date` (`IssueDate`);

--
-- Indices de la tabla `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`NotificationID`),
  ADD KEY `SenderID` (`SenderID`),
  ADD KEY `ReceiverID` (`ReceiverID`),
  ADD KEY `idx_notification_read` (`IsRead`),
  ADD KEY `idx_notification_type` (`Type`),
  ADD KEY `idx_notification_receiver` (`ReceiverID`,`IsRead`),
  ADD KEY `idx_notification_receiver_unread` (`ReceiverID`,`IsRead`,`CreatedAt`);

--
-- Indices de la tabla `permission`
--
ALTER TABLE `permission`
  ADD PRIMARY KEY (`PermissionID`),
  ADD UNIQUE KEY `unique_permission` (`Module`,`Action`),
  ADD KEY `idx_module` (`Module`);

--
-- Indices de la tabla `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`RoleID`),
  ADD UNIQUE KEY `RoleName` (`RoleName`);

--
-- Indices de la tabla `role_permission`
--
ALTER TABLE `role_permission`
  ADD PRIMARY KEY (`RolePermissionID`),
  ADD UNIQUE KEY `unique_role_permission` (`RoleID`,`PermissionID`),
  ADD KEY `PermissionID` (`PermissionID`);

--
-- Indices de la tabla `session`
--
ALTER TABLE `session`
  ADD PRIMARY KEY (`SessionID`),
  ADD UNIQUE KEY `Token` (`Token`),
  ADD KEY `UserID` (`UserID`),
  ADD KEY `idx_session_expires` (`ExpiresAt`);

--
-- Indices de la tabla `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`StudentID`),
  ADD KEY `GradeID` (`GradeID`),
  ADD KEY `idx_student_name` (`FirstName`,`LastName`),
  ADD KEY `idx_student_active` (`IsActive`),
  ADD KEY `idx_student_recurrent` (`IsRecurrent`),
  ADD KEY `idx_document` (`DocumentNumber`);

--
-- Indices de la tabla `student_guardian`
--
ALTER TABLE `student_guardian`
  ADD PRIMARY KEY (`StudentGuardianID`),
  ADD UNIQUE KEY `unique_student_guardian` (`StudentID`,`GuardianID`),
  ADD KEY `GuardianID` (`GuardianID`);

--
-- Indices de la tabla `student_observation`
--
ALTER TABLE `student_observation`
  ADD PRIMARY KEY (`ObservationID`),
  ADD KEY `StudentID` (`StudentID`),
  ADD KEY `EmpID` (`EmpID`),
  ADD KEY `idx_observation_date` (`ObservationDate`),
  ADD KEY `idx_observation_category` (`Category`);

--
-- Indices de la tabla `student_payment`
--
ALTER TABLE `student_payment`
  ADD PRIMARY KEY (`StudentPaymentID`),
  ADD KEY `StudentID` (`StudentID`),
  ADD KEY `ProcessedBy` (`ProcessedBy`),
  ADD KEY `CreatedBy` (`CreatedBy`),
  ADD KEY `idx_payment_status` (`Status`),
  ADD KEY `idx_payment_date` (`PaymentDate`),
  ADD KEY `idx_due_date` (`DueDate`),
  ADD KEY `idx_service_type` (`ServiceType`),
  ADD KEY `idx_invoice` (`InvoiceNumber`),
  ADD KEY `idx_student_payment_student_status` (`StudentID`,`Status`),
  ADD KEY `idx_student_payment_dates` (`PaymentDate`,`DueDate`);

--
-- Indices de la tabla `teacher_payment`
--
ALTER TABLE `teacher_payment`
  ADD PRIMARY KEY (`TeacherPaymentID`),
  ADD KEY `EmpID` (`EmpID`),
  ADD KEY `ProcessedBy` (`ProcessedBy`),
  ADD KEY `CreatedBy` (`CreatedBy`),
  ADD KEY `idx_payment_status` (`Status`),
  ADD KEY `idx_payment_date` (`PaymentDate`),
  ADD KEY `idx_payment_period` (`PaymentPeriod`),
  ADD KEY `idx_teacher_payment_employee_period` (`EmpID`,`PaymentPeriod`);

--
-- Indices de la tabla `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`UserID`),
  ADD UNIQUE KEY `UserName` (`UserName`),
  ADD UNIQUE KEY `Email` (`Email`),
  ADD KEY `idx_username` (`UserName`),
  ADD KEY `idx_email` (`Email`),
  ADD KEY `idx_active` (`IsActive`);

--
-- Indices de la tabla `user_role`
--
ALTER TABLE `user_role`
  ADD PRIMARY KEY (`UserRoleID`),
  ADD UNIQUE KEY `unique_user_role` (`UserID`,`RoleID`),
  ADD KEY `RoleID` (`RoleID`),
  ADD KEY `AssignedBy` (`AssignedBy`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `activity`
--
ALTER TABLE `activity`
  MODIFY `ActivityID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `activity_media`
--
ALTER TABLE `activity_media`
  MODIFY `MediaID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `attendance`
--
ALTER TABLE `attendance`
  MODIFY `AttendanceID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `LogID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `employee`
--
ALTER TABLE `employee`
  MODIFY `EmpID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `employee_task`
--
ALTER TABLE `employee_task`
  MODIFY `TaskID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `grade`
--
ALTER TABLE `grade`
  MODIFY `GradeID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `guardian`
--
ALTER TABLE `guardian`
  MODIFY `GuardianID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `invoice`
--
ALTER TABLE `invoice`
  MODIFY `InvoiceID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notification`
--
ALTER TABLE `notification`
  MODIFY `NotificationID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `permission`
--
ALTER TABLE `permission`
  MODIFY `PermissionID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `role`
--
ALTER TABLE `role`
  MODIFY `RoleID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `role_permission`
--
ALTER TABLE `role_permission`
  MODIFY `RolePermissionID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT de la tabla `session`
--
ALTER TABLE `session`
  MODIFY `SessionID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `student`
--
ALTER TABLE `student`
  MODIFY `StudentID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `student_guardian`
--
ALTER TABLE `student_guardian`
  MODIFY `StudentGuardianID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `student_observation`
--
ALTER TABLE `student_observation`
  MODIFY `ObservationID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `student_payment`
--
ALTER TABLE `student_payment`
  MODIFY `StudentPaymentID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `teacher_payment`
--
ALTER TABLE `teacher_payment`
  MODIFY `TeacherPaymentID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `user`
--
ALTER TABLE `user`
  MODIFY `UserID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `user_role`
--
ALTER TABLE `user_role`
  MODIFY `UserRoleID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `activity`
--
ALTER TABLE `activity`
  ADD CONSTRAINT `fk_activity_created_by` FOREIGN KEY (`CreatedBy`) REFERENCES `user` (`UserID`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_activity_employee` FOREIGN KEY (`EmpID`) REFERENCES `employee` (`EmpID`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_activity_grade` FOREIGN KEY (`GradeID`) REFERENCES `grade` (`GradeID`) ON DELETE SET NULL;

--
-- Filtros para la tabla `activity_media`
--
ALTER TABLE `activity_media`
  ADD CONSTRAINT `fk_activity_media_activity` FOREIGN KEY (`ActivityID`) REFERENCES `activity` (`ActivityID`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_activity_media_uploaded_by` FOREIGN KEY (`UploadedBy`) REFERENCES `user` (`UserID`) ON DELETE SET NULL;

--
-- Filtros para la tabla `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `fk_attendance_checked_in_by` FOREIGN KEY (`CheckedInBy`) REFERENCES `employee` (`EmpID`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_attendance_checked_out_by` FOREIGN KEY (`CheckedOutBy`) REFERENCES `employee` (`EmpID`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_attendance_student` FOREIGN KEY (`StudentID`) REFERENCES `student` (`StudentID`) ON DELETE CASCADE;

--
-- Filtros para la tabla `audit_log`
--
ALTER TABLE `audit_log`
  ADD CONSTRAINT `fk_audit_log_user` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE SET NULL;

--
-- Filtros para la tabla `employee`
--
ALTER TABLE `employee`
  ADD CONSTRAINT `fk_employee_user` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE SET NULL;

--
-- Filtros para la tabla `employee_task`
--
ALTER TABLE `employee_task`
  ADD CONSTRAINT `fk_employee_task_created_by` FOREIGN KEY (`CreatedBy`) REFERENCES `user` (`UserID`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_employee_task_employee` FOREIGN KEY (`EmpID`) REFERENCES `employee` (`EmpID`) ON DELETE CASCADE;

--
-- Filtros para la tabla `invoice`
--
ALTER TABLE `invoice`
  ADD CONSTRAINT `fk_invoice_created_by` FOREIGN KEY (`CreatedBy`) REFERENCES `user` (`UserID`) ON DELETE SET NULL;

--
-- Filtros para la tabla `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `fk_notification_receiver` FOREIGN KEY (`ReceiverID`) REFERENCES `user` (`UserID`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notification_sender` FOREIGN KEY (`SenderID`) REFERENCES `user` (`UserID`) ON DELETE SET NULL;

--
-- Filtros para la tabla `role_permission`
--
ALTER TABLE `role_permission`
  ADD CONSTRAINT `fk_role_permission_permission` FOREIGN KEY (`PermissionID`) REFERENCES `permission` (`PermissionID`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_role_permission_role` FOREIGN KEY (`RoleID`) REFERENCES `role` (`RoleID`) ON DELETE CASCADE;

--
-- Filtros para la tabla `session`
--
ALTER TABLE `session`
  ADD CONSTRAINT `fk_session_user` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE CASCADE;

--
-- Filtros para la tabla `student`
--
ALTER TABLE `student`
  ADD CONSTRAINT `fk_student_grade` FOREIGN KEY (`GradeID`) REFERENCES `grade` (`GradeID`) ON DELETE SET NULL;

--
-- Filtros para la tabla `student_guardian`
--
ALTER TABLE `student_guardian`
  ADD CONSTRAINT `fk_student_guardian_guardian` FOREIGN KEY (`GuardianID`) REFERENCES `guardian` (`GuardianID`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_student_guardian_student` FOREIGN KEY (`StudentID`) REFERENCES `student` (`StudentID`) ON DELETE CASCADE;

--
-- Filtros para la tabla `student_observation`
--
ALTER TABLE `student_observation`
  ADD CONSTRAINT `fk_observation_employee` FOREIGN KEY (`EmpID`) REFERENCES `employee` (`EmpID`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_observation_student` FOREIGN KEY (`StudentID`) REFERENCES `student` (`StudentID`) ON DELETE CASCADE;

--
-- Filtros para la tabla `student_payment`
--
ALTER TABLE `student_payment`
  ADD CONSTRAINT `fk_student_payment_created_by` FOREIGN KEY (`CreatedBy`) REFERENCES `user` (`UserID`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_student_payment_processed_by` FOREIGN KEY (`ProcessedBy`) REFERENCES `employee` (`EmpID`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_student_payment_student` FOREIGN KEY (`StudentID`) REFERENCES `student` (`StudentID`) ON DELETE CASCADE;

--
-- Filtros para la tabla `teacher_payment`
--
ALTER TABLE `teacher_payment`
  ADD CONSTRAINT `fk_teacher_payment_created_by` FOREIGN KEY (`CreatedBy`) REFERENCES `user` (`UserID`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_teacher_payment_employee` FOREIGN KEY (`EmpID`) REFERENCES `employee` (`EmpID`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_teacher_payment_processed_by` FOREIGN KEY (`ProcessedBy`) REFERENCES `user` (`UserID`) ON DELETE SET NULL;

--
-- Filtros para la tabla `user_role`
--
ALTER TABLE `user_role`
  ADD CONSTRAINT `fk_user_role_assigned_by` FOREIGN KEY (`AssignedBy`) REFERENCES `user` (`UserID`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_user_role_role` FOREIGN KEY (`RoleID`) REFERENCES `role` (`RoleID`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user_role_user` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
