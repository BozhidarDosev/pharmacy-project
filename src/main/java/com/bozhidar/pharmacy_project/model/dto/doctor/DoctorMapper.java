// model/dto/doctor/DoctorMapper.java
package com.bozhidar.pharmacy_project.model.dto.doctor;

import com.bozhidar.pharmacy_project.model.entity.Doctor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface DoctorMapper {

    @Mapping(target = "specializations", source = "specializations")
    DoctorResponseDto toDto(Doctor doctor);

    @Mapping(target = "user", ignore = true)
    Doctor toEntity(DoctorRequestDto dto);

    @Mapping(target = "generalPractitioner", ignore = true)
    @Mapping(target = "user", ignore = true)
    void updateEntity(DoctorRequestDto dto, @MappingTarget Doctor doctor);
}