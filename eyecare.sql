-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 22, 2024 at 10:18 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.1.17

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
-- Table structure for table `cataract_surgery_records`
--

CREATE TABLE `cataract_surgery_records` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `payment_cache_item_id` bigint(20) UNSIGNED NOT NULL,
  `unaided_re_va` varchar(255) DEFAULT NULL,
  `unaided_le_va` varchar(255) DEFAULT NULL,
  `aided_re_va` varchar(255) DEFAULT NULL,
  `aided_le_va` varchar(255) DEFAULT NULL,
  `lens_examination_re` varchar(255) DEFAULT NULL,
  `lens_examination_le` varchar(255) DEFAULT NULL,
  `other_ocular_pathology` varchar(255) DEFAULT NULL,
  `other_ocular_pathology_specify` varchar(255) DEFAULT NULL,
  `clinical_data` text DEFAULT NULL,
  `operated_eye` varchar(255) DEFAULT NULL,
  `operated_eye_refraction_sph` varchar(255) DEFAULT NULL,
  `operated_eye_refraction_sph_postop` varchar(255) DEFAULT NULL,
  `operated_eye_refraction_cyl` varchar(255) DEFAULT NULL,
  `operated_eye_refraction_axis` varchar(255) DEFAULT NULL,
  `operated_eye_biometry_k1` varchar(255) DEFAULT NULL,
  `operated_eye_biometry_k2` varchar(255) DEFAULT NULL,
  `operated_eye_biometry_axial_length` varchar(255) DEFAULT NULL,
  `operation_date` date DEFAULT NULL,
  `operation_place` varchar(255) DEFAULT NULL,
  `surgery_type` varchar(255) DEFAULT NULL,
  `iol` varchar(255) DEFAULT NULL,
  `hospital_id` varchar(255) DEFAULT NULL,
  `surgeon_id` varchar(255) DEFAULT NULL,
  `training` varchar(255) DEFAULT NULL,
  `operative_complications` varchar(255) DEFAULT NULL,
  `section` varchar(255) DEFAULT NULL,
  `capsulotomy` varchar(255) DEFAULT NULL,
  `iol_type` varchar(255) DEFAULT NULL,
  `iol_power` varchar(255) DEFAULT NULL,
  `suture` varchar(255) DEFAULT NULL,
  `number_of_sutures` varchar(255) DEFAULT NULL,
  `postoperative_data` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('Draft','Saved') NOT NULL DEFAULT 'Draft',
  `saved_at` timestamp NULL DEFAULT NULL,
  `saved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cataract_surgery_records`
--

INSERT INTO `cataract_surgery_records` (`id`, `payment_cache_item_id`, `unaided_re_va`, `unaided_le_va`, `aided_re_va`, `aided_le_va`, `lens_examination_re`, `lens_examination_le`, `other_ocular_pathology`, `other_ocular_pathology_specify`, `clinical_data`, `operated_eye`, `operated_eye_refraction_sph`, `operated_eye_refraction_sph_postop`, `operated_eye_refraction_cyl`, `operated_eye_refraction_axis`, `operated_eye_biometry_k1`, `operated_eye_biometry_k2`, `operated_eye_biometry_axial_length`, `operation_date`, `operation_place`, `surgery_type`, `iol`, `hospital_id`, `surgeon_id`, `training`, `operative_complications`, `section`, `capsulotomy`, `iol_type`, `iol_power`, `suture`, `number_of_sutures`, `postoperative_data`, `created_at`, `created_by`, `status`, `saved_at`, `saved_by`, `updated_at`) VALUES
(1, 19, '6/6', '6/7', '6/9', '7/9', '4', '5', '3', 'test', 'clinical data', 'RE', '1', '1.4', '0.5', '1.5', '2', '4', '6', '2024-03-21', 'Other hospital', 'SICS', 'PC-IOL', '3456', '985', 'Resident / Trainee', 'Zonular dehiscence', 'Limbal', 'Linear', 'TIOL', 'IOLP', 'Continuous', '3', '3||6/9||6/9||Specs||2024-03-28||7/9||7/8||Surg||2024-04-10||7/8||7/9||Specs||2024-06-12||6/8||6/9||Sequel||1||0.6||2.5', '2024-03-22 00:14:41', 1, 'Saved', '2024-03-22 16:47:50', 1, '2024-03-22 23:12:57');

-- --------------------------------------------------------

--
-- Table structure for table `clinic_details`
--

CREATE TABLE `clinic_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
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
  `patient_direction` enum('Direct to Doctor','Direct to Optician') NOT NULL DEFAULT 'Direct to Doctor',
  `chief_complaint` text DEFAULT NULL,
  `history_present_illness` text DEFAULT NULL,
  `family_history` text DEFAULT NULL,
  `general_health` text DEFAULT NULL,
  `family_ocular_history` text DEFAULT NULL,
  `family_general_history` text DEFAULT NULL,
  `pupils` text DEFAULT NULL,
  `extra_ocular_muscles` text DEFAULT NULL,
  `patient_to_return` enum('Yes','No') NOT NULL DEFAULT 'No',
  `to_return_date` date DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('Pending','Consulted') NOT NULL DEFAULT 'Pending',
  `require_glass` enum('Yes','No') NOT NULL DEFAULT 'No',
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
(8, 14, 'Direct to Doctor', 'blurry', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'No', NULL, 'test', '2023-04-25 17:56:03', 1, 'Pending', 'Yes', NULL, NULL, '2023-04-25 18:01:07'),
(9, 15, 'Direct to Doctor', 'Blurry vision kabisa', NULL, 'fh', 'gh', NULL, NULL, NULL, NULL, 'Yes', '2023-07-31', 'mpe glass flani kali kabisa tena', '2023-07-13 13:54:40', 1, 'Consulted', 'Yes', '2023-07-13 17:08:45', 1, '2023-07-13 14:08:45'),
(10, 18, 'Direct to Doctor', 'blurry vision', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'No', NULL, 'continue with procedure', '2024-03-21 17:26:31', 1, 'Consulted', 'No', NULL, NULL, '2024-03-21 17:31:14'),
(11, 20, 'Direct to Doctor', 'blurry vision', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'No', NULL, 'amechagua hizo', '2024-05-13 07:32:03', 1, 'Consulted', 'Yes', '2024-05-13 10:41:47', 1, '2024-05-13 07:41:47'),
(12, 25, 'Direct to Doctor', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'No', NULL, NULL, '2024-05-13 07:59:26', 1, 'Pending', 'No', NULL, NULL, '2024-05-13 07:59:26'),
(13, 24, 'Direct to Doctor', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'No', NULL, NULL, '2024-05-13 08:00:39', 1, 'Pending', 'No', NULL, NULL, '2024-05-13 08:00:39');

-- --------------------------------------------------------

--
-- Table structure for table `consultation_diagnoses`
--

CREATE TABLE `consultation_diagnoses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `consultation_id` bigint(20) UNSIGNED NOT NULL,
  `disease_id` bigint(20) UNSIGNED NOT NULL,
  `diagnosis_type` enum('Preliminary','Final') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `consultation_external_examinations`
--

CREATE TABLE `consultation_external_examinations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `consultation_id` bigint(20) UNSIGNED NOT NULL,
  `re_lid` varchar(255) DEFAULT NULL,
  `re_sclera` varchar(255) DEFAULT NULL,
  `re_cornea` varchar(255) DEFAULT NULL,
  `re_conjuctiva` varchar(255) DEFAULT NULL,
  `re_iris` varchar(255) DEFAULT NULL,
  `re_pupil` varchar(255) DEFAULT NULL,
  `re_lens` varchar(255) DEFAULT NULL,
  `re_iop` varchar(255) DEFAULT NULL,
  `le_lid` varchar(255) DEFAULT NULL,
  `le_sclera` varchar(255) DEFAULT NULL,
  `le_cornea` varchar(255) DEFAULT NULL,
  `le_conjuctiva` varchar(255) DEFAULT NULL,
  `le_iris` varchar(255) DEFAULT NULL,
  `le_pupil` varchar(255) DEFAULT NULL,
  `le_lens` varchar(255) DEFAULT NULL,
  `le_iop` varchar(255) DEFAULT NULL,
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
(3, 8, 'HE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'HE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-04-25 17:57:39', 1, '2023-04-25 17:57:46'),
(4, 9, 'HEALTHY', 'BROWN', NULL, NULL, NULL, NULL, NULL, NULL, 'HEALTHY', 'BROWN', NULL, NULL, NULL, NULL, NULL, NULL, '2023-07-13 13:58:06', 1, '2023-07-13 13:58:22'),
(5, 9, 'HEALTHY', 'BROWN', NULL, NULL, NULL, NULL, NULL, NULL, 'HEALTHY', 'BROWN', NULL, NULL, NULL, NULL, NULL, NULL, '2023-07-13 14:05:30', 1, '2023-07-13 14:05:30'),
(6, 10, 'HEALTHY', 'BROWN', NULL, 'HEALTHY', NULL, NULL, NULL, NULL, 'HEALTHY', 'BROWN', NULL, 'HEALTHY', NULL, NULL, NULL, NULL, '2024-03-21 17:29:37', 1, '2024-03-21 17:30:02'),
(7, 11, 'HEALTHY', 'BROWN', NULL, NULL, NULL, NULL, NULL, NULL, 'HEALTHY', 'BROWN', NULL, NULL, NULL, NULL, NULL, NULL, '2024-05-13 07:33:19', 1, '2024-05-13 07:33:37');

-- --------------------------------------------------------

--
-- Table structure for table `consultation_functional_tests`
--

CREATE TABLE `consultation_functional_tests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `consultation_id` bigint(20) UNSIGNED NOT NULL,
  `re_npc` varchar(255) DEFAULT NULL,
  `re_npa` varchar(255) DEFAULT NULL,
  `re_confrontation` varchar(255) DEFAULT NULL,
  `re_cover_test` varchar(255) DEFAULT NULL,
  `le_npc` varchar(255) DEFAULT NULL,
  `le_npa` varchar(255) DEFAULT NULL,
  `le_confrontation` varchar(255) DEFAULT NULL,
  `le_cover_test` varchar(255) DEFAULT NULL,
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
  `re` varchar(255) DEFAULT NULL,
  `le` varchar(255) DEFAULT NULL,
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
  `ob_re_sph` varchar(255) DEFAULT NULL,
  `ob_re_cyl` varchar(255) DEFAULT NULL,
  `ob_re_axis` varchar(255) DEFAULT NULL,
  `ob_re_va` varchar(255) DEFAULT NULL,
  `ob_le_sph` varchar(255) DEFAULT NULL,
  `ob_le_cyl` varchar(255) DEFAULT NULL,
  `ob_le_axis` varchar(255) DEFAULT NULL,
  `ob_le_va` varchar(255) DEFAULT NULL,
  `sub_re_sph` varchar(255) DEFAULT NULL,
  `sub_re_cyl` varchar(255) DEFAULT NULL,
  `sub_re_axis` varchar(255) DEFAULT NULL,
  `sub_re_va` varchar(255) DEFAULT NULL,
  `sub_re_add` varchar(255) DEFAULT NULL,
  `sub_re_add_va` varchar(255) DEFAULT NULL,
  `sub_le_sph` varchar(255) DEFAULT NULL,
  `sub_le_cyl` varchar(255) DEFAULT NULL,
  `sub_le_axis` varchar(255) DEFAULT NULL,
  `sub_le_va` varchar(255) DEFAULT NULL,
  `sub_le_add` varchar(255) DEFAULT NULL,
  `sub_le_add_va` varchar(255) DEFAULT NULL,
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
(5, 8, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'PL', '0.5', NULL, NULL, NULL, NULL, 'PL', '0.5', NULL, NULL, NULL, NULL, '2023-04-25 17:58:15', 1, '2023-04-25 17:58:30'),
(6, 9, 're sph', 're cyl', 're ax', 're va', 'le sph', 'le cyl', 'le ax', 'le va', 'sre sph', 'sre cyl', NULL, NULL, NULL, NULL, 'sle sph', NULL, NULL, NULL, NULL, NULL, '2023-07-13 13:59:28', 1, '2023-07-13 14:08:24'),
(7, 9, 're sph', 're cyl', 're ax', 're va', 'le sph', 'le cyl', 'le ax', 'le va', 'sre sph', NULL, NULL, NULL, NULL, NULL, 'sle sph', NULL, NULL, NULL, NULL, NULL, '2023-07-13 14:05:30', 1, '2023-07-13 14:05:30'),
(8, 9, 're sph', 're cyl', 're ax', 're va', 'le sph', 'le cyl', 'le ax', 'le va', 'sre sph', 'sre cyl', NULL, NULL, NULL, NULL, 'sle sph', NULL, NULL, NULL, NULL, NULL, '2023-07-13 14:08:45', 1, '2023-07-13 14:08:45'),
(9, 10, '0.5', '+1', '1', '6/7', NULL, NULL, NULL, NULL, '1.5', '0.5', '-1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-03-21 17:30:11', 1, '2024-03-21 17:30:34'),
(10, 11, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0.5', '+1', '2', '6/9', '1.5', '6/9', NULL, NULL, NULL, NULL, NULL, NULL, '2024-05-13 07:33:50', 1, '2024-05-13 07:34:07'),
(11, 11, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0.5', '+1', '2', '6/9', '1.5', '6/9', NULL, NULL, NULL, NULL, NULL, NULL, '2024-05-13 07:41:47', 1, '2024-05-13 07:41:47');

-- --------------------------------------------------------

--
-- Table structure for table `consultation_types`
--

CREATE TABLE `consultation_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
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
  `unaided_re_va` varchar(255) DEFAULT NULL,
  `unaided_re_ph` varchar(255) DEFAULT NULL,
  `unaided_ipd` varchar(255) DEFAULT NULL,
  `unaided_le_va` varchar(255) DEFAULT NULL,
  `unaided_le_ph` varchar(255) DEFAULT NULL,
  `aided_re_va` varchar(255) DEFAULT NULL,
  `aided_re_va_description` varchar(255) DEFAULT NULL,
  `aided_le_va` varchar(255) DEFAULT NULL,
  `aided_le_va_description` varchar(255) DEFAULT NULL,
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
(3, 8, '6/6', NULL, NULL, '6/7', NULL, '7/7', NULL, '7/8', NULL, '2023-04-25 17:57:20', 1, '2023-04-25 17:57:33'),
(4, 9, '6/7', NULL, NULL, '6/7', NULL, '7/7', NULL, '7/8', NULL, '2023-07-13 13:57:49', 1, '2023-07-13 13:57:59'),
(5, 9, '6/7', NULL, NULL, '6/7', NULL, '7/7', NULL, '7/8', NULL, '2023-07-13 14:05:30', 1, '2023-07-13 14:05:30'),
(6, 10, '6/7', NULL, NULL, '7/7', NULL, '7/7', NULL, '7/7', NULL, '2024-03-21 17:29:21', 1, '2024-03-21 17:29:32'),
(7, 11, '6/6', NULL, NULL, '6/6', NULL, '6/9', NULL, '6/9', NULL, '2024-05-13 07:33:04', 1, '2024-05-13 07:33:14');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
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
  `name` varchar(255) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `diseases`
--

INSERT INTO `diseases` (`id`, `name`, `code`, `status`, `created_at`, `updated_at`) VALUES
(5, 'Hordeolum and chalazion', 'H00', 'Active', NULL, NULL),
(6, 'Hordeolum and other deep inflammation of eyelid', 'H00.0', 'Active', NULL, NULL),
(7, 'Chalazion', 'H00.1', 'Active', NULL, NULL),
(8, 'Other inflammation of eyelid', 'H01', 'Active', NULL, NULL),
(9, 'Blepharitis', 'H01.0', 'Active', NULL, NULL),
(10, 'Noninfectious dermatoses of eyelid', 'H01.1', 'Active', NULL, NULL),
(11, 'Other specified inflammation of eyelid', 'H01.8', 'Active', NULL, NULL),
(12, 'Inflammation of eyelid, unspecified', 'H01.9', 'Active', NULL, NULL),
(13, 'Other disorders of eyelid', 'H02', 'Active', NULL, NULL),
(14, 'Entropion and trichiasis of eyelid', 'H02.0', 'Active', NULL, NULL),
(15, 'Ectropion of eyelid', 'H02.1', 'Active', NULL, NULL),
(16, 'Lagophthalmos', 'H02.2', 'Active', NULL, NULL),
(17, 'Blepharochalasis', 'H02.3', 'Active', NULL, NULL),
(18, 'Ptosis of eyelid', 'H02.4', 'Active', NULL, NULL),
(19, 'Other disorders affecting eyelid function', 'H02.5', 'Active', NULL, NULL),
(20, 'Xanthelasma of eyelid', 'H02.6', 'Active', NULL, NULL),
(21, 'Other degenerative disorders of eyelid and periocular area', 'H02.7', 'Active', NULL, NULL),
(22, 'Other specified disorders of eyelid', 'H02.8', 'Active', NULL, NULL),
(23, 'Disorder of eyelid, unspecified', 'H02.9', 'Active', NULL, NULL),
(24, 'Disorders of eyelid in diseases classified elsewhere', 'H03', 'Active', NULL, NULL),
(25, 'Parasitic infestation of eyelid in diseases classified elsewhere', 'H03.0', 'Active', NULL, NULL),
(26, 'Involvement of eyelid in other infectious diseases classified elsewhere', 'H03.1', 'Active', NULL, NULL),
(27, 'Involvement of eyelid in other diseases classified elsewhere', 'H03.8', 'Active', NULL, NULL),
(28, 'Disorders of lacrimal system', 'H04', 'Active', NULL, NULL),
(29, 'Dacryoadenitis', 'H04.0', 'Active', NULL, NULL),
(30, 'Other disorders of lacrimal gland', 'H04.1', 'Active', NULL, NULL),
(31, 'Epiphora', 'H04.2', 'Active', NULL, NULL),
(32, 'Acute and unspecified inflammation of lacrimal passages', 'H04.3', 'Active', NULL, NULL),
(33, 'Chronic inflammation of lacrimal passages', 'H04.4', 'Active', NULL, NULL),
(34, 'Stenosis and insufficiency of lacrimal passages', 'H04.5', 'Active', NULL, NULL),
(35, 'Other changes in lacrimal passages', 'H04.6', 'Active', NULL, NULL),
(36, 'Other disorders of lacrimal system', 'H04.8', 'Active', NULL, NULL),
(37, 'Disorder of lacrimal system, unspecified', 'H04.9', 'Active', NULL, NULL),
(38, 'Disorders of orbit', 'H05', 'Active', NULL, NULL),
(39, 'Acute inflammation of orbit', 'H05.0', 'Active', NULL, NULL),
(40, 'Chronic inflammatory disorders of orbit', 'H05.1', 'Active', NULL, NULL),
(41, 'Exophthalmic conditions', 'H05.2', 'Active', NULL, NULL),
(42, 'Deformity of orbit', 'H05.3', 'Active', NULL, NULL),
(43, 'Enophthalmos', 'H05.4', 'Active', NULL, NULL),
(44, 'Retained (old) foreign body following penetrating wound of orbit', 'H05.5', 'Active', NULL, NULL),
(45, 'Other disorders of orbit', 'H05.8', 'Active', NULL, NULL),
(46, 'Disorder of orbit, unspecified', 'H05.9', 'Active', NULL, NULL),
(47, 'Disorders of lacrimal system and orbit in diseases classified elsewhere', 'H06', 'Active', NULL, NULL),
(48, 'Disorders of lacrimal system in diseases classified elsewhere', 'H06.0', 'Active', NULL, NULL),
(49, 'Parasitic infestation of orbit in diseases classified elsewhere', 'H06.1', 'Active', NULL, NULL),
(50, 'Dysthyroid exophthalmos', 'H06.2', 'Active', NULL, NULL),
(51, 'Other disorders of orbit in diseases classified elsewhere', 'H06.3', 'Active', NULL, NULL),
(52, 'Conjunctivitis', 'H10', 'Active', NULL, NULL),
(53, 'Mucopurulent conjunctivitis', 'H10.0', 'Active', NULL, NULL),
(54, 'Acute atopic conjunctivitis', 'H10.1', 'Active', NULL, NULL),
(55, 'Other acute conjunctivitis', 'H10.2', 'Active', NULL, NULL),
(56, 'Acute conjunctivitis, unspecified', 'H10.3', 'Active', NULL, NULL),
(57, 'Chronic conjunctivitis', 'H10.4', 'Active', NULL, NULL),
(58, 'Blepharoconjunctivitis', 'H10.5', 'Active', NULL, NULL),
(59, 'Other conjunctivitis', 'H10.8', 'Active', NULL, NULL),
(60, 'Conjunctivitis, unspecified', 'H10.9', 'Active', NULL, NULL),
(61, 'Other disorders of conjunctiva', 'H11', 'Active', NULL, NULL),
(62, 'Pterygium', 'H11.0', 'Active', NULL, NULL),
(63, 'Conjunctival degenerations and deposits', 'H11.1', 'Active', NULL, NULL),
(64, 'Conjunctival scars', 'H11.2', 'Active', NULL, NULL),
(65, 'Conjunctival haemorrhage', 'H11.3', 'Active', NULL, NULL),
(66, 'Other conjunctival vascular disorders and cysts', 'H11.4', 'Active', NULL, NULL),
(67, 'Other specified disorders of conjunctiva', 'H11.8', 'Active', NULL, NULL),
(68, 'Disorder of conjunctiva, unspecified', 'H11.9', 'Active', NULL, NULL),
(69, 'Disorders of conjunctiva in diseases classified elsewhere', 'H13', 'Active', NULL, NULL),
(70, 'Filarial infection of conjunctiva', 'H13.0', 'Active', NULL, NULL),
(71, 'Conjunctivitis in infectious and parasitic diseases classified elsewhere', 'H13.1', 'Active', NULL, NULL),
(72, 'Conjunctivitis in other diseases classified elsewhere', 'H13.2', 'Active', NULL, NULL),
(73, 'Ocular pemphigoid', 'H13.3', 'Active', NULL, NULL),
(74, 'Other disorders of conjunctiva in diseases classified elsewhere', 'H13.8', 'Active', NULL, NULL),
(75, 'Disorders of sclera', 'H15', 'Active', NULL, NULL),
(76, 'Scleritis', 'H15.0', 'Active', NULL, NULL),
(77, 'Episcleritis', 'H15.1', 'Active', NULL, NULL),
(78, 'Other disorders of sclera', 'H15.8', 'Active', NULL, NULL),
(79, 'Disorder of sclera, unspecified', 'H15.9', 'Active', NULL, NULL),
(80, 'Keratitis', 'H16', 'Active', NULL, NULL),
(81, 'Corneal ulcer', 'H16.0', 'Active', NULL, NULL),
(82, 'Other superficial keratitis without conjunctivitis', 'H16.1', 'Active', NULL, NULL),
(83, 'Keratoconjunctivitis', 'H16.2', 'Active', NULL, NULL),
(84, 'Interstitial and deep keratitis', 'H16.3', 'Active', NULL, NULL),
(85, 'Corneal neovascularization', 'H16.4', 'Active', NULL, NULL),
(86, 'Other keratitis', 'H16.8', 'Active', NULL, NULL),
(87, 'Keratitis, unspecified', 'H16.9', 'Active', NULL, NULL),
(88, 'Corneal scars and opacities', 'H17', 'Active', NULL, NULL),
(89, 'Adherent leukoma', 'H17.0', 'Active', NULL, NULL),
(90, 'Other central corneal opacity', 'H17.1', 'Active', NULL, NULL),
(91, 'Other corneal scars and opacities', 'H17.8', 'Active', NULL, NULL),
(92, 'Corneal scar and opacity, unspecified', 'H17.9', 'Active', NULL, NULL),
(93, 'Other disorders of cornea', 'H18', 'Active', NULL, NULL),
(94, 'Corneal pigmentations and deposits', 'H18.0', 'Active', NULL, NULL),
(95, 'Bullous keratopathy', 'H18.1', 'Active', NULL, NULL),
(96, 'Other corneal oedema', 'H18.2', 'Active', NULL, NULL),
(97, 'Changes in corneal membranes', 'H18.3', 'Active', NULL, NULL),
(98, 'Corneal degeneration', 'H18.4', 'Active', NULL, NULL),
(99, 'Hereditary corneal dystrophies', 'H18.5', 'Active', NULL, NULL),
(100, 'Keratoconus', 'H18.6', 'Active', NULL, NULL),
(101, 'Other corneal deformities', 'H18.7', 'Active', NULL, NULL),
(102, 'Other specified disorders of cornea', 'H18.8', 'Active', NULL, NULL),
(103, 'Disorder of cornea, unspecified', 'H18.9', 'Active', NULL, NULL),
(104, 'Disorders of sclera and cornea in diseases classified elsewhere', 'H19', 'Active', NULL, NULL),
(105, 'Scleritis and episcleritis in diseases classified elsewhere', 'H19.0', 'Active', NULL, NULL),
(106, 'Herpesviral keratitis and keratoconjunctivitis', 'H19.1', 'Active', NULL, NULL),
(107, 'Keratitis and keratoconjunctivitis in other infectious and parasitic diseases classified elsewhere', 'H19.2', 'Active', NULL, NULL),
(108, 'Keratitis and keratoconjunctivitis in other diseases classified elsewhere', 'H19.3', 'Active', NULL, NULL),
(109, 'Other disorders of sclera and cornea in diseases classified elsewhere', 'H19.8', 'Active', NULL, NULL),
(110, 'Iridocyclitis', 'H20', 'Active', NULL, NULL),
(111, 'Acute and subacute iridocyclitis', 'H20.0', 'Active', NULL, NULL),
(112, 'Chronic iridocyclitis', 'H20.1', 'Active', NULL, NULL),
(113, 'Lens-induced iridocyclitis', 'H20.2', 'Active', NULL, NULL),
(114, 'Other iridocyclitis', 'H20.8', 'Active', NULL, NULL),
(115, 'Iridocyclitis, unspecified', 'H20.9', 'Active', NULL, NULL),
(116, 'Other disorders of iris and ciliary body', 'H21', 'Active', NULL, NULL),
(117, 'Hyphaema', 'H21.0', 'Active', NULL, NULL),
(118, 'Other vascular disorders of iris and ciliary body', 'H21.1', 'Active', NULL, NULL),
(119, 'Degeneration of iris and ciliary body', 'H21.2', 'Active', NULL, NULL),
(120, 'Cyst of iris, ciliary body and anterior chamber', 'H21.3', 'Active', NULL, NULL),
(121, 'Pupillary membranes', 'H21.4', 'Active', NULL, NULL),
(122, 'Other adhesions and disruptions of iris and ciliary body', 'H21.5', 'Active', NULL, NULL),
(123, 'Other specified disorders of iris and ciliary body', 'H21.8', 'Active', NULL, NULL),
(124, 'Disorder of iris and ciliary body, unspecified', 'H21.9', 'Active', NULL, NULL),
(125, 'Disorders of iris and ciliary body in diseases classified elsewhere', 'H22', 'Active', NULL, NULL),
(126, 'Iridocyclitis in infectious and parasitic diseases classified elsewhere', 'H22.0', 'Active', NULL, NULL),
(127, 'Iridocyclitis in other diseases classified elsewhere', 'H22.1', 'Active', NULL, NULL),
(128, 'Other disorders of iris and ciliary body in diseases classified elsewhere', 'H22.8', 'Active', NULL, NULL),
(129, 'Senile cataract', 'H25', 'Active', NULL, NULL),
(130, 'Senile incipient cataract', 'H25.0', 'Active', NULL, NULL),
(131, 'Senile nuclear cataract', 'H25.1', 'Active', NULL, NULL),
(132, 'Senile cataract, morgagnian type', 'H25.2', 'Active', NULL, NULL),
(133, 'Other senile cataract', 'H25.8', 'Active', NULL, NULL),
(134, 'Senile cataract, unspecified', 'H25.9', 'Active', NULL, NULL),
(135, 'Other cataract', 'H26', 'Active', NULL, NULL),
(136, 'Infantile, juvenile and presenile cataract', 'H26.0', 'Active', NULL, NULL),
(137, 'Traumatic cataract', 'H26.1', 'Active', NULL, NULL),
(138, 'Complicated cataract', 'H26.2', 'Active', NULL, NULL),
(139, 'Drug-induced cataract', 'H26.3', 'Active', NULL, NULL),
(140, 'After-cataract', 'H26.4', 'Active', NULL, NULL),
(141, 'Other specified cataract', 'H26.8', 'Active', NULL, NULL),
(142, 'Cataract, unspecified', 'H26.9', 'Active', NULL, NULL),
(143, 'Other disorders of lens', 'H27', 'Active', NULL, NULL),
(144, 'Aphakia', 'H27.0', 'Active', NULL, NULL),
(145, 'Dislocation of lens', 'H27.1', 'Active', NULL, NULL),
(146, 'Other specified disorders of lens', 'H27.8', 'Active', NULL, NULL),
(147, 'Disorder of lens, unspecified', 'H27.9', 'Active', NULL, NULL),
(148, 'Cataract and other disorders of lens in diseases classified elsewhere', 'H28', 'Active', NULL, NULL),
(149, 'Diabetic cataract', 'H28.0', 'Active', NULL, NULL),
(150, 'Cataract in other endocrine, nutritional and metabolic diseases', 'H28.1', 'Active', NULL, NULL),
(151, 'Cataract in other diseases classified elsewhere', 'H28.2', 'Active', NULL, NULL),
(152, 'Other disorders of lens in diseases classified elsewhere', 'H28.8', 'Active', NULL, NULL),
(153, 'Chorioretinal inflammation', 'H30', 'Active', NULL, NULL),
(154, 'Focal chorioretinal inflammation', 'H30.0', 'Active', NULL, NULL),
(155, 'Disseminated chorioretinal inflammation', 'H30.1', 'Active', NULL, NULL),
(156, 'Posterior cyclitis', 'H30.2', 'Active', NULL, NULL),
(157, 'Other chorioretinal inflammations', 'H30.8', 'Active', NULL, NULL),
(158, 'Chorioretinal inflammation, unspecified', 'H30.9', 'Active', NULL, NULL),
(159, 'Other disorders of choroid', 'H31', 'Active', NULL, NULL),
(160, 'Chorioretinal scars', 'H31.0', 'Active', NULL, NULL),
(161, 'Choroidal degeneration', 'H31.1', 'Active', NULL, NULL),
(162, 'Hereditary choroidal dystrophy', 'H31.2', 'Active', NULL, NULL),
(163, 'Choroidal haemorrhage and rupture', 'H31.3', 'Active', NULL, NULL),
(164, 'Choroidal detachment', 'H31.4', 'Active', NULL, NULL),
(165, 'Other specified disorders of choroid', 'H31.8', 'Active', NULL, NULL),
(166, 'Disorder of choroid, unspecified', 'H31.9', 'Active', NULL, NULL),
(167, 'Chorioretinal disorders in diseases classified elsewhere', 'H32', 'Active', NULL, NULL),
(168, 'Chorioretinal inflammation in infectious and parasitic diseases classified elsewhere', 'H32.0', 'Active', NULL, NULL),
(169, 'Other chorioretinal disorders in diseases classified elsewhere', 'H32.8', 'Active', NULL, NULL),
(170, 'Retinal detachments and breaks', 'H33', 'Active', NULL, NULL),
(171, 'Retinal detachment with retinal break', 'H33.0', 'Active', NULL, NULL),
(172, 'Retinoschisis and retinal cysts', 'H33.1', 'Active', NULL, NULL),
(173, 'Serous retinal detachment', 'H33.2', 'Active', NULL, NULL),
(174, 'Retinal breaks without detachment', 'H33.3', 'Active', NULL, NULL),
(175, 'Traction detachment of retina', 'H33.4', 'Active', NULL, NULL),
(176, 'Other retinal detachments', 'H33.5', 'Active', NULL, NULL),
(177, 'Retinal vascular occlusions', 'H34', 'Active', NULL, NULL),
(178, 'Transient retinal artery occlusion', 'H34.0', 'Active', NULL, NULL),
(179, 'Central retinal artery occlusion', 'H34.1', 'Active', NULL, NULL),
(180, 'Other retinal artery occlusions', 'H34.2', 'Active', NULL, NULL),
(181, 'Other retinal vascular occlusions', 'H34.8', 'Active', NULL, NULL),
(182, 'Retinal vascular occlusion, unspecified', 'H34.9', 'Active', NULL, NULL),
(183, 'Other retinal disorders', 'H35', 'Active', NULL, NULL),
(184, 'Background retinopathy and retinal vascular changes', 'H35.0', 'Active', NULL, NULL),
(185, 'Retinopathy of prematurity', 'H35.1', 'Active', NULL, NULL),
(186, 'Other proliferative retinopathy', 'H35.2', 'Active', NULL, NULL),
(187, 'Degeneration of macula and posterior pole', 'H35.3', 'Active', NULL, NULL),
(188, 'Peripheral retinal degeneration', 'H35.4', 'Active', NULL, NULL),
(189, 'Hereditary retinal dystrophy', 'H35.5', 'Active', NULL, NULL),
(190, 'Retinal haemorrhage', 'H35.6', 'Active', NULL, NULL),
(191, 'Separation of retinal layers', 'H35.7', 'Active', NULL, NULL),
(192, 'Other specified retinal disorders', 'H35.8', 'Active', NULL, NULL),
(193, 'Retinal disorder, unspecified', 'H35.9', 'Active', NULL, NULL),
(194, 'Retinal disorders in diseases classified elsewhere', 'H36', 'Active', NULL, NULL),
(195, 'Diabetic retinopathy', 'H36.0', 'Active', NULL, NULL),
(196, 'Other retinal disorders in diseases classified elsewhere', 'H36.8', 'Active', NULL, NULL),
(197, 'Glaucoma', 'H40', 'Active', NULL, NULL),
(198, 'Glaucoma suspect', 'H40.0', 'Active', NULL, NULL),
(199, 'Primary open-angle glaucoma', 'H40.1', 'Active', NULL, NULL),
(200, 'Primary angle-closure glaucoma', 'H40.2', 'Active', NULL, NULL),
(201, 'Glaucoma secondary to eye trauma', 'H40.3', 'Active', NULL, NULL),
(202, 'Glaucoma secondary to eye inflammation', 'H40.4', 'Active', NULL, NULL),
(203, 'Glaucoma secondary to other eye disorders', 'H40.5', 'Active', NULL, NULL),
(204, 'Glaucoma secondary to drugs', 'H40.6', 'Active', NULL, NULL),
(205, 'Other glaucoma', 'H40.8', 'Active', NULL, NULL),
(206, 'Glaucoma, unspecified', 'H40.9', 'Active', NULL, NULL),
(207, 'Glaucoma in diseases classified elsewhere', 'H42', 'Active', NULL, NULL),
(208, 'Glaucoma in endocrine, nutritional and metabolic diseases', 'H42.0', 'Active', NULL, NULL),
(209, 'Glaucoma in other diseases classified elsewhere', 'H42.8', 'Active', NULL, NULL),
(210, 'Disorders of vitreous body', 'H43', 'Active', NULL, NULL),
(211, 'Vitreous prolapse', 'H43.0', 'Active', NULL, NULL),
(212, 'Vitreous haemorrhage', 'H43.1', 'Active', NULL, NULL),
(213, 'Crystalline deposits in vitreous body', 'H43.2', 'Active', NULL, NULL),
(214, 'Other vitreous opacities', 'H43.3', 'Active', NULL, NULL),
(215, 'Other disorders of vitreous body', 'H43.8', 'Active', NULL, NULL),
(216, 'Disorder of vitreous body, unspecified', 'H43.9', 'Active', NULL, NULL),
(217, 'Disorders of globe', 'H44', 'Active', NULL, NULL),
(218, 'Purulent endophthalmitis', 'H44.0', 'Active', NULL, NULL),
(219, 'Other endophthalmitis', 'H44.1', 'Active', NULL, NULL),
(220, 'Degenerative myopia', 'H44.2', 'Active', NULL, NULL),
(221, 'Other degenerative disorders of globe', 'H44.3', 'Active', NULL, NULL),
(222, 'Hypotony of eye', 'H44.4', 'Active', NULL, NULL),
(223, 'Degenerated conditions of globe', 'H44.5', 'Active', NULL, NULL),
(224, 'Retained (old) intraocular foreign body, magnetic', 'H44.6', 'Active', NULL, NULL),
(225, 'Retained (old) intraocular foreign body, nonmagnetic', 'H44.7', 'Active', NULL, NULL),
(226, 'Other disorders of globe', 'H44.8', 'Active', NULL, NULL),
(227, 'Disorder of globe, unspecified', 'H44.9', 'Active', NULL, NULL),
(228, 'Disorders of vitreous body and globe in diseases classified elsewhere', 'H45', 'Active', NULL, NULL),
(229, 'Vitreous haemorrhage in diseases classified elsewhere', 'H45.0', 'Active', NULL, NULL),
(230, 'Endophthalmitis in diseases classified elsewhere', 'H45.1', 'Active', NULL, NULL),
(231, 'Other disorders of vitreous body and globe in diseases classified elsewhere', 'H45.8', 'Active', NULL, NULL),
(232, 'Optic neuritis', 'H46', 'Active', NULL, NULL),
(233, 'Other disorders of optic [2nd] nerve and visual pathways', 'H47', 'Active', NULL, NULL),
(234, 'Disorders of optic nerve, NEC', 'H47.0', 'Active', NULL, NULL),
(235, 'Papilloedema, unspecified', 'H47.1', 'Active', NULL, NULL),
(236, 'Optic atrophy', 'H47.2', 'Active', NULL, NULL),
(237, 'Other disorders of optic disc', 'H47.3', 'Active', NULL, NULL),
(238, 'Disorders of optic chiasm', 'H47.4', 'Active', NULL, NULL),
(239, 'Disorders of other visual pathways', 'H47.5', 'Active', NULL, NULL),
(240, 'Disorders of visual cortex', 'H47.6', 'Active', NULL, NULL),
(241, 'Disorder of visual pathways, unspecified', 'H47.7', 'Active', NULL, NULL),
(242, 'Disorders of optic [2nd] nerve and visual pathways in diseases classified elsewhere', 'H48', 'Active', NULL, NULL),
(243, 'Optic atrophy in diseases classified elsewhere', 'H48.0', 'Active', NULL, NULL),
(244, 'Retrobulbar neuritis in diseases classified elsewhere', 'H48.1', 'Active', NULL, NULL),
(245, 'Other disorders of optic nerve and visual pathways in diseases classified elsewhere', 'H48.8', 'Active', NULL, NULL),
(246, 'Paralytic strabismus', 'H49', 'Active', NULL, NULL),
(247, 'Third [oculomotor] nerve palsy', 'H49.0', 'Active', NULL, NULL),
(248, 'Fourth [trochlear] nerve palsy', 'H49.1', 'Active', NULL, NULL),
(249, 'Sixth [abducent] nerve palsy', 'H49.2', 'Active', NULL, NULL),
(250, 'Total (external) ophthalmoplegia', 'H49.3', 'Active', NULL, NULL),
(251, 'Progressive external ophthalmoplegia', 'H49.4', 'Active', NULL, NULL),
(252, 'Other paralytic strabismus', 'H49.8', 'Active', NULL, NULL),
(253, 'Paralytic strabismus, unspecified', 'H49.9', 'Active', NULL, NULL),
(254, 'Other strabismus', 'H50', 'Active', NULL, NULL),
(255, 'Convergent concomitant strabismus', 'H50.0', 'Active', NULL, NULL),
(256, 'Divergent concomitant strabismus', 'H50.1', 'Active', NULL, NULL),
(257, 'Vertical strabismus', 'H50.2', 'Active', NULL, NULL),
(258, 'Intermittent heterotropia', 'H50.3', 'Active', NULL, NULL),
(259, 'Other and unspecified heterotropia', 'H50.4', 'Active', NULL, NULL),
(260, 'Heterophoria', 'H50.5', 'Active', NULL, NULL),
(261, 'Mechanical strabismus', 'H50.6', 'Active', NULL, NULL),
(262, 'Other specified strabismus', 'H50.8', 'Active', NULL, NULL),
(263, 'Strabismus, unspecified', 'H50.9', 'Active', NULL, NULL),
(264, 'Other disorders of binocular movement', 'H51', 'Active', NULL, NULL),
(265, 'Palsy of conjugate gaze', 'H51.0', 'Active', NULL, NULL),
(266, 'Convergence insufficiency and excess', 'H51.1', 'Active', NULL, NULL),
(267, 'Internuclear ophthalmoplegia', 'H51.2', 'Active', NULL, NULL),
(268, 'Other specified disorders of binocular movement', 'H51.8', 'Active', NULL, NULL),
(269, 'Disorder of binocular movement, unspecified', 'H51.9', 'Active', NULL, NULL),
(270, 'Disorders of refraction and accommodation', 'H52', 'Active', NULL, NULL),
(271, 'Hypermetropia', 'H52.0', 'Active', NULL, NULL),
(272, 'Myopia', 'H52.1', 'Active', NULL, NULL),
(273, 'Astigmatism', 'H52.2', 'Active', NULL, NULL),
(274, 'Anisometropia and aniseikonia', 'H52.3', 'Active', NULL, NULL),
(275, 'Presbyopia', 'H52.4', 'Active', NULL, NULL),
(276, 'Disorders of accommodation', 'H52.5', 'Active', NULL, NULL),
(277, 'Other disorders of refraction', 'H52.6', 'Active', NULL, NULL),
(278, 'Disorder of refraction, unspecified', 'H52.7', 'Active', NULL, NULL),
(279, 'Visual disturbances', 'H53', 'Active', NULL, NULL),
(280, 'Amblyopia ex anopsia', 'H53.0', 'Active', NULL, NULL),
(281, 'Subjective visual disturbances', 'H53.1', 'Active', NULL, NULL),
(282, 'Diplopia', 'H53.2', 'Active', NULL, NULL),
(283, 'Other disorders of binocular vision', 'H53.3', 'Active', NULL, NULL),
(284, 'Visual field defects', 'H53.4', 'Active', NULL, NULL),
(285, 'Colour vision deficiencies', 'H53.5', 'Active', NULL, NULL),
(286, 'Night blindness', 'H53.6', 'Active', NULL, NULL),
(287, 'Other visual disturbances', 'H53.8', 'Active', NULL, NULL),
(288, 'Visual disturbance, unspecified', 'H53.9', 'Active', NULL, NULL),
(289, 'Blindness and low vision', 'H54', 'Active', NULL, NULL),
(290, 'Blindness, both eyes', 'H54.0', 'Active', NULL, NULL),
(291, 'Blindness, one eye, low vision other eye', 'H54.1', 'Active', NULL, NULL),
(292, 'Low vision, both eyes', 'H54.2', 'Active', NULL, NULL),
(293, 'Unqualified visual loss, both eyes', 'H54.3', 'Active', NULL, NULL),
(294, 'Blindness, one eye', 'H54.4', 'Active', NULL, NULL),
(295, 'Low vision, one eye', 'H54.5', 'Active', NULL, NULL),
(296, 'Unqualified visual loss, one eye', 'H54.6', 'Active', NULL, NULL),
(297, 'Unspecified visual impairment (binocular)', 'H54.9', 'Active', NULL, NULL),
(298, 'Nystagmus and other irregular eye movements', 'H55', 'Active', NULL, NULL),
(299, 'Other disorders of eye and adnexa', 'H57', 'Active', NULL, NULL),
(300, 'Anomalies of pupillary function', 'H57.0', 'Active', NULL, NULL),
(301, 'Ocular pain', 'H57.1', 'Active', NULL, NULL),
(302, 'Other specified disorders of eye and adnexa', 'H57.8', 'Active', NULL, NULL),
(303, 'Disorder of eye and adnexa, unspecified', 'H57.9', 'Active', NULL, NULL),
(304, 'Other disorders of eye and adnexa in diseases classified elsewhere', 'H58', 'Active', NULL, NULL),
(305, 'Anomalies of pupillary function in diseases classified elsewhere', 'H58.0', 'Active', NULL, NULL),
(306, 'Visual disturbances in diseases classified elsewhere', 'H58.1', 'Active', NULL, NULL),
(307, 'Other specified disorders of eye and adnexa in diseases classified elsewhere', 'H58.8', 'Active', NULL, NULL),
(308, 'Postprocedural disorders of eye and adnexa, NEC', 'H59', 'Active', NULL, NULL),
(309, 'Vitreous syndrome following cataract surgery', 'H59.0', 'Active', NULL, NULL),
(310, 'Other postprocedural disorders of eye and adnexa', 'H59.8', 'Active', NULL, NULL),
(311, 'Postprocedural disorder of eye and adnexa, unspecified', 'H59.9', 'Active', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `districts`
--

CREATE TABLE `districts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `region_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
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
  `first_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) NOT NULL,
  `department_id` bigint(20) UNSIGNED DEFAULT NULL,
  `job_title_id` bigint(20) UNSIGNED DEFAULT NULL,
  `employee_number` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('Male','Female') DEFAULT NULL,
  `national_id` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
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
  `description` varchar(255) DEFAULT NULL,
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
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
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
  `description` varchar(255) DEFAULT NULL,
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
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `item_type_id` bigint(20) UNSIGNED DEFAULT NULL,
  `consultation_type_id` bigint(20) UNSIGNED DEFAULT NULL,
  `unit_of_measure_id` bigint(20) UNSIGNED DEFAULT NULL,
  `lens_type_id` bigint(20) UNSIGNED DEFAULT NULL,
  `is_consultation_item` enum('Yes','No') NOT NULL DEFAULT 'No',
  `is_stock_item` enum('Yes','No') NOT NULL DEFAULT 'No',
  `balance` double DEFAULT NULL,
  `unit_buying_price` double UNSIGNED DEFAULT NULL,
  `templates` text DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `name`, `code`, `item_type_id`, `consultation_type_id`, `unit_of_measure_id`, `lens_type_id`, `is_consultation_item`, `is_stock_item`, `balance`, `unit_buying_price`, `templates`, `status`, `created_at`, `updated_at`) VALUES
(1, 'General Consultation - New', 'GC', 5, 4, NULL, NULL, 'Yes', 'No', NULL, NULL, NULL, 'Active', '2022-12-30 18:55:33', '2022-12-30 18:55:33'),
(2, 'General Consultation - Return', 'GR', 5, 4, NULL, NULL, 'Yes', 'No', NULL, NULL, NULL, 'Active', '2022-12-30 19:00:25', '2022-12-30 19:00:25'),
(3, 'Aciclovir eye ointment', NULL, 2, 1, 5, NULL, 'No', 'Yes', 56, 2000, NULL, 'Active', '2022-12-30 19:01:07', '2023-07-13 14:11:03'),
(4, 'Fluorometholone eye drops for inflammation (FML)', NULL, 2, 1, 4, NULL, 'No', 'Yes', 148, 500, NULL, 'Active', '2022-12-30 19:01:36', '2022-12-30 19:53:19'),
(5, 'Eye Cleansing', NULL, 1, 3, NULL, NULL, 'No', 'No', NULL, NULL, NULL, 'Active', '2022-12-30 19:02:06', '2022-12-30 19:02:06'),
(6, 'RE CONV (02 - 06)', NULL, 3, 2, 3, 1, 'No', 'Yes', 30, 80000, NULL, 'Active', '2022-12-30 19:03:27', '2024-05-13 07:44:15'),
(7, 'Test Procedure', NULL, 1, 3, NULL, NULL, 'No', 'No', NULL, NULL, ',Surgery Record Report,Cataract Surgery Record', 'Active', '2024-03-21 17:22:28', '2024-03-21 17:23:50'),
(8, 'Cataract Surgery', NULL, 1, 3, NULL, NULL, 'No', 'No', NULL, NULL, 'Surgery Record Report,Cataract Surgery Record', 'Active', '2024-03-21 17:25:25', '2024-03-21 17:25:25');

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
(10, 6, 2, 100000, '2022-12-30 19:58:16', '2022-12-30 19:58:16'),
(11, 8, 1, 150000, '2024-03-21 17:27:51', '2024-03-21 17:27:51');

-- --------------------------------------------------------

--
-- Table structure for table `item_types`
--

CREATE TABLE `item_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
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
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
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
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
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
  `message` text NOT NULL,
  `phone` varchar(255) NOT NULL,
  `patient_id` bigint(20) UNSIGNED DEFAULT NULL,
  `api_response` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `message`, `phone`, `patient_id`, `api_response`, `created_at`, `updated_at`) VALUES
(1, 'Habari Husna. Tunakushukuru kwa kuja kupata huduma yetu. Ni matumaini yetu umefurahia huduma zetu. Asante na karibu tena.', '0678660192', 4, '{\"successful\":true,\"request_id\":58994516,\"code\":100,\"message\":\"Message Submitted Successfully\",\"valid\":1,\"invalid\":0,\"duplicates\":0}', '2022-12-30 21:35:15', '2022-12-30 21:35:15'),
(2, 'Habari Eric. Tunakushukuru kwa kuja kupata huduma yetu. Ni matumaini yetu umefurahia huduma zetu. Asante na karibu tena.', '0757206864', 3, '{\"successful\":true,\"request_id\":66245910,\"code\":100,\"message\":\"Message Submitted Successfully\",\"valid\":1,\"invalid\":0,\"duplicates\":0}', '2023-03-02 17:48:15', '2023-03-02 17:48:15'),
(3, 'Habari Elizabeth. Tunakushukuru kwa kuja kupata huduma yetu. Ni matumaini yetu umefurahia huduma zetu. Asante na karibu tena.', '0756204859', 5, '{\"successful\":true,\"request_id\":112733601,\"code\":100,\"message\":\"Message Submitted Successfully\",\"valid\":1,\"invalid\":0,\"duplicates\":0}', '2024-03-21 17:31:15', '2024-03-21 17:31:15'),
(4, 'Habari Peter. Tunakushukuru kwa kuja kupata huduma yetu. Ni matumaini yetu umefurahia huduma zetu. Asante na karibu tena.', '0688811874', 6, '{\"successful\":true,\"request_id\":120033560,\"code\":100,\"message\":\"Message Submitted Successfully\",\"valid\":1,\"invalid\":0,\"duplicates\":0}', '2024-05-13 07:36:00', '2024-05-13 07:36:00');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
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
(44, '2023_04_30_000913_update_consultations_table', 3),
(46, '2023_07_13_161522_update_address_on_patients_table', 4),
(47, '2024_03_21_194535_add_templates_to_items_table', 5),
(50, '2024_03_21_223838_create_surgery_record_reports_table', 6),
(53, '2024_03_21_223857_create_cataract_surgery_records_table', 7);

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) NOT NULL,
  `gender` enum('Male','Female') NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `region_id` bigint(20) UNSIGNED DEFAULT NULL,
  `district_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ward_id` bigint(20) UNSIGNED DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `national_id` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `occupation` varchar(255) DEFAULT NULL,
  `payment_mode_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `first_name`, `middle_name`, `last_name`, `gender`, `date_of_birth`, `region_id`, `district_id`, `ward_id`, `address`, `national_id`, `phone`, `occupation`, `payment_mode_id`, `created_at`, `created_by`, `updated_at`) VALUES
(1, 'Paul', NULL, 'Rudiger', 'Male', '1996-12-30', 1, 2, 6, 'Magomeni', NULL, '0757206864', NULL, 1, '2022-12-30 19:38:29', 1, '2022-12-30 19:38:29'),
(2, 'Amina', NULL, 'Shaaban', 'Female', '2003-12-30', 1, 1, 1, 'Kijitonyama', NULL, '0678660192', NULL, 2, '2022-12-30 19:39:29', 1, '2022-12-30 19:39:29'),
(3, 'Eric', NULL, 'Msodoki', 'Male', NULL, 1, 1, 2, 'Msasani', NULL, '0757206864', NULL, 1, '2022-12-30 19:40:37', 1, '2022-12-30 19:40:37'),
(4, 'Husna', NULL, 'Abdul', 'Female', '1988-09-17', 1, 2, 7, 'Tabata Segerea', NULL, '0678660192', NULL, 1, '2022-12-30 19:41:41', 1, '2022-12-30 19:41:41'),
(5, 'Elizabeth', NULL, 'Karungi', 'Female', NULL, NULL, NULL, NULL, 'Kawe', NULL, '0756204859', NULL, 1, '2023-07-13 13:50:09', 1, '2023-07-13 13:51:22'),
(6, 'Peter', NULL, 'Babyegeya', 'Male', '2004-05-13', NULL, NULL, NULL, 'Bugando', NULL, '0688811874', NULL, 1, '2024-05-13 07:30:06', 1, '2024-05-13 07:30:06');

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
(8, 4, 1, '2023-04-25 17:55:39', 1, '2023-04-25 17:55:39'),
(9, 5, 1, '2023-07-13 13:54:01', 1, '2023-07-13 13:54:01'),
(10, 5, 1, '2024-03-21 17:26:13', 1, '2024-03-21 17:26:13'),
(11, 6, 1, '2024-05-13 07:31:09', 1, '2024-05-13 07:31:09'),
(12, 5, 1, '2024-05-13 07:49:16', 1, '2024-05-13 07:49:16'),
(13, 2, 2, '2024-05-13 07:50:46', 1, '2024-05-13 07:50:46'),
(14, 6, 1, '2024-05-22 19:28:07', 1, '2024-05-22 19:28:07'),
(15, 5, 1, '2024-05-22 19:28:22', 1, '2024-05-22 19:28:22');

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
  `status` enum('Pending','Cleared') NOT NULL DEFAULT 'Pending',
  `cleared_at` datetime DEFAULT NULL,
  `cleared_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patient_item_bills`
--

INSERT INTO `patient_item_bills` (`id`, `amount`, `discount`, `created_at`, `created_by`, `status`, `cleared_at`, `cleared_by`, `updated_at`) VALUES
(1, 5000, 0, '2024-05-13 08:00:39', 1, 'Cleared', '2024-05-13 11:07:54', 1, '2024-05-13 08:07:54');

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
(1, 1, 2, 3000, '2024-05-13 08:05:57', 1, '2024-05-13 08:05:57'),
(2, 1, 2, 5000, '2024-05-13 08:06:47', 1, '2024-05-13 08:06:47');

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
(7, 2, 5000, 0, '2023-04-25 17:56:02', 1, '2023-04-25 17:56:03'),
(8, 2, 5000, 0, '2023-07-13 13:54:40', 1, '2023-07-13 13:54:40'),
(9, 3, 5000, 0, '2024-03-21 17:26:31', 1, '2024-03-21 17:26:31'),
(10, 2, 150000, 0, '2024-03-21 17:34:09', 1, '2024-03-21 17:34:09'),
(11, 2, 5000, 0, '2024-05-13 07:32:03', 1, '2024-05-13 07:32:03'),
(12, 3, 107500, 0, '2024-05-13 07:43:51', 1, '2024-05-13 07:43:51');

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
(10, 8, NULL, '2023-04-25 17:55:39', 1, '2023-04-25 17:55:39'),
(11, 9, NULL, '2023-07-13 13:54:01', 1, '2023-07-13 13:54:01'),
(12, 9, 9, '2023-07-13 14:01:06', 1, '2023-07-13 14:01:06'),
(13, 10, NULL, '2024-03-21 17:26:13', 1, '2024-03-21 17:26:13'),
(14, 10, 10, '2024-03-21 17:28:14', 1, '2024-03-21 17:28:14'),
(15, 11, NULL, '2024-05-13 07:31:09', 1, '2024-05-13 07:31:09'),
(16, 11, 11, '2024-05-13 07:35:11', 1, '2024-05-13 07:35:11'),
(17, 12, NULL, '2024-05-13 07:49:16', 1, '2024-05-13 07:49:16'),
(18, 13, NULL, '2024-05-13 07:50:46', 1, '2024-05-13 07:50:46'),
(19, 12, 13, '2024-05-13 08:05:19', 1, '2024-05-13 08:05:19'),
(20, 14, NULL, '2024-05-22 19:28:07', 1, '2024-05-22 19:28:07'),
(21, 15, NULL, '2024-05-22 19:28:22', 1, '2024-05-22 19:28:22');

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
  `dosage` text DEFAULT NULL,
  `comments` text DEFAULT NULL,
  `status` enum('Pending','Paid','Billed','Served') NOT NULL DEFAULT 'Pending',
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
(14, 10, 1, 4, NULL, 1, 5000, 1, 7, NULL, '2023-04-25 17:55:40', 1, NULL, 'asa', 'Served', '2023-04-25 21:01:07', 1, '2023-04-25 18:01:07'),
(15, 11, 1, 4, 1, 1, 5000, 1, 8, NULL, '2023-07-13 13:54:01', 1, NULL, 'test', 'Served', '2023-07-13 17:05:30', 1, '2023-07-13 14:05:30'),
(16, 12, 3, 1, NULL, 2, 2500, 1, NULL, NULL, '2023-07-13 14:01:06', 1, '2x3', 'none', 'Served', '2023-07-13 17:11:03', 1, '2023-07-13 14:11:03'),
(17, 12, 6, 2, NULL, 2, 100000, 1, NULL, NULL, '2023-07-13 14:08:14', 1, NULL, 'test', 'Served', '2023-07-13 17:10:44', 1, '2023-07-13 14:10:44'),
(18, 13, 1, 4, NULL, 1, 5000, 1, 9, NULL, '2024-03-21 17:26:13', 1, NULL, '1', 'Served', '2024-03-21 20:31:14', 1, '2024-03-21 17:31:14'),
(19, 14, 8, 3, NULL, 1, 150000, 1, 10, NULL, '2024-03-21 17:28:14', 1, NULL, 'test', 'Paid', NULL, NULL, '2024-03-21 17:34:09'),
(20, 15, 1, 4, NULL, 1, 5000, 1, 11, NULL, '2024-05-13 07:31:09', 1, NULL, 'test', 'Served', '2024-05-13 10:35:57', 1, '2024-05-13 07:35:57'),
(21, 16, 3, 1, NULL, 1, 2500, 1, 12, NULL, '2024-05-13 07:35:11', 1, '1x3', NULL, 'Paid', NULL, NULL, '2024-05-13 07:43:51'),
(22, 16, 5, 3, NULL, 1, 5000, 1, 12, NULL, '2024-05-13 07:35:28', 1, NULL, 'done', 'Served', '2024-05-13 10:45:03', 1, '2024-05-13 07:45:03'),
(23, 16, 6, 2, NULL, 1, 100000, 1, 12, NULL, '2024-05-13 07:41:21', 1, NULL, NULL, 'Served', '2024-05-13 10:44:15', 1, '2024-05-13 07:44:15'),
(24, 17, 1, 4, NULL, 1, 5000, 1, NULL, 1, '2024-05-13 07:49:16', 1, NULL, '1', 'Billed', NULL, NULL, '2024-05-13 08:00:39'),
(25, 18, 1, 4, NULL, 2, 4500, 1, NULL, NULL, '2024-05-13 07:50:46', 1, NULL, '1', 'Paid', NULL, NULL, '2024-05-13 07:59:26'),
(26, 19, 8, 3, NULL, 1, 150000, 1, NULL, NULL, '2024-05-13 08:05:19', 1, NULL, NULL, 'Pending', NULL, NULL, '2024-05-13 08:05:19'),
(27, 20, 1, 4, NULL, 1, 5000, 1, NULL, NULL, '2024-05-22 19:28:07', 1, NULL, '1', 'Pending', NULL, NULL, '2024-05-22 19:28:07'),
(28, 21, 1, 4, NULL, 1, 5000, 1, NULL, NULL, '2024-05-22 19:28:22', 1, NULL, '1', 'Pending', NULL, NULL, '2024-05-22 19:28:22');

-- --------------------------------------------------------

--
-- Table structure for table `payment_channels`
--

CREATE TABLE `payment_channels` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_channels`
--

INSERT INTO `payment_channels` (`id`, `name`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Cash', NULL, 'Active', '2022-12-30 18:44:13', '2022-12-30 18:44:13'),
(2, 'M-Pesa', NULL, 'Active', '2022-12-30 18:44:23', '2022-12-30 18:44:23'),
(3, 'TigoPesa', NULL, 'Active', '2022-12-30 18:44:32', '2022-12-30 18:44:32'),
(4, 'Airtel Money', NULL, 'Active', '2022-12-30 18:44:45', '2022-12-30 18:44:45');

-- --------------------------------------------------------

--
-- Table structure for table `payment_modes`
--

CREATE TABLE `payment_modes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `transaction_type` enum('Cash','Credit') NOT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
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
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
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
(25, 'App\\Models\\User', 1, 'MyApp', 'e75792989ee0a2dc6ea873c55ddb1175e74eff43fe3d11f446f7b9e1dffe067d', '[\"*\"]', '2023-04-29 22:58:03', NULL, '2023-04-29 22:33:25', '2023-04-29 22:58:03'),
(26, 'App\\Models\\User', 1, 'MyApp', 'aaec2bf406185754e5149cc2f53862d81dca1fba8e3009a0c646c1f6c0064938', '[\"*\"]', '2023-07-13 14:20:56', NULL, '2023-07-13 13:46:27', '2023-07-13 14:20:56'),
(27, 'App\\Models\\User', 1, 'MyApp', '49a67d34c5a272bf3099a3d2033ad84ae954ebbedb3cc1f4f8b2a6c1aebda278', '[\"*\"]', '2023-07-14 11:06:30', NULL, '2023-07-14 11:00:26', '2023-07-14 11:06:30'),
(28, 'App\\Models\\User', 1, 'MyApp', '158ce598cfaf532233803f3c89747d0cb3aedbccf2e568cada813691131b625e', '[\"*\"]', '2023-07-18 10:10:10', NULL, '2023-07-18 10:10:02', '2023-07-18 10:10:10'),
(29, 'App\\Models\\User', 1, 'MyApp', 'bc7564d56621ba48c753a09c03d7eb834870236d5ea1113a1823decd2f4c6b39', '[\"*\"]', '2023-07-28 09:59:54', NULL, '2023-07-28 08:59:55', '2023-07-28 09:59:54'),
(30, 'App\\Models\\User', 1, 'MyApp', '8ab08e3e812f039e400f88b29292fc709df96f2a6d2c2f0a5bb9fc2e8c444497', '[\"*\"]', '2023-07-28 10:51:06', NULL, '2023-07-28 10:00:07', '2023-07-28 10:51:06'),
(31, 'App\\Models\\User', 1, 'MyApp', '3cca6f916e2b7a044f90b52595a27ec1a5df08fad01d526be5c536da16a0ff97', '[\"*\"]', '2023-07-28 15:54:00', NULL, '2023-07-28 15:00:41', '2023-07-28 15:54:00'),
(32, 'App\\Models\\User', 1, 'MyApp', '9ee14cf6a4588b0f6601188d91c9c3888b735308d6da0b5c2359fd5a5120577e', '[\"*\"]', '2023-08-06 22:21:16', NULL, '2023-08-06 22:16:50', '2023-08-06 22:21:16'),
(33, 'App\\Models\\User', 1, 'MyApp', '32fd97245c67a9b707136326885f59384abe9384d86103716bb83fe7a0d1a26f', '[\"*\"]', '2024-03-21 17:34:51', NULL, '2024-03-21 17:12:26', '2024-03-21 17:34:51'),
(34, 'App\\Models\\User', 1, 'MyApp', '842ad336c950a320a28e12c4d652e7728e96aa2fc4c8af2799f7844b9e98d6e5', '[\"*\"]', '2024-03-21 19:27:50', NULL, '2024-03-21 18:28:14', '2024-03-21 19:27:50'),
(35, 'App\\Models\\User', 1, 'MyApp', '847190d0bba8dd8ea0d31d6fd267ef949aa2c11de0601eae5053e35b4d435cdc', '[\"*\"]', '2024-03-21 20:27:09', NULL, '2024-03-21 19:28:25', '2024-03-21 20:27:09'),
(36, 'App\\Models\\User', 1, 'MyApp', 'cc8519799d36792d11590462d3e5ba2d830add480b63b0796791661f2582be8e', '[\"*\"]', '2024-03-21 21:56:15', NULL, '2024-03-21 20:58:49', '2024-03-21 21:56:15'),
(37, 'App\\Models\\User', 1, 'MyApp', '66284551af727792b2f97dd63a7b788a30a8574029b1c582d2e90540d48c4d44', '[\"*\"]', '2024-03-21 22:58:32', NULL, '2024-03-21 21:59:29', '2024-03-21 22:58:32'),
(38, 'App\\Models\\User', 1, 'MyApp', '47e79589672b061455b8677e1d0c839b7768187a2c0c5338651caa63bd748783', '[\"*\"]', '2024-03-21 23:57:36', NULL, '2024-03-21 22:59:44', '2024-03-21 23:57:36'),
(39, 'App\\Models\\User', 1, 'MyApp', 'e8942a03fae1ed60ef7f4bc6f7f3009ac614367bd76d0f3e15f61358886e727b', '[\"*\"]', '2024-03-22 00:14:41', NULL, '2024-03-22 00:04:43', '2024-03-22 00:14:41'),
(40, 'App\\Models\\User', 1, 'MyApp', '2c00e045a97a4da4e4cebcb4eb6a7547be0b80296363b823d9e01a47382f5914', '[\"*\"]', '2024-03-22 09:19:51', NULL, '2024-03-22 08:21:09', '2024-03-22 09:19:51'),
(41, 'App\\Models\\User', 1, 'MyApp', 'b0321a8ed99d5d06be376c1a734ad596cd3feb339f008b9128d71cfc96e352e6', '[\"*\"]', '2024-03-22 09:53:55', NULL, '2024-03-22 09:22:26', '2024-03-22 09:53:55'),
(42, 'App\\Models\\User', 1, 'MyApp', '3c584fea7294195090795d86faf6c84beddd9628ee079acc514c2559896aa71e', '[\"*\"]', '2024-03-22 11:52:54', NULL, '2024-03-22 10:57:49', '2024-03-22 11:52:54'),
(43, 'App\\Models\\User', 1, 'MyApp', '94141e283343c927fc265d58a9df3ffad33b1cc62c6bd9fc25de9822e1586a55', '[\"*\"]', '2024-03-22 12:38:11', NULL, '2024-03-22 11:59:06', '2024-03-22 12:38:11'),
(44, 'App\\Models\\User', 1, 'MyApp', 'e1e929f7264ade4b91d289a4fef8133138d35a221e816c5878a0a6c6becf9ce2', '[\"*\"]', '2024-03-22 14:27:40', NULL, '2024-03-22 13:33:31', '2024-03-22 14:27:40'),
(45, 'App\\Models\\User', 1, 'MyApp', '412361fc5d66e22c6aa4e873330adba059676f3ae002d5eb2a10757d6db39bad', '[\"*\"]', '2024-03-22 15:40:03', NULL, '2024-03-22 14:42:48', '2024-03-22 15:40:03'),
(46, 'App\\Models\\User', 1, 'MyApp', '3c998b73873f5c0e455a9edd9ea6c9e5eefd4ca9f87022ae0905ac33c51bd5ee', '[\"*\"]', '2024-03-22 16:48:53', NULL, '2024-03-22 15:50:34', '2024-03-22 16:48:53'),
(47, 'App\\Models\\User', 1, 'MyApp', '723cec36bd32db9ddaa23635427999f7089754f05ccf60d5b2ad38543c00e56a', '[\"*\"]', '2024-03-22 17:13:02', NULL, '2024-03-22 16:53:16', '2024-03-22 17:13:02'),
(48, 'App\\Models\\User', 1, 'MyApp', 'ca3e80c25b9c68c4cecb02bf0d1888f7e0968c9a5d612f02cb537f7357e0e92d', '[\"*\"]', '2024-03-22 20:03:00', NULL, '2024-03-22 19:07:29', '2024-03-22 20:03:00'),
(49, 'App\\Models\\User', 1, 'MyApp', '179c84b49bf088b0673a8bc1f001f68091f8589f9b2fea4336ced15dd97619ec', '[\"*\"]', '2024-03-22 20:59:23', NULL, '2024-03-22 20:07:43', '2024-03-22 20:59:23'),
(50, 'App\\Models\\User', 1, 'MyApp', 'e08e7809e5f757da5d26e0a21232277260abc7fac1b2f94b01b996389c05b90f', '[\"*\"]', '2024-03-22 22:03:12', NULL, '2024-03-22 21:08:53', '2024-03-22 22:03:12'),
(51, 'App\\Models\\User', 1, 'MyApp', '33bca0b6de5788d36c9a7acc50fde071a25b1e91b216abc61695275a2c37766a', '[\"*\"]', '2024-03-22 23:23:46', NULL, '2024-03-22 22:37:05', '2024-03-22 23:23:46'),
(52, 'App\\Models\\User', 1, 'MyApp', '5d49e35a4c950919f1525b7ff57c2ae2ae6e48e6773b1b5c52ad3de8ae35d8fc', '[\"*\"]', '2024-05-13 08:18:49', NULL, '2024-05-13 07:28:12', '2024-05-13 08:18:49'),
(53, 'App\\Models\\User', 1, 'MyApp', '6abb5cf5bcf5b04aa394a6bab3d4748be740122e752cb915ed14577d8513c019', '[\"*\"]', '2024-05-13 08:57:43', NULL, '2024-05-13 08:30:26', '2024-05-13 08:57:43'),
(54, 'App\\Models\\User', 1, 'MyApp', '754cbf134d3f5057a1e6e294c4bc89669f5c4a369900b7c493f35c05d08aeaf9', '[\"*\"]', '2024-05-13 11:19:54', NULL, '2024-05-13 11:19:52', '2024-05-13 11:19:54'),
(55, 'App\\Models\\User', 1, 'MyApp', '51031dc86b1362bf736abe79619c9cd69709f34420867457c08eaf53f92d68d2', '[\"*\"]', '2024-05-22 20:16:14', NULL, '2024-05-22 19:25:12', '2024-05-22 20:16:14');

-- --------------------------------------------------------

--
-- Table structure for table `preferences`
--

CREATE TABLE `preferences` (
  `key` varchar(255) NOT NULL,
  `value` varchar(255) DEFAULT NULL
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
  `name` varchar(255) NOT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
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
  `reason` text NOT NULL,
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
-- Table structure for table `surgery_record_reports`
--

CREATE TABLE `surgery_record_reports` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `payment_cache_item_id` bigint(20) UNSIGNED NOT NULL,
  `unaided_re_va` varchar(255) DEFAULT NULL,
  `unaided_le_va` varchar(255) DEFAULT NULL,
  `aided_re_va` varchar(255) DEFAULT NULL,
  `aided_le_va` varchar(255) DEFAULT NULL,
  `surgeon` varchar(255) DEFAULT NULL,
  `assistant_surgeon` varchar(255) DEFAULT NULL,
  `scrub_nurse` varchar(255) DEFAULT NULL,
  `operation_type` varchar(255) DEFAULT NULL,
  `anaesthesia_type` varchar(255) DEFAULT NULL,
  `operated_eye` varchar(255) DEFAULT NULL,
  `intraoperative_notes` text DEFAULT NULL,
  `postoperative_management` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('Draft','Saved') NOT NULL DEFAULT 'Draft',
  `saved_at` timestamp NULL DEFAULT NULL,
  `saved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `surgery_record_reports`
--

INSERT INTO `surgery_record_reports` (`id`, `payment_cache_item_id`, `unaided_re_va`, `unaided_le_va`, `aided_re_va`, `aided_le_va`, `surgeon`, `assistant_surgeon`, `scrub_nurse`, `operation_type`, `anaesthesia_type`, `operated_eye`, `intraoperative_notes`, `postoperative_management`, `remarks`, `created_at`, `created_by`, `status`, `saved_at`, `saved_by`, `updated_at`) VALUES
(3, 19, '6/6', '7/7', '7/8', '7/7', 'Jay Mashauri', 'Assistant X', 'Neema', 'Test', 'GA', 'LE', 'Intra', 'Post', NULL, '2024-03-21 21:37:13', 1, 'Saved', '2024-03-21 21:59:56', 1, '2024-03-21 21:59:56');

-- --------------------------------------------------------

--
-- Table structure for table `units_of_measure`
--

CREATE TABLE `units_of_measure` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
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
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
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
  `privilege` varchar(255) NOT NULL
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
  `name` varchar(255) NOT NULL,
  `district_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
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
-- Indexes for table `cataract_surgery_records`
--
ALTER TABLE `cataract_surgery_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cataract_surgery_records_payment_cache_item_id_foreign` (`payment_cache_item_id`),
  ADD KEY `cataract_surgery_records_created_by_foreign` (`created_by`),
  ADD KEY `cataract_surgery_records_saved_by_foreign` (`saved_by`);

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
-- Indexes for table `surgery_record_reports`
--
ALTER TABLE `surgery_record_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `surgery_record_reports_payment_cache_item_id_foreign` (`payment_cache_item_id`),
  ADD KEY `surgery_record_reports_created_by_foreign` (`created_by`),
  ADD KEY `surgery_record_reports_saved_by_foreign` (`saved_by`);

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
-- AUTO_INCREMENT for table `cataract_surgery_records`
--
ALTER TABLE `cataract_surgery_records`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `clinic_details`
--
ALTER TABLE `clinic_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `consultations`
--
ALTER TABLE `consultations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `consultation_diagnoses`
--
ALTER TABLE `consultation_diagnoses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `consultation_external_examinations`
--
ALTER TABLE `consultation_external_examinations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `consultation_types`
--
ALTER TABLE `consultation_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `consultation_visual_acuities`
--
ALTER TABLE `consultation_visual_acuities`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `diseases`
--
ALTER TABLE `diseases`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=312;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `item_prices`
--
ALTER TABLE `item_prices`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `patient_check_ins`
--
ALTER TABLE `patient_check_ins`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `patient_item_bills`
--
ALTER TABLE `patient_item_bills`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `patient_item_bill_payments`
--
ALTER TABLE `patient_item_bill_payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `patient_item_payments`
--
ALTER TABLE `patient_item_payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `patient_payment_cache`
--
ALTER TABLE `patient_payment_cache`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `patient_payment_cache_items`
--
ALTER TABLE `patient_payment_cache_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

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
-- AUTO_INCREMENT for table `surgery_record_reports`
--
ALTER TABLE `surgery_record_reports`
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
-- Constraints for table `cataract_surgery_records`
--
ALTER TABLE `cataract_surgery_records`
  ADD CONSTRAINT `cataract_surgery_records_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `cataract_surgery_records_payment_cache_item_id_foreign` FOREIGN KEY (`payment_cache_item_id`) REFERENCES `patient_payment_cache_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cataract_surgery_records_saved_by_foreign` FOREIGN KEY (`saved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
-- Constraints for table `surgery_record_reports`
--
ALTER TABLE `surgery_record_reports`
  ADD CONSTRAINT `surgery_record_reports_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `surgery_record_reports_payment_cache_item_id_foreign` FOREIGN KEY (`payment_cache_item_id`) REFERENCES `patient_payment_cache_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `surgery_record_reports_saved_by_foreign` FOREIGN KEY (`saved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
