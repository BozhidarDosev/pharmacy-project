package com.bozhidar.pharmacy_project.model.dto.doctor;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorResponseDto {
    private Long id;

    private String name;
    private List<String> specializations;
    private boolean generalPractitioner;
}