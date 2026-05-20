package com.bozhidar.pharmacy_project.controller.patient;


import com.bozhidar.pharmacy_project.model.dto.doctor.DoctorRequestDto;
import com.bozhidar.pharmacy_project.model.dto.doctor.DoctorResponseDto;
import com.bozhidar.pharmacy_project.model.dto.patient.PatientMapper;
import com.bozhidar.pharmacy_project.model.dto.patient.PatientRequestDto;
import com.bozhidar.pharmacy_project.model.dto.patient.PatientResponseDto;
import com.bozhidar.pharmacy_project.model.entity.Doctor;
import com.bozhidar.pharmacy_project.model.entity.Patient;
import com.bozhidar.pharmacy_project.model.entity.User;
import com.bozhidar.pharmacy_project.repository.PatientRepository;
import com.bozhidar.pharmacy_project.service.doctor.DoctorService;
import com.bozhidar.pharmacy_project.service.patient.PatientService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@AllArgsConstructor
public class PatientController {

    private final PatientService patientService;
    private final PatientMapper patientMapper;
    private final DoctorService doctorService;
    private final PatientRepository patientRepository;

    @GetMapping
    public ResponseEntity<List<PatientResponseDto>> findAll() {
        return ResponseEntity.ok(
                patientService.findAll()
                        .stream()
                        .map(patientMapper::toDto)
                        .toList()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientResponseDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(patientMapper.toDto(patientService.findById(id)));
    }


    @PutMapping("/{id}")
    public ResponseEntity<PatientResponseDto> update(@PathVariable Long id, @RequestBody PatientRequestDto dto) {
        Patient existing = patientService.findById(id);
        patientMapper.updateEntity(dto,existing);
        return ResponseEntity.ok(patientMapper.toDto(patientService.save(existing)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        patientService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<PatientResponseDto> save(@RequestBody PatientRequestDto dto) {
        return ResponseEntity.ok(
                patientMapper.toDto(patientService.save(patientMapper.toEntity(dto)))
        );
    }

    @GetMapping("/my-profile")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return patientService.findByUserId(user.getId())
                .map(p -> ResponseEntity.ok(patientMapper.toDto(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/my-profile")
    public ResponseEntity<?> createMyProfile(
            @RequestBody PatientRequestDto dto,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        if (patientService.findByUserId(user.getId()).isPresent()) {
            throw new IllegalArgumentException("Профилът вече съществува");
        }


        if (patientRepository.existsByEgn(dto.getEgn())) {
            throw new IllegalArgumentException("Пациент с това ЕГН вече съществува");
        }


        Doctor doctor = doctorService.findById(dto.getPersonalDoctorId());

        Patient patient = patientMapper.toEntity(dto);
        patient.setUser(user);
        patient.setPersonalDoctor(doctor);
        patient.setInsured(dto.isInsured()); // вз от dto

        return ResponseEntity.ok(
                patientMapper.toDto(patientService.save(patient))
        );
    }
}