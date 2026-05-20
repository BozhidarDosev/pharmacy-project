package com.bozhidar.pharmacy_project.model.dto.user;

import com.bozhidar.pharmacy_project.model.enums.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDto {
    private Long id;
    private String username;
    private Role role;
}