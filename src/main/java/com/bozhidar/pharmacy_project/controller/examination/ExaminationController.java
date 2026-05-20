package com.bozhidar.pharmacy_project.controller.examination;

import com.bozhidar.pharmacy_project.exceptions.EntityNotFoundException;
import com.bozhidar.pharmacy_project.exceptions.UnauthorizedAccessException;
import com.bozhidar.pharmacy_project.model.dto.examination.ExaminationRequestDto;
import com.bozhidar.pharmacy_project.model.dto.examination.ExaminationResponseDto;
import com.bozhidar.pharmacy_project.model.entity.Doctor;
import com.bozhidar.pharmacy_project.model.entity.Examination;
import com.bozhidar.pharmacy_project.model.entity.Patient;
import com.bozhidar.pharmacy_project.model.entity.User;
import com.bozhidar.pharmacy_project.service.doctor.DoctorService;
import com.bozhidar.pharmacy_project.service.examination.ExaminationService;
import com.bozhidar.pharmacy_project.service.patient.PatientService;
import com.bozhidar.pharmacy_project.model.dto.examination.ExaminationMapper;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.bozhidar.pharmacy_project.exceptions.EntityNotFoundException;
import com.bozhidar.pharmacy_project.exceptions.UnauthorizedAccessException;

import java.util.List;

@RestController
@RequestMapping("/api/examinations")
@AllArgsConstructor
public class ExaminationController {

    private final ExaminationService examinationService;
    private final ExaminationMapper examinationMapper;
    private final DoctorService doctorService;
    private final PatientService patientService;

    @GetMapping
    public ResponseEntity<List<ExaminationResponseDto>> findAll(
            @RequestParam(required = false) Long patientId) {

        List<Examination> examinations = patientId != null
                ? examinationService.findByPatientId(patientId)
                : examinationService.findAll();

        return ResponseEntity.ok(
                examinations.stream()
                        .map(examinationMapper::toDto)
                        .toList()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExaminationResponseDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(examinationMapper.toDto(examinationService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ExaminationResponseDto> save(
            @RequestBody ExaminationRequestDto dto,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        Doctor doctor = doctorService.findByUserId(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Лекарят не е намерен"));
        Patient patient = patientService.findById(dto.getPatientId());

        var examination = examinationMapper.toEntity(dto);
        examination.setDoctor(doctor);
        examination.setPatient(patient);
        examination.setPaidByInsurance(patient.isInsured());

        return ResponseEntity.ok(
                examinationMapper.toDto(examinationService.save(examination))
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExaminationResponseDto> update(
            @PathVariable Long id,
            @RequestBody ExaminationRequestDto dto,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        Doctor doctor = doctorService.findByUserId(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Лекарят не е намерен"));

        var existing = examinationService.findById(id);

        // Провери дали лекарят е преглеждал
        if (existing.getDoctor() == null ||
                !existing.getDoctor().getId().equals(doctor.getId())) {
            throw new UnauthorizedAccessException("Нямате право да редактирате този преглед");
        }

        examinationMapper.updateEntity(dto, existing);
        return ResponseEntity.ok(
                examinationMapper.toDto(examinationService.save(existing))
        );
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<ExaminationResponseDto> adminUpdate(
            @PathVariable Long id,
            @RequestBody ExaminationRequestDto dto) {

        var existing = examinationService.findById(id);
        existing.setDiagnosis(dto.getDiagnosis());

        return ResponseEntity.ok(
                examinationMapper.toDto(examinationService.save(existing))
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        examinationService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my/doctor")
    public ResponseEntity<List<ExaminationResponseDto>> getMyExaminationsAsDoctor(
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Doctor doctor = doctorService.findByUserId(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Лекарят не е намерен"));

        return ResponseEntity.ok(
                examinationService.findByDoctorId(doctor.getId()).stream()
                        .map(examinationMapper::toDto)
                        .toList()
        );
    }

    @GetMapping("/my/patient")
    public ResponseEntity<List<ExaminationResponseDto>> getMyExaminationsAsPatient(
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Patient patient = patientService.findByUserId(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Пациентът не е намерен"));

        return ResponseEntity.ok(
                examinationService.findByPatientId(patient.getId()).stream()
                        .map(examinationMapper::toDto)
                        .toList()
        );
    }
}