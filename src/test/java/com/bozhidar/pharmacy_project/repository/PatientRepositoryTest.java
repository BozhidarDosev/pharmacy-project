package com.bozhidar.pharmacy_project.repository;

import com.bozhidar.pharmacy_project.model.entity.Patient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class PatientRepositoryTest {

    @Autowired
    private PatientRepository patientRepository;

    @Test
    void findByEgn_shouldReturnEmpty_whenNotExists() {
        Optional<Patient> result = patientRepository.findByEgn("0000000000");
        assertTrue(result.isEmpty());
    }

    @Test
    void existsByPersonalDoctorId_shouldReturnFalse_whenNoPatients() {
        boolean result = patientRepository.existsByPersonalDoctorId(999L);
        assertFalse(result);
    }

    @Test
    void existsByEgn_shouldReturnFalse_whenNotExists() {
        boolean result = patientRepository.existsByEgn("1111111111");
        assertFalse(result);
    }
}