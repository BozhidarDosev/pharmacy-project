package com.bozhidar.pharmacy_project.service;

import com.bozhidar.pharmacy_project.exceptions.EntityNotFoundException;
import com.bozhidar.pharmacy_project.model.entity.Doctor;
import com.bozhidar.pharmacy_project.repository.DoctorRepository;
import com.bozhidar.pharmacy_project.repository.PatientRepository;
import com.bozhidar.pharmacy_project.service.doctor.DoctorServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.Mockito.doNothing;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;


import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DoctorServiceTest {

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private DoctorServiceImpl doctorService;

    private Doctor doctor;

    @BeforeEach
    void setUp() {
        doctor = new Doctor();
        doctor.setId(1L);
        doctor.setName("Д-р Иванов");
        doctor.setSpecializations(List.of("Кардиология"));
        doctor.setGeneralPractitioner(true);
    }

    @Test
    void findAll_shouldReturnAllDoctors() {
        when(doctorRepository.findAll()).thenReturn(List.of(doctor));

        List<Doctor> result = doctorService.findAll();

        assertEquals(1, result.size());
        assertEquals("Д-р Иванов", result.get(0).getName());
        verify(doctorRepository, times(1)).findAll();
    }

    @Test
    void findById_shouldReturnDoctor_whenExists() {
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));

        Doctor result = doctorService.findById(1L);

        assertNotNull(result);
        assertEquals("Д-р Иванов", result.getName());
    }

    @Test
    void findById_shouldThrowException_whenNotExists() {
        when(doctorRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> doctorService.findById(99L));
    }

    @Test
    void deleteById_shouldThrowException_whenDoctorHasPatients() {
        when(patientRepository.existsByPersonalDoctorId(1L)).thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> doctorService.deleteById(1L));

        verify(doctorRepository, never()).deleteById(any());
    }

    @Test
    void deleteById_shouldDelete_whenNoPatients() {
        when(patientRepository.existsByPersonalDoctorId(1L)).thenReturn(false);

        doctorService.deleteById(1L);

        verify(doctorRepository, times(1)).deleteById(1L);
    }
}