package com.bozhidar.pharmacy_project.repository;

import com.bozhidar.pharmacy_project.model.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByUserId(Long userId);
    List<Patient> findByPersonalDoctorId(Long doctorId);
    boolean existsByEgn(String egn);
    Optional<Patient> findByEgn(String egn);
    boolean existsByPersonalDoctorId(Long doctorId);

    @Query("SELECT p.personalDoctor.name, COUNT(p) FROM Patient p " +
            "WHERE p.personalDoctor IS NOT NULL GROUP BY p.personalDoctor.name")
    List<Object[]> countPatientsPerDoctor();
}