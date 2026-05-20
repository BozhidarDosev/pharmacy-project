package com.bozhidar.pharmacy_project.model.dto.examination;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExaminationResponseDto {
    private Long id;
    private Long patientId;
    private Long doctorId;
    private LocalDate date;
    private String diagnosis;
    private String treatment;
    private double price;
    private boolean paidByInsurance;
    private String doctorName;
    private String patientName;
}