-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 04, 2022 at 12:12 PM
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
-- Database: `eyecare`
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
(1, 'SmartSoft Clinic', '078576847', NULL, 'P. O. Box 795, DSM', '2022-11-05 14:24:18', '2022-11-05 14:24:18');

-- --------------------------------------------------------

--
-- Table structure for table `consultations`
--

CREATE TABLE `consultations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `payment_cache_item_id` bigint(20) UNSIGNED NOT NULL,
  `consultant` enum('Doctor','Optician') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Doctor',
  `chief_complaint` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `history_present_illness` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `family_history` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `patient_to_return` enum('Yes','No') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'No',
  `to_return_date` date DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('Pending','Consulted') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `sent_to_optician_at` datetime DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `sent_to_optician_by` bigint(20) UNSIGNED DEFAULT NULL,
  `optician_status` enum('Pending','Consulted') COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `consultations`
--

INSERT INTO `consultations` (`id`, `payment_cache_item_id`, `consultant`, `chief_complaint`, `history_present_illness`, `family_history`, `patient_to_return`, `to_return_date`, `remarks`, `created_at`, `created_by`, `status`, `sent_to_optician_at`, `updated_at`, `sent_to_optician_by`, `optician_status`) VALUES
(1, 1, 'Doctor', 'test', NULL, NULL, '', NULL, NULL, '2022-10-15 10:37:49', 1, 'Consulted', NULL, '2022-11-18 17:32:11', NULL, NULL),
(3, 3, 'Doctor', 'macho hayaoni mbali sana', 'tangu juzi', 'nyumbani wazima wote', 'Yes', '2022-10-31', 'Proceed with ordered items', '2022-10-15 10:41:27', 1, 'Consulted', NULL, '2022-11-18 17:32:52', NULL, NULL),
(4, 12, 'Optician', NULL, NULL, NULL, 'No', NULL, NULL, '2022-10-21 23:47:58', 1, 'Consulted', '2022-10-22 02:47:58', '2022-10-21 23:47:58', 1, 'Pending'),
(5, 16, 'Doctor', 'Blurry vision at distance and near', 'Onset year', 'NIL', 'Yes', '2022-11-17', 'Proceeded with given details and went on to dispense the glasses ordered. Done.', '2022-10-27 21:38:32', 1, 'Consulted', '2022-11-08 01:47:15', '2022-11-18 17:34:23', 1, 'Consulted'),
(6, 20, 'Doctor', 'test', NULL, NULL, 'No', NULL, 'test', '2022-11-05 00:46:04', 1, 'Consulted', NULL, '2022-11-18 17:21:38', NULL, NULL),
(7, 24, 'Optician', NULL, NULL, NULL, 'No', NULL, NULL, '2022-11-08 08:28:11', 1, 'Consulted', '2022-11-08 11:28:11', '2022-11-08 08:28:11', 1, 'Pending'),
(8, 26, 'Doctor', NULL, NULL, NULL, 'No', NULL, NULL, '2022-11-30 10:05:24', 1, 'Pending', NULL, '2022-11-30 10:05:24', NULL, NULL),
(9, 28, 'Doctor', NULL, NULL, NULL, 'No', NULL, NULL, '2022-11-30 14:49:36', 1, 'Pending', NULL, '2022-11-30 14:49:36', NULL, NULL);

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
(9, 3, 3, 'Preliminary', '2022-10-17 18:06:39', 1, '2022-10-17 18:06:39'),
(10, 3, 2, 'Preliminary', '2022-10-17 18:07:01', 1, '2022-10-17 18:07:01'),
(11, 3, 1, 'Final', '2022-10-17 19:44:15', 1, '2022-10-17 19:44:15'),
(12, 1, 1, 'Preliminary', '2022-10-20 20:08:00', 1, '2022-10-20 20:08:00'),
(13, 1, 3, 'Preliminary', '2022-10-21 23:09:54', 1, '2022-10-21 23:09:54'),
(14, 1, 3, 'Final', '2022-11-05 12:29:32', 1, '2022-11-05 12:29:32'),
(15, 5, 1, 'Final', '2022-11-07 22:02:26', 1, '2022-11-07 22:02:26'),
(16, 6, 1, 'Final', '2022-11-08 22:52:00', 1, '2022-11-08 22:52:00');

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
(1, 3, 'rlid', 'sce', 'c', 'cj', 'ir', 'pp', 'lr', 'ip', 'l', 'scl', 'ce', 'cjl', 'irl', 'ppl', 'll', 'ipl', '2022-10-19 21:48:15', 1, '2022-10-19 22:02:16'),
(2, 1, 'HEALTHY', 'WHITE', 'CLEAR AND TRANSPARENT', 'HEALTHY', 'BROWN', NULL, NULL, NULL, 'HEALTHY', 'WHITE', NULL, NULL, NULL, NULL, NULL, NULL, '2022-10-20 20:08:25', 1, '2022-10-21 23:12:05'),
(3, 5, 'HEALTHY', 'WHITE', 'CLEAR AND TRANSPARENT', 'WHITE', 'BROWN', 'PERRLA', 'CLEAR AND TRANSPARENT', NULL, 'HEALTHY', 'WHITE', 'CLEAR AND TRANSPARENT', 'WHITE', 'BROWN', 'PERRLA', 'CLEAR AND TRANSPARENT', NULL, '2022-11-07 22:36:23', 1, '2022-11-07 22:38:04');

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
(1, 5, 'rnpc', 'rnpa', 'rcon', 'rcov', 'lnpc', 'lnpa', 'lcon', 'lcov', '2022-11-07 21:58:55', 1, '2022-11-07 21:59:32');

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
(1, 3, '6/7', '6/9', '2022-10-19 23:08:06', 1, '2022-10-19 23:08:22'),
(2, 1, 'fund re', 'fund le', '2022-11-05 12:29:45', 1, '2022-11-05 12:29:55'),
(3, 5, 'Good', 'Good', '2022-11-07 22:40:22', 1, '2022-11-07 22:40:29');

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
(1, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'PLANO', '-0.50', '75', NULL, NULL, NULL, 'PLANO', '-0.50', '95', NULL, NULL, NULL, '2022-10-21 23:13:32', 1, '2022-10-21 23:14:04'),
(2, 4, '7/8', NULL, NULL, NULL, '7/9', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2022-11-05 13:26:23', 1, '2022-11-05 13:26:29'),
(11, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'PLANO', '-0.5', '75', '6/6', '+2.50', '1', 'PLANO', '-0.5', '95', '6/6', '+2.50', NULL, '2022-11-07 22:38:50', 1, '2022-11-16 12:42:23'),
(12, 7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'PLANO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2022-11-16 12:43:47', 1, '2022-11-16 12:43:50');

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
(1, 'Pharmacy', NULL, 'Active', '2022-10-04 15:18:32', '2022-10-04 15:18:32'),
(2, 'Glass', NULL, 'Active', '2022-10-04 15:18:32', '2022-10-04 15:18:32'),
(3, 'Procedure', NULL, 'Active', '2022-10-04 15:18:32', '2022-10-04 15:18:32'),
(4, 'Others', NULL, 'Active', '2022-10-04 15:18:32', '2022-10-04 15:18:32');

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
(1, 3, '7/9', '2', 'good', '8/9', '5', '9/9', NULL, '9/99', NULL, '2022-10-19 22:39:11', 1, '2022-10-19 22:39:56'),
(2, 1, '6/9', NULL, NULL, '6/9', NULL, '7/9', 're desc', '8/9', 'le desc', '2022-10-21 23:13:07', 1, '2022-11-08 20:20:06'),
(3, 5, '6/9', NULL, NULL, '6/9', NULL, '7/9', NULL, '7/9', NULL, '2022-11-07 22:35:42', 1, '2022-11-07 22:36:03');

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
(1, 'IT', 'Watu wabaya', 'Active', '2022-11-03 22:47:40', '2022-11-03 22:47:40'),
(2, 'Administration', NULL, 'Active', '2022-11-03 22:47:56', '2022-11-03 22:47:56'),
(3, 'Finance', 'Deals with financial affairs', 'Active', '2022-11-03 22:48:24', '2022-11-03 22:48:24'),
(4, 'Pharmacy', NULL, 'Active', '2022-11-03 22:48:42', '2022-11-03 22:48:52');

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
(1, 'Myopia', 'A0.0', 'Active', '2022-10-17 10:49:32', '2022-10-17 10:49:32'),
(2, 'Glaucoma', 'A1.0', 'Active', '2022-10-17 10:50:18', '2022-10-17 10:50:18'),
(3, 'Cataract', 'A1.2', 'Active', '2022-10-17 10:50:41', '2022-10-17 10:50:41'),
(4, 'Diabetic Retinopathy', 'B1', 'Active', '2022-10-17 10:51:08', '2022-10-17 10:51:08');

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
(1, 'Arumeru', 2, 'Active', '2022-10-07 21:12:08', '2022-10-07 21:12:08'),
(2, 'Kinondoni', 1, 'Active', '2022-10-07 21:42:49', '2022-10-07 21:42:49'),
(3, 'Ilala', 1, 'Active', '2022-10-07 21:51:04', '2022-10-07 21:51:04');

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `total_amount` double UNSIGNED NOT NULL,
  `paid_amount` double UNSIGNED NOT NULL DEFAULT 0,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expense_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`id`, `category_id`, `total_amount`, `paid_amount`, `description`, `expense_date`, `created_at`, `created_by`, `updated_at`) VALUES
(1, 1, 250000, 250000, 'Mishahara ya wafanyakazi wa ndani', '2022-11-03', '2022-11-03 21:33:09', 1, '2022-11-05 19:49:51'),
(2, 3, 2000, 1500, 'Umeme', '2022-11-04', '2022-11-03 22:12:39', 1, '2022-11-05 19:49:30'),
(3, 2, 1000, 1000, 'Kwenda site', '2022-11-05', '2022-11-05 19:51:42', 1, '2022-11-05 19:51:42'),
(4, 2, 51000, 51000, 'Hela ya kwenda kununua vifaa', '2022-11-08', '2022-11-08 12:16:59', 1, '2022-11-08 12:44:29'),
(5, 3, 50000, 50000, 'umeme', '2022-11-17', '2022-11-17 09:25:50', 1, '2022-11-17 09:25:50');

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
(1, 'Employee Salaries', 'It\'s self explanatory here', 'Active', '2022-11-03 20:29:18', '2022-11-03 20:30:28'),
(2, 'Transport', NULL, 'Active', '2022-11-03 20:30:42', '2022-11-03 20:30:42'),
(3, 'Electricity Bill', NULL, 'Active', '2022-11-03 20:31:02', '2022-11-03 20:31:02'),
(4, 'Employee Allowances', NULL, 'Active', '2022-11-15 09:08:09', '2022-11-15 09:08:09');

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
  `unit_buying_price` double DEFAULT NULL,
  `manufacture_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `name`, `code`, `item_type_id`, `consultation_type_id`, `unit_of_measure_id`, `lens_type_id`, `is_consultation_item`, `is_stock_item`, `balance`, `unit_buying_price`, `manufacture_date`, `expiry_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Glasses', 'GL', 3, 2, 3, 1, 'No', 'No', 0, NULL, NULL, NULL, 'Active', '2022-10-05 13:09:59', '2022-10-06 09:24:43'),
(2, 'General Consultation - New', 'C02', 1, 4, NULL, NULL, 'Yes', 'No', 0, NULL, NULL, NULL, 'Active', '2022-10-05 14:02:27', '2022-10-05 16:46:49'),
(3, 'General Consultation - Return', 'C03', 1, 4, NULL, NULL, 'Yes', 'No', 0, NULL, NULL, NULL, 'Active', '2022-10-05 16:47:25', '2022-10-05 16:50:36'),
(4, 'Aciclovir eye ointment', NULL, 2, 1, 5, NULL, 'No', 'Yes', 498, 1000, NULL, '2022-11-30', 'Active', '2022-10-06 09:20:00', '2022-11-30 14:52:10'),
(5, 'Apraclonidine eye drops', NULL, 2, 1, 4, NULL, 'No', 'No', 0, NULL, NULL, NULL, 'Active', '2022-10-06 09:20:42', '2022-10-06 09:20:42'),
(6, 'Fluorometholone eye drops for inflammation (FML)', NULL, 2, 1, 4, NULL, 'No', 'No', 0, NULL, NULL, NULL, 'Active', '2022-10-06 09:22:06', '2022-10-06 09:22:06'),
(7, 'Ganciclovir eye gel (Virgan)', NULL, 2, 1, 5, NULL, 'No', 'Yes', 100, 300, NULL, NULL, 'Active', '2022-10-06 09:22:47', '2022-11-02 09:22:06'),
(8, 'Eye Cleansing', NULL, 1, 3, NULL, NULL, 'No', 'No', 0, NULL, NULL, NULL, 'Active', '2022-10-06 09:23:56', '2022-10-06 09:23:56'),
(9, 'Follow Up Consultation', 'C04', 1, 4, NULL, NULL, 'Yes', 'No', 0, NULL, NULL, NULL, 'Active', '2022-10-09 23:24:25', '2022-10-09 23:24:25'),
(10, 'Glass Maintenance', 'C10', 1, 4, NULL, NULL, 'No', 'No', 0, NULL, NULL, NULL, 'Active', '2022-10-20 19:30:12', '2022-10-20 19:30:12'),
(11, 'Fusidic acid eye drops', 'F02', 2, 1, 4, NULL, 'No', 'Yes', NULL, NULL, NULL, NULL, 'Active', '2022-11-01 15:58:18', '2022-11-01 16:01:03');

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
(1, 1, 1, 5000, '2022-10-08 22:27:25', '2022-10-08 22:27:25'),
(3, 1, 2, 1500, '2022-10-08 22:32:50', '2022-10-08 22:32:50'),
(4, 2, 1, 4000, '2022-10-08 22:33:17', '2022-10-08 22:33:17'),
(5, 9, 1, 2000, '2022-10-09 23:24:53', '2022-10-09 23:24:53'),
(6, 4, 1, 2500, '2022-10-10 20:46:24', '2022-10-10 20:46:24'),
(7, 5, 1, 1000, '2022-10-10 20:46:39', '2022-10-10 20:46:39'),
(8, 8, 1, 3000, '2022-10-10 20:47:02', '2022-10-10 20:47:02'),
(9, 6, 1, 1500, '2022-10-14 23:10:46', '2022-10-14 23:10:46'),
(10, 10, 1, 2000, '2022-10-20 19:30:33', '2022-10-20 19:30:33'),
(11, 2, 2, 3500, '2022-10-23 22:46:50', '2022-10-23 22:46:50'),
(12, 4, 2, 2450, '2022-10-23 22:47:11', '2022-10-23 22:47:11'),
(13, 8, 2, 3000, '2022-10-23 22:47:32', '2022-10-23 22:47:32');

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
(1, 'Service', 'Serviced Item', 'Active', '2022-10-04 15:18:32', '2022-10-04 15:18:32'),
(2, 'Pharmaceutical', 'Pharmaceutical and Consumable Item', 'Active', '2022-10-04 15:18:32', '2022-10-04 15:18:32'),
(3, 'Lens', 'Lens Item', 'Active', '2022-10-04 15:18:32', '2022-10-04 15:18:32'),
(4, 'Frame', 'Frame Item', 'Active', '2022-10-04 15:18:32', '2022-10-04 15:18:32'),
(5, 'Others', 'Other Item', 'Active', '2022-10-04 15:18:32', '2022-10-04 15:18:32');

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
(1, 'Receptionist', NULL, 'Active', '2022-10-04 15:18:32', '2022-10-04 15:18:32'),
(2, 'Doctor', NULL, 'Active', '2022-10-04 15:18:32', '2022-10-04 15:18:32'),
(3, 'Cashier', 'Mkusanya pesa', 'Active', '2022-10-04 15:18:32', '2022-11-03 22:50:46'),
(4, 'Optician', 'Miwani moja', 'Active', '2022-11-03 22:50:32', '2022-11-03 22:50:32');

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
(1, 'BLUECUT', NULL, 'Active', '2022-10-05 11:03:19', '2022-10-05 11:03:19'),
(2, 'NONPP', NULL, 'Active', '2022-10-05 11:03:37', '2022-10-05 11:03:37'),
(3, 'PGX', NULL, 'Active', '2022-10-05 11:03:45', '2022-10-05 11:03:45'),
(4, 'Special Lens', NULL, 'Active', '2022-10-05 11:04:04', '2022-10-05 11:04:04');

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
(1, 'Habari Diana. Tunakushukuru kwa kuja kupata huduma yetu. Ni matumaini yetu umefurahia huduma zetu. Asante na karibu tena.', '0757206864', 2, '{\"successful\":true,\"request_id\":53676681,\"code\":100,\"message\":\"Message Submitted Successfully\",\"valid\":1,\"invalid\":0,\"duplicates\":0}', '2022-11-14 19:09:55', '2022-11-14 19:09:55'),
(2, 'Habari Diana. Unakumbushwa kuhudhuria appointment yako ya tarehe Nov 15, 2022.', '0757206864', 2, '{\"successful\":true,\"request_id\":53678667,\"code\":100,\"message\":\"Message Submitted Successfully\",\"valid\":1,\"invalid\":0,\"duplicates\":0}', '2022-11-14 19:46:35', '2022-11-14 19:46:35'),
(3, 'Habari Francis. Tunakushukuru kwa kuja kupata huduma yetu. Ni matumaini yetu umefurahia huduma zetu. Asante na karibu tena.', '0757206864', 7, '{\"successful\":true,\"request_id\":53996919,\"code\":100,\"message\":\"Message Submitted Successfully\",\"valid\":1,\"invalid\":0,\"duplicates\":0}', '2022-11-17 20:43:22', '2022-11-17 20:43:22'),
(4, 'Habari Francis. Tunakushukuru kwa kuja kupata huduma yetu. Ni matumaini yetu umefurahia huduma zetu. Asante na karibu tena.', '0757206864', 7, '{\"successful\":true,\"request_id\":54085581,\"code\":100,\"message\":\"Message Submitted Successfully\",\"valid\":1,\"invalid\":0,\"duplicates\":0}', '2022-11-18 17:21:43', '2022-11-18 17:21:43'),
(5, 'Habari Rukia. Tunakushukuru kwa kuja kupata huduma yetu. Ni matumaini yetu umefurahia huduma zetu. Asante na karibu tena.', '0757206864', 3, '{\"successful\":true,\"request_id\":54086010,\"code\":100,\"message\":\"Message Submitted Successfully\",\"valid\":1,\"invalid\":0,\"duplicates\":0}', '2022-11-18 17:27:38', '2022-11-18 17:27:38'),
(6, 'Habari Rukia. Tunakushukuru kwa kuja kupata huduma yetu. Ni matumaini yetu umefurahia huduma zetu. Asante na karibu tena.', '0757206864', 3, '{\"successful\":true,\"request_id\":54086343,\"code\":100,\"message\":\"Message Submitted Successfully\",\"valid\":1,\"invalid\":0,\"duplicates\":0}', '2022-11-18 17:32:14', '2022-11-18 17:32:14'),
(7, 'Habari Lameck. Tunakushukuru kwa kuja kupata huduma yetu. Ni matumaini yetu umefurahia huduma zetu. Asante na karibu tena.', '0757206864', 1, '{\"successful\":true,\"request_id\":54086394,\"code\":100,\"message\":\"Message Submitted Successfully\",\"valid\":1,\"invalid\":0,\"duplicates\":0}', '2022-11-18 17:33:05', '2022-11-18 17:33:05'),
(8, 'Habari Diana. Tunakushukuru kwa kuja kupata huduma yetu. Ni matumaini yetu umefurahia huduma zetu. Asante na karibu tena.', '0757206864', 2, '{\"successful\":true,\"request_id\":54086408,\"code\":100,\"message\":\"Message Submitted Successfully\",\"valid\":1,\"invalid\":0,\"duplicates\":0}', '2022-11-18 17:34:24', '2022-11-18 17:34:24');

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
(2, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(3, '2022_10_03_214055_create_job_titles_table', 1),
(4, '2022_10_04_004136_create_users_table', 1),
(5, '2022_10_04_131748_create_consultation_types_table', 1),
(6, '2022_10_04_131820_create_payment_modes_table', 1),
(7, '2022_10_04_131904_create_units_of_measure_table', 1),
(8, '2022_10_04_131939_create_item_types_table', 1),
(9, '2022_10_04_131941_create_lens_types_table', 1),
(10, '2022_10_04_132058_create_items_table', 1),
(11, '2022_10_04_133517_create_item_prices_table', 1),
(12, '2022_10_06_001959_create_regions_table', 2),
(13, '2022_10_06_002041_create_districts_table', 2),
(14, '2022_10_06_002056_create_wards_table', 2),
(15, '2022_10_06_002141_create_patients_table', 2),
(16, '2022_10_06_234840_create_patient_check_ins_table', 2),
(24, '2022_10_04_131827_create_payment_channels_table', 7),
(25, '2022_10_14_001956_create_patient_item_payments_table', 8),
(26, '2022_10_06_234714_create_patient_payment_cache_table', 9),
(27, '2022_10_06_234856_create_patient_payment_cache_items_table', 10),
(29, '2022_10_15_233352_create_consultations_table', 11),
(30, '2022_10_06_002114_create_diseases_table', 12),
(31, '2022_10_19_233352_update_consultations_table', 13),
(32, '2022_10_17_144145_create_consultation_diagnoses_table', 14),
(37, '2022_10_19_123049_create_consultation_fundoscopies_table', 15),
(39, '2022_10_19_122949_create_consultation_visual_acuities_table', 17),
(40, '2022_10_19_121932_create_consultation_external_examinations_table', 18),
(42, '2022_10_19_123031_create_consultation_refractions_table', 19),
(43, '2022_10_15_233352_update_consultations_table', 20),
(44, '2022_10_14_184035_create_patient_item_bills_table', 21),
(46, '2022_10_14_185525_create_patient_item_bill_payments_table', 22),
(47, '2022_11_04_132058_update_items_table', 23),
(48, '2022_11_01_183546_create_stocktakes_table', 24),
(49, '2022_11_01_183713_create_stocktake_items_table', 25),
(50, '2022_11_03_213309_create_expense_categories_table', 26),
(51, '2022_11_03_213354_create_expenses_table', 27),
(52, '2022_10_03_011621_create_departments_table', 28),
(53, '2023_10_04_004136_create_users_table', 29),
(54, '2022_10_04_124022_create_user_privileges_table', 30),
(55, '2022_10_02_164329_create_clinic_details_table', 31),
(56, '2022_11_03_213354_createe_expenses_table', 32),
(57, '2022_10_04_124022_update_user_privileges_table', 33),
(58, '2022_10_19_122149_create_consultation_functional_tests_table', 34),
(59, '2022_11_08_131857_update_expenses_table', 35),
(60, '2022_11_19_122949_update_consultation_visual_acuities_table', 36),
(61, '2022_10_04_132058_update_items_table', 37),
(62, '2022_11_14_153812_create_preferences_table', 38),
(64, '2022_11_14_155613_create_messages_table', 39),
(65, '2022_11_16_164900_update_patients_table', 40);

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
  `payment_mode_id` bigint(20) UNSIGNED DEFAULT 1,
  `is_vip` enum('Yes','No') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'No',
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `first_name`, `middle_name`, `last_name`, `gender`, `date_of_birth`, `region_id`, `district_id`, `ward_id`, `national_id`, `phone`, `occupation`, `payment_mode_id`, `is_vip`, `created_at`, `created_by`, `updated_at`) VALUES
(1, 'Lameck', 'Mwigulu', 'Nchemba', 'Male', '1989-10-03', 1, 2, 4, '1989973274762601', '0757206864', 'Mkulima', 1, 'No', '2022-10-07 22:53:18', 1, '2022-10-07 22:53:18'),
(2, 'Diana', NULL, 'Mmari', 'Female', '2006-08-16', 1, 3, 5, NULL, '0757206864', 'Student', 1, 'No', '2022-10-07 23:06:09', 1, '2022-11-18 17:34:25'),
(3, 'Rukia', 'S', 'Abdallah', 'Female', '2006-05-03', 1, 2, 2, NULL, '0757206864', 'Student', 1, 'No', '2022-10-07 23:11:50', 1, '2022-10-07 23:11:50'),
(4, 'John', NULL, 'Lenon', 'Male', '1990-10-02', 2, 1, NULL, NULL, '0757206864', 'Musician', 1, 'No', '2022-10-07 23:20:24', 1, '2022-10-07 23:20:24'),
(5, 'Narjis', 'Faizali', 'Hasham', 'Female', '1988-11-09', 1, 3, 7, NULL, '0757206864', 'Teacher', 1, 'No', '2022-10-08 00:08:22', 1, '2022-10-08 00:08:22'),
(6, 'Nickson', 'B', 'Mungai', 'Male', '2001-07-18', 2, 1, 8, '2001071857676473', '0757206864', '0767546288', 2, 'No', '2022-10-11 22:03:05', 1, '2022-11-04 07:49:30'),
(7, 'Francis', 'M', 'Kagwe', 'Male', '2005-11-01', 1, 3, 5, NULL, '0757206864', 'Model', 1, 'No', '2022-11-05 00:40:43', 1, '2022-11-18 19:06:23');

-- --------------------------------------------------------

--
-- Table structure for table `patient_check_ins`
--

CREATE TABLE `patient_check_ins` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `payment_mode_id` bigint(20) UNSIGNED NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patient_check_ins`
--

INSERT INTO `patient_check_ins` (`id`, `patient_id`, `payment_mode_id`, `created_at`, `created_by`, `updated_at`) VALUES
(5, 3, 1, '2022-10-14 23:04:53', 1, '2022-10-14 23:04:53'),
(6, 3, 1, '2022-10-14 23:05:54', 1, '2022-10-14 23:05:54'),
(7, 1, 1, '2022-10-15 10:40:52', 1, '2022-10-15 10:40:52'),
(8, 4, 1, '2022-10-21 23:47:20', 1, '2022-10-21 23:47:20'),
(9, 6, 2, '2022-10-23 22:49:02', 1, '2022-10-23 22:49:02'),
(10, 2, 1, '2022-10-27 21:05:20', 1, '2022-10-27 21:05:20'),
(11, 4, 1, '2022-11-02 11:52:37', 1, '2022-11-02 11:52:37'),
(12, 7, 1, '2022-11-05 00:42:34', 1, '2022-11-05 00:42:34'),
(13, 7, 1, '2022-11-08 08:27:47', 1, '2022-11-08 08:27:47'),
(14, 7, 1, '2022-11-30 10:00:51', 1, '2022-11-30 10:00:51'),
(15, 7, 1, '2022-11-30 14:48:53', 1, '2022-11-30 14:48:53');

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

--
-- Dumping data for table `patient_item_bills`
--

INSERT INTO `patient_item_bills` (`id`, `amount`, `discount`, `created_at`, `created_by`, `status`, `cleared_at`, `cleared_by`, `updated_at`) VALUES
(1, 6000, 0, '2022-10-27 21:38:30', 1, 'Cleared', '2022-11-01 00:27:26', 1, '2022-10-31 21:27:26'),
(2, 3500, 1000, '2022-11-02 11:53:05', 1, 'Cleared', '2022-11-05 03:23:34', 1, '2022-11-05 00:23:34');

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

--
-- Dumping data for table `patient_item_bill_payments`
--

INSERT INTO `patient_item_bill_payments` (`id`, `bill_id`, `channel_id`, `amount`, `created_at`, `created_by`, `updated_at`) VALUES
(2, 1, 1, 2000, '2022-10-31 15:26:04', 1, '2022-10-31 15:26:04'),
(3, 1, 2, 3500, '2022-10-31 21:17:21', 1, '2022-10-31 21:17:21'),
(4, 2, 1, 1000, '2022-11-02 11:54:24', 1, '2022-11-02 11:54:24'),
(5, 2, 3, 1500, '2022-11-05 00:21:26', 1, '2022-11-05 00:21:26');

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
(3, 1, 7000, 500, '2022-10-15 10:37:48', 1, '2022-10-15 10:37:49'),
(4, 2, 4000, 100, '2022-10-15 10:41:27', 1, '2022-10-15 10:41:27'),
(5, 1, 3000, 0, '2022-10-18 21:20:11', 1, '2022-10-18 21:20:11'),
(6, 1, 2500, 5, '2022-10-20 12:10:13', 1, '2022-10-20 12:10:13'),
(7, 1, 5000, 0, '2022-10-21 23:47:58', 1, '2022-10-21 23:47:58'),
(8, 2, 1000, 0, '2022-10-23 17:48:38', 1, '2022-10-23 17:48:39'),
(9, 2, 3000, 0, '2022-10-24 18:44:56', 1, '2022-10-24 18:44:57'),
(10, 1, 4000, 0, '2022-11-05 00:46:04', 1, '2022-11-05 00:46:04'),
(11, 2, 6500, 500, '2022-11-05 02:14:07', 1, '2022-11-05 02:14:07'),
(12, 3, 3000, 0, '2022-11-05 22:39:05', 1, '2022-11-05 22:39:05'),
(13, 1, 5000, 0, '2022-11-05 22:41:24', 1, '2022-11-05 22:41:24'),
(14, 1, 5000, 0, '2022-11-08 08:28:10', 1, '2022-11-08 08:28:11'),
(15, 4, 5000, 500, '2022-11-12 10:45:00', 1, '2022-11-12 10:45:01'),
(16, 1, 6500, 400, '2022-11-30 10:05:23', 1, '2022-11-30 10:05:24'),
(17, 4, 5000, 500, '2022-11-30 10:06:44', 1, '2022-11-30 10:06:45'),
(18, 2, 2500, 300, '2022-11-30 10:08:21', 1, '2022-11-30 10:08:22'),
(19, 1, 4000, 500, '2022-11-30 14:49:35', 1, '2022-11-30 14:49:36'),
(20, 1, 2500, 0, '2022-11-30 14:51:53', 1, '2022-11-30 14:51:53');

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
(1, 5, NULL, '2022-10-14 23:04:53', 1, '2022-10-14 23:04:53'),
(2, 6, NULL, '2022-10-14 23:05:55', 1, '2022-10-14 23:05:55'),
(3, 7, NULL, '2022-10-15 10:40:52', 1, '2022-10-15 10:40:52'),
(4, 7, 3, '2022-10-18 21:13:42', 1, '2022-10-18 21:13:42'),
(5, 6, 1, '2022-10-20 12:09:15', 1, '2022-10-20 12:09:15'),
(6, 8, NULL, '2022-10-21 23:47:21', 1, '2022-10-21 23:47:21'),
(7, 9, NULL, '2022-10-23 22:49:02', 1, '2022-10-23 22:49:02'),
(8, 10, NULL, '2022-10-27 21:05:20', 1, '2022-10-27 21:05:20'),
(9, 11, NULL, '2022-11-02 11:52:37', 1, '2022-11-02 11:52:37'),
(10, 12, NULL, '2022-11-05 00:42:35', 1, '2022-11-05 00:42:35'),
(11, 10, 5, '2022-11-05 22:38:01', 1, '2022-11-05 22:38:01'),
(12, 8, 4, '2022-11-05 22:40:53', 1, '2022-11-05 22:40:53'),
(13, 13, NULL, '2022-11-08 08:27:48', 1, '2022-11-08 08:27:48'),
(14, 12, 6, '2022-11-17 20:49:34', 1, '2022-11-17 20:49:34'),
(15, 14, NULL, '2022-11-30 10:00:51', 1, '2022-11-30 10:00:51'),
(16, 15, NULL, '2022-11-30 14:48:53', 1, '2022-11-30 14:48:53'),
(17, 15, 9, '2022-11-30 14:50:34', 1, '2022-11-30 14:50:34');

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
  `served_by` bigint(20) UNSIGNED DEFAULT NULL,
  `served_at` datetime DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patient_payment_cache_items`
--

INSERT INTO `patient_payment_cache_items` (`id`, `payment_cache_id`, `item_id`, `consultation_type_id`, `consultant_id`, `payment_mode_id`, `unit_price`, `quantity`, `item_payment_id`, `bill_id`, `created_at`, `created_by`, `dosage`, `comments`, `status`, `served_by`, `served_at`, `updated_at`) VALUES
(1, 2, 2, 4, 1, 1, 4000, 1, 3, NULL, '2022-10-14 23:05:55', 1, NULL, NULL, 'Paid', NULL, NULL, '2022-10-15 10:37:48'),
(2, 2, 8, 3, 1, 1, 3000, 1, 3, NULL, '2022-10-14 23:05:55', 1, NULL, NULL, 'Paid', NULL, NULL, '2022-10-15 10:37:49'),
(3, 3, 2, 4, 1, 1, 4000, 1, 4, NULL, '2022-10-15 10:40:52', 1, NULL, NULL, 'Paid', NULL, NULL, '2022-10-15 10:41:27'),
(4, 3, 6, 1, 1, 1, 1500, 1, NULL, NULL, '2022-10-15 10:40:52', 1, NULL, NULL, 'Pending', NULL, NULL, '2022-10-15 10:40:52'),
(5, 4, 8, 3, 1, 1, 3000, 1, 5, NULL, '2022-10-18 21:13:42', 1, NULL, NULL, 'Paid', NULL, NULL, '2022-10-18 21:20:11'),
(6, 4, 1, 2, 1, 1, 5000, 1, 11, NULL, '2022-10-18 21:15:30', 1, NULL, 'Apewe miwani huyu', 'Paid', NULL, NULL, '2022-11-05 02:14:07'),
(7, 4, 5, 1, 1, 1, 1000, 1, 8, NULL, '2022-10-18 21:17:26', 1, '1x3', 'Apewe dawa hizo', 'Served', 1, '2022-10-23 21:52:27', '2022-10-23 18:52:27'),
(9, 4, 6, 1, 1, 1, 1500, 1, 11, NULL, '2022-10-18 21:50:32', 1, '2 /7 oral', 'good', 'Paid', NULL, NULL, '2022-11-05 02:14:07'),
(10, 5, 4, 1, 1, 1, 2500, 1, 6, NULL, '2022-10-20 12:09:15', 1, 'tuut', 'tt', 'Paid', NULL, NULL, '2022-10-20 12:10:13'),
(11, 5, 8, 3, 1, 1, 3000, 1, 9, NULL, '2022-10-20 12:09:31', 1, NULL, 'performed well', 'Served', 1, '2022-10-24 21:46:25', '2022-10-24 18:46:25'),
(12, 6, 1, 2, 1, 1, 5000, 1, 7, NULL, '2022-10-21 23:47:21', 1, NULL, 'given all', 'Served', 1, '2022-11-07 12:14:55', '2022-11-07 09:14:55'),
(13, 6, 4, 1, 1, 1, 2500, 1, 18, NULL, '2022-10-21 23:47:21', 1, NULL, NULL, 'Paid', NULL, NULL, '2022-11-30 10:08:22'),
(14, 7, 4, 1, 1, 2, 2450, 5, NULL, NULL, '2022-10-23 22:49:02', 1, NULL, NULL, 'Paid', NULL, NULL, '2022-10-31 13:57:24'),
(15, 7, 8, 3, 1, 2, 3000, 1, NULL, NULL, '2022-10-23 22:49:02', 1, NULL, 'went well', 'Paid', NULL, NULL, '2022-10-31 13:57:24'),
(16, 8, 2, 4, 1, 1, 4000, 1, NULL, 1, '2022-10-27 21:05:20', 1, NULL, NULL, 'Billed', NULL, NULL, '2022-10-27 21:38:32'),
(17, 8, 10, 4, 1, 1, 2000, 1, NULL, 1, '2022-10-27 21:05:20', 1, NULL, NULL, 'Billed', NULL, NULL, '2022-10-27 21:38:32'),
(18, 9, 4, 1, 1, 1, 2500, 1, NULL, 2, '2022-11-02 11:52:37', 1, '2 x 3', 'well n good', 'Served', 1, '2022-11-02 17:23:36', '2022-11-02 14:23:36'),
(19, 9, 5, 1, 1, 1, 1000, 1, NULL, 2, '2022-11-02 11:52:37', 1, NULL, 'given', 'Served', 1, '2022-11-07 12:35:18', '2022-11-07 09:35:18'),
(20, 10, 2, 4, 1, 1, 4000, 1, 10, NULL, '2022-11-05 00:42:35', 1, NULL, NULL, 'Paid', NULL, NULL, '2022-11-17 20:43:18'),
(21, 11, 8, 3, 1, 1, 3000, 1, 12, NULL, '2022-11-05 22:38:01', 1, NULL, 'To be done today asap', 'Served', 1, '2022-11-07 12:40:16', '2022-11-07 09:40:16'),
(22, 12, 1, 2, 1, 1, 5000, 1, 13, NULL, '2022-11-05 22:40:53', 1, NULL, 'test', 'Paid', NULL, NULL, '2022-11-05 22:41:24'),
(23, 11, 1, 2, 1, 1, 5000, 1, 15, NULL, '2022-11-07 22:41:30', 1, NULL, 'Give bifocal for constant wear', 'Paid', NULL, NULL, '2022-11-12 10:45:01'),
(24, 13, 1, 2, NULL, 1, 5000, 1, 14, NULL, '2022-11-08 08:27:48', 1, NULL, NULL, 'Paid', NULL, NULL, '2022-11-08 08:28:10'),
(25, 14, 1, 2, 1, 1, 5000, 1, 17, NULL, '2022-11-17 20:49:34', 1, NULL, 'gg', 'Paid', NULL, NULL, '2022-11-30 10:06:44'),
(26, 15, 2, 4, 1, 1, 4000, 1, 16, NULL, '2022-11-30 10:00:51', 1, NULL, NULL, 'Paid', NULL, NULL, '2022-11-30 10:05:23'),
(27, 15, 4, 1, 1, 1, 2500, 1, 16, NULL, '2022-11-30 10:00:51', 1, NULL, NULL, 'Paid', NULL, NULL, '2022-11-30 10:05:24'),
(28, 16, 2, 4, 1, 1, 4000, 1, 19, NULL, '2022-11-30 14:48:53', 1, NULL, NULL, 'Paid', NULL, NULL, '2022-11-30 14:49:36'),
(29, 17, 4, 1, 1, 1, 2500, 1, 20, NULL, '2022-11-30 14:50:35', 1, '2x3', 'aa', 'Served', 1, '2022-11-30 17:52:10', '2022-11-30 14:52:10');

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
(1, 'Cash in Hand', NULL, 'Active', '2022-10-13 22:02:08', '2022-10-13 22:02:08'),
(2, 'M-Pesa', NULL, 'Active', '2022-10-13 22:03:15', '2022-10-13 22:03:15'),
(3, 'TigoPesa', NULL, 'Active', '2022-10-13 22:03:27', '2022-10-13 22:03:27'),
(4, 'Airtel Money', NULL, 'Active', '2022-11-12 10:44:09', '2022-11-12 10:44:09');

-- --------------------------------------------------------

--
-- Table structure for table `payment_modes`
--

CREATE TABLE `payment_modes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_type` enum('Cash','Credit') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Cash',
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_modes`
--

INSERT INTO `payment_modes` (`id`, `name`, `description`, `payment_type`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Cash', NULL, 'Cash', 'Active', '2022-10-04 15:18:32', '2022-10-04 15:18:32'),
(2, 'NHIF', NULL, 'Credit', 'Active', '2022-10-05 13:07:02', '2022-10-11 21:55:34'),
(3, 'Jubilee Insurance', NULL, 'Cash', 'Active', '2022-10-05 13:08:25', '2022-10-05 13:08:25'),
(4, 'MJM Insurance', NULL, 'Credit', 'Active', '2022-10-11 21:56:02', '2022-10-13 22:04:54');

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
(1, 'App\\Models\\User', 1, 'MyApp', 'b198354fc6048e33d2cc81af48a1831f7637a70edb5ec95bf51e02bf4ae66616', '[\"*\"]', '2022-12-03 19:45:33', NULL, '2022-12-02 09:30:49', '2022-12-03 19:45:33'),
(2, 'App\\Models\\User', 1, 'MyApp', 'bcf71aa06e5d3e3e5d40c2495a786315f65c49b7acff8ce722077e46fd948438', '[\"*\"]', '2022-12-04 11:10:24', NULL, '2022-12-04 11:10:20', '2022-12-04 11:10:24');

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
('SEND_REMINDER_MESSAGE_AT', NULL),
('SEND_REMINDER_MESSAGES_AT', '12:00');

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
(1, 'Dar es Salaam', 'Active', '2022-10-07 21:09:18', '2022-10-07 21:09:18'),
(2, 'Arusha', 'Active', '2022-10-07 21:11:50', '2022-10-07 21:11:50');

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
(1, '2022-11-02 09:22:05', 1, 'Monthly stocktaking', '2022-11-02 09:22:05'),
(2, '2022-11-02 09:22:32', 1, 'Monthly stocktaking', '2022-11-02 09:22:32');

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
  `manufacture_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stocktake_items`
--

INSERT INTO `stocktake_items` (`id`, `stocktake_id`, `item_id`, `quantity`, `unit_buying_price`, `manufacture_date`, `expiry_date`, `created_at`, `updated_at`) VALUES
(1, 1, 4, 500, 1000, NULL, '2022-11-30', '2022-11-02 09:22:05', '2022-11-02 09:22:05'),
(2, 1, 7, 100, 300, NULL, NULL, '2022-11-02 09:22:06', '2022-11-02 09:22:06'),
(3, 2, 4, 500, 1000, NULL, '2022-11-30', '2022-11-02 09:22:33', '2022-11-02 09:22:33'),
(4, 2, 7, 100, 300, NULL, NULL, '2022-11-02 09:22:33', '2022-11-02 09:22:33');

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
(1, 'mg', 'Milligrams', 'Inactive', '2022-10-04 15:18:32', '2022-10-05 10:47:24'),
(2, 'Btl', 'Bottles', 'Active', '2022-10-04 15:18:32', '2022-10-05 10:48:02'),
(3, 'PC', NULL, 'Active', '2022-10-04 15:18:32', '2022-10-04 15:18:32'),
(4, 'Drops', NULL, 'Active', '2022-10-04 15:18:32', '2022-10-04 15:18:32'),
(5, 'Tube', NULL, 'Active', '2022-10-04 15:18:32', '2022-10-04 15:18:32'),
(6, 'Kit', NULL, 'Active', '2022-10-04 15:18:32', '2022-10-04 15:18:32'),
(7, 'Box', NULL, 'Active', '2022-10-04 15:18:32', '2022-10-04 15:18:32'),
(8, 'Ltr', NULL, 'Active', '2022-10-04 15:18:32', '2022-10-04 15:18:32'),
(9, 'Cap', NULL, 'Active', '2022-10-04 15:18:32', '2022-10-04 15:18:32'),
(10, 'Tin', NULL, 'Active', '2022-10-04 15:18:32', '2022-10-04 15:18:32'),
(11, 'Tab', 'Tablets', 'Active', '2022-10-05 10:34:37', '2022-10-05 10:34:37');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `middle_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_id` bigint(20) UNSIGNED DEFAULT NULL,
  `job_title_id` bigint(20) UNSIGNED DEFAULT NULL,
  `employee_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('Male','Female') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `national_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `api_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `middle_name`, `last_name`, `username`, `department_id`, `job_title_id`, `employee_number`, `date_of_birth`, `gender`, `national_id`, `phone`, `password`, `api_token`, `created_at`, `created_by`, `status`, `updated_at`) VALUES
(1, 'System', NULL, 'Administrator', 'admin', 1, 2, NULL, NULL, 'Male', NULL, NULL, '$2y$10$3A9a6o/mKvMCyZKFJZ3jYe8xuLLr1HJu9/L5FeuOJlHT5qKgAWBnC', 'J8vUvnZOzvdUzLW4pULD4kGUCowbXFCy', '2022-10-04 15:18:32', NULL, 'Active', '2022-12-02 09:17:33'),
(2, 'Gerishon', 'B', 'Gway', 'gerishon', 1, 1, '89', '2006-11-02', 'Male', '1994656675777', '0756362329', '$2y$10$8W7E3Zv2IUPcnhE4rzlPSOt4sD6E9QDkrxSOKNrQbpjbyEQtH6OR6', NULL, '2022-11-04 11:39:30', 1, 'Active', '2022-11-04 15:48:49');

-- --------------------------------------------------------

--
-- Table structure for table `user_privileges`
--

CREATE TABLE `user_privileges` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `dashboard` tinyint(1) NOT NULL DEFAULT 0,
  `reception` tinyint(1) NOT NULL DEFAULT 0,
  `payment_center` tinyint(1) NOT NULL DEFAULT 0,
  `consultation_room` tinyint(1) NOT NULL DEFAULT 0,
  `optician_center` tinyint(1) NOT NULL DEFAULT 0,
  `medicine_center` tinyint(1) NOT NULL DEFAULT 0,
  `procedure_room` tinyint(1) NOT NULL DEFAULT 0,
  `inventory_management` tinyint(1) NOT NULL DEFAULT 0,
  `financial_management` tinyint(1) NOT NULL DEFAULT 0,
  `employee_management` tinyint(1) NOT NULL DEFAULT 0,
  `settings` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_privileges`
--

INSERT INTO `user_privileges` (`user_id`, `dashboard`, `reception`, `payment_center`, `consultation_room`, `optician_center`, `medicine_center`, `procedure_room`, `inventory_management`, `financial_management`, `employee_management`, `settings`) VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
(2, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);

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
(1, 'Sekei', 1, 'Active', '2022-10-07 21:13:32', '2022-10-07 21:13:32'),
(2, 'Sinza', 2, 'Active', '2022-10-07 21:43:17', '2022-10-07 21:43:17'),
(3, 'Msasani', 2, 'Active', '2022-10-07 21:43:36', '2022-10-07 21:43:36'),
(4, 'Kawe', 2, 'Active', '2022-10-07 21:43:47', '2022-10-07 21:43:47'),
(5, 'Magomeni', 3, 'Active', '2022-10-07 21:51:20', '2022-10-07 21:51:20'),
(6, 'Tandale', 2, 'Active', '2022-10-07 21:53:16', '2022-10-07 21:53:16'),
(7, 'Upanga', 3, 'Active', '2022-10-08 00:07:34', '2022-10-08 00:07:34'),
(8, 'Ngarenaro', 1, 'Active', '2022-10-11 22:01:29', '2022-10-11 22:01:29');

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
  ADD KEY `patients_created_by_foreign` (`created_by`),
  ADD KEY `patients_payment_mode_id_foreign` (`payment_mode_id`);

--
-- Indexes for table `patient_check_ins`
--
ALTER TABLE `patient_check_ins`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_check_ins_patient_id_foreign` (`patient_id`),
  ADD KEY `patient_check_ins_created_by_foreign` (`created_by`),
  ADD KEY `patient_check_ins_payment_mode_id_foreign` (`payment_mode_id`);

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
  ADD KEY `patient_item_payments_channel_id_foreign` (`channel_id`);

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
  ADD KEY `users_job_title_id_foreign` (`job_title_id`),
  ADD KEY `users_created_by_foreign` (`created_by`),
  ADD KEY `users_department_id_foreign` (`department_id`);

--
-- Indexes for table `user_privileges`
--
ALTER TABLE `user_privileges`
  ADD PRIMARY KEY (`user_id`);

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `consultation_diagnoses`
--
ALTER TABLE `consultation_diagnoses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `consultation_external_examinations`
--
ALTER TABLE `consultation_external_examinations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `consultation_functional_tests`
--
ALTER TABLE `consultation_functional_tests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `consultation_fundoscopies`
--
ALTER TABLE `consultation_fundoscopies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `consultation_refractions`
--
ALTER TABLE `consultation_refractions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `diseases`
--
ALTER TABLE `diseases`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `districts`
--
ALTER TABLE `districts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `expense_categories`
--
ALTER TABLE `expense_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `item_prices`
--
ALTER TABLE `item_prices`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `patient_check_ins`
--
ALTER TABLE `patient_check_ins`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `patient_item_bills`
--
ALTER TABLE `patient_item_bills`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `patient_item_bill_payments`
--
ALTER TABLE `patient_item_bill_payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `patient_item_payments`
--
ALTER TABLE `patient_item_payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `patient_payment_cache`
--
ALTER TABLE `patient_payment_cache`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `patient_payment_cache_items`
--
ALTER TABLE `patient_payment_cache_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `payment_channels`
--
ALTER TABLE `payment_channels`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `payment_modes`
--
ALTER TABLE `payment_modes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `regions`
--
ALTER TABLE `regions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `stocktakes`
--
ALTER TABLE `stocktakes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `stocktake_items`
--
ALTER TABLE `stocktake_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `units_of_measure`
--
ALTER TABLE `units_of_measure`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `wards`
--
ALTER TABLE `wards`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
-- Constraints for table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `expenses_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `expense_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
  ADD CONSTRAINT `patient_item_payments_channel_id_foreign` FOREIGN KEY (`channel_id`) REFERENCES `payment_channels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
  ADD CONSTRAINT `patient_payment_cache_items_consultant_id_foreign` FOREIGN KEY (`consultant_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
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
  ADD CONSTRAINT `users_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_job_title_id_foreign` FOREIGN KEY (`job_title_id`) REFERENCES `job_titles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
