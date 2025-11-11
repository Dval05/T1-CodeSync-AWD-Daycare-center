-- phpMyAdmin SQL Dump
-- version 4.9.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 03-11-2025 a las 19:06:20
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
-- Base de datos: `daycarecenter`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `activity`
--

CREATE TABLE `activity` (
  `ActivityID` int(11) NOT NULL,
  `Name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `GradeID` int(11) DEFAULT NULL,
  `EmpID` int(11) DEFAULT NULL,
  `ImagePath` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `activity_media`
--

CREATE TABLE `activity_media` (
  `MediaID` int(11) NOT NULL,
  `ActivityID` int(11) NOT NULL,
  `FileName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `FilePath` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `UploadDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `UploadedByEmpID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `attendance`
--

CREATE TABLE `attendance` (
  `AttendanceID` int(11) NOT NULL,
  `StudID` int(11) NOT NULL,
  `EmpID` int(11) NOT NULL,
  `Date` date NOT NULL,
  `Status` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `audit_log`
--

CREATE TABLE `audit_log` (
  `LogID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `ActionType` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `Details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `Timestamp` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `employee`
--

CREATE TABLE `employee` (
  `EmpID` int(11) NOT NULL,
  `FirstName` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `LastName` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `UserID` int(11) DEFAULT NULL,
  `Email` varchar(60) COLLATE utf8mb4_general_ci NOT NULL,
  `PhoneNumber` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `Position` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `employee_task`
--

CREATE TABLE `employee_task` (
  `TaskID` int(11) NOT NULL,
  `EmpID` int(11) NOT NULL,
  `Description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `AssignedDate` date DEFAULT NULL,
  `CompletionDate` date DEFAULT NULL,
  `Status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grade`
--

CREATE TABLE `grade` (
  `GradeID` int(11) NOT NULL,
  `Name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `EmpID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `guardian`
--

CREATE TABLE `guardian` (
  `GuardID` int(11) NOT NULL,
  `FirstName` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `LastName` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `Address` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `UserID` int(11) DEFAULT NULL,
  `Email` varchar(60) COLLATE utf8mb4_general_ci NOT NULL,
  `PhoneNumber` varchar(10) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `invoice`
--

CREATE TABLE `invoice` (
  `InvoiceID` int(11) NOT NULL,
  `PayID` int(11) NOT NULL,
  `TotalAmount` decimal(10,2) DEFAULT NULL,
  `IssueDate` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notification`
--

CREATE TABLE `notification` (
  `NotificationID` int(11) NOT NULL,
  `SenderID` int(11) DEFAULT NULL,
  `ReceiverID` int(11) NOT NULL,
  `Message` text COLLATE utf8mb4_general_ci,
  `SentAt` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notification_read`
--

CREATE TABLE `notification_read` (
  `UserID` int(11) NOT NULL,
  `NotificationID` int(11) NOT NULL,
  `ReadAt` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `payment`
--

CREATE TABLE `payment` (
  `PayID` int(11) NOT NULL,
  `StudID` int(11) NOT NULL,
  `Amount` decimal(10,2) NOT NULL,
  `PaymentDate` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `permission`
--

CREATE TABLE `permission` (
  `PermID` int(11) NOT NULL,
  `Name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `MenuTitle` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `MenuIcon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `MenuRoute` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `MenuOrder` int(11) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `permission`
--

INSERT INTO `permission` (`PermID`, `Name`, `MenuTitle`, `MenuIcon`, `MenuRoute`, `MenuOrder`) VALUES
(1, 'access_dashboard', 'Dashboard', 'fas fa-fw fa-tachometer-alt', 'html/dashboard.html', 10),
(2, 'view_students', 'Estudiantes', 'fas fa-fw fa-users', 'html/students.html', 20),
(3, 'create_students', 'Crear Estudiante', 'fas fa-fw fa-user-plus', 'html/students.html', NULL),
(4, 'edit_students', 'Editar Estudiante', 'fas fa-fw fa-user-edit', 'html/students.html', NULL),
(5, 'delete_students', 'Eliminar Estudiante', 'fas fa-fw fa-user-minus', 'html/students.html', NULL),
(6, 'view_student_detail', 'Detalle Estudiante', 'fas fa-fw fa-info-circle', 'html/student-detail.html', 25),
(7, 'view_observations', 'Observaciones', 'fas fa-fw fa-eye', 'html/observations.html', 26),
(8, 'add_observations', 'Añadir Observación', 'fas fa-fw fa-plus-square', 'html/observations.html', NULL),
(9, 'edit_observations', 'Editar Observación', 'fas fa-fw fa-edit', 'html/observations.html', NULL),
(10, 'view_activities', 'Actividades', 'fas fa-fw fa-calendar-alt', 'html/activities.html', 30),
(11, 'create_activities', 'Crear Actividad', 'fas fa-fw fa-plus-circle', 'html/activities.html', NULL),
(12, 'edit_activities', 'Editar Actividad', 'fas fa-fw fa-edit', 'html/activities.html', NULL),
(13, 'delete_activities', 'Eliminar Actividad', 'fas fa-fw fa-trash', 'html/activities.html', NULL),
(14, 'upload_activity_media', 'Subir Contenido', 'fas fa-fw fa-upload', 'html/activities.html', NULL),
(15, 'view_activity_calendar', 'Calendario Actividades', 'fas fa-fw fa-calendar-day', 'html/activity-calendar.html', 35),
(16, 'view_attendance', 'Asistencia', 'fas fa-fw fa-clipboard-check', 'html/attendance.html', 40),
(17, 'manage_attendance', 'Gestionar Asistencia', 'fas fa-fw fa-check-double', 'html/attendance.html', NULL),
(18, 'view_daily_reports', 'Reportes Diarios', 'fas fa-fw fa-file-invoice', 'html/attendance.html', NULL),
(19, 'view_periodic_summaries', 'Resumen Periódico', 'fas fa-fw fa-chart-bar', 'html/attendance.html', NULL),
(20, 'receive_late_alerts', 'Alertas de Retraso', 'fas fa-fw fa-exclamation-triangle', 'html/notifications.html', NULL),
(21, 'view_teachers', 'Maestros', 'fas fa-fw fa-chalkboard-teacher', 'html/teachers.html', 70),
(22, 'manage_teachers', 'Gestionar Maestros', 'fas fa-fw fa-user-tie', 'html/teachers.html', NULL),
(23, 'view_parents', 'Padres/Tutores', 'fas fa-fw fa-user-friends', 'html/parents.html', 80),
(24, 'manage_parents', 'Gestionar Padres', 'fas fa-fw fa-user-shield', 'html/parents.html', NULL),
(25, 'view_grades', 'Grados', 'fas fa-fw fa-graduation-cap', 'html/grades.html', 90),
(26, 'manage_grades', 'Gestionar Grados', 'fas fa-fw fa-chalkboard', 'html/grades.html', NULL),
(27, 'send_messages', 'Comunicación', 'fas fa-fw fa-comments', 'html/communication.html', 100),
(28, 'view_notifications', 'Notificaciones', 'fas fa-fw fa-bell', 'html/notifications.html', 110),
(29, 'send_notifications', 'Enviar Notificación', 'fas fa-fw fa-paper-plane', 'html/notifications.html', NULL),
(30, 'view_reports', 'Reportes Generales', 'fas fa-fw fa-chart-line', 'html/reports.html', 50),
(31, 'export_reports', 'Exportar Reportes', 'fas fa-fw fa-file-export', 'html/reports.html', NULL),
(32, 'view_staff_performance', 'Rendimiento Personal', 'fas fa-fw fa-users-cog', 'html/reports.html', NULL),
(33, 'manage_users_roles', 'Usuarios y Roles', 'fas fa-fw fa-user-cog', 'html/users-roles.html', 60),
(34, 'manage_permissions', 'Gestionar Permisos', 'fas fa-fw fa-shield-alt', 'html/users-roles.html', NULL),
(35, 'view_audit_log', 'Registro de Auditoría', 'fas fa-fw fa-history', 'html/reports.html', NULL),
(36, 'view_invoices', 'Facturas', 'fas fa-fw fa-file-invoice', 'html/invoices.html', 120),
(37, 'manage_invoices', 'Gestionar Facturas', 'fas fa-fw fa-file-invoice-dollar', 'html/invoices.html', NULL),
(38, 'view_payments', 'Pagos', 'fas fa-fw fa-dollar-sign', 'html/payments.html', 130),
(39, 'manage_payments', 'Gestionar Pagos', 'fas fa-fw fa-money-check-alt', 'html/payments.html', NULL),
(40, 'add_payments', 'Añadir Pago', 'fas fa-fw fa-hand-holding-usd', 'html/payments.html', NULL),
(41, 'view_profile', 'Mi Perfil', 'fas fa-fw fa-user', 'html/profile.html', 140);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `role`
--

CREATE TABLE `role` (
  `RoleID` int(11) NOT NULL,
  `Name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `role`
--

INSERT INTO `role` (`RoleID`, `Name`) VALUES
(1, 'Administrator'),
(2, 'Teacher'),
(3, 'Parent'),
(4, 'Todologo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `role_permission`
--

CREATE TABLE `role_permission` (
  `ID` int(11) NOT NULL,
  `RoleID` int(11) NOT NULL,
  `PermID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `role_permission`
--

INSERT INTO `role_permission` (`ID`, `RoleID`, `PermID`) VALUES
(42, 2, 1),
(43, 2, 2),
(44, 2, 4),
(45, 2, 6),
(46, 2, 7),
(47, 2, 8),
(48, 2, 9),
(49, 2, 10),
(50, 2, 11),
(51, 2, 12),
(52, 2, 13),
(53, 2, 14),
(54, 2, 15),
(55, 2, 16),
(56, 2, 17),
(57, 2, 18),
(58, 2, 27),
(59, 2, 28),
(60, 2, 41),
(61, 3, 1),
(62, 3, 2),
(63, 3, 6),
(64, 3, 7),
(65, 3, 10),
(66, 3, 15),
(67, 3, 16),
(68, 3, 19),
(69, 3, 20),
(70, 3, 27),
(71, 3, 28),
(72, 3, 36),
(73, 3, 38),
(74, 3, 41),
(143, 1, 7),
(144, 1, 8),
(145, 1, 9),
(146, 1, 38),
(147, 1, 40),
(148, 1, 39),
(149, 1, 10),
(150, 1, 11),
(151, 1, 13),
(152, 1, 12),
(153, 1, 2),
(154, 1, 3),
(155, 1, 5),
(156, 1, 4),
(157, 1, 30),
(158, 1, 16),
(159, 1, 17),
(160, 1, 25),
(161, 1, 26),
(162, 1, 36),
(163, 1, 37),
(164, 1, 23),
(165, 1, 24),
(166, 1, 34),
(167, 1, 21),
(168, 1, 22),
(169, 1, 28),
(170, 1, 35),
(171, 1, 18),
(172, 1, 19),
(173, 1, 32),
(174, 1, 6),
(175, 1, 15),
(176, 1, 33),
(177, 1, 41);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `student`
--

CREATE TABLE `student` (
  `StudID` int(11) NOT NULL,
  `FirstName` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `LastName` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `GradeID` int(11) DEFAULT NULL,
  `Address` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `student_guardian`
--

CREATE TABLE `student_guardian` (
  `ID` int(11) NOT NULL,
  `StudID` int(11) NOT NULL,
  `GuardID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `student_observation`
--

CREATE TABLE `student_observation` (
  `ObservationID` int(11) NOT NULL,
  `StudID` int(11) NOT NULL,
  `EmpID` int(11) NOT NULL,
  `ObservationText` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `ObservationDate` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user`
--

CREATE TABLE `user` (
  `UserID` int(11) NOT NULL,
  `Username` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `Password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `Email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `IsActive` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `user`
--

INSERT INTO `user` (`UserID`, `Username`, `Password`, `Email`, `CreatedAt`, `IsActive`) VALUES
(1, 'admin', '$2y$10$S94wxR4S8.rKPwgXWWTP/O4IUNEIudFx951qhpMpmXkZXGyoWcSCS', 'admin@example.com', '2025-11-03 00:48:10', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_role`
--

CREATE TABLE `user_role` (
  `ID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `RoleID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `activity`
--
ALTER TABLE `activity`
  ADD PRIMARY KEY (`ActivityID`),
  ADD KEY `GradeID` (`GradeID`),
  ADD KEY `EmpID` (`EmpID`);

--
-- Indices de la tabla `activity_media`
--
ALTER TABLE `activity_media`
  ADD PRIMARY KEY (`MediaID`),
  ADD KEY `ActivityID` (`ActivityID`),
  ADD KEY `UploadedByEmpID` (`UploadedByEmpID`);

--
-- Indices de la tabla `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`AttendanceID`),
  ADD KEY `StudID` (`StudID`),
  ADD KEY `EmpID` (`EmpID`);

--
-- Indices de la tabla `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`LogID`),
  ADD KEY `UserID` (`UserID`);

--
-- Indices de la tabla `employee`
--
ALTER TABLE `employee`
  ADD PRIMARY KEY (`EmpID`),
  ADD KEY `UserID` (`UserID`);

--
-- Indices de la tabla `employee_task`
--
ALTER TABLE `employee_task`
  ADD PRIMARY KEY (`TaskID`),
  ADD KEY `EmpID` (`EmpID`);

--
-- Indices de la tabla `grade`
--
ALTER TABLE `grade`
  ADD PRIMARY KEY (`GradeID`),
  ADD KEY `EmpID` (`EmpID`);

--
-- Indices de la tabla `guardian`
--
ALTER TABLE `guardian`
  ADD PRIMARY KEY (`GuardID`),
  ADD KEY `UserID` (`UserID`);

--
-- Indices de la tabla `invoice`
--
ALTER TABLE `invoice`
  ADD PRIMARY KEY (`InvoiceID`),
  ADD KEY `PayID` (`PayID`);

--
-- Indices de la tabla `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`NotificationID`),
  ADD KEY `SenderID` (`SenderID`),
  ADD KEY `ReceiverID` (`ReceiverID`);

--
-- Indices de la tabla `notification_read`
--
ALTER TABLE `notification_read`
  ADD PRIMARY KEY (`UserID`,`NotificationID`),
  ADD KEY `NotificationID` (`NotificationID`);

--
-- Indices de la tabla `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`PayID`),
  ADD KEY `StudID` (`StudID`);

--
-- Indices de la tabla `permission`
--
ALTER TABLE `permission`
  ADD PRIMARY KEY (`PermID`);

--
-- Indices de la tabla `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`RoleID`);

--
-- Indices de la tabla `role_permission`
--
ALTER TABLE `role_permission`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `RoleID` (`RoleID`),
  ADD KEY `PermID` (`PermID`);

--
-- Indices de la tabla `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`StudID`),
  ADD KEY `GradeID` (`GradeID`);

--
-- Indices de la tabla `student_guardian`
--
ALTER TABLE `student_guardian`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `StudID` (`StudID`),
  ADD KEY `GuardID` (`GuardID`);

--
-- Indices de la tabla `student_observation`
--
ALTER TABLE `student_observation`
  ADD PRIMARY KEY (`ObservationID`),
  ADD KEY `StudID` (`StudID`),
  ADD KEY `EmpID` (`EmpID`);

--
-- Indices de la tabla `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`UserID`);

--
-- Indices de la tabla `user_role`
--
ALTER TABLE `user_role`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `UserID` (`UserID`),
  ADD KEY `RoleID` (`RoleID`);

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
  MODIFY `GuardID` int(11) NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT de la tabla `payment`
--
ALTER TABLE `payment`
  MODIFY `PayID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `permission`
--
ALTER TABLE `permission`
  MODIFY `PermID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT de la tabla `role`
--
ALTER TABLE `role`
  MODIFY `RoleID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `role_permission`
--
ALTER TABLE `role_permission`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=179;

--
-- AUTO_INCREMENT de la tabla `student`
--
ALTER TABLE `student`
  MODIFY `StudID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `student_guardian`
--
ALTER TABLE `student_guardian`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `student_observation`
--
ALTER TABLE `student_observation`
  MODIFY `ObservationID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `user`
--
ALTER TABLE `user`
  MODIFY `UserID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `user_role`
--
ALTER TABLE `user_role`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `activity`
--
ALTER TABLE `activity`
  ADD CONSTRAINT `activity_ibfk_1` FOREIGN KEY (`GradeID`) REFERENCES `grade` (`GradeID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `activity_ibfk_2` FOREIGN KEY (`EmpID`) REFERENCES `employee` (`EmpID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Filtros para la tabla `activity_media`
--
ALTER TABLE `activity_media`
  ADD CONSTRAINT `activity_media_ibfk_1` FOREIGN KEY (`ActivityID`) REFERENCES `activity` (`ActivityID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `activity_media_ibfk_2` FOREIGN KEY (`UploadedByEmpID`) REFERENCES `employee` (`EmpID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`StudID`) REFERENCES `student` (`StudID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`EmpID`) REFERENCES `employee` (`EmpID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Filtros para la tabla `audit_log`
--
ALTER TABLE `audit_log`
  ADD CONSTRAINT `audit_log_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`);

--
-- Filtros para la tabla `employee`
--
ALTER TABLE `employee`
  ADD CONSTRAINT `employee_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Filtros para la tabla `employee_task`
--
ALTER TABLE `employee_task`
  ADD CONSTRAINT `employee_task_ibfk_1` FOREIGN KEY (`EmpID`) REFERENCES `employee` (`EmpID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Filtros para la tabla `grade`
--
ALTER TABLE `grade`
  ADD CONSTRAINT `grade_ibfk_1` FOREIGN KEY (`EmpID`) REFERENCES `employee` (`EmpID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Filtros para la tabla `guardian`
--
ALTER TABLE `guardian`
  ADD CONSTRAINT `guardian_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Filtros para la tabla `invoice`
--
ALTER TABLE `invoice`
  ADD CONSTRAINT `invoice_ibfk_1` FOREIGN KEY (`PayID`) REFERENCES `payment` (`PayID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Filtros para la tabla `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`SenderID`) REFERENCES `user` (`UserID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `notification_ibfk_2` FOREIGN KEY (`ReceiverID`) REFERENCES `user` (`UserID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Filtros para la tabla `notification_read`
--
ALTER TABLE `notification_read`
  ADD CONSTRAINT `notification_read_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `notification_read_ibfk_2` FOREIGN KEY (`NotificationID`) REFERENCES `notification` (`NotificationID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`StudID`) REFERENCES `student` (`StudID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Filtros para la tabla `role_permission`
--
ALTER TABLE `role_permission`
  ADD CONSTRAINT `role_permission_ibfk_1` FOREIGN KEY (`RoleID`) REFERENCES `role` (`RoleID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `role_permission_ibfk_2` FOREIGN KEY (`PermID`) REFERENCES `permission` (`PermID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Filtros para la tabla `student`
--
ALTER TABLE `student`
  ADD CONSTRAINT `student_ibfk_1` FOREIGN KEY (`GradeID`) REFERENCES `grade` (`GradeID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Filtros para la tabla `student_guardian`
--
ALTER TABLE `student_guardian`
  ADD CONSTRAINT `student_guardian_ibfk_1` FOREIGN KEY (`StudID`) REFERENCES `student` (`StudID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `student_guardian_ibfk_2` FOREIGN KEY (`GuardID`) REFERENCES `guardian` (`GuardID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Filtros para la tabla `student_observation`
--
ALTER TABLE `student_observation`
  ADD CONSTRAINT `student_observation_ibfk_1` FOREIGN KEY (`StudID`) REFERENCES `student` (`StudID`),
  ADD CONSTRAINT `student_observation_ibfk_2` FOREIGN KEY (`EmpID`) REFERENCES `employee` (`EmpID`);

--
-- Filtros para la tabla `user_role`
--
ALTER TABLE `user_role`
  ADD CONSTRAINT `user_role_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `user_role_ibfk_2` FOREIGN KEY (`RoleID`) REFERENCES `role` (`RoleID`) ON DELETE RESTRICT ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
