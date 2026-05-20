package com.bozhidar.pharmacy_project.model.dto.patient;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientRequestDto {
    private String name;
    private String egn;
    private boolean insured;
    private Long personalDoctorId;
}