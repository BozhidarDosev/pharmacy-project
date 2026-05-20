package com.bozhidar.pharmacy_project.controller.statistics;

import com.bozhidar.pharmacy_project.model.dto.examination.ExaminationMapper;
import com.bozhidar.pharmacy_project.model.dto.examination.ExaminationResponseDto;
import com.bozhidar.pharmacy_project.repository.ExaminationRepository;
import com.bozhidar.pharmacy_project.repository.SickLeaveRepository;
import com.bozhidar.pharmacy_project.repository.PatientRepository;
import com.bozhidar.pharmacy_project.repository.DoctorRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
@AllArgsConstructor
public class StatisticsController {

    private final ExaminationRepository examinationRepository;
    private final SickLeaveRepository sickLeaveRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final ExaminationMapper examinationMapper;

    // 1. Най-честа диагноза
    @GetMapping("/most-common-diagnosis")
    public ResponseEntity<?> mostCommonDiagnosis() {
        return ResponseEntity.ok(examinationRepository.findMostCommonDiagnosis());
    }

    // 2. Пациенти с дадена диагноза
    @GetMapping("/patients-by-diagnosis")
    public ResponseEntity<?> patientsByDiagnosis(@RequestParam String diagnosis) {
        return ResponseEntity.ok(examinationRepository.findPatientsByDiagnosis(diagnosis));
    }

    // 3. Пациенти към даден личен лекар
    @GetMapping("/patients-by-doctor/{doctorId}")
    public ResponseEntity<?> patientsByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(patientRepository.findByPersonalDoctorId(doctorId));
    }

    // 4. Брой пациенти при всеки личен лекар
    @GetMapping("/patients-count-per-doctor")
    public ResponseEntity<?> patientsCountPerDoctor() {
        return ResponseEntity.ok(patientRepository.countPatientsPerDoctor());
    }

    // 5. Обща стойност платена от пациенти
    @GetMapping("/total-paid-by-patients")
    public ResponseEntity<?> totalPaidByPatients() {
        return ResponseEntity.ok(
                Map.of("total", examinationRepository.totalPaidByPatients())
        );
    }

    // 6. Стойност платена от пациенти по лекар
    @GetMapping("/paid-by-patients-per-doctor")
    public ResponseEntity<?> paidByPatientsPerDoctor() {
        return ResponseEntity.ok(examinationRepository.paidByPatientsPerDoctor());
    }

    // 7. Брой посещения при всеки лекар
    @GetMapping("/visits-per-doctor")
    public ResponseEntity<?> visitsPerDoctor() {
        return ResponseEntity.ok(examinationRepository.countVisitsPerDoctor());
    }

    // 8. Месец с най-много болнични
    @GetMapping("/month-most-sick-leaves")
    public ResponseEntity<?> monthWithMostSickLeaves() {
        return ResponseEntity.ok(sickLeaveRepository.findMonthWithMostSickLeaves());
    }

    // 9. Лекар с най-много болнични
    @GetMapping("/doctor-most-sick-leaves")
    public ResponseEntity<?> doctorWithMostSickLeaves() {
        return ResponseEntity.ok(sickLeaveRepository.findDoctorWithMostSickLeaves());
    }

    // 10. Прегледи по период
    @GetMapping("/examinations-by-period")
    public ResponseEntity<List<ExaminationResponseDto>> examinationsByPeriod(
            @RequestParam String from,
            @RequestParam String to,
            ExaminationMapper examinationMapper) {

        return ResponseEntity.ok(
                examinationRepository.findByPeriod(
                                java.time.LocalDate.parse(from),
                                java.time.LocalDate.parse(to)
                        )
                        .stream()
                        .map(examinationMapper::toDto)
                        .toList()
        );
    }
}