package com.bozhidar.pharmacy_project.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "doctor")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Doctor extends BaseEntity {

    private String name;


    @ElementCollection
    @CollectionTable
            (name = "doctor_specializations",
            joinColumns = @JoinColumn(name = "doctor_id")
    )
    @Column(name = "specialization", nullable = false)
    private List<String> specializations = new ArrayList<>();

    @Column(name = "general_practitioner", nullable = false)
    private boolean generalPractitioner = false;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}