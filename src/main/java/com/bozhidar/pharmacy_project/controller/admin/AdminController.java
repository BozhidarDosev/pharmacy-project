package com.bozhidar.pharmacy_project.controller.admin;

import com.bozhidar.pharmacy_project.exceptions.EntityNotFoundException;
import com.bozhidar.pharmacy_project.model.dto.user.UserResponseDto;
import com.bozhidar.pharmacy_project.model.entity.User;
import com.bozhidar.pharmacy_project.model.enums.Role;
import com.bozhidar.pharmacy_project.repository.DoctorRepository;
import com.bozhidar.pharmacy_project.repository.ExaminationRepository;
import com.bozhidar.pharmacy_project.repository.PatientRepository;
import com.bozhidar.pharmacy_project.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@AllArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final ExaminationRepository examinationRepository;

    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        List<UserResponseDto> users = userRepository.findAll()
                .stream()
                .map(u -> UserResponseDto.builder()
                        .id(u.getId())
                        .username(u.getUsername())
                        .role(u.getRole())
                        .build())
                .toList();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> changeRole(@PathVariable Long id,
                                        @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Потребителят не е намерен"));

        Role newRole = Role.valueOf(body.get("role"));
        Role currentRole = user.getRole();

        // Проверка при смяна от ROLE_DOCTOR към друга роля
        if (currentRole == Role.ROLE_DOCTOR && newRole != Role.ROLE_DOCTOR) {
            System.out.println("Looking for doctor with userId: " + id);
            var doctorOpt = doctorRepository.findByUserId(id);
            System.out.println("Doctor found: " + doctorOpt.isPresent()); // добави

            doctorOpt.ifPresent(doctor -> {
                System.out.println("Doctor id: " + doctor.getId()); // добави
                boolean hasPatients = patientRepository.existsByPersonalDoctorId(doctor.getId());
                System.out.println("Has patients: " + hasPatients); // добави

                if (hasPatients) {
                    throw new IllegalArgumentException(
                            "Не може да смените ролята — лекарят има вързани пациенти"
                    );
                }
                if (!examinationRepository.findByDoctorId(doctor.getId()).isEmpty()) {
                    throw new IllegalArgumentException(
                            "Не може да смените ролята — лекарят има извършени прегледи"
                    );
                }
            });

        }

        user.setRole(newRole);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Ролята е сменена успешно",
                "role", newRole.name()
                //"userId", id
        ));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            throw new IllegalArgumentException(
                    "Не може да изтриете потребител със свързани данни"
            );
        }
    }
}