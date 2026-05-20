package com.bozhidar.pharmacy_project.controller.sick_leave;

import com.bozhidar.pharmacy_project.exceptions.EntityNotFoundException;
import com.bozhidar.pharmacy_project.model.dto.sick_leave.SickLeaveMapper;
import com.bozhidar.pharmacy_project.model.dto.sick_leave.SickLeaveRequestDto;
import com.bozhidar.pharmacy_project.model.dto.sick_leave.SickLeaveResponseDto;
import com.bozhidar.pharmacy_project.model.entity.*;
import com.bozhidar.pharmacy_project.service.doctor.DoctorService;
import com.bozhidar.pharmacy_project.service.examination.ExaminationService;
import com.bozhidar.pharmacy_project.service.sick_leave.SickLeaveService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sick-leaves")
@AllArgsConstructor
public class SickLeaveController {

    private final SickLeaveService sickLeaveService;
    private final SickLeaveMapper sickLeaveMapper;
    private final DoctorService doctorService;
    private final ExaminationService examinationService;

    @GetMapping
    public ResponseEntity<List<SickLeaveResponseDto>> findAll() {
        return ResponseEntity.ok(
                sickLeaveService.findAll()
                        .stream()
                        .map(sickLeaveMapper::toDto)
                        .toList()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<SickLeaveResponseDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(
                sickLeaveMapper.toDto(sickLeaveService.findById(id))
        );
    }

    @PostMapping
    public ResponseEntity<SickLeaveResponseDto> save(
            @RequestBody SickLeaveRequestDto dto,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        Doctor doctor = doctorService.findByUserId(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Лекарят не е намерен"));

        Examination examination = examinationService.findById(dto.getExaminationId());
        Patient patient = examination.getPatient();

        SickLeave sickLeave = sickLeaveMapper.toEntity(dto);
        sickLeave.setDoctor(doctor);
        sickLeave.setPatient(patient);
        sickLeave.setExamination(examination);

        return ResponseEntity.ok(
                sickLeaveMapper.toDto(sickLeaveService.save(sickLeave))
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<SickLeaveResponseDto> update(
            @PathVariable Long id,
            @RequestBody SickLeaveRequestDto dto) {
        SickLeave existing = sickLeaveService.findById(id);
        sickLeaveMapper.updateEntity(dto, existing);
        return ResponseEntity.ok(
                sickLeaveMapper.toDto(sickLeaveService.save(existing))
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        sickLeaveService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}