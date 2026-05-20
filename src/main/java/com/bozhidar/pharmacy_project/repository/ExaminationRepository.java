package com.bozhidar.pharmacy_project.repository;

import com.bozhidar.pharmacy_project.model.entity.Examination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExaminationRepository extends JpaRepository<Examination, Long> {

    List<Examination> findByDoctorId(Long doctorId);
    List<Examination> findByPatientId(Long patientId);

    // Най-честа диагноза
    @Query("SELECT e.diagnosis, COUNT(e) as cnt FROM Examination e " +
            "GROUP BY e.diagnosis ORDER BY cnt DESC LIMIT 1")
    List<Object[]> findMostCommonDiagnosis();

    // Пациенти с дадена диагноза
    @Query("SELECT DISTINCT e.patient FROM Examination e WHERE e.diagnosis = :diagnosis")
    List<Object> findPatientsByDiagnosis(@Param("diagnosis") String diagnosis);

    // Обща стойност платена от пациенти
    @Query("SELECT SUM(e.price) FROM Examination e WHERE e.paidByInsurance = false")
    Double totalPaidByPatients();

    // Стойност по лекар платена от пациенти
    @Query("SELECT e.doctor.name, SUM(e.price) FROM Examination e " +
            "WHERE e.paidByInsurance = false GROUP BY e.doctor.name")
    List<Object[]> paidByPatientsPerDoctor();

    // Брой посещения при всеки лекар
    @Query("SELECT e.doctor.name, COUNT(e) FROM Examination e GROUP BY e.doctor.name")
    List<Object[]> countVisitsPerDoctor();

    // Прегледи по период
    @Query("SELECT e FROM Examination e WHERE e.date BETWEEN :from AND :to")
    List<Examination> findByPeriod(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );
}