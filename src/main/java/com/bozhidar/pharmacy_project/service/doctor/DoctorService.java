package com.bozhidar.pharmacy_project.service.doctor;

import com.bozhidar.pharmacy_project.model.entity.Doctor;
import java.util.List;
import java.util.Optional;

public interface DoctorService {
    List<Doctor> findAll();
    Doctor findById(Long id);
    Doctor save(Doctor doctor);
    Doctor update(Long id, Doctor doctor);
    void deleteById(Long id);
    Optional<Doctor> findByUserId(Long userId);
}