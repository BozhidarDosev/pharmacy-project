package com.bozhidar.pharmacy_project.service.examination;

import com.bozhidar.pharmacy_project.model.entity.Examination;
import com.bozhidar.pharmacy_project.repository.ExaminationRepository;
import com.bozhidar.pharmacy_project.service.examination.ExaminationService;
import com.bozhidar.pharmacy_project.exceptions.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class ExaminationServiceImpl implements ExaminationService {

    private final ExaminationRepository examinationRepository;

    @Override
    public List<Examination> findAll() {
        return examinationRepository.findAll();
    }

    @Override
    public Examination findById(Long id) {
        return examinationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Examination not found with id: " + id));
    }

    @Override
    public Examination save(Examination examination) {
        return examinationRepository.save(examination);
    }

    @Override
    public Examination update(Long id, Examination examination) {
        Examination existing = findById(id);
        existing.setDate(examination.getDate());
        existing.setDiagnosis(examination.getDiagnosis());
        existing.setTreatment(examination.getTreatment());
        existing.setPrice(examination.getPrice());
        existing.setPaidByInsurance(examination.isPaidByInsurance());
        existing.setDoctor(examination.getDoctor());
        existing.setPatient(examination.getPatient());
        return examinationRepository.save(existing);
    }

    @Override
    public void deleteById(Long id) {
        examinationRepository.deleteById(id);
    }

    @Override
    public List<Examination> findByDoctorId(Long doctorId) {
        return examinationRepository.findByDoctorId(doctorId);
    }

    @Override
    public List<Examination> findByPatientId(Long patientId) {
        return examinationRepository.findByPatientId(patientId);
    }
}