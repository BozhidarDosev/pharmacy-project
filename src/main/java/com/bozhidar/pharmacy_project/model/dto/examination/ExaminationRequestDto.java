package com.bozhidar.pharmacy_project.model.dto.examination;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExaminationRequestDto {
    private LocalDate date;
    private String diagnosis;
    private String treatment;
    private double price;
    private Long doctorId;
    private Long patientId;
}