package com.bozhidar.pharmacy_project.controller;

import com.bozhidar.pharmacy_project.controller.doctor.DoctorController;
import com.bozhidar.pharmacy_project.model.dto.doctor.DoctorResponseDto;
import com.bozhidar.pharmacy_project.service.doctor.DoctorService;
import com.bozhidar.pharmacy_project.model.dto.doctor.DoctorMapper;
import com.bozhidar.pharmacy_project.model.entity.Doctor;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DoctorController.class)
class DoctorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DoctorService doctorService;

    @MockBean
    private DoctorMapper doctorMapper;

    @Test
    @WithMockUser(roles = "ADMIN")
    void findAll_shouldReturn200_withDoctors() throws Exception {
        Doctor doctor = new Doctor();
        doctor.setId(1L);
        doctor.setName("Д-р Иванов");

        DoctorResponseDto dto = new DoctorResponseDto();
        dto.setId(1L);
        dto.setName("Д-р Иванов");

        when(doctorService.findAll()).thenReturn(List.of(doctor));
        when(doctorMapper.toDto(doctor)).thenReturn(dto);

        mockMvc.perform(get("/api/doctors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Д-р Иванов"));
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void findAll_shouldReturn200_forPatientRole() throws Exception {
        when(doctorService.findAll()).thenReturn(List.of());
        when(doctorMapper.toDto(any())).thenReturn(new DoctorResponseDto());

        mockMvc.perform(get("/api/doctors"))
                .andExpect(status().isOk());
    }
    @Test
    void findAll_shouldReturn401_whenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/doctors"))
                .andExpect(status().isUnauthorized());
    }
}