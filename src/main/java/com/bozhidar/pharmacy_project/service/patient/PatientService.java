package com.bozhidar.pharmacy_project.service.patient;

import com.bozhidar.pharmacy_project.model.entity.Patient;
import java.util.List;
import java.util.Optional;

public interface PatientService {
    List<Patient> findAll();
    Patient findById(Long id);
    Patient save(Patient patient);
    Patient update(Long id, Patient patient);
    void deleteById(Long id);
    Optional<Patient> findByUserId(Long userId);
}