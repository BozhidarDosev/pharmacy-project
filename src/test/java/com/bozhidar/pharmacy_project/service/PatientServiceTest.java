package com.bozhidar.pharmacy_project.service.patient;

import com.bozhidar.pharmacy_project.exceptions.EntityNotFoundException;
import com.bozhidar.pharmacy_project.model.entity.Patient;
import com.bozhidar.pharmacy_project.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private PatientServiceImpl patientService;

    private Patient patient;

    @BeforeEach
    void setUp() {
        patient = new Patient();
        patient.setId(1L);
        patient.setName("Иван Иванов");
        patient.setEgn("9001011234");
        patient.setInsured(true);
    }

    @Test
    void findById_shouldReturnPatient_whenExists() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));

        Patient result = patientService.findById(1L);

        assertNotNull(result);
        assertEquals("Иван Иванов", result.getName());
    }

    @Test
    void findById_shouldThrowException_whenNotExists() {
        when(patientRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> patientService.findById(99L));
    }

    @Test
    void save_shouldThrowException_whenDuplicateEgn() {
        Patient other = new Patient();
        other.setId(2L);
        other.setEgn("9001011234");

        when(patientRepository.findByEgn("9001011234"))
                .thenReturn(Optional.of(other));

        assertThrows(IllegalArgumentException.class,
                () -> patientService.save(patient));
    }

    @Test
    void save_shouldSave_whenEgnIsUnique() {
        when(patientRepository.findByEgn("9001011234"))
                .thenReturn(Optional.empty());
        when(patientRepository.save(patient)).thenReturn(patient);

        Patient result = patientService.save(patient);

        assertNotNull(result);
        verify(patientRepository, times(1)).save(patient);
    }
}