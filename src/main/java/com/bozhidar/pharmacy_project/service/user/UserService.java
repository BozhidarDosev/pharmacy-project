package com.bozhidar.pharmacy_project.service.user;

import com.bozhidar.pharmacy_project.model.entity.User;

public interface UserService {
    User register(String username, String password);
    User findByUsername(String username);
}
