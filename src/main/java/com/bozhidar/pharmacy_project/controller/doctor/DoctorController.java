package com.bozhidar.pharmacy_project.controller.doctor;

import com.bozhidar.pharmacy_project.model.dto.doctor.DoctorMapper;
import com.bozhidar.pharmacy_project.model.dto.doctor.DoctorRequestDto;
import com.bozhidar.pharmacy_project.model.dto.doctor.DoctorResponseDto;
import com.bozhidar.pharmacy_project.model.dto.patient.PatientRequestDto;
import com.bozhidar.pharmacy_project.model.dto.patient.PatientResponseDto;
import com.bozhidar.pharmacy_project.model.entity.Doctor;
import com.bozhidar.pharmacy_project.model.entity.Patient;
import com.bozhidar.pharmacy_project.model.entity.User;
import com.bozhidar.pharmacy_project.service.doctor.DoctorService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@AllArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    private final DoctorMapper doctorMapper;

    @GetMapping
    public ResponseEntity<List<DoctorResponseDto>> findAll() {
        //return ResponseEntity.ok(doctorService.findAll());

        return ResponseEntity.ok(
                doctorService.findAll()
                        .stream()
                        .map(doctorMapper::toDto)
                        .toList()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorResponseDto> findById(@PathVariable Long id) {
        //return ResponseEntity.ok(doctorService.findById(id));
        return ResponseEntity.ok(doctorMapper.toDto(doctorService.findById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoctorResponseDto> update(@PathVariable Long id, @RequestBody DoctorRequestDto dto) {
        return ResponseEntity.ok(
                doctorMapper.toDto(doctorService.update(id, doctorMapper.toEntity(dto)))
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        doctorService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<DoctorResponseDto> save(@RequestBody DoctorRequestDto dto) {
        //return ResponseEntity.ok(doctorService.save(doctor));
        return ResponseEntity.ok(
                doctorMapper.toDto(doctorService.save(doctorMapper.toEntity(dto)))
        );
    }

    @GetMapping("/my-profile")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return doctorService.findByUserId(user.getId())
                .map(p -> ResponseEntity.ok(doctorMapper.toDto(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/my-profile")
    public ResponseEntity<DoctorResponseDto> createMyProfile(
            @RequestBody DoctorRequestDto dto,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        if (doctorService.findByUserId(user.getId()).isPresent()) {
            throw new IllegalArgumentException("Профилът вече съществува");
        }

        Doctor doctor = doctorMapper.toEntity(dto);
        doctor.setUser(user);

        return ResponseEntity.ok(
                doctorMapper.toDto(doctorService.save(doctor))
        );
    }

}