package com.bozhidar.pharmacy_project.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Examination extends BaseEntity{
    private LocalDate date;
    private String diagnosis;
    private String treatment;
    private double price;
    private boolean paidByInsurance;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @OneToOne(mappedBy = "examination", cascade = CascadeType.ALL)
    private SickLeave sickLeave;
}
