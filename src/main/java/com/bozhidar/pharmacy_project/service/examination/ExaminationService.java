package com.bozhidar.pharmacy_project.service.examination;

import com.bozhidar.pharmacy_project.model.entity.Examination;
import java.util.List;

public interface ExaminationService {
    List<Examination> findAll();
    List<Examination> findByDoctorId(Long doctorId);
    List<Examination> findByPatientId(Long patientId);
    Examination findById(Long id);
    Examination save(Examination examination);
    Examination update(Long id, Examination examination);
    void deleteById(Long id);
}