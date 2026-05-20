package com.bozhidar.pharmacy_project.model.dto.sick_leave;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SickLeaveResponseDto {
    private Long id;
    private LocalDate startDate;
    private int days;
    private String doctorName;
    private String patientName;
}