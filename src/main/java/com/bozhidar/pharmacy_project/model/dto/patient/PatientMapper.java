// model/dto/patient/PatientMapper.java
package com.bozhidar.pharmacy_project.model.dto.patient;

import com.bozhidar.pharmacy_project.model.entity.Patient;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PatientMapper {

    @Mapping(source = "personalDoctor.name", target = "personalDoctorName")
    PatientResponseDto toDto(Patient patient);

    @Mapping(target = "personalDoctor", ignore = true)
    @Mapping(target = "user", ignore = true)
    Patient toEntity(PatientRequestDto dto);

    @Mapping(target = "personalDoctor", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "insured", ignore = true)
    //@Mapping(target = "egn", ignore = true)
    void updateEntity(PatientRequestDto dto, @MappingTarget Patient patient);
}