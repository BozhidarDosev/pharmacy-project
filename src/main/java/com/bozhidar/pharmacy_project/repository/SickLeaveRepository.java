package com.bozhidar.pharmacy_project.repository;

import com.bozhidar.pharmacy_project.model.entity.SickLeave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SickLeaveRepository extends JpaRepository<SickLeave, Long> {

    // Месец с най-много болнични
    @Query("SELECT MONTH(s.startDate), COUNT(s) as cnt FROM SickLeave s " +
            "GROUP BY MONTH(s.startDate) ORDER BY cnt DESC LIMIT 1")
    List<Object[]> findMonthWithMostSickLeaves();

    // Лекар с най-много болнични
    @Query("SELECT s.doctor.name, COUNT(s) as cnt FROM SickLeave s " +
            "GROUP BY s.doctor.name ORDER BY cnt DESC LIMIT 1")
    List<Object[]> findDoctorWithMostSickLeaves();
}