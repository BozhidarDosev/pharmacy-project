package com.bozhidar.pharmacy_project.model.dto.patient;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientResponseDto {
    private Long id;
    private String name;
    private String egn;
    private boolean insured;
    private String personalDoctorName;
}