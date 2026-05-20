// model/dto/sickleave/SickLeaveMapper.java
package com.bozhidar.pharmacy_project.model.dto.sick_leave;

import com.bozhidar.pharmacy_project.model.dto.sick_leave.SickLeaveRequestDto;
import com.bozhidar.pharmacy_project.model.dto.sick_leave.SickLeaveResponseDto;
import com.bozhidar.pharmacy_project.model.entity.SickLeave;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface SickLeaveMapper {

    @Mapping(source = "doctor.name", target = "doctorName")
    @Mapping(source = "patient.name", target = "patientName")
    SickLeaveResponseDto toDto(SickLeave sickLeave);

    @Mapping(target = "doctor", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "examination", ignore = true)
    SickLeave toEntity(SickLeaveRequestDto dto);

    @Mapping(target = "doctor", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "examination", ignore = true)
    void updateEntity(SickLeaveRequestDto dto, @MappingTarget SickLeave sickLeave);
}