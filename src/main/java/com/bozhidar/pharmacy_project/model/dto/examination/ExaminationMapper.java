// model/dto/examination/ExaminationMapper.java
package com.bozhidar.pharmacy_project.model.dto.examination;

import com.bozhidar.pharmacy_project.model.entity.Examination;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ExaminationMapper {
//    @Mapping(source = "doctor.name", target = "doctorName")
//    @Mapping(source = "patient.name", target = "patientName")


    @Mapping(target = "doctor", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "paidByInsurance", ignore = true)
    Examination toEntity(ExaminationRequestDto dto);

    @Mapping(target = "doctor", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "paidByInsurance", ignore = true)
    void updateEntity(ExaminationRequestDto dto, @MappingTarget Examination examination);

    @Mapping(source = "patient.id", target = "patientId")
    @Mapping(source = "doctor.id", target = "doctorId")
    @Mapping(source = "doctor.name", target = "doctorName")
    @Mapping(source = "patient.name", target = "patientName")

    ExaminationResponseDto toDto(Examination examination);

}