package com.bozhidar.pharmacy_project.service.sick_leave;

import com.bozhidar.pharmacy_project.model.entity.SickLeave;
import java.util.List;

public interface SickLeaveService {
    List<SickLeave> findAll();
    SickLeave findById(Long id);
    SickLeave save(SickLeave sickLeave);
    SickLeave update(Long id, SickLeave sickLeave);
    void deleteById(Long id);
}