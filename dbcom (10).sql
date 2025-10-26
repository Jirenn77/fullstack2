-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 26, 2025 at 01:58 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dbcom`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `admin_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`admin_id`, `email`, `password`, `role`) VALUES
(1, 'admin@gmail.com', 'password123', 'admin');

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `color_code` varchar(7) DEFAULT '#3B82F6',
  `address` varchar(255) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `branches`
--

INSERT INTO `branches` (`id`, `name`, `color_code`, `address`, `contact_number`, `user_id`) VALUES
(1, 'Pabayo Gomez Street', '#3B82F6', 'Condoy Building Room 201, Pabayo Gomez Street, CDO', NULL, NULL),
(2, 'Gingoog City', '#10B981', 'CV Lugod Street, Gingoog City', NULL, NULL),
(3, 'Patag, CDO', '#F59E0B', 'Zone-1 Crossing Camp Evangelista,\r\nGwen\'s Place 3rd Door Patag, CDO', NULL, NULL),
(4, 'Manolo, Bukidnon', '#EF4444', 'Ostrea Buildng Door 2, L Binauro Street Tankulan Manolo Fortich Bukidnon', 'Not available', 11);

-- --------------------------------------------------------

--
-- Table structure for table `bundles`
--

CREATE TABLE `bundles` (
  `bundle_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_to` date DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bundles`
--

INSERT INTO `bundles` (`bundle_id`, `name`, `description`, `price`, `valid_from`, `valid_to`, `status`) VALUES
(1, 'Beauty Essentials Bundle', 'Eyelash Extension + Eyebrow Threading + Eyebag Treatment for only 899 pesos', 899.00, '2025-10-05', '2025-10-31', 'active'),
(2, 'Glow Diamond 24k Facial Bundle', 'Glow Drip + Diamond Peel + 24K Gold Mask Facial Combo', 999.00, '2025-10-05', '2025-11-08', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `bundle_services`
--

CREATE TABLE `bundle_services` (
  `bundle_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bundle_services`
--

INSERT INTO `bundle_services` (`bundle_id`, `service_id`) VALUES
(1, 12),
(1, 18),
(1, 25),
(2, 56),
(2, 82),
(2, 83);

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `contact` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `membership_status` varchar(20) DEFAULT 'None',
  `customerId` varchar(20) DEFAULT NULL,
  `birthday` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `contact`, `email`, `address`, `membership_status`, `customerId`, `birthday`) VALUES
(16, 'Maria Kristina Dela Cruz', '09174628593', NULL, NULL, 'None', NULL, '1980-08-06'),
(17, 'Jessa Mae Alvarez', '09287356412', NULL, NULL, 'None', NULL, '1980-01-23'),
(18, 'Lianne Rose Villanueva', '09562483094', NULL, NULL, 'None', NULL, '1995-05-08'),
(19, 'Camille Joy Ramos', '09158341207', NULL, NULL, 'None', NULL, NULL),
(20, 'Angelica Soriano', '09352817603', 'Angelicas@gmail.com', NULL, 'None', NULL, NULL),
(21, 'Shiela Ann Bautista', '09671125948', NULL, NULL, 'None', NULL, '1985-01-03');

-- --------------------------------------------------------

--
-- Table structure for table `discounts`
--

CREATE TABLE `discounts` (
  `discount_id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_to` date DEFAULT NULL,
  `discount_type` enum('percentage','fixed') DEFAULT 'percentage',
  `value` decimal(5,2) DEFAULT 0.00,
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `discounts`
--

INSERT INTO `discounts` (`discount_id`, `name`, `description`, `valid_from`, `valid_to`, `discount_type`, `value`, `status`) VALUES
(1, 'Holloween Discount', 'Input customers', '2025-10-25', '2025-11-05', 'percentage', 10.00, 'active'),
(2, 'Holiday Discount', '10% off', '2025-10-05', '2025-10-20', 'percentage', 15.00, 'active'),
(3, 'Birthday Discount', 'Special for birthdays', '2025-10-08', '2025-10-24', 'percentage', 15.00, 'active'),
(4, 'Loyalty Discount', 'For loyal customers', '2025-10-25', '2025-11-10', 'fixed', 150.00, 'active'),
(5, 'Discount Test', 'Test', NULL, NULL, 'percentage', 20.00, 'active'),
(6, 'nail care services', '', NULL, NULL, '', 10.00, 'active'),
(7, 'Sample Discount', '', NULL, NULL, 'fixed', 100.00, 'active');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `service` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `contact_details` text DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `branch_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `name`, `service`, `email`, `phone`, `hire_date`, `contact_details`, `status`, `branch_id`, `created_at`, `updated_at`) VALUES
(1, 'Maria Santos', 'Dermatologist', 'maria.santos@lizlyclinic.com', '09171234567', '2020-05-15', '123 Pabayo Gomez Street, Cagayan de Oro', 'Active', 1, '2025-08-11 12:11:43', '2025-08-11 12:11:43'),
(2, 'Juan Dela Cruz', 'Aesthetician', 'juan.delacruz@lizlyclinic.com', '09172345678', '2021-02-20', '456 CV Lugod Street, Gingoog City', 'Active', 2, '2025-08-11 12:11:43', '2025-08-11 12:11:43'),
(3, 'Sophia Rodriguez', 'Laser Technician', 'sophia.rodriguez@lizlyclinic.com', '09173456789', '2019-11-10', '789 Patag Road, Cagayan de Oro', 'Active', 3, '2025-08-11 12:11:43', '2025-08-11 12:11:43'),
(4, 'Miguel Lopez', 'Receptionist', 'miguel.lopez@lizlyclinic.com', '09174567890', '2022-01-05', '321 Tankulan, Manolo Fortich, Bukidnon', 'Active', 4, '2025-08-11 12:11:43', '2025-08-11 12:11:43'),
(5, 'Andrea Reyes', 'Nurse', 'andrea.reyes@lizlyclinic.com', '09175678901', '2020-08-30', '234 Pabayo Gomez Street, Cagayan de Oro', 'Active', 1, '2025-08-11 12:11:43', '2025-08-11 12:11:43'),
(6, 'Carlos Lim', 'Accountant', 'carlos.lim@lizlyclinic.com', '09176789012', '2021-06-18', '567 CV Lugod Street, Gingoog City', 'Active', 2, '2025-08-11 12:11:43', '2025-08-11 12:11:43'),
(13, 'Carmen Sy', 'Beauty Therapist', 'carmen.sy@lizlyclinic.com', '09173456789', '2020-10-25', '456 Pabayo Gomez Street, Cagayan de Oro', 'Inactive', 1, '2025-08-11 12:11:43', '2025-08-11 12:11:43'),
(16, 'Test Employee', 'employeerist', 'testempolyee@gmail.com', '09565774698', '2025-09-22', 'bulaospring CDO', 'Active', NULL, '2025-09-22 04:02:11', '2025-09-22 04:02:11');

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `invoice_id` int(11) NOT NULL,
  `invoice_number` varchar(20) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `invoice_date` datetime NOT NULL DEFAULT current_timestamp(),
  `quantity` int(11) DEFAULT 1,
  `total_price` decimal(10,2) NOT NULL,
  `status` varchar(20) DEFAULT 'Pending',
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`invoice_id`, `invoice_number`, `customer_id`, `service_id`, `invoice_date`, `quantity`, `total_price`, `status`, `notes`) VALUES
(284, 'INV-251023-749', 18, 28, '2025-10-23 00:00:00', 1, 2499.00, 'Paid', NULL),
(285, 'INV-251023-749', 18, 29, '2025-10-23 00:00:00', 1, 599.00, 'Paid', NULL),
(286, 'INV-251023-749', 18, 4, '2025-10-23 00:00:00', 1, 749.50, 'Paid', NULL),
(287, 'INV-251025-338', 19, 28, '2025-10-25 00:00:00', 1, 2499.00, 'Paid', NULL),
(288, 'INV-251025-338', 19, 29, '2025-10-25 00:00:00', 1, 599.00, 'Paid', NULL),
(289, 'INV-251025-338', 19, 27, '2025-10-25 00:00:00', 1, 1499.00, 'Paid', NULL),
(290, 'INV-251025-338', 19, 8, '2025-10-25 00:00:00', 1, 749.50, 'Paid', NULL),
(291, 'INV-251025-947', 20, 0, '2025-10-25 00:00:00', 1, 1000.00, 'Paid', NULL),
(292, 'INV-251025-947', 20, 36, '2025-10-25 00:00:00', 1, 1499.00, 'Paid', NULL),
(293, 'INV-251025-947', 20, 86, '2025-10-25 00:00:00', 1, 249.50, 'Paid', NULL),
(294, 'INV-251025-610', 17, 29, '2025-10-25 00:00:00', 1, 599.00, 'Paid', NULL),
(295, 'INV-251025-610', 17, 27, '2025-10-25 00:00:00', 1, 1499.00, 'Paid', NULL),
(296, 'INV-251025-610', 17, 1, '2025-10-25 00:00:00', 1, 199.50, 'Paid', NULL),
(297, 'INV-251025-529', 16, 29, '2025-10-25 00:00:00', 1, 599.00, 'Paid', NULL),
(298, 'INV-251025-529', 16, 59, '2025-10-25 00:00:00', 1, 1399.00, 'Paid', NULL),
(299, 'INV-251025-529', 16, 56, '2025-10-25 00:00:00', 1, 899.00, 'Paid', NULL),
(300, 'INV-251025-529', 16, 60, '2025-10-25 00:00:00', 1, 1799.00, 'Paid', NULL),
(301, 'INV-251025-529', 16, 86, '2025-10-25 00:00:00', 1, 249.50, 'Paid', NULL),
(302, 'INV-251025-529', 16, 4, '2025-10-25 00:00:00', 1, 749.50, 'Paid', NULL),
(303, 'INV-251026-394', 21, 26, '2025-10-26 00:00:00', 1, 599.00, 'Paid', NULL),
(304, 'INV-251026-394', 21, 24, '2025-10-26 00:00:00', 1, 150.00, 'Paid', NULL),
(305, 'INV-251026-394', 21, 25, '2025-10-26 00:00:00', 1, 200.00, 'Paid', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `invoice_service`
--

CREATE TABLE `invoice_service` (
  `id` int(11) NOT NULL,
  `invoice_id` int(11) DEFAULT NULL,
  `service_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `stockQty` int(11) NOT NULL,
  `service` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `unitPrice` decimal(10,2) NOT NULL,
  `supplier` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `name`, `category`, `type`, `stockQty`, `service`, `description`, `unitPrice`, `supplier`) VALUES
(3, 'Loreal Paris Elvive', 'Hair Product', 'Hair Services', 45, 'Hair Treatment', 'Professional hair care product', 395.00, 'James'),
(4, 'GiGi Honee Wax', 'Skincare Product', 'Underarm Services', 56, 'Waxing Service', 'Professional waxing product', 18.50, 'SkinCare Solutions'),
(5, 'Kerazon Brazilian Hair', 'Hair Product', 'Hair Services', 56, 'Hair Extension', 'High-quality Brazilian hair', 120.00, 'Hair World'),
(6, 'Majestic Hair Botox', 'Hair Product', 'Hair Services', 56, 'Hair Treatment', 'Professional hair botox treatment', 85.00, 'Luxury Hair Care'),
(9, 'Loreal Paris Elvive', 'Hair Product', 'Hair Services', 45, 'Hair Treatment', 'Professional hair care product', 395.00, 'James');

-- --------------------------------------------------------

--
-- Table structure for table `membership`
--

CREATE TABLE `membership` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `discount` varchar(10) NOT NULL,
  `description` text NOT NULL,
  `duration` int(11) NOT NULL DEFAULT 30,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `type` enum('basic','pro','promo') NOT NULL DEFAULT 'basic',
  `consumable_amount` int(11) NOT NULL DEFAULT 0,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `no_expiration` tinyint(1) NOT NULL DEFAULT 1,
  `valid_until` date DEFAULT NULL,
  `date_registered` date DEFAULT curdate()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `membership`
--

INSERT INTO `membership` (`id`, `name`, `discount`, `description`, `duration`, `status`, `created_at`, `type`, `consumable_amount`, `price`, `no_expiration`, `valid_until`, `date_registered`) VALUES
(1, 'Pro Member', '50%', 'Priority services and bigger discounts', 12, 'active', '2025-05-30 13:11:54', 'pro', 10000, 6000.00, 1, NULL, '2025-10-24'),
(2, 'Basic Member', '50%', 'Affordable benefits for loyal clients', 12, 'active', '2025-05-30 13:11:54', 'basic', 5000, 3000.00, 1, NULL, '2025-10-24'),
(3, 'Anniversary Promo Membership', '50%', 'This membership promo is part of our 2025 Anniversary Promotion.', 30, 'active', '2025-07-26 07:02:42', 'promo', 20000, 6000.00, 0, '2025-11-07', '2025-10-24'),
(9, 'Ber Months Membership', '50%', 'This membership promo is available only during the BER months of 2025.', 30, 'active', '2025-10-23 07:17:01', 'promo', 30000, 6999.00, 0, '2025-12-25', '2025-10-24'),
(14, 'Proshit Membership', '50%', 'asdasdasdasd', 30, 'active', '2025-10-26 10:14:54', 'promo', 10000, 6000.00, 0, '2025-10-31', '2025-10-26');

-- --------------------------------------------------------

--
-- Table structure for table `memberships`
--

CREATE TABLE `memberships` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `coverage` decimal(10,2) DEFAULT 0.00,
  `remaining_balance` decimal(10,2) DEFAULT 0.00,
  `date_registered` date DEFAULT NULL,
  `expire_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `memberships`
--

INSERT INTO `memberships` (`id`, `customer_id`, `type`, `coverage`, `remaining_balance`, `date_registered`, `expire_date`) VALUES
(73, 20, 'basic', 5000.00, 8750.50, '2025-10-26', NULL),
(74, 19, 'promo', 20000.00, 17701.50, '2025-10-23', '2025-11-23'),
(75, 17, 'pro', 10000.00, 8951.00, '2025-10-23', NULL),
(76, 18, 'promo', 20000.00, 16902.00, '2025-10-23', '2025-11-23'),
(77, 16, 'promo', 30000.00, 25304.00, '2025-10-25', '2025-12-25');

-- --------------------------------------------------------

--
-- Table structure for table `membership_logs`
--

CREATE TABLE `membership_logs` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `membership_id` int(11) DEFAULT NULL,
  `action` varchar(20) NOT NULL,
  `type` varchar(20) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(20) NOT NULL,
  `timestamp` datetime NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `performed_by` int(11) DEFAULT NULL,
  `performed_by_name` varchar(255) DEFAULT 'Unknown User'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `membership_logs`
--

INSERT INTO `membership_logs` (`id`, `customer_id`, `membership_id`, `action`, `type`, `amount`, `payment_method`, `timestamp`, `branch_id`, `performed_by`, `performed_by_name`) VALUES
(93, 20, 73, 'New member', 'basic', 5000.00, 'Cash', '2025-10-23 12:16:06', NULL, NULL, 'Unknown User'),
(94, 19, 74, 'New member', 'promo', 20000.00, 'Cash', '2025-10-23 12:16:34', 1, 1, 'Admin'),
(95, 17, 75, 'New member', 'pro', 10000.00, 'Cash', '2025-10-23 12:26:50', 1, 1, 'Admin'),
(96, 18, 76, 'New member', 'promo', 20000.00, 'Cash', '2025-10-23 12:28:04', 1, 1, 'Admin'),
(97, 16, 77, 'New member', 'promo', 30000.00, 'Cash', '2025-10-25 06:52:31', 1, 1, 'Admin'),
(98, 20, 73, 'renewed', 'basic', 5000.00, 'cash', '2025-10-26 10:45:54', NULL, NULL, 'Unknown User');

-- --------------------------------------------------------

--
-- Table structure for table `membership_services`
--

CREATE TABLE `membership_services` (
  `id` int(11) NOT NULL,
  `membership_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `membership_services`
--

INSERT INTO `membership_services` (`id`, `membership_id`, `service_id`) VALUES
(1, 2, 92),
(2, 2, 9),
(3, 2, 28),
(4, 2, 30),
(5, 2, 89),
(6, 2, 49),
(7, 2, 94),
(8, 2, 60),
(9, 2, 4),
(10, 2, 36),
(11, 2, 8),
(12, 2, 76),
(13, 2, 27),
(14, 2, 6),
(15, 2, 59),
(16, 2, 2),
(17, 2, 58),
(18, 2, 93),
(19, 2, 57),
(20, 2, 74),
(21, 2, 37),
(22, 2, 40),
(23, 2, 17),
(24, 2, 16),
(25, 2, 50),
(26, 2, 90),
(27, 2, 39),
(28, 2, 32),
(29, 2, 95),
(30, 2, 38),
(31, 2, 33),
(32, 2, 80),
(33, 2, 18),
(34, 2, 72),
(35, 2, 35),
(36, 2, 70),
(37, 2, 78),
(38, 2, 44),
(39, 2, 7),
(40, 2, 77),
(41, 2, 100),
(42, 2, 102),
(43, 2, 71),
(44, 2, 96),
(45, 2, 43),
(46, 2, 29),
(47, 2, 23),
(48, 2, 81),
(49, 2, 91),
(50, 2, 97),
(51, 2, 66),
(52, 2, 98),
(53, 2, 26),
(54, 2, 105),
(55, 2, 101),
(56, 2, 86),
(57, 2, 64),
(58, 2, 73),
(59, 2, 34),
(60, 2, 75),
(61, 2, 62),
(62, 2, 61),
(63, 2, 19),
(64, 2, 85),
(65, 2, 79),
(66, 2, 65),
(67, 2, 15),
(68, 2, 63),
(69, 2, 41),
(705, 1, 92),
(706, 1, 9),
(707, 1, 28),
(708, 1, 30),
(709, 1, 89),
(710, 1, 49),
(711, 1, 94),
(712, 1, 60),
(713, 1, 4),
(714, 1, 36),
(715, 1, 8),
(716, 1, 76),
(717, 1, 27),
(718, 1, 6),
(719, 1, 59),
(720, 1, 2),
(721, 1, 58),
(722, 1, 93),
(723, 1, 57),
(724, 1, 74),
(725, 1, 37),
(726, 1, 40),
(727, 1, 17),
(728, 1, 16),
(729, 1, 50),
(730, 1, 90),
(731, 1, 39),
(732, 1, 32),
(733, 1, 95),
(734, 1, 38),
(735, 1, 33),
(736, 1, 80),
(737, 1, 56),
(738, 1, 18),
(739, 1, 72),
(740, 1, 35),
(741, 1, 70),
(742, 1, 78),
(743, 1, 44),
(744, 1, 7),
(745, 1, 77),
(746, 1, 100),
(747, 1, 102),
(748, 1, 71),
(749, 1, 96),
(750, 1, 43),
(751, 1, 29),
(752, 1, 23),
(753, 1, 81),
(754, 1, 91),
(755, 1, 97),
(756, 1, 66),
(757, 1, 98),
(758, 1, 26),
(759, 1, 105),
(760, 1, 101),
(761, 1, 86),
(762, 1, 64),
(763, 1, 73),
(764, 1, 34),
(765, 1, 75),
(766, 1, 62),
(767, 1, 61),
(768, 1, 19),
(769, 1, 85),
(770, 1, 79),
(771, 1, 65),
(772, 1, 15),
(773, 1, 63),
(774, 1, 41),
(992, 14, 99),
(993, 14, 92),
(994, 14, 9),
(995, 9, 92),
(996, 9, 9),
(997, 9, 28),
(998, 9, 30),
(999, 9, 89),
(1000, 9, 49),
(1001, 9, 94),
(1002, 9, 60),
(1003, 9, 4),
(1004, 9, 36),
(1005, 9, 8),
(1006, 9, 76),
(1007, 9, 27),
(1008, 9, 6),
(1009, 9, 59),
(1010, 9, 2),
(1011, 9, 58),
(1012, 9, 93),
(1013, 9, 57),
(1014, 9, 74),
(1015, 9, 37),
(1016, 9, 40),
(1017, 9, 17),
(1018, 9, 16),
(1019, 9, 50),
(1020, 9, 90),
(1021, 9, 39),
(1022, 9, 32),
(1023, 9, 95),
(1024, 9, 38),
(1025, 9, 33),
(1026, 9, 80),
(1027, 9, 56),
(1028, 9, 18),
(1029, 9, 72),
(1030, 9, 35),
(1031, 9, 70),
(1032, 9, 78),
(1033, 9, 44),
(1034, 9, 7),
(1035, 9, 77),
(1036, 9, 100),
(1037, 9, 102),
(1038, 9, 71),
(1039, 9, 96),
(1040, 9, 43),
(1041, 9, 29),
(1042, 9, 23),
(1043, 9, 81),
(1044, 9, 91),
(1045, 9, 97),
(1046, 9, 66),
(1047, 9, 98),
(1048, 9, 26),
(1049, 9, 105),
(1050, 9, 101),
(1051, 9, 86),
(1052, 9, 64),
(1053, 9, 73),
(1054, 9, 34),
(1055, 9, 75),
(1056, 9, 62),
(1057, 9, 61),
(1058, 9, 19),
(1059, 9, 85),
(1060, 9, 79),
(1061, 9, 65),
(1062, 9, 15),
(1063, 9, 63),
(1064, 9, 41),
(1065, 9, 99),
(1137, 3, 92),
(1138, 3, 9),
(1139, 3, 28),
(1140, 3, 30),
(1141, 3, 89),
(1142, 3, 49),
(1143, 3, 94),
(1144, 3, 60),
(1145, 3, 4),
(1146, 3, 36),
(1147, 3, 8),
(1148, 3, 76),
(1149, 3, 27),
(1150, 3, 6),
(1151, 3, 59),
(1152, 3, 2),
(1153, 3, 58),
(1154, 3, 93),
(1155, 3, 57),
(1156, 3, 74),
(1157, 3, 37),
(1158, 3, 40),
(1159, 3, 17),
(1160, 3, 16),
(1161, 3, 50),
(1162, 3, 90),
(1163, 3, 39),
(1164, 3, 32),
(1165, 3, 95),
(1166, 3, 38),
(1167, 3, 33),
(1168, 3, 80),
(1169, 3, 56),
(1170, 3, 18),
(1171, 3, 72),
(1172, 3, 35),
(1173, 3, 70),
(1174, 3, 78),
(1175, 3, 44),
(1176, 3, 7),
(1177, 3, 77),
(1178, 3, 100),
(1179, 3, 102),
(1180, 3, 71),
(1181, 3, 96),
(1182, 3, 43),
(1183, 3, 29),
(1184, 3, 23),
(1185, 3, 81),
(1186, 3, 91),
(1187, 3, 97),
(1188, 3, 66),
(1189, 3, 98),
(1190, 3, 26),
(1191, 3, 105),
(1192, 3, 101),
(1193, 3, 86),
(1194, 3, 64),
(1195, 3, 73),
(1196, 3, 34),
(1197, 3, 75),
(1198, 3, 62),
(1199, 3, 61),
(1200, 3, 19),
(1201, 3, 85),
(1202, 3, 79),
(1203, 3, 65),
(1204, 3, 15),
(1205, 3, 63),
(1206, 3, 41);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `order_date` datetime NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `customer_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `branch_id`, `service_id`, `order_date`, `amount`, `customer_id`) VALUES
(290, 1, 28, '2025-10-23 12:28:57', 2499.00, 18),
(291, 1, 29, '2025-10-23 12:28:57', 599.00, 18),
(292, 1, 4, '2025-10-23 12:28:57', 749.50, 18),
(293, 2, 28, '2025-10-25 09:01:39', 2499.00, 19),
(294, 2, 29, '2025-10-25 09:01:39', 599.00, 19),
(295, 2, 27, '2025-10-25 09:01:39', 1499.00, 19),
(296, 2, 8, '2025-10-25 09:01:39', 749.50, 19),
(297, 3, 0, '2025-10-25 09:03:47', 1000.00, 20),
(298, 3, 36, '2025-10-25 09:03:47', 1499.00, 20),
(299, 3, 86, '2025-10-25 09:03:47', 249.50, 20),
(300, 2, 29, '2025-10-25 09:14:24', 599.00, 17),
(301, 2, 27, '2025-10-25 09:14:24', 1499.00, 17),
(302, 2, 1, '2025-10-25 09:14:24', 199.50, 17),
(303, 4, 29, '2025-10-25 09:17:11', 599.00, 16),
(304, 4, 59, '2025-10-25 09:17:11', 1399.00, 16),
(305, 4, 56, '2025-10-25 09:17:11', 899.00, 16),
(306, 4, 60, '2025-10-25 09:17:11', 1799.00, 16),
(307, 4, 86, '2025-10-25 09:17:11', 249.50, 16),
(308, 4, 4, '2025-10-25 09:17:11', 749.50, 16),
(309, 1, 26, '2025-10-26 11:50:09', 599.00, 21),
(310, 1, 24, '2025-10-26 11:50:09', 150.00, 21),
(311, 1, 25, '2025-10-26 11:50:09', 200.00, 21);

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`) VALUES
(1, 'Manage Services'),
(2, 'Manage Memberships'),
(3, 'Manage Customers'),
(4, 'Monitor Services'),
(5, 'Monitor Memberships'),
(6, 'Access the Service Acquire'),
(7, 'Allow user to create, edit, the Service Category'),
(8, 'Allow user to create, edit, the Memberships'),
(9, 'Allow user to see View Reports'),
(10, 'Access the Employee Management'),
(11, 'Access the User Management'),
(12, 'Access the Branch Management'),
(13, 'Access the Roles');

-- --------------------------------------------------------

--
-- Table structure for table `promos`
--

CREATE TABLE `promos` (
  `promo_id` int(11) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_to` date DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `discount_type` enum('fixed','percentage') DEFAULT 'fixed',
  `discount_value` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `promos`
--

INSERT INTO `promos` (`promo_id`, `type`, `name`, `description`, `valid_from`, `valid_to`, `status`, `discount_type`, `discount_value`) VALUES
(1, 'Membership', 'Facial Spa + Footspa', 'Bundled Promo', '2025-09-22', '2025-10-25', 'active', 'percentage', 30.00),
(2, 'Laser Promos', 'Diode Laser ', 'Diode Laser 50% Discounted Price', '2025-10-25', '2025-11-10', 'inactive', 'percentage', 50.00),
(3, 'Skincare', 'Facial + Diamond Peel', 'Glow-up bundle', '2025-02-01', '2025-02-15', 'active', 'fixed', 0.00),
(4, 'Massage Deals', 'Loyalty Discount', 'For loyal customers', '1970-01-01', '1970-01-01', 'inactive', 'fixed', 0.00),
(6, 'Test Promo', 'Test', 'Testing', '2025-09-28', '2025-10-04', 'active', 'percentage', 20.00),
(7, 'holiday discount', 'Nail care services', '', '2025-10-25', '2025-11-10', 'inactive', 'fixed', 50.00),
(15, 'Anniversary Promos', 'Promo Services', 'Bundled Promo for Customers', '2025-10-25', '2025-11-10', 'inactive', 'fixed', 100.00),
(16, 'Sample Promo', 'Sample Promos', 'Promo Sample', '2025-09-30', '2025-10-22', 'active', 'percentage', 30.00);

-- --------------------------------------------------------

--
-- Table structure for table `promo_services`
--

CREATE TABLE `promo_services` (
  `promo_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `promo_services`
--

INSERT INTO `promo_services` (`promo_id`, `service_id`) VALUES
(2, 1),
(2, 3),
(2, 4),
(2, 8),
(2, 86),
(6, 59),
(6, 71),
(6, 76),
(7, 11),
(7, 12),
(7, 13),
(15, 22),
(15, 23),
(15, 81),
(16, 8),
(16, 36),
(16, 52);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `created_at`) VALUES
(1, 'Admin', '2025-09-25 04:51:39'),
(2, 'Receptionist', '2025-09-25 04:51:39');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(1, 9),
(1, 10),
(1, 11),
(1, 12),
(1, 13),
(2, 1),
(2, 3);

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `service_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`service_id`, `name`, `price`, `description`, `duration`, `category`) VALUES
(0, 'Full Body Massage', 1000.00, 'Relaxing full-body massage session', 90, 'Body Treatment'),
(1, 'UA Diode Laser', 399.00, 'Permanent hair reduction for small areas like underarms', 30, 'Diode Laser'),
(2, 'Face', 1299.00, 'Full face hair removal using diode laser technology', 45, 'Diode Laser'),
(3, 'Upper Lip', 399.00, 'Precise upper lip hair removal', 15, 'Diode Laser'),
(4, 'Arms', 1499.00, 'Complete arm hair removal treatment', 60, 'Diode Laser'),
(5, 'Lower Lip', 399.00, 'Lower lip and chin area hair removal', 15, 'Diode Laser'),
(6, 'Legs', 1499.00, 'Full leg hair removal treatment', 90, 'Diode Laser'),
(7, 'Mustache', 699.00, 'Mustache area permanent hair reduction', 20, 'Diode Laser'),
(8, 'Brazilian', 1499.00, 'Complete intimate area hair removal', 60, 'Diode Laser'),
(9, 'All Parts Diode Laser', 4999.00, 'Full body diode laser hair removal package', 180, 'Diode Laser'),
(10, 'Classic Manicure', 120.00, 'Basic nail trimming, shaping, and polishing', 30, 'Nails & Foot'),
(11, 'Classic Pedicure', 150.00, 'Basic foot care including nail trimming and callus removal', 45, 'Nails & Foot'),
(12, 'Luxury Manicure Gel Polish', 299.00, 'Premium manicure with long-lasting gel polish', 60, 'Nails & Foot'),
(13, 'Luxury Pedicure Gel Polish', 349.00, 'Deluxe pedicure with gel polish application', 75, 'Nails & Foot'),
(14, 'Classic Foot Spa', 299.00, 'Relaxing foot soak with massage and basic care', 45, 'Nails & Foot'),
(15, 'Premium Foot Spa with Whitening', 499.00, 'Advanced foot treatment with whitening effects', 90, 'Nails & Foot'),
(16, 'Hair Rebond', 999.00, 'Chemical straightening treatment for frizzy hair', 180, 'Hair Treatments'),
(17, 'Hair Botox Treatment', 999.00, 'Deep conditioning treatment that repairs damaged hair', 120, 'Hair Treatments'),
(18, 'Brazilian Blowout', 799.00, 'Smoothing treatment that reduces frizz', 150, 'Hair Treatments'),
(19, 'Hair Detox Treatment', 499.00, 'Removes product buildup and impurities from hair', 60, 'Hair Treatments'),
(21, 'Hair Cellophane', 399.00, 'Semi-permanent color treatment with conditioning', 90, 'Hair Treatments'),
(22, 'Hair Spa', 399.00, 'Relaxing hair and scalp treatment with massage', 60, 'Hair Treatments'),
(23, 'Haircolor', 599.00, 'Professional hair coloring service', 120, 'Basic Hair Services'),
(24, 'Haircut/Style', 150.00, 'Custom haircut and styling', 45, 'Basic Hair Services'),
(25, 'Hair Iron', 200.00, 'Professional straightening/ironing service', 60, 'Basic Hair Services'),
(26, 'Top Highlights', 599.00, 'Partial highlighting for dimension', 90, 'Basic Hair Services'),
(27, 'Classic Balayage', 1499.00, 'Hand-painted highlighting technique', 180, 'Basic Hair Services'),
(28, '3D Balayage', 2499.00, 'Advanced dimensional balayage technique', 210, 'Basic Hair Services'),
(29, 'Hair Bleaching', 599.00, 'Lightening service for dark hair', 120, 'Basic Hair Services'),
(30, 'Hair Protein Straight Bond (Short)', 1999.00, 'Advanced straightening treatment for short hair', 150, 'Hair Treatments'),
(31, 'Eyebag Treatment', 399.00, NULL, 30, 'Special Treatments'),
(32, 'Melasma Treatment PS', 999.00, NULL, 45, 'Special Treatments'),
(33, 'Scar Treatment PS', 999.00, NULL, 45, 'Special Treatments'),
(34, 'Body Massage', 499.00, NULL, 60, 'Body & Relaxing Services'),
(35, 'Moisturizing Body Scrub', 799.00, NULL, 60, 'Body & Relaxing Services'),
(36, 'Body Whitening Mask', 1499.00, NULL, 60, 'Body & Relaxing Services'),
(37, 'Black Doll Carbon Peel Laser', 999.00, NULL, 45, 'Laser Treatment Services'),
(38, 'Pico Laser', 999.00, NULL, 45, 'Laser Treatment Services'),
(39, 'Leg Carbon Peel Laser', 999.00, NULL, 60, 'Laser Treatment Services'),
(40, 'Cauterization Services Warts/Milia/Syringoma Removal', 999.00, NULL, NULL, 'Laser Treatment Services'),
(41, 'Tattoo Removal Price Starts', 499.00, NULL, NULL, 'Laser Treatment Services'),
(42, 'Eyelash Extension Natural Look', 299.00, NULL, 60, 'Lashes & Brows Services'),
(43, 'Eyelash Extension Volume Look', 599.00, NULL, 75, 'Lashes & Brows Services'),
(44, 'Eyelash Extension Cat-Eye Look', 699.00, NULL, 75, 'Lashes & Brows Services'),
(45, 'Eyelash Perming', 199.00, NULL, 30, 'Lashes & Brows Services'),
(46, 'Eyelash Perming With Tint', 299.00, NULL, 45, 'Lashes & Brows Services'),
(47, 'Eyebrow Threading', 99.00, NULL, 15, 'Lashes & Brows Services'),
(48, 'Cystic Pimple Injection', 99.00, NULL, 15, 'Medical Procedure Services'),
(49, 'Sclerotherapy', 1899.00, NULL, 60, 'Medical Procedure Services'),
(50, 'Keloid Removal', 999.00, NULL, 30, 'Medical Procedure Services'),
(51, 'Sweatox', 149.00, NULL, 15, 'Medical Procedure Services'),
(52, 'Barbie Arms Botox', 149.00, NULL, 30, 'Medical Procedure Services'),
(53, 'Jawtox', 149.00, NULL, 30, 'Medical Procedure Services'),
(54, 'Facial Botox', 149.00, NULL, 30, 'Medical Procedure Services'),
(55, 'Traptox', 149.00, NULL, 30, 'Medical Procedure Services'),
(56, 'Glow Drip', 899.00, NULL, 45, 'Glutha Drip & Push Services'),
(57, 'Melasma Drip', 1199.00, NULL, 45, 'Glutha Drip & Push Services'),
(58, 'Sakura Drip', 1299.00, NULL, 45, 'Glutha Drip & Push Services'),
(59, 'Cinderella Drip', 1399.00, NULL, 45, 'Glutha Drip & Push Services'),
(60, 'Hikari Drip', 1799.00, NULL, 45, 'Glutha Drip & Push Services'),
(61, 'Glow Push', 499.00, NULL, 30, 'Glutha Drip & Push Services'),
(62, 'Collagen', 499.00, NULL, NULL, 'Glutha Drip & Push Services'),
(63, 'Stemcell', 499.00, NULL, NULL, 'Glutha Drip & Push Services'),
(64, 'B-Complex', 499.00, NULL, NULL, 'Glutha Drip & Push Services'),
(65, 'Placenta', 499.00, NULL, NULL, 'Glutha Drip & Push Services'),
(66, 'L-Carnitine', 599.00, NULL, NULL, 'Glutha Drip & Push Services'),
(67, 'UA Wax', 99.00, NULL, 15, 'Underarm Services'),
(68, 'UA Whitening', 99.00, NULL, 20, 'Underarm Services'),
(69, 'UA IPL', 199.00, NULL, 20, 'Underarm Services'),
(70, 'UA Carbon Peel Laser', 799.00, NULL, NULL, 'Underarm Services'),
(71, 'Brazilian Wax Women', 599.00, NULL, 45, 'Intimate Area Services'),
(72, 'Brazilian Wax Men', 799.00, NULL, 60, 'Intimate Area Services'),
(73, 'Bikini Whitening', 499.00, NULL, 30, 'Intimate Area Services'),
(74, 'Bikini Carbon Peel Laser', 999.00, NULL, 45, 'Intimate Area Services'),
(75, 'Butt Whitening', 499.00, NULL, 30, 'Intimate Area Services'),
(76, 'Butt Carbon', 1499.00, NULL, 60, 'Intimate Area Services'),
(77, 'Vajacial Women', 699.00, NULL, 45, 'Intimate Area Services'),
(78, 'Vajacial Men', 799.00, NULL, 60, 'Intimate Area Services'),
(79, 'Mustache Wax (Up & Down)', 499.00, NULL, NULL, 'Waxing Services'),
(80, 'Whole Leg Wax', 999.00, NULL, 60, 'Waxing Services'),
(81, 'Half Leg Wax', 599.00, NULL, 30, 'Waxing Services'),
(82, '24k Gold Mask Facial', 99.00, NULL, 30, 'Facial Services'),
(83, 'Diamond Peel', 99.00, NULL, 30, 'Facial Services'),
(84, 'Facial With Diamond Peel', 198.00, NULL, 45, 'Facial Services'),
(85, 'Hydrafacial', 499.00, NULL, 45, 'Facial Services'),
(86, 'Acne/Pimple Microlaser', 499.00, NULL, 30, 'Facial Services'),
(87, 'RF Face Contouring', 149.00, NULL, 30, 'Facial Services'),
(88, 'Lipo Cavitation', 149.00, NULL, 30, 'Facial Services'),
(89, 'Vampire PRP Treatment', 1999.00, NULL, 90, 'Microneedling Services'),
(90, 'Korean BB Glow', 999.00, NULL, 60, 'Microneedling Services'),
(91, 'Korean BB Blush', 599.00, NULL, 60, 'Microneedling Services'),
(92, '7D HIFU Ultralift', 4999.00, NULL, 90, 'Slimming Services'),
(93, 'HIFU V-Max Facelift', 1199.00, NULL, 60, 'Slimming Services'),
(94, 'HIFU Body Maxtite', 1799.00, NULL, 90, 'Slimming Services'),
(95, 'Mesolipo', 999.00, NULL, 45, 'Slimming Services'),
(96, 'EMS Slendertone', 599.00, NULL, 30, 'Slimming Services'),
(97, 'Korean Body Sculpting', 599.00, NULL, 60, 'Slimming Services'),
(98, 'Thermogenic Wrap', 599.00, NULL, 45, 'Slimming Services'),
(99, 'Sample Service ', 6969.00, NULL, 20, 'Test group 2'),
(100, 'TEST SERVICE', 695.00, NULL, 29, 'Test Group'),
(101, 'Test service 2', 569.00, NULL, 20, 'Test Group'),
(102, 'Test Service 3', 690.00, NULL, 69, 'Test Group'),
(103, 'ewfsdf', 12.00, NULL, 32, 'Test Group 3'),
(104, 'laplap', 10.00, NULL, 3, 'Test Group 3'),
(105, 'random service', 596.00, NULL, 10, 'Test Group'),
(106, 'asdasd', 123.00, NULL, 5, 'Test Group'),
(107, 'Test servicee', 123.00, NULL, 4, 'Test group 2'),
(108, 'service1', 213.00, NULL, 6, 'Test group 2');

-- --------------------------------------------------------

--
-- Table structure for table `service_groups`
--

CREATE TABLE `service_groups` (
  `group_id` int(11) NOT NULL,
  `group_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `group_type` enum('promo','discount','custom') DEFAULT 'custom'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `service_groups`
--

INSERT INTO `service_groups` (`group_id`, `group_name`, `description`, `status`, `created_at`, `updated_at`, `group_type`) VALUES
(1, 'Facial Spa + Footspa', 'Bundled Promo', 'Active', '2025-08-20 14:07:31', '2025-09-22 03:51:20', 'custom'),
(2, 'Diode Laser ', 'Diode Laser for all available parts ', 'Active', '2025-05-18 14:42:04', '2025-09-30 11:18:39', 'custom'),
(5, 'Hair Treatments', 'Hair treatments and services', 'Active', '2025-05-18 14:43:47', '2025-05-21 07:16:22', 'custom'),
(18, 'Special Treatments', 'Group for special facial and skin treatments', 'Active', '2025-06-28 03:34:34', '2025-06-28 03:34:34', 'custom'),
(19, 'Body & Relaxing Services', 'Massages and body care treatments', 'Active', '2025-06-28 03:34:34', '2025-09-10 07:40:04', 'custom'),
(20, 'Laser Treatment Services', 'Laser-based treatment options', 'Active', '2025-06-28 03:34:34', '2025-06-28 03:34:34', 'custom'),
(21, 'Lashes & Brows Services', 'Eyelash and eyebrow enhancement services', 'Active', '2025-06-28 03:34:34', '2025-06-28 03:34:34', 'custom'),
(22, 'Medical Procedure Services', 'Medical-grade skincare and cosmetic procedures', 'Active', '2025-06-28 03:34:34', '2025-06-28 03:34:34', 'custom'),
(23, 'Glutha Drip & Push Services', 'IV drip and push treatments for skin and wellness', 'Active', '2025-06-28 03:34:34', '2025-06-28 03:34:34', 'custom'),
(24, 'Underarm Services', 'Underarm waxing, whitening, and laser services', 'Active', '2025-06-28 03:34:34', '2025-06-28 03:34:34', 'custom'),
(25, 'Intimate Area Services', 'Whitening and treatment services for intimate areas', 'Active', '2025-06-28 03:34:34', '2025-06-28 03:34:34', 'custom'),
(26, 'Waxing Services', 'General waxing and hair removal services', 'Active', '2025-06-28 03:34:34', '2025-06-28 03:34:34', 'custom'),
(27, 'Facial Services', 'Various facial treatments and enhancements', 'Active', '2025-06-28 03:34:34', '2025-06-28 03:34:34', 'custom'),
(28, 'Microneedling Services', 'Microneedling and skin rejuvenation services', 'Active', '2025-06-28 03:34:34', '2025-06-28 03:34:34', 'custom'),
(29, 'Slimming Services', 'Body slimming, contouring, and sculpting treatments', 'Active', '2025-06-28 03:34:34', '2025-06-28 03:34:34', 'custom'),
(33, 'Test group 2', 'Test description 2', 'Active', '2025-09-09 07:20:47', '2025-09-09 07:20:47', 'custom'),
(41, 'Nails & Foot', 'Nail and foot care treatments', 'Active', '2025-09-29 13:46:10', '2025-09-29 13:47:28', 'custom'),
(42, 'Basic Hair Services', 'Essential haircuts, coloring, and styling', 'Active', '2025-09-29 13:46:10', '2025-09-29 13:46:10', 'custom'),
(43, 'Body Treatment', 'Standalone body treatment services', 'Active', '2025-09-29 13:46:10', '2025-09-29 13:49:07', 'custom'),
(44, 'Nail care services', '', 'Active', '2025-09-30 06:28:32', '2025-09-30 06:28:32', 'custom'),
(45, 'Test Group 3', 'test group 3\n', 'Active', '2025-09-30 06:44:42', '2025-09-30 06:44:42', 'custom'),
(46, 'Test Group', 'random testing group\n', 'Active', '2025-10-03 11:49:47', '2025-10-03 11:49:47', 'custom');

-- --------------------------------------------------------

--
-- Table structure for table `service_group_mappings`
--

CREATE TABLE `service_group_mappings` (
  `mapping_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `service_group_mappings`
--

INSERT INTO `service_group_mappings` (`mapping_id`, `group_id`, `service_id`, `sort_order`, `created_at`) VALUES
(349, 33, 99, 0, '2025-09-09 11:22:07'),
(413, 19, 34, 0, '2025-09-10 07:40:04'),
(414, 19, 36, 0, '2025-09-10 07:40:04'),
(415, 19, 35, 0, '2025-09-10 07:40:04'),
(468, 45, 103, 0, '2025-09-30 06:48:23'),
(469, 45, 104, 0, '2025-09-30 06:49:50'),
(487, 46, 106, 0, '2025-10-03 13:22:37'),
(488, 33, 107, 0, '2025-10-13 12:46:47'),
(489, 33, 108, 0, '2025-10-13 12:50:29');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `service_date` date DEFAULT NULL,
  `service_description` varchar(100) DEFAULT NULL,
  `employee_name` varchar(100) DEFAULT NULL,
  `invoice_number` varchar(20) DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `branch_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `customer_id`, `service_date`, `service_description`, `employee_name`, `invoice_number`, `total_amount`, `branch_id`, `branch_name`) VALUES
(125, 18, '2025-10-23', '3D Balayage, Hair Bleaching, Arms', 'Admin', 'INV-251023-749', 749.50, 1, 'Pabayo Gomez Street'),
(126, 19, '2025-10-25', '3D Balayage, Hair Bleaching, Classic Balayage, Brazilian', 'Angela Mae Borja', 'INV-251025-338', 3048.00, 2, 'Gingoog City'),
(127, 20, '2025-10-25', 'Full Body Massage, Body Whitening Mask, Acne/Pimple Microlaser', ' Katrina Joy Ramos', 'INV-251025-947', 1499.00, 3, 'Patag, CDO'),
(128, 17, '2025-10-25', 'Hair Bleaching, Classic Balayage, UA Diode Laser', 'Judy Navarro', 'INV-251025-610', 1248.50, 2, 'Gingoog City'),
(129, 16, '2025-10-25', 'Hair Bleaching, Cinderella Drip, Glow Drip, Hikari Drip, Acne/Pimple Microlaser, Arms', 'Bernadette L. Magturo', 'INV-251025-529', 999.00, 4, 'Manolo, Bukidnon'),
(130, 21, '2025-10-26', 'Top Highlights, Haircut/Style, Hair Iron', 'Admin', 'INV-251026-394', 949.00, 1, 'Pabayo Gomez Street');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `branch` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `branch_id` int(11) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Active',
  `role` varchar(50) DEFAULT 'receptionist'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `username`, `branch`, `email`, `password`, `created_at`, `branch_id`, `status`, `role`) VALUES
(1, 'Kaker', 'kakier', 'Pabayo Gomez Street', 'kier@gmail.com', 'kaker123', '2024-10-18 18:12:01', 1, 'Active', 'receptionist'),
(3, 'Angela Mae Borja', 'angelM', 'Gingoog City', 'angelamae@gmail.com', 'angela123', '2024-10-22 12:46:06', 2, 'Active', 'receptionist'),
(7, ' Katrina Joy Ramos', 'kjramos', 'Patag, CDO', 'kjramos@gmail.com', 'kjramos', '2025-09-25 08:18:01', 3, 'Active', 'receptionist'),
(8, 'Maria Lourdes', 'mlsantos', 'Pabayo Gomez Street', 'mlsantos@gmail.com', 'santos123', '2025-10-23 06:25:01', 1, 'Active', 'receptionist'),
(9, 'Judy Navarro', 'judyN', 'Gingoog City', 'judynavaro@gmail.com', 'judy123', '2025-10-23 06:40:04', 2, 'Active', 'receptionist'),
(10, 'Mark Anthony Villanueva', 'mavillanueva', 'Patag, CDO', 'mavillanueva@gmail.com', 'mavilla123', '2025-10-23 06:45:01', 3, 'Active', 'receptionist'),
(11, 'Bernadette L. Magturo', 'blmagturo', 'Manolo, Bukidnon', 'blmagturo@gmail.com', 'berna123', '2025-10-23 06:48:49', 4, 'Active', 'receptionist'),
(12, 'Carlo Ramon Espinosa', 'crespinosa', 'Manolo, Bukidnon', 'crespin@gmail.com', 'crespin123', '2025-10-23 06:49:36', 4, 'Active', 'receptionist'),
(16, 'KangKong', 'kangkong', 'Pabayo Gomez Street', 'kangkong@gmail.com', 'kangkong123', '2025-10-26 05:21:08', 1, 'Active', 'receptionist');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_branch_user` (`user_id`);

--
-- Indexes for table `bundles`
--
ALTER TABLE `bundles`
  ADD PRIMARY KEY (`bundle_id`);

--
-- Indexes for table `bundle_services`
--
ALTER TABLE `bundle_services`
  ADD PRIMARY KEY (`bundle_id`,`service_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customerId` (`customerId`);

--
-- Indexes for table `discounts`
--
ALTER TABLE `discounts`
  ADD PRIMARY KEY (`discount_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD KEY `branch_id` (`branch_id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`invoice_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `invoice_service`
--
ALTER TABLE `invoice_service`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_id` (`invoice_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `membership`
--
ALTER TABLE `membership`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `memberships`
--
ALTER TABLE `memberships`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `membership_logs`
--
ALTER TABLE `membership_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `membership_id` (`membership_id`);

--
-- Indexes for table `membership_services`
--
ALTER TABLE `membership_services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `membership_id` (`membership_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `branch_id` (`branch_id`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `fk_orders_customer` (`customer_id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `promos`
--
ALTER TABLE `promos`
  ADD PRIMARY KEY (`promo_id`);

--
-- Indexes for table `promo_services`
--
ALTER TABLE `promo_services`
  ADD PRIMARY KEY (`promo_id`,`service_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`role_id`,`permission_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`service_id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `service_groups`
--
ALTER TABLE `service_groups`
  ADD PRIMARY KEY (`group_id`);

--
-- Indexes for table `service_group_mappings`
--
ALTER TABLE `service_group_mappings`
  ADD PRIMARY KEY (`mapping_id`),
  ADD UNIQUE KEY `unique_group_service` (`group_id`,`service_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_branch` (`branch_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `bundles`
--
ALTER TABLE `bundles`
  MODIFY `bundle_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `discounts`
--
ALTER TABLE `discounts`
  MODIFY `discount_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `invoice_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=306;

--
-- AUTO_INCREMENT for table `invoice_service`
--
ALTER TABLE `invoice_service`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `membership`
--
ALTER TABLE `membership`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `memberships`
--
ALTER TABLE `memberships`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

--
-- AUTO_INCREMENT for table `membership_logs`
--
ALTER TABLE `membership_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=99;

--
-- AUTO_INCREMENT for table `membership_services`
--
ALTER TABLE `membership_services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1207;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=312;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `promos`
--
ALTER TABLE `promos`
  MODIFY `promo_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `service_groups`
--
ALTER TABLE `service_groups`
  MODIFY `group_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `service_group_mappings`
--
ALTER TABLE `service_group_mappings`
  MODIFY `mapping_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=490;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=131;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `branches`
--
ALTER TABLE `branches`
  ADD CONSTRAINT `fk_branch_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `bundle_services`
--
ALTER TABLE `bundle_services`
  ADD CONSTRAINT `bundle_services_ibfk_1` FOREIGN KEY (`bundle_id`) REFERENCES `bundles` (`bundle_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bundle_services_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE;

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`);

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE;

--
-- Constraints for table `invoice_service`
--
ALTER TABLE `invoice_service`
  ADD CONSTRAINT `invoice_service_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`invoice_id`);

--
-- Constraints for table `memberships`
--
ALTER TABLE `memberships`
  ADD CONSTRAINT `memberships_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `membership_logs`
--
ALTER TABLE `membership_logs`
  ADD CONSTRAINT `membership_logs_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `membership_logs_ibfk_2` FOREIGN KEY (`membership_id`) REFERENCES `memberships` (`id`);

--
-- Constraints for table `membership_services`
--
ALTER TABLE `membership_services`
  ADD CONSTRAINT `membership_services_ibfk_1` FOREIGN KEY (`membership_id`) REFERENCES `membership` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `membership_services_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`);

--
-- Constraints for table `promo_services`
--
ALTER TABLE `promo_services`
  ADD CONSTRAINT `promo_services_ibfk_1` FOREIGN KEY (`promo_id`) REFERENCES `promos` (`promo_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `promo_services_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `service_group_mappings`
--
ALTER TABLE `service_group_mappings`
  ADD CONSTRAINT `service_group_mappings_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `service_groups` (`group_id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
