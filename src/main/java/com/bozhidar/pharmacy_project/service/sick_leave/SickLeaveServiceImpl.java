package com.bozhidar.pharmacy_project.service.sick_leave;

import com.bozhidar.pharmacy_project.model.entity.SickLeave;
import com.bozhidar.pharmacy_project.repository.SickLeaveRepository;
import com.bozhidar.pharmacy_project.service.sick_leave.SickLeaveService;
import com.bozhidar.pharmacy_project.exceptions.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class SickLeaveServiceImpl implements SickLeaveService {

    private final SickLeaveRepository sickLeaveRepository;

    @Override
    public List<SickLeave> findAll() {
        return sickLeaveRepository.findAll();
    }

    @Override
    public SickLeave findById(Long id) {
        return sickLeaveRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SickLeave not found with id: " + id));
    }

    @Override
    public SickLeave save(SickLeave sickLeave) {
        return sickLeaveRepository.save(sickLeave);
    }

    @Override
    public SickLeave update(Long id, SickLeave sickLeave) {
        SickLeave existing = findById(id);
        existing.setStartDate(sickLeave.getStartDate());
        existing.setDays(sickLeave.getDays());
        existing.setDoctor(sickLeave.getDoctor());
        existing.setPatient(sickLeave.getPatient());
        return sickLeaveRepository.save(existing);
    }

    @Override
    public void deleteById(Long id) {
        sickLeaveRepository.deleteById(id);
    }
}