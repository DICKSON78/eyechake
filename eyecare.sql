-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 01, 2023 at 10:30 AM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 8.1.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `eyecare_meb`
--

-- --------------------------------------------------------

--
-- Table structure for table `clinic_details`
--

CREATE TABLE `clinic_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clinic_details`
--

INSERT INTO `clinic_details` (`id`, `name`, `phone`, `email`, `address`, `created_at`, `updated_at`) VALUES
(1, 'SmartSoft Clinic', '076855364', 'smartsoft@gmail.com', 'P. O. Box 879 DSM', '2022-12-30 17:43:09', '2022-12-30 17:43:09');

-- --------------------------------------------------------

--
-- Table structure for table `consultations`
--

CREATE TABLE `consultations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `payment_cache_item_id` bigint(20) UNSIGNED NOT NULL,
  `patient_direction` enum('Direct to Doctor','Direct to Optician') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Direct to Doctor',
  `chief_complaint` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `history_present_illness` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `family_history` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `general_health` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `family_ocular_history` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `family_general_history` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pupils` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `extra_ocular_muscles` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `patient_to_return` enum('Yes','No') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'No',
  `to_return_date` date DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('Pending','Consulted') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `require_glass` enum('Yes','No') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'No',
  `sent_to_optician_at` datetime DEFAULT NULL,
  `sent_to_optician_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `consultations`
--

INSERT INTO `consultations` (`id`, `payment_cache_item_id`, `patient_direction`, `chief_complaint`, `history_present_illness`, `family_history`, `general_health`, `family_ocular_history`, `family_general_history`, `pupils`, `extra_ocular_muscles`, `patient_to_return`, `to_return_date`, `remarks`, `created_at`, `created_by`, `status`, `require_glass`, `sent_to_optician_at`, `sent_to_optician_by`, `updated_at`) VALUES
(1, 1, 'Direct to Doctor', 'Blurry vision', 'the first time', 'fh', 'gh', 'foh', 'fgh', 'pp', 'eom', 'Yes', '2023-01-20', 'proceed with ordered items', '2022-12-30 20:10:19', 1, 'Consulted', 'Yes', '2022-12-31 00:35:12', 2, '2023-04-29 22:34:25'),
(2, 3, 'Direct to Doctor', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'No', NULL, NULL, '2022-12-30 20:18:26', 1, 'Pending', 'No', NULL, NULL, '2022-12-30 20:18:26'),
(3, 7, 'Direct to Optician', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'No', NULL, NULL, '2022-12-30 22:53:56', 2, 'Consulted', 'Yes', '2022-12-31 01:53:56', 2, '2022-12-30 22:53:56'),
(5, 9, 'Direct to Optician', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'No', NULL, 'done', '2023-01-18 17:49:27', 1, 'Consulted', 'Yes', '2023-01-18 20:49:27', 1, '2023-01-19 11:22:56'),
(6, 10, 'Direct to Doctor', 'Blurry vision', 'just started', 'elders use glasses', NULL, NULL, NULL, NULL, NULL, 'No', NULL, 'apewe pgx', '2023-03-02 16:33:28', 1, 'Consulted', 'Yes', '2023-03-02 20:50:18', 1, '2023-03-02 17:50:18'),
(7, 12, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'No', NULL, 'mpe hiyo conv', '2023-03-02 16:33:49', 1, 'Consulted', 'Yes', '2023-03-02 19:38:48', 1, '2023-03-02 16:38:48'),
(8, 14, 'Direct to Doctor', 'blurry', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'No', NULL, 'test', '2023-04-25 17:56:03', 1, 'Pending', 'Yes', NULL, NULL, '2023-04-25 18:01:07');

-- --------------------------------------------------------

--
-- Table structure for table `consultation_diagnoses`
--

CREATE TABLE `consultation_diagnoses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `consultation_id` bigint(20) UNSIGNED NOT NULL,
  `disease_id` bigint(20) UNSIGNED NOT NULL,
  `diagnosis_type` enum('Preliminary','Final') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `consultation_diagnoses`
--

INSERT INTO `consultation_diagnoses` (`id`, `consultation_id`, `disease_id`, `diagnosis_type`, `created_at`, `created_by`, `updated_at`) VALUES
(1, 1, 1, 'Final', '2022-12-30 21:32:41', 2, '2022-12-30 21:32:41'),
(2, 6, 1, 'Final', '2023-03-02 17:46:54', 1, '2023-03-02 17:46:54'),
(3, 8, 1, 'Final', '2023-04-25 17:58:47', 1, '2023-04-25 17:58:47');

-- --------------------------------------------------------

--
-- Table structure for table `consultation_external_examinations`
--

CREATE TABLE `consultation_external_examinations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `consultation_id` bigint(20) UNSIGNED NOT NULL,
  `re_lid` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `re_sclera` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `re_cornea` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `re_conjuctiva` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `re_iris` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `re_pupil` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `re_lens` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `re_iop` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `le_lid` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `le_sclera` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `le_cornea` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `le_conjuctiva` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `le_iris` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `le_pupil` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `le_lens` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `le_iop` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `consultation_external_examinations`
--

INSERT INTO `consultation_external_examinations` (`id`, `consultation_id`, `re_lid`, `re_sclera`, `re_cornea`, `re_conjuctiva`, `re_iris`, `re_pupil`, `re_lens`, `re_iop`, `le_lid`, `le_sclera`, `le_cornea`, `le_conjuctiva`, `le_iris`, `le_pupil`, `le_lens`, `le_iop`, `created_at`, `created_by`, `updated_at`) VALUES
(1, 1, 'HEALTHY', 'BROWN', NULL, NULL, NULL, NULL, NULL, NULL, 'HEALTHY', 'BROWN', NULL, NULL, NULL, NULL, NULL, NULL, '2022-12-30 21:29:25', 2, '2022-12-30 21:29:53'),
(2, 6, 'HEALTHY', 'BROWN', 'HEALTHY', NULL, NULL, NULL, NULL, NULL, 'HEALTHY', 'BROWN', 'HEALTHY', NULL, NULL, NULL, NULL, NULL, '2023-03-02 17:42:31', 1, '2023-03-02 17:43:18'),
(3, 8, 'HE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'HE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-04-25 17:57:39', 1, '2023-04-25 17:57:46');

-- --------------------------------------------------------

--
-- Table structure for table `consultation_functional_tests`
--

CREATE TABLE `consultation_functional_tests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `consultation_id` bigint(20) UNSIGNED NOT NULL,
  `re_npc` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `re_npa` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `re_confrontation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `re_cover_test` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `le_npc` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `le_npa` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `le_confrontation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `le_cover_test` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `consultation_functional_tests`
--

INSERT INTO `consultation_functional_tests` (`id`, `consultation_id`, `re_npc`, `re_npa`, `re_confrontation`, `re_cover_test`, `le_npc`, `le_npa`, `le_confrontation`, `le_cover_test`, `created_at`, `created_by`, `updated_at`) VALUES
(1, 1, 'NRE', 'PRE', NULL, NULL, 'NLE', 'PLE', NULL, NULL, '2022-12-30 21:30:57', 2, '2022-12-30 21:31:12'),
(2, 8, 'npc re', NULL, NULL, NULL, 'npc le', NULL, NULL, NULL, '2023-04-25 17:57:53', 1, '2023-04-25 17:58:02');

-- --------------------------------------------------------

--
-- Table structure for table `consultation_fundoscopies`
--

CREATE TABLE `consultation_fundoscopies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `consultation_id` bigint(20) UNSIGNED NOT NULL,
  `re` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `le` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `consultation_fundoscopies`
--

INSERT INTO `consultation_fundoscopies` (`id`, `consultation_id`, `re`, `le`, `created_at`, `created_by`, `updated_at`) VALUES
(1, 1, 'FRE', 'FLE', '2022-12-30 21:32:30', 2, '2022-12-30 21:32:37'),
(2, 8, 'f re', 'f le', '2023-04-25 17:58:32', 1, '2023-04-25 17:58:38');

-- --------------------------------------------------------

--
-- Table structure for table `consultation_refractions`
--

CREATE TABLE `consultation_refractions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `consultation_id` bigint(20) UNSIGNED NOT NULL,
  `ob_re_sph` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ob_re_cyl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ob_re_axis` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ob_re_va` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ob_le_sph` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ob_le_cyl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ob_le_axis` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ob_le_va` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sub_re_sph` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sub_re_cyl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sub_re_axis` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sub_re_va` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sub_re_add` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sub_re_add_va` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sub_le_sph` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sub_le_cyl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sub_le_axis` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sub_le_va` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sub_le_add` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sub_le_add_va` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `consultation_refractions`
--

INSERT INTO `consultation_refractions` (`id`, `consultation_id`, `ob_re_sph`, `ob_re_cyl`, `ob_re_axis`, `ob_re_va`, `ob_le_sph`, `ob_le_cyl`, `ob_le_axis`, `ob_le_va`, `sub_re_sph`, `sub_re_cyl`, `sub_re_axis`, `sub_re_va`, `sub_re_add`, `sub_re_add_va`, `sub_le_sph`, `sub_le_cyl`, `sub_le_axis`, `sub_le_va`, `sub_le_add`, `sub_le_add_va`, `created_at`, `created_by`, `updated_at`) VALUES
(1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'PLANO', '2.5', '0.05', '6/9', '0.1V', NULL, 'PLANO', '2.5', '0.05', '6/9', '0.1V', NULL, '2022-12-30 21:31:37', 2, '2022-12-30 21:32:25'),
(2, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'PLANO', '0.5', NULL, NULL, NULL, NULL, 'PLANO', '0.5', NULL, NULL, NULL, NULL, '2023-01-19 11:21:45', 1, '2023-01-19 11:22:07'),
(3, 7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'PLANO', NULL, NULL, '6/6', '0.5', '6/7', 'PLANO', NULL, NULL, '6/7', '0.5', '7/7', '2023-03-02 16:35:26', 1, '2023-03-02 16:36:06'),
(4, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'PLANO', '0.5', NULL, '6/7', '1', '7/8', 'PLANO', '0.5', NULL, '6/7', '1', '7/8', '2023-03-02 17:45:21', 1, '2023-03-02 17:46:19'),
(5, 8, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'PL', '0.5', NULL, NULL, NULL, NULL, 'PL', '0.5', NULL, NULL, NULL, NULL, '2023-04-25 17:58:15', 1, '2023-04-25 17:58:30');

-- --------------------------------------------------------

--
-- Table structure for table `consultation_types`
--

CREATE TABLE `consultation_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `consultation_types`
--

INSERT INTO `consultation_types` (`id`, `name`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Pharmacy', NULL, 'Active', '2022-12-30 17:43:09', '2022-12-30 17:43:09'),
(2, 'Glass', NULL, 'Active', '2022-12-30 17:43:09', '2022-12-30 17:43:09'),
(3, 'Procedure', NULL, 'Active', '2022-12-30 17:43:09', '2022-12-30 17:43:09'),
(4, 'Others', NULL, 'Active', '2022-12-30 17:43:09', '2022-12-30 17:43:09');

-- --------------------------------------------------------

--
-- Table structure for table `consultation_visual_acuities`
--

CREATE TABLE `consultation_visual_acuities` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `consultation_id` bigint(20) UNSIGNED NOT NULL,
  `unaided_re_va` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unaided_re_ph` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unaided_ipd` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unaided_le_va` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unaided_le_ph` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `aided_re_va` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `aided_re_va_description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `aided_le_va` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `aided_le_va_description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `consultation_visual_acuities`
--

INSERT INTO `consultation_visual_acuities` (`id`, `consultation_id`, `unaided_re_va`, `unaided_re_ph`, `unaided_ipd`, `unaided_le_va`, `unaided_le_ph`, `aided_re_va`, `aided_re_va_description`, `aided_le_va`, `aided_le_va_description`, `created_at`, `created_by`, `updated_at`) VALUES
(1, 1, '6/9', NULL, NULL, '6/9', NULL, '7/9', NULL, '8/9', NULL, '2022-12-30 21:27:28', 2, '2022-12-30 21:27:45'),
(2, 6, '6/7', NULL, NULL, '6/7', NULL, '7/7', NULL, '7/8', NULL, '2023-03-02 17:41:49', 1, '2023-03-02 17:42:03'),
(3, 8, '6/6', NULL, NULL, '6/7', NULL, '7/7', NULL, '7/8', NULL, '2023-04-25 17:57:20', 1, '2023-04-25 17:57:33');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Administration', NULL, 'Active', '2022-12-30 17:49:42', '2022-12-30 23:53:00'),
(2, 'Finance', NULL, 'Active', '2022-12-30 17:49:51', '2022-12-30 17:49:51'),
(3, 'IT', NULL, 'Active', '2022-12-30 17:50:00', '2022-12-30 17:50:00');

-- --------------------------------------------------------

--
-- Table structure for table `diseases`
--

CREATE TABLE `diseases` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `diseases`
--

INSERT INTO `diseases` (`id`, `name`, `code`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Myopia', 'A01', 'Active', '2022-12-30 18:53:19', '2022-12-30 18:54:26'),
(2, 'Cataract', 'A02', 'Active', '2022-12-30 18:53:28', '2022-12-30 18:54:18'),
(3, 'Glaucoma', 'A03', 'Active', '2022-12-30 18:53:39', '2022-12-30 18:54:09'),
(4, 'Diabetic Retinopathy', 'A04', 'Active', '2022-12-30 18:54:02', '2022-12-30 18:54:02');

-- --------------------------------------------------------

--
-- Table structure for table `districts`
--

CREATE TABLE `districts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `region_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `districts`
--

INSERT INTO `districts` (`id`, `name`, `region_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Kinondoni', 1, 'Active', '2022-12-30 19:34:34', '2022-12-30 19:34:34'),
(2, 'Ilala', 1, 'Active', '2022-12-30 19:35:46', '2022-12-30 19:35:46');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `middle_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_id` bigint(20) UNSIGNED DEFAULT NULL,
  `job_title_id` bigint(20) UNSIGNED DEFAULT NULL,
  `employee_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('Male','Female') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `national_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `first_name`, `middle_name`, `last_name`, `department_id`, `job_title_id`, `employee_number`, `date_of_birth`, `gender`, `national_id`, `phone`, `user_id`, `created_at`, `created_by`, `status`, `updated_at`) VALUES
(1, 'Joseph', 'W', 'Mashauri', 1, 2, '1', '2003-12-04', 'Male', NULL, '0757206864', 2, '2022-12-30 17:51:30', 1, 'Active', '2022-12-30 17:51:54'),
(2, 'Anna', NULL, 'Mnzava', 2, 1, '2', NULL, 'Female', NULL, NULL, 3, '2022-12-30 17:53:26', 1, 'Active', '2022-12-30 17:53:27');

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `total_amount` double UNSIGNED NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expense_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`id`, `category_id`, `total_amount`, `description`, `expense_date`, `created_at`, `created_by`, `updated_at`) VALUES
(1, 2, 20000, 'Umeme na maji', '2022-12-31', '2022-12-30 22:59:21', 2, '2022-12-30 22:59:21'),
(2, 1, 20000, 'Site visit', '2023-03-02', '2023-03-02 14:35:57', 1, '2023-03-02 14:35:57');

-- --------------------------------------------------------

--
-- Table structure for table `expense_categories`
--

CREATE TABLE `expense_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `expense_categories`
--

INSERT INTO `expense_categories` (`id`, `name`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Transport', NULL, 'Active', '2022-12-30 18:45:04', '2022-12-30 18:45:04'),
(2, 'Bills', NULL, 'Active', '2022-12-30 18:45:14', '2022-12-30 18:45:14'),
(3, 'Employee Salaries', NULL, 'Active', '2022-12-30 18:45:28', '2022-12-30 18:45:28');

-- --------------------------------------------------------

--
-- Table structure for table `expense_payments`
--

CREATE TABLE `expense_payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `expense_id` bigint(20) UNSIGNED NOT NULL,
  `amount` double UNSIGNED NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `expense_payments`
--

INSERT INTO `expense_payments` (`id`, `expense_id`, `amount`, `description`, `created_at`, `created_by`, `updated_at`) VALUES
(1, 1, 15000, NULL, '2022-12-30 22:59:21', 2, '2023-03-02 13:40:08'),
(2, 2, 1000, 'Advance', '2023-03-02 14:36:20', 1, '2023-03-02 14:36:20');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `item_type_id` bigint(20) UNSIGNED DEFAULT NULL,
  `consultation_type_id` bigint(20) UNSIGNED DEFAULT NULL,
  `unit_of_measure_id` bigint(20) UNSIGNED DEFAULT NULL,
  `lens_type_id` bigint(20) UNSIGNED DEFAULT NULL,
  `is_consultation_item` enum('Yes','No') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'No',
  `is_stock_item` enum('Yes','No') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'No',
  `balance` double DEFAULT NULL,
  `unit_buying_price` double UNSIGNED DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `name`, `code`, `item_type_id`, `consultation_type_id`, `unit_of_measure_id`, `lens_type_id`, `is_consultation_item`, `is_stock_item`, `balance`, `unit_buying_price`, `status`, `created_at`, `updated_at`) VALUES
(1, 'General Consultation - New', 'GC', 5, 4, NULL, NULL, 'Yes', 'No', NULL, NULL, 'Active', '2022-12-30 18:55:33', '2022-12-30 18:55:33'),
(2, 'General Consultation - Return', 'GR', 5, 4, NULL, NULL, 'Yes', 'No', NULL, NULL, 'Active', '2022-12-30 19:00:25', '2022-12-30 19:00:25'),
(3, 'Aciclovir eye ointment', NULL, 2, 1, 5, NULL, 'No', 'Yes', 57, 2000, 'Active', '2022-12-30 19:01:07', '2023-03-02 16:39:55'),
(4, 'Fluorometholone eye drops for inflammation (FML)', NULL, 2, 1, 4, NULL, 'No', 'Yes', 148, 500, 'Active', '2022-12-30 19:01:36', '2022-12-30 19:53:19'),
(5, 'Eye Cleansing', NULL, 1, 3, NULL, NULL, 'No', 'No', NULL, NULL, 'Active', '2022-12-30 19:02:06', '2022-12-30 19:02:06'),
(6, 'RE CONV (02 - 06)', NULL, 3, 2, 3, 1, 'No', 'Yes', 32, 80000, 'Active', '2022-12-30 19:03:27', '2023-03-02 16:39:15');

-- --------------------------------------------------------

--
-- Table structure for table `item_prices`
--

CREATE TABLE `item_prices` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `item_id` bigint(20) UNSIGNED NOT NULL,
  `payment_mode_id` bigint(20) UNSIGNED NOT NULL,
  `unit_price` double UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `item_prices`
--

INSERT INTO `item_prices` (`id`, `item_id`, `payment_mode_id`, `unit_price`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 5000, '2022-12-30 18:55:47', '2022-12-30 18:55:47'),
(2, 1, 2, 4500, '2022-12-30 18:56:00', '2022-12-30 18:56:00'),
(3, 2, 1, 0, '2022-12-30 19:56:47', '2022-12-30 19:56:47'),
(4, 2, 2, 0, '2022-12-30 19:56:52', '2022-12-30 19:56:52'),
(5, 3, 1, 2500, '2022-12-30 19:57:08', '2022-12-30 19:57:08'),
(6, 3, 2, 2500, '2022-12-30 19:57:13', '2022-12-30 19:57:13'),
(7, 4, 1, 1000, '2022-12-30 19:57:33', '2022-12-30 19:57:33'),
(8, 5, 1, 5000, '2022-12-30 19:57:49', '2022-12-30 19:57:49'),
(9, 6, 1, 100000, '2022-12-30 19:58:07', '2022-12-30 19:58:07'),
(10, 6, 2, 100000, '2022-12-30 19:58:16', '2022-12-30 19:58:16');

-- --------------------------------------------------------

--
-- Table structure for table `item_types`
--

CREATE TABLE `item_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `item_types`
--

INSERT INTO `item_types` (`id`, `name`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Service', 'Serviced Item', 'Active', '2022-12-30 17:43:09', '2022-12-30 17:43:09'),
(2, 'Pharmaceutical', 'Pharmaceutical and Consumable Item', 'Active', '2022-12-30 17:43:09', '2022-12-30 17:43:09'),
(3, 'Lens', 'Lens Item', 'Active', '2022-12-30 17:43:09', '2022-12-30 17:43:09'),
(4, 'Frame', 'Frame Item', 'Active', '2022-12-30 17:43:09', '2022-12-30 17:43:09'),
(5, 'Others', 'Other Item', 'Active', '2022-12-30 17:43:09', '2022-12-30 17:43:09');

-- --------------------------------------------------------

--
-- Table structure for table `job_titles`
--

CREATE TABLE `job_titles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `job_titles`
--

INSERT INTO `job_titles` (`id`, `name`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Receptionist', NULL, 'Active', '2022-12-30 17:43:09', '2022-12-30 17:43:09'),
(2, 'Doctor', NULL, 'Active', '2022-12-30 17:43:09', '2022-12-30 17:43:09'),
(3, 'Cashier', NULL, 'Active', '2022-12-30 17:43:09', '2022-12-30 17:43:09'),
(4, 'Director', NULL, 'Active', '2022-12-30 18:45:49', '2022-12-30 18:45:49');

-- --------------------------------------------------------

--
-- Table structure for table `lens_types`
--

CREATE TABLE `lens_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lens_types`
--

INSERT INTO `lens_types` (`id`, `name`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'BLUECUT', NULL, 'Active', '2022-12-30 18:46:29', '2022-12-30 18:46:29'),
(2, 'NONPP', NULL, 'Active', '2022-12-30 18:46:43', '2022-12-30 18:46:43'),
(3, 'PGX', NULL, 'Active', '2022-12-30 18:46:51', '2022-12-30 18:46:51'),
(4, 'Special Lens', NULL, 'Active', '2022-12-30 18:47:04', '2022-12-30 18:47:04');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` bigint(20) UNSIGNED DEFAULT NULL,
  `api_response` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `message`, `phone`, `patient_id`, `api_response`, `created_at`, `updated_at`) VALUES
(1, 'Habari Husna. Tunakushukuru kwa kuja kupata huduma yetu. Ni matumaini yetu umefurahia huduma zetu. Asante na karibu tena.', '0678660192', 4, '{\"successful\":true,\"request_id\":58994516,\"code\":100,\"message\":\"Message Submitted Successfully\",\"valid\":1,\"invalid\":0,\"duplicates\":0}', '2022-12-30 21:35:15', '2022-12-30 21:35:15'),
(2, 'Habari Eric. Tunakushukuru kwa kuja kupata huduma yetu. Ni matumaini yetu umefurahia huduma zetu. Asante na karibu tena.', '0757206864', 3, '{\"successful\":true,\"request_id\":66245910,\"code\":100,\"message\":\"Message Submitted Successfully\",\"valid\":1,\"invalid\":0,\"duplicates\":0}', '2023-03-02 17:48:15', '2023-03-02 17:48:15');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2019_08_19_000000_create_failed_jobs_table', 1),
(2, '2019_12_13_011621_create_departments_table', 1),
(3, '2019_12_13_214055_create_job_titles_table', 1),
(4, '2019_12_14_000000_create_users_table', 1),
(5, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(6, '2022_10_01_124022_create_user_privileges_table', 1),
(7, '2022_10_01_225631_create_employees_table', 1),
(8, '2022_10_02_164329_create_clinic_details_table', 1),
(9, '2022_10_04_131748_create_consultation_types_table', 1),
(10, '2022_10_04_131820_create_payment_modes_table', 1),
(11, '2022_10_04_131827_create_payment_channels_table', 1),
(12, '2022_10_04_131904_create_units_of_measure_table', 1),
(13, '2022_10_04_131939_create_item_types_table', 1),
(14, '2022_10_04_131941_create_lens_types_table', 1),
(15, '2022_10_04_132058_create_items_table', 1),
(16, '2022_10_04_133517_create_item_prices_table', 1),
(17, '2022_10_06_001959_create_regions_table', 1),
(18, '2022_10_06_002041_create_districts_table', 1),
(19, '2022_10_06_002056_create_wards_table', 1),
(20, '2022_10_06_002114_create_diseases_table', 1),
(21, '2022_10_06_002141_create_patients_table', 1),
(22, '2022_10_06_004840_create_patient_check_ins_table', 1),
(23, '2022_10_06_234714_create_patient_payment_cache_table', 1),
(24, '2022_10_06_234856_create_patient_payment_cache_items_table', 1),
(25, '2022_10_14_001956_create_patient_item_payments_table', 1),
(26, '2022_10_14_184035_create_patient_item_bills_table', 1),
(27, '2022_10_14_185525_create_patient_item_bill_payments_table', 1),
(28, '2022_10_15_233352_create_consultations_table', 1),
(29, '2022_10_17_144145_create_consultation_diagnoses_table', 1),
(30, '2022_10_19_121932_create_consultation_external_examinations_table', 1),
(31, '2022_10_19_122149_create_consultation_functional_tests_table', 1),
(32, '2022_10_19_122949_create_consultation_visual_acuities_table', 1),
(33, '2022_10_19_123031_create_consultation_refractions_table', 1),
(34, '2022_10_19_123049_create_consultation_fundoscopies_table', 1),
(35, '2022_11_01_183546_create_stocktakes_table', 1),
(36, '2022_11_01_183713_create_stocktake_items_table', 1),
(37, '2022_11_03_213309_create_expense_categories_table', 1),
(38, '2022_11_03_213354_create_expenses_table', 1),
(39, '2022_11_14_153812_create_preferences_table', 1),
(40, '2022_11_14_155613_create_messages_table', 1),
(41, '2022_10_15_233356_update_consultations_table', 2),
(42, '2022_11_10_231753_create_expense_payments_table', 2),
(43, '2022_11_10_233356_update_expenses_table', 2),
(44, '2023_04_30_000913_update_consultations_table', 3);

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `middle_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` enum('Male','Female') COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `region_id` bigint(20) UNSIGNED DEFAULT NULL,
  `district_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ward_id` bigint(20) UNSIGNED DEFAULT NULL,
  `national_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `occupation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_mode_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `first_name`, `middle_name`, `last_name`, `gender`, `date_of_birth`, `region_id`, `district_id`, `ward_id`, `national_id`, `phone`, `occupation`, `payment_mode_id`, `created_at`, `created_by`, `updated_at`) VALUES
(1, 'Paul', NULL, 'Rudiger', 'Male', '1996-12-30', 1, 2, 6, NULL, '0757206864', NULL, 1, '2022-12-30 19:38:29', 1, '2022-12-30 19:38:29'),
(2, 'Amina', NULL, 'Shaaban', 'Female', '2003-12-30', 1, 1, 1, NULL, '0678660192', NULL, 2, '2022-12-30 19:39:29', 1, '2022-12-30 19:39:29'),
(3, 'Eric', NULL, 'Msodoki', 'Male', NULL, 1, 1, 2, NULL, '0757206864', NULL, 1, '2022-12-30 19:40:37', 1, '2022-12-30 19:40:37'),
(4, 'Husna', NULL, 'Abdul', 'Female', '1988-09-17', 1, 2, 7, NULL, '0678660192', NULL, 1, '2022-12-30 19:41:41', 1, '2022-12-30 19:41:41');

-- --------------------------------------------------------

--
-- Table structure for table `patient_check_ins`
--

CREATE TABLE `patient_check_ins` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `payment_mode_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patient_check_ins`
--

INSERT INTO `patient_check_ins` (`id`, `patient_id`, `payment_mode_id`, `created_at`, `created_by`, `updated_at`) VALUES
(1, 4, 1, '2022-12-30 20:00:51', 1, '2022-12-30 20:00:51'),
(2, 2, 2, '2022-12-30 20:16:34', 1, '2022-12-30 20:16:34'),
(3, 2, 2, '2022-12-30 22:53:32', 2, '2022-12-30 22:53:32'),
(4, 4, 1, '2023-01-18 17:39:33', 1, '2023-01-18 17:39:33'),
(5, 3, 1, '2023-01-18 17:49:10', 1, '2023-01-18 17:49:10'),
(6, 3, 1, '2023-03-02 16:31:42', 1, '2023-03-02 16:31:42'),
(7, 2, 2, '2023-03-02 16:32:55', 1, '2023-03-02 16:32:55'),
(8, 4, 1, '2023-04-25 17:55:39', 1, '2023-04-25 17:55:39');

-- --------------------------------------------------------

--
-- Table structure for table `patient_item_bills`
--

CREATE TABLE `patient_item_bills` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `amount` double UNSIGNED NOT NULL,
  `discount` double UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('Pending','Cleared') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `cleared_at` datetime DEFAULT NULL,
  `cleared_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `patient_item_bill_payments`
--

CREATE TABLE `patient_item_bill_payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `bill_id` bigint(20) UNSIGNED NOT NULL,
  `channel_id` bigint(20) UNSIGNED DEFAULT NULL,
  `amount` double UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `patient_item_payments`
--

CREATE TABLE `patient_item_payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `channel_id` bigint(20) UNSIGNED DEFAULT NULL,
  `amount` double UNSIGNED NOT NULL,
  `discount` double UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patient_item_payments`
--

INSERT INTO `patient_item_payments` (`id`, `channel_id`, `amount`, `discount`, `created_at`, `created_by`, `updated_at`) VALUES
(1, 1, 10000, 1000, '2022-12-30 20:10:19', 1, '2022-12-30 20:10:19'),
(2, 2, 102500, 0, '2022-12-30 21:41:06', 2, '2022-12-30 21:41:06'),
(3, 1, 0, 0, '2023-01-18 17:39:56', 1, '2023-01-18 17:39:56'),
(4, 1, 0, 0, '2023-01-18 17:46:49', 1, '2023-01-18 17:46:49'),
(5, 2, 100000, 0, '2023-01-18 17:49:27', 1, '2023-01-18 17:49:27'),
(6, 1, 5000, 0, '2023-03-02 16:33:28', 1, '2023-03-02 16:33:28'),
(7, 2, 5000, 0, '2023-04-25 17:56:02', 1, '2023-04-25 17:56:03');

-- --------------------------------------------------------

--
-- Table structure for table `patient_payment_cache`
--

CREATE TABLE `patient_payment_cache` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `check_in_id` bigint(20) UNSIGNED NOT NULL,
  `consultation_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patient_payment_cache`
--

INSERT INTO `patient_payment_cache` (`id`, `check_in_id`, `consultation_id`, `created_at`, `created_by`, `updated_at`) VALUES
(1, 1, NULL, '2022-12-30 20:00:51', 1, '2022-12-30 20:00:51'),
(2, 2, NULL, '2022-12-30 20:16:35', 1, '2022-12-30 20:16:35'),
(3, 1, 1, '2022-12-30 21:34:13', 2, '2022-12-30 21:34:13'),
(4, 3, NULL, '2022-12-30 22:53:32', 2, '2022-12-30 22:53:32'),
(5, 4, NULL, '2023-01-18 17:39:33', 1, '2023-01-18 17:39:33'),
(6, 5, 5, '2023-01-18 17:49:10', 1, '2023-01-18 17:49:27'),
(7, 6, NULL, '2023-03-02 16:31:43', 1, '2023-03-02 16:31:43'),
(8, 7, 7, '2023-03-02 16:32:55', 1, '2023-03-02 16:33:49'),
(9, 6, 6, '2023-03-02 17:49:41', 1, '2023-03-02 17:49:41'),
(10, 8, NULL, '2023-04-25 17:55:39', 1, '2023-04-25 17:55:39');

-- --------------------------------------------------------

--
-- Table structure for table `patient_payment_cache_items`
--

CREATE TABLE `patient_payment_cache_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `payment_cache_id` bigint(20) UNSIGNED NOT NULL,
  `item_id` bigint(20) UNSIGNED NOT NULL,
  `consultation_type_id` bigint(20) UNSIGNED NOT NULL,
  `consultant_id` bigint(20) UNSIGNED DEFAULT NULL,
  `payment_mode_id` bigint(20) UNSIGNED NOT NULL,
  `unit_price` double UNSIGNED NOT NULL,
  `quantity` double UNSIGNED NOT NULL,
  `item_payment_id` bigint(20) UNSIGNED DEFAULT NULL,
  `bill_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `dosage` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comments` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Pending','Paid','Billed','Served') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `served_at` datetime DEFAULT NULL,
  `served_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patient_payment_cache_items`
--

INSERT INTO `patient_payment_cache_items` (`id`, `payment_cache_id`, `item_id`, `consultation_type_id`, `consultant_id`, `payment_mode_id`, `unit_price`, `quantity`, `item_payment_id`, `bill_id`, `created_at`, `created_by`, `dosage`, `comments`, `status`, `served_at`, `served_by`, `updated_at`) VALUES
(1, 1, 1, 4, 1, 1, 5000, 1, 1, NULL, '2022-12-30 20:00:51', 1, NULL, NULL, 'Served', '2022-12-31 01:42:38', 1, '2022-12-30 22:42:38'),
(2, 1, 5, 3, NULL, 1, 5000, 1, 1, NULL, '2022-12-30 20:00:51', 1, NULL, 'went well', 'Served', '2022-12-31 00:49:10', 2, '2022-12-30 21:49:10'),
(3, 2, 1, 4, 1, 2, 4500, 1, NULL, NULL, '2022-12-30 20:16:35', 1, NULL, NULL, 'Paid', NULL, NULL, '2022-12-30 20:18:26'),
(4, 3, 3, 1, 1, 1, 2500, 1, 2, NULL, '2022-12-30 21:34:13', 2, 'once immediately', 'mpe hizo', 'Served', '2022-12-31 00:47:11', 2, '2022-12-30 21:47:11'),
(5, 3, 6, 2, 1, 1, 100000, 1, 2, NULL, '2022-12-30 21:38:37', 2, NULL, 'recommended lens', 'Served', '2022-12-31 00:46:25', 2, '2022-12-30 21:46:25'),
(6, 4, 3, 1, NULL, 2, 2500, 1, NULL, NULL, '2022-12-30 22:53:32', 2, '1 per day', NULL, 'Served', '2022-12-31 01:56:01', 2, '2022-12-30 22:56:01'),
(7, 4, 6, 2, NULL, 2, 100000, 1, NULL, NULL, '2022-12-30 22:53:32', 2, NULL, 'served', 'Served', '2022-12-31 01:54:26', 2, '2022-12-30 22:54:26'),
(9, 6, 6, 2, NULL, 1, 100000, 1, 5, NULL, '2023-01-18 17:49:11', 1, NULL, 'mpe hiyo', 'Paid', NULL, NULL, '2023-01-18 17:49:27'),
(10, 7, 1, 4, 1, 1, 5000, 1, 6, NULL, '2023-03-02 16:31:43', 1, NULL, 'test', 'Served', '2023-03-02 20:48:13', 1, '2023-03-02 17:48:13'),
(11, 8, 3, 1, NULL, 2, 2500, 1, NULL, NULL, '2023-03-02 16:32:56', 1, 'tt', 'mpe abc', 'Served', '2023-03-02 19:39:55', 1, '2023-03-02 16:39:55'),
(12, 8, 6, 2, 1, 2, 100000, 1, NULL, NULL, '2023-03-02 16:32:56', 1, NULL, 'pgx', 'Served', '2023-03-02 19:39:15', 1, '2023-03-02 16:39:15'),
(13, 9, 6, 2, 1, 1, 100000, 1, NULL, NULL, '2023-03-02 17:49:42', 1, NULL, 'pgx', 'Pending', NULL, NULL, '2023-03-02 17:49:42'),
(14, 10, 1, 4, NULL, 1, 5000, 1, 7, NULL, '2023-04-25 17:55:40', 1, NULL, 'asa', 'Served', '2023-04-25 21:01:07', 1, '2023-04-25 18:01:07');

-- --------------------------------------------------------

--
-- Table structure for table `payment_channels`
--

CREATE TABLE `payment_channels` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_channels`
--

INSERT INTO `payment_channels` (`id`, `name`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Cash-on-hand', NULL, 'Active', '2022-12-30 18:44:13', '2022-12-30 18:44:13'),
(2, 'M-Pesa', NULL, 'Active', '2022-12-30 18:44:23', '2022-12-30 18:44:23'),
(3, 'TigoPesa', NULL, 'Active', '2022-12-30 18:44:32', '2022-12-30 18:44:32'),
(4, 'Airtel Money', NULL, 'Active', '2022-12-30 18:44:45', '2022-12-30 18:44:45');

-- --------------------------------------------------------

--
-- Table structure for table `payment_modes`
--

CREATE TABLE `payment_modes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_type` enum('Cash','Credit') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_modes`
--

INSERT INTO `payment_modes` (`id`, `name`, `description`, `transaction_type`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Cash', NULL, 'Cash', 'Active', '2022-12-30 17:43:09', '2022-12-30 17:43:09'),
(2, 'NHIF', NULL, 'Credit', 'Active', '2022-12-30 17:54:57', '2022-12-30 20:17:28'),
(3, 'Jubilee Insurance', NULL, 'Cash', 'Active', '2022-12-30 17:55:19', '2022-12-30 17:55:19');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 1, 'MyApp', 'b228bfab450c50d21a5915518ef81cd1592ca5c48bcbc9933296778b1ef957be', '[\"*\"]', '2022-12-30 18:47:10', NULL, '2022-12-30 17:47:28', '2022-12-30 18:47:10'),
(2, 'App\\Models\\User', 1, 'MyApp', '906d6aae32f06aa46a15859e125c52a89c69a434b674b9bdaafd268dbbcfeddb', '[\"*\"]', '2022-12-30 19:41:45', NULL, '2022-12-30 18:47:19', '2022-12-30 19:41:45'),
(3, 'App\\Models\\User', 1, 'MyApp', '9fb8173370cabd02eb3a0df1eed5d38914ceb1e6933fd9b8576844c329c15692', '[\"*\"]', '2022-12-30 20:18:36', NULL, '2022-12-30 19:49:21', '2022-12-30 20:18:36'),
(4, 'App\\Models\\User', 1, 'MyApp', '83155b65388b49d99c89f1d5994f3bd001635a0c374b54050311bc3bf5b1e967', '[\"*\"]', '2022-12-30 21:01:21', NULL, '2022-12-30 20:22:54', '2022-12-30 21:01:21'),
(5, 'App\\Models\\User', 2, 'MyApp', 'ed107605a4d6804d99767a565caee2e6f582467d2e5e1a344e748a50a3075114', '[\"*\"]', '2022-12-30 21:49:21', NULL, '2022-12-30 21:01:51', '2022-12-30 21:49:21'),
(6, 'App\\Models\\User', 1, 'MyApp', '5c041bdc8669690e6ddb26269347f4973192e4b3b88929926d8fa4dcac49c7d5', '[\"*\"]', '2022-12-30 22:43:21', NULL, '2022-12-30 22:20:12', '2022-12-30 22:43:21'),
(7, 'App\\Models\\User', 2, 'MyApp', '61485f71c770c1afc18e5d277789b32bd169f2c6447d07de75d2a34c6489a0e2', '[\"*\"]', '2022-12-30 23:18:44', NULL, '2022-12-30 22:52:12', '2022-12-30 23:18:44'),
(8, 'App\\Models\\User', 3, 'MyApp', '1eaba3f833fd9accfd5419a731c153ba3648d6c92c472e9e10f9cd6905d7e0f8', '[\"*\"]', '2022-12-30 23:19:55', NULL, '2022-12-30 23:19:51', '2022-12-30 23:19:55'),
(9, 'App\\Models\\User', 2, 'MyApp', '1d0a7cfca3921cacc293ee7b22635a00e29ef8815b08402f06d6918c5b6576fc', '[\"*\"]', '2022-12-31 00:12:57', NULL, '2022-12-30 23:20:43', '2022-12-31 00:12:57'),
(10, 'App\\Models\\User', 1, 'MyApp', '3993311a62fd9eae4c122482502ea45a7c9a490661e232efe98a0d6b4a472f1e', '[\"*\"]', '2022-12-31 00:21:38', NULL, '2022-12-31 00:21:35', '2022-12-31 00:21:38'),
(11, 'App\\Models\\User', 1, 'MyApp', '91bdc1d570f0bb91e1dec6bb9b9af57eb8bf6a1e26e35c5c7e3781ae74953a73', '[\"*\"]', '2023-01-18 17:50:06', NULL, '2023-01-18 17:36:30', '2023-01-18 17:50:06'),
(12, 'App\\Models\\User', 1, 'MyApp', '2c6212c5de3739b54f0a4792e8399d8c9f7915718d714bfba7ef34125c17dc56', '[\"*\"]', '2023-01-18 18:37:59', NULL, '2023-01-18 18:35:35', '2023-01-18 18:37:59'),
(13, 'App\\Models\\User', 1, 'MyApp', 'f2201dbad619f68ceb4965eef25b5532ccc6d096a69e6f5dc56663530dc35f6c', '[\"*\"]', '2023-01-19 08:15:27', NULL, '2023-01-19 08:15:24', '2023-01-19 08:15:27'),
(14, 'App\\Models\\User', 1, 'MyApp', 'c18a4dec90e9427757ea9d4d9d90fb07a18ef8b158e050d831f2458e472c1b79', '[\"*\"]', '2023-01-19 10:34:06', NULL, '2023-01-19 10:33:52', '2023-01-19 10:34:06'),
(15, 'App\\Models\\User', 1, 'MyApp', 'b726d66789a2244cc4189b3a18e77891e3f4d3c0724f77117b462a0be4e8d1d5', '[\"*\"]', '2023-01-19 10:45:22', NULL, '2023-01-19 10:45:09', '2023-01-19 10:45:22'),
(16, 'App\\Models\\User', 1, 'MyApp', 'a639d0afc826ce49585c0234215fa231263cd45121f748cfc9e651abac9a5f00', '[\"*\"]', '2023-01-19 11:23:18', NULL, '2023-01-19 10:45:59', '2023-01-19 11:23:18'),
(17, 'App\\Models\\User', 1, 'MyApp', 'f4228341c832a2e4f565bac36c1e173bdc609ceba7f84911f2e85c0c7702841c', '[\"*\"]', '2023-03-02 14:42:25', NULL, '2023-03-02 14:15:58', '2023-03-02 14:42:25'),
(18, 'App\\Models\\User', 1, 'MyApp', '86bf47d9ca0f5f7fca762e6058a9d7d75ca6e38199535f0f54ab634a1c993f94', '[\"*\"]', '2023-03-02 16:43:15', NULL, '2023-03-02 16:30:42', '2023-03-02 16:43:15'),
(19, 'App\\Models\\User', 1, 'MyApp', '6fd4e6699f4aa1430d586d4c598d5079064d73b7fbb391b0c095107ff6bf24dd', '[\"*\"]', '2023-03-02 18:27:05', NULL, '2023-03-02 17:34:36', '2023-03-02 18:27:05'),
(20, 'App\\Models\\User', 1, 'MyApp', 'a4dd026e1a163bceab30e1df2723578f327535eef192f07e18763fe29a75b005', '[\"*\"]', '2023-03-02 18:34:57', NULL, '2023-03-02 18:34:49', '2023-03-02 18:34:57'),
(21, 'App\\Models\\User', 1, 'MyApp', '81bf84e977a6d7cdddb0830d07283e9ae3de1eb3f3613bcd686f6379bb69d2b9', '[\"*\"]', '2023-03-02 20:07:09', NULL, '2023-03-02 20:07:05', '2023-03-02 20:07:09'),
(22, 'App\\Models\\User', 1, 'MyApp', 'd856e14a72e1e61d8bc657a07dbe7a4cf06cd513c1f401a395ed537b46253d78', '[\"*\"]', '2023-04-25 18:01:11', NULL, '2023-04-25 17:55:01', '2023-04-25 18:01:11'),
(23, 'App\\Models\\User', 1, 'MyApp', '2d79b7bab890c5e7a47b727f310bd7d48dd25463cd448c32d28008763f96d2ed', '[\"*\"]', '2023-04-29 19:39:51', NULL, '2023-04-29 19:39:28', '2023-04-29 19:39:51'),
(24, 'App\\Models\\User', 1, 'MyApp', 'b437728cb7e3ff9272c8bc6decb02ac0de095b4dcc9d148eef091dc6b171bab4', '[\"*\"]', '2023-04-29 22:28:46', NULL, '2023-04-29 21:30:29', '2023-04-29 22:28:46'),
(25, 'App\\Models\\User', 1, 'MyApp', 'e75792989ee0a2dc6ea873c55ddb1175e74eff43fe3d11f446f7b9e1dffe067d', '[\"*\"]', '2023-04-29 22:58:03', NULL, '2023-04-29 22:33:25', '2023-04-29 22:58:03');

-- --------------------------------------------------------

--
-- Table structure for table `preferences`
--

CREATE TABLE `preferences` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `preferences`
--

INSERT INTO `preferences` (`key`, `value`) VALUES
('CONSULTATION_MESSAGE', 'Habari {name}. Tunakushukuru kwa kuja kupata huduma yetu. Ni matumaini yetu umefurahia huduma zetu. Asante na karibu tena.'),
('PATIENT_TO_RETURN_REMINDER_MESSAGE', 'Habari {name}. Unakumbushwa kuhudhuria appointment yako ya tarehe {date}.'),
('SEND_MESSAGES', 'Yes'),
('SEND_REMINDER_MESSAGES_AT', '11:00');

-- --------------------------------------------------------

--
-- Table structure for table `regions`
--

CREATE TABLE `regions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `regions`
--

INSERT INTO `regions` (`id`, `name`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Dar es Salaam', 'Active', '2022-12-30 19:34:21', '2022-12-30 19:34:21');

-- --------------------------------------------------------

--
-- Table structure for table `stocktakes`
--

CREATE TABLE `stocktakes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stocktakes`
--

INSERT INTO `stocktakes` (`id`, `created_at`, `created_by`, `reason`, `updated_at`) VALUES
(1, '2022-12-30 19:53:19', 1, 'Initial stocktake', '2022-12-30 19:53:19');

-- --------------------------------------------------------

--
-- Table structure for table `stocktake_items`
--

CREATE TABLE `stocktake_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `stocktake_id` bigint(20) UNSIGNED NOT NULL,
  `item_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` double UNSIGNED NOT NULL,
  `unit_buying_price` double UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stocktake_items`
--

INSERT INTO `stocktake_items` (`id`, `stocktake_id`, `item_id`, `quantity`, `unit_buying_price`, `created_at`, `updated_at`) VALUES
(1, 1, 3, 60, 2000, '2022-12-30 19:53:19', '2022-12-30 19:53:19'),
(2, 1, 4, 148, 500, '2022-12-30 19:53:19', '2022-12-30 19:53:19'),
(3, 1, 6, 35, 80000, '2022-12-30 19:53:20', '2022-12-30 19:53:20');

-- --------------------------------------------------------

--
-- Table structure for table `units_of_measure`
--

CREATE TABLE `units_of_measure` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `units_of_measure`
--

INSERT INTO `units_of_measure` (`id`, `name`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'mg', NULL, 'Active', '2022-12-30 17:43:09', '2022-12-30 17:43:09'),
(2, 'Btl', NULL, 'Active', '2022-12-30 17:43:09', '2022-12-30 17:43:09'),
(3, 'PC', NULL, 'Active', '2022-12-30 17:43:09', '2022-12-30 17:43:09'),
(4, 'Drops', NULL, 'Active', '2022-12-30 17:43:09', '2022-12-30 17:43:09'),
(5, 'Tube', NULL, 'Active', '2022-12-30 17:43:09', '2022-12-30 17:43:09'),
(6, 'Kit', NULL, 'Active', '2022-12-30 17:43:09', '2022-12-30 17:43:09'),
(7, 'Box', NULL, 'Active', '2022-12-30 17:43:09', '2022-12-30 17:43:09'),
(8, 'Ltr', NULL, 'Active', '2022-12-30 17:43:09', '2022-12-30 17:43:09'),
(9, 'Cap', NULL, 'Active', '2022-12-30 17:43:09', '2022-12-30 17:43:09'),
(10, 'Tin', NULL, 'Active', '2022-12-30 17:43:09', '2022-12-30 17:43:09');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `remember_token`, `created_at`, `created_by`, `status`, `updated_at`) VALUES
(1, 'admin', '$2y$10$dz9G17Rh8nEKx9EiU8/1TuGkroYStGjGqH9BBmZJYnc7.pOzFVTv2', NULL, '2022-12-30 17:43:09', NULL, 'Active', '2022-12-30 17:43:09'),
(2, 'dev', '$2y$10$dz9G17Rh8nEKx9EiU8/1TuGkroYStGjGqH9BBmZJYnc7.pOzFVTv2', NULL, '2022-12-30 17:51:30', 1, 'Active', '2022-12-30 20:30:06'),
(3, 'anna', '$2y$10$T2LfVNP2NIneYrT1Zf0mg.b36OOyaIA7JV9KKHWFVIaKkxEn4EOTq', NULL, '2022-12-30 17:53:26', 1, 'Active', '2022-12-30 17:53:26');

-- --------------------------------------------------------

--
-- Table structure for table `user_privileges`
--

CREATE TABLE `user_privileges` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `privilege` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_privileges`
--

INSERT INTO `user_privileges` (`user_id`, `privilege`) VALUES
(1, 'dashboard'),
(1, 'reception'),
(1, 'payment_center'),
(1, 'consultation_room'),
(1, 'optician_center'),
(1, 'medicine_center'),
(1, 'procedure_room'),
(1, 'inventory_management'),
(1, 'financial_management'),
(1, 'employee_management'),
(1, 'settings'),
(3, 'dashboard'),
(3, 'reception'),
(3, 'payment_center'),
(3, 'optician_center'),
(3, 'medicine_center'),
(2, 'dashboard'),
(2, 'reception'),
(2, 'payment_center'),
(2, 'consultation_room'),
(2, 'optician_center'),
(2, 'medicine_center'),
(2, 'procedure_room'),
(2, 'employee_management'),
(2, 'financial_management'),
(2, 'inventory_management'),
(2, 'settings');

-- --------------------------------------------------------

--
-- Table structure for table `wards`
--

CREATE TABLE `wards` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `district_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wards`
--

INSERT INTO `wards` (`id`, `name`, `district_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Kijitonyama', 1, 'Active', '2022-12-30 19:34:52', '2022-12-30 19:34:52'),
(2, 'Msasani', 1, 'Active', '2022-12-30 19:35:03', '2022-12-30 19:35:03'),
(3, 'Kawe', 1, 'Active', '2022-12-30 19:35:11', '2022-12-30 19:35:11'),
(4, 'Kunduchi', 1, 'Active', '2022-12-30 19:35:20', '2022-12-30 19:35:20'),
(5, 'Bunju', 1, 'Active', '2022-12-30 19:35:29', '2022-12-30 19:35:29'),
(6, 'Magomeni', 2, 'Active', '2022-12-30 19:35:56', '2022-12-30 19:35:56'),
(7, 'Tabata Segerea', 2, 'Active', '2022-12-30 19:36:25', '2022-12-30 19:36:25');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `clinic_details`
--
ALTER TABLE `clinic_details`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `consultations`
--
ALTER TABLE `consultations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `consultations_payment_cache_item_id_foreign` (`payment_cache_item_id`),
  ADD KEY `consultations_created_by_foreign` (`created_by`),
  ADD KEY `consultations_sent_to_optician_by_foreign` (`sent_to_optician_by`);

--
-- Indexes for table `consultation_diagnoses`
--
ALTER TABLE `consultation_diagnoses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `consultation_diagnoses_consultation_id_foreign` (`consultation_id`),
  ADD KEY `consultation_diagnoses_disease_id_foreign` (`disease_id`),
  ADD KEY `consultation_diagnoses_created_by_foreign` (`created_by`);

--
-- Indexes for table `consultation_external_examinations`
--
ALTER TABLE `consultation_external_examinations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `consultation_external_examinations_consultation_id_foreign` (`consultation_id`),
  ADD KEY `consultation_external_examinations_created_by_foreign` (`created_by`);

--
-- Indexes for table `consultation_functional_tests`
--
ALTER TABLE `consultation_functional_tests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `consultation_functional_tests_consultation_id_foreign` (`consultation_id`),
  ADD KEY `consultation_functional_tests_created_by_foreign` (`created_by`);

--
-- Indexes for table `consultation_fundoscopies`
--
ALTER TABLE `consultation_fundoscopies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `consultation_fundoscopies_consultation_id_foreign` (`consultation_id`),
  ADD KEY `consultation_fundoscopies_created_by_foreign` (`created_by`);

--
-- Indexes for table `consultation_refractions`
--
ALTER TABLE `consultation_refractions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `consultation_refractions_consultation_id_foreign` (`consultation_id`),
  ADD KEY `consultation_refractions_created_by_foreign` (`created_by`);

--
-- Indexes for table `consultation_types`
--
ALTER TABLE `consultation_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `consultation_types_name_unique` (`name`);

--
-- Indexes for table `consultation_visual_acuities`
--
ALTER TABLE `consultation_visual_acuities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `consultation_visual_acuities_consultation_id_foreign` (`consultation_id`),
  ADD KEY `consultation_visual_acuities_created_by_foreign` (`created_by`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `departments_name_unique` (`name`);

--
-- Indexes for table `diseases`
--
ALTER TABLE `diseases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `diseases_name_unique` (`name`),
  ADD UNIQUE KEY `diseases_code_unique` (`code`);

--
-- Indexes for table `districts`
--
ALTER TABLE `districts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `districts_name_unique` (`name`),
  ADD KEY `districts_region_id_foreign` (`region_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employees_department_id_foreign` (`department_id`),
  ADD KEY `employees_job_title_id_foreign` (`job_title_id`),
  ADD KEY `employees_user_id_foreign` (`user_id`),
  ADD KEY `employees_created_by_foreign` (`created_by`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `expenses_category_id_foreign` (`category_id`),
  ADD KEY `expenses_created_by_foreign` (`created_by`);

--
-- Indexes for table `expense_categories`
--
ALTER TABLE `expense_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `expense_categories_name_unique` (`name`);

--
-- Indexes for table `expense_payments`
--
ALTER TABLE `expense_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `expense_payments_expense_id_foreign` (`expense_id`),
  ADD KEY `expense_payments_created_by_foreign` (`created_by`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `items_code_unique` (`code`),
  ADD KEY `items_item_type_id_foreign` (`item_type_id`),
  ADD KEY `items_consultation_type_id_foreign` (`consultation_type_id`),
  ADD KEY `items_unit_of_measure_id_foreign` (`unit_of_measure_id`),
  ADD KEY `items_lens_type_id_foreign` (`lens_type_id`);

--
-- Indexes for table `item_prices`
--
ALTER TABLE `item_prices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_prices_item_id_foreign` (`item_id`),
  ADD KEY `item_prices_payment_mode_id_foreign` (`payment_mode_id`);

--
-- Indexes for table `item_types`
--
ALTER TABLE `item_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `item_types_name_unique` (`name`);

--
-- Indexes for table `job_titles`
--
ALTER TABLE `job_titles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `job_titles_name_unique` (`name`);

--
-- Indexes for table `lens_types`
--
ALTER TABLE `lens_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lens_types_name_unique` (`name`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `messages_patient_id_foreign` (`patient_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patients_region_id_foreign` (`region_id`),
  ADD KEY `patients_district_id_foreign` (`district_id`),
  ADD KEY `patients_ward_id_foreign` (`ward_id`),
  ADD KEY `patients_payment_mode_id_foreign` (`payment_mode_id`),
  ADD KEY `patients_created_by_foreign` (`created_by`);

--
-- Indexes for table `patient_check_ins`
--
ALTER TABLE `patient_check_ins`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_check_ins_patient_id_foreign` (`patient_id`),
  ADD KEY `patient_check_ins_payment_mode_id_foreign` (`payment_mode_id`),
  ADD KEY `patient_check_ins_created_by_foreign` (`created_by`);

--
-- Indexes for table `patient_item_bills`
--
ALTER TABLE `patient_item_bills`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_item_bills_created_by_foreign` (`created_by`),
  ADD KEY `patient_item_bills_cleared_by_foreign` (`cleared_by`);

--
-- Indexes for table `patient_item_bill_payments`
--
ALTER TABLE `patient_item_bill_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_item_bill_payments_bill_id_foreign` (`bill_id`),
  ADD KEY `patient_item_bill_payments_channel_id_foreign` (`channel_id`),
  ADD KEY `patient_item_bill_payments_created_by_foreign` (`created_by`);

--
-- Indexes for table `patient_item_payments`
--
ALTER TABLE `patient_item_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_item_payments_channel_id_foreign` (`channel_id`),
  ADD KEY `patient_item_payments_created_by_foreign` (`created_by`);

--
-- Indexes for table `patient_payment_cache`
--
ALTER TABLE `patient_payment_cache`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_payment_cache_check_in_id_foreign` (`check_in_id`),
  ADD KEY `patient_payment_cache_created_by_foreign` (`created_by`);

--
-- Indexes for table `patient_payment_cache_items`
--
ALTER TABLE `patient_payment_cache_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_payment_cache_items_payment_cache_id_foreign` (`payment_cache_id`),
  ADD KEY `patient_payment_cache_items_item_id_foreign` (`item_id`),
  ADD KEY `patient_payment_cache_items_consultation_type_id_foreign` (`consultation_type_id`),
  ADD KEY `patient_payment_cache_items_consultant_id_foreign` (`consultant_id`),
  ADD KEY `patient_payment_cache_items_payment_mode_id_foreign` (`payment_mode_id`),
  ADD KEY `patient_payment_cache_items_created_by_foreign` (`created_by`),
  ADD KEY `patient_payment_cache_items_served_by_foreign` (`served_by`);

--
-- Indexes for table `payment_channels`
--
ALTER TABLE `payment_channels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_channels_name_unique` (`name`);

--
-- Indexes for table `payment_modes`
--
ALTER TABLE `payment_modes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_modes_name_unique` (`name`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `preferences`
--
ALTER TABLE `preferences`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `regions`
--
ALTER TABLE `regions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `regions_name_unique` (`name`);

--
-- Indexes for table `stocktakes`
--
ALTER TABLE `stocktakes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stocktakes_created_by_foreign` (`created_by`);

--
-- Indexes for table `stocktake_items`
--
ALTER TABLE `stocktake_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stocktake_items_stocktake_id_foreign` (`stocktake_id`),
  ADD KEY `stocktake_items_item_id_foreign` (`item_id`);

--
-- Indexes for table `units_of_measure`
--
ALTER TABLE `units_of_measure`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `units_of_measure_name_unique` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_username_unique` (`username`),
  ADD KEY `users_created_by_foreign` (`created_by`);

--
-- Indexes for table `user_privileges`
--
ALTER TABLE `user_privileges`
  ADD KEY `user_privileges_user_id_foreign` (`user_id`);

--
-- Indexes for table `wards`
--
ALTER TABLE `wards`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `wards_name_unique` (`name`),
  ADD KEY `wards_district_id_foreign` (`district_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `clinic_details`
--
ALTER TABLE `clinic_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `consultations`
--
ALTER TABLE `consultations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `consultation_diagnoses`
--
ALTER TABLE `consultation_diagnoses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `consultation_external_examinations`
--
ALTER TABLE `consultation_external_examinations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `consultation_functional_tests`
--
ALTER TABLE `consultation_functional_tests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `consultation_fundoscopies`
--
ALTER TABLE `consultation_fundoscopies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `consultation_refractions`
--
ALTER TABLE `consultation_refractions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `consultation_types`
--
ALTER TABLE `consultation_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `consultation_visual_acuities`
--
ALTER TABLE `consultation_visual_acuities`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `diseases`
--
ALTER TABLE `diseases`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `districts`
--
ALTER TABLE `districts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `expense_categories`
--
ALTER TABLE `expense_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `expense_payments`
--
ALTER TABLE `expense_payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `item_prices`
--
ALTER TABLE `item_prices`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `item_types`
--
ALTER TABLE `item_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `job_titles`
--
ALTER TABLE `job_titles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `lens_types`
--
ALTER TABLE `lens_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `patient_check_ins`
--
ALTER TABLE `patient_check_ins`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `patient_item_bills`
--
ALTER TABLE `patient_item_bills`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `patient_item_bill_payments`
--
ALTER TABLE `patient_item_bill_payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `patient_item_payments`
--
ALTER TABLE `patient_item_payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `patient_payment_cache`
--
ALTER TABLE `patient_payment_cache`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `patient_payment_cache_items`
--
ALTER TABLE `patient_payment_cache_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `payment_channels`
--
ALTER TABLE `payment_channels`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `payment_modes`
--
ALTER TABLE `payment_modes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `regions`
--
ALTER TABLE `regions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `stocktakes`
--
ALTER TABLE `stocktakes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `stocktake_items`
--
ALTER TABLE `stocktake_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `units_of_measure`
--
ALTER TABLE `units_of_measure`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `wards`
--
ALTER TABLE `wards`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `consultations`
--
ALTER TABLE `consultations`
  ADD CONSTRAINT `consultations_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `consultations_payment_cache_item_id_foreign` FOREIGN KEY (`payment_cache_item_id`) REFERENCES `patient_payment_cache_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `consultations_sent_to_optician_by_foreign` FOREIGN KEY (`sent_to_optician_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `consultation_diagnoses`
--
ALTER TABLE `consultation_diagnoses`
  ADD CONSTRAINT `consultation_diagnoses_consultation_id_foreign` FOREIGN KEY (`consultation_id`) REFERENCES `consultations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `consultation_diagnoses_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `consultation_diagnoses_disease_id_foreign` FOREIGN KEY (`disease_id`) REFERENCES `diseases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `consultation_external_examinations`
--
ALTER TABLE `consultation_external_examinations`
  ADD CONSTRAINT `consultation_external_examinations_consultation_id_foreign` FOREIGN KEY (`consultation_id`) REFERENCES `consultations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `consultation_external_examinations_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `consultation_functional_tests`
--
ALTER TABLE `consultation_functional_tests`
  ADD CONSTRAINT `consultation_functional_tests_consultation_id_foreign` FOREIGN KEY (`consultation_id`) REFERENCES `consultations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `consultation_functional_tests_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `consultation_fundoscopies`
--
ALTER TABLE `consultation_fundoscopies`
  ADD CONSTRAINT `consultation_fundoscopies_consultation_id_foreign` FOREIGN KEY (`consultation_id`) REFERENCES `consultations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `consultation_fundoscopies_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `consultation_refractions`
--
ALTER TABLE `consultation_refractions`
  ADD CONSTRAINT `consultation_refractions_consultation_id_foreign` FOREIGN KEY (`consultation_id`) REFERENCES `consultations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `consultation_refractions_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `consultation_visual_acuities`
--
ALTER TABLE `consultation_visual_acuities`
  ADD CONSTRAINT `consultation_visual_acuities_consultation_id_foreign` FOREIGN KEY (`consultation_id`) REFERENCES `consultations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `consultation_visual_acuities_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `districts`
--
ALTER TABLE `districts`
  ADD CONSTRAINT `districts_region_id_foreign` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `employees_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `employees_job_title_id_foreign` FOREIGN KEY (`job_title_id`) REFERENCES `job_titles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `employees_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `expenses_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `expense_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `expense_payments`
--
ALTER TABLE `expense_payments`
  ADD CONSTRAINT `expense_payments_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `expense_payments_expense_id_foreign` FOREIGN KEY (`expense_id`) REFERENCES `expenses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `items_consultation_type_id_foreign` FOREIGN KEY (`consultation_type_id`) REFERENCES `consultation_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `items_item_type_id_foreign` FOREIGN KEY (`item_type_id`) REFERENCES `item_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `items_lens_type_id_foreign` FOREIGN KEY (`lens_type_id`) REFERENCES `lens_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `items_unit_of_measure_id_foreign` FOREIGN KEY (`unit_of_measure_id`) REFERENCES `units_of_measure` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `item_prices`
--
ALTER TABLE `item_prices`
  ADD CONSTRAINT `item_prices_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `item_prices_payment_mode_id_foreign` FOREIGN KEY (`payment_mode_id`) REFERENCES `payment_modes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `patients`
--
ALTER TABLE `patients`
  ADD CONSTRAINT `patients_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `patients_district_id_foreign` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `patients_payment_mode_id_foreign` FOREIGN KEY (`payment_mode_id`) REFERENCES `payment_modes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `patients_region_id_foreign` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `patients_ward_id_foreign` FOREIGN KEY (`ward_id`) REFERENCES `wards` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `patient_check_ins`
--
ALTER TABLE `patient_check_ins`
  ADD CONSTRAINT `patient_check_ins_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `patient_check_ins_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `patient_check_ins_payment_mode_id_foreign` FOREIGN KEY (`payment_mode_id`) REFERENCES `payment_modes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `patient_item_bills`
--
ALTER TABLE `patient_item_bills`
  ADD CONSTRAINT `patient_item_bills_cleared_by_foreign` FOREIGN KEY (`cleared_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `patient_item_bills_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `patient_item_bill_payments`
--
ALTER TABLE `patient_item_bill_payments`
  ADD CONSTRAINT `patient_item_bill_payments_bill_id_foreign` FOREIGN KEY (`bill_id`) REFERENCES `patient_item_bills` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `patient_item_bill_payments_channel_id_foreign` FOREIGN KEY (`channel_id`) REFERENCES `payment_channels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `patient_item_bill_payments_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `patient_item_payments`
--
ALTER TABLE `patient_item_payments`
  ADD CONSTRAINT `patient_item_payments_channel_id_foreign` FOREIGN KEY (`channel_id`) REFERENCES `payment_channels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `patient_item_payments_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `patient_payment_cache`
--
ALTER TABLE `patient_payment_cache`
  ADD CONSTRAINT `patient_payment_cache_check_in_id_foreign` FOREIGN KEY (`check_in_id`) REFERENCES `patient_check_ins` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `patient_payment_cache_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `patient_payment_cache_items`
--
ALTER TABLE `patient_payment_cache_items`
  ADD CONSTRAINT `patient_payment_cache_items_consultant_id_foreign` FOREIGN KEY (`consultant_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `patient_payment_cache_items_consultation_type_id_foreign` FOREIGN KEY (`consultation_type_id`) REFERENCES `consultation_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `patient_payment_cache_items_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `patient_payment_cache_items_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `patient_payment_cache_items_payment_cache_id_foreign` FOREIGN KEY (`payment_cache_id`) REFERENCES `patient_payment_cache` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `patient_payment_cache_items_payment_mode_id_foreign` FOREIGN KEY (`payment_mode_id`) REFERENCES `payment_modes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `patient_payment_cache_items_served_by_foreign` FOREIGN KEY (`served_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `stocktakes`
--
ALTER TABLE `stocktakes`
  ADD CONSTRAINT `stocktakes_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `stocktake_items`
--
ALTER TABLE `stocktake_items`
  ADD CONSTRAINT `stocktake_items_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `stocktake_items_stocktake_id_foreign` FOREIGN KEY (`stocktake_id`) REFERENCES `stocktakes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `user_privileges`
--
ALTER TABLE `user_privileges`
  ADD CONSTRAINT `user_privileges_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `wards`
--
ALTER TABLE `wards`
  ADD CONSTRAINT `wards_district_id_foreign` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
