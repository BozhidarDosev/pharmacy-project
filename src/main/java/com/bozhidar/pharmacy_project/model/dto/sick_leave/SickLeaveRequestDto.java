package com.bozhidar.pharmacy_project.model.dto.sick_leave;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SickLeaveRequestDto {
    private LocalDate startDate;
    private int days;
    private Long examinationId;
    private Long doctorId;
    private Long patientId;
}