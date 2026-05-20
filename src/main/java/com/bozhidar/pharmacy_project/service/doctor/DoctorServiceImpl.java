package com.bozhidar.pharmacy_project.service.doctor;

import com.bozhidar.pharmacy_project.model.entity.Doctor;
import com.bozhidar.pharmacy_project.repository.DoctorRepository;
import com.bozhidar.pharmacy_project.repository.PatientRepository;
import com.bozhidar.pharmacy_project.service.doctor.DoctorService;
import com.bozhidar.pharmacy_project.exceptions.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    @Override
    public List<Doctor> findAll() {
        return doctorRepository.findAll();
    }

    @Override
    public Doctor findById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with id: " + id));
    }

    @Override
    public Doctor save(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    @Override
    public Doctor update(Long id, Doctor doctor) {
        Doctor existing = findById(id);
        if (doctor.getSpecializations() != null) {
            existing.setSpecializations(doctor.getSpecializations());
        }
        if (doctor.isGeneralPractitioner() != existing.isGeneralPractitioner()) {
            existing.setGeneralPractitioner(doctor.isGeneralPractitioner());
        }
        return doctorRepository.save(existing);
    }

    //Проверка дали е свързан с пациенти
    @Override
    public void deleteById(Long id) {
        if (patientRepository.existsByPersonalDoctorId(id)) {
            throw new IllegalArgumentException(
                    "Не може да изтриете лекар който е личен лекар на пациенти"
            );
        }
        doctorRepository.deleteById(id);
    }

    @Override
    public Optional<Doctor> findByUserId(Long userId) {
        return doctorRepository.findByUserId(userId);
    }
}
