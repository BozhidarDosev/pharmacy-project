package com.bozhidar.pharmacy_project.service.patient;

import com.bozhidar.pharmacy_project.model.entity.Doctor;
import com.bozhidar.pharmacy_project.model.entity.Patient;
import com.bozhidar.pharmacy_project.repository.PatientRepository;
import com.bozhidar.pharmacy_project.service.patient.PatientService;
import com.bozhidar.pharmacy_project.exceptions.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;

    @Override
    public List<Patient> findAll() {
        return patientRepository.findAll();
    }

    @Override
    public Patient findById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + id));
    }

    @Override
    public Patient save(Patient patient) {
        // Провери дали ЕГН-то е на ДРУГ пациент
        patientRepository.findByEgn(patient.getEgn()).ifPresent(existing -> {
            if (!existing.getId().equals(patient.getId())) {
                throw new IllegalArgumentException("Пациент с това ЕГН вече съществува");
            }
        });
        return patientRepository.save(patient);
    }

    @Override
    public Patient update(Long id, Patient patient) {
        Patient existing = findById(id);

//        existing.setInsured(patient.isInsured());
//        existing.setPersonalDoctor(patient.getPersonalDoctor());
        if (patient.getName() != null) {
            existing.setName(patient.getName());
        }
        if (patient.getEgn() != null) {
            existing.setEgn(patient.getEgn()); // добави
        }
        if (patient.getPersonalDoctor() != null) {
            existing.setPersonalDoctor(patient.getPersonalDoctor());
        }

        return patientRepository.save(existing);
    }

    @Override
    public void deleteById(Long id) {
        patientRepository.deleteById(id);
    }

    @Override
    public Optional<Patient> findByUserId(Long userId) {
        return patientRepository.findByUserId(userId);
    }

    public boolean isCurrentlyInsured(Patient patient) {
        if (patient.getInsuredUntil() == null) return false;
        return patient.getInsuredUntil().isAfter(LocalDate.now().minusMonths(6));
    }
}