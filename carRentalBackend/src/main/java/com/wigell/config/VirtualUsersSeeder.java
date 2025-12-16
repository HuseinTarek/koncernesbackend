package com.wigell.config;

import com.wigell.entities.User;
import com.wigell.dao.UserRepo;
import jakarta.annotation.PostConstruct;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class VirtualUsersSeeder {

    private final UserRepo userRepository;
    private final PasswordEncoder passwordEncoder;

    public VirtualUsersSeeder(UserRepo userRepository,
                              PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void seed() {

        if (userRepository.count() >= 5) return;

        userRepository.saveAll(List.of(
                new User(
                        "User", "One", "user1",
                        "0700000001", "user1@test.se",
                        passwordEncoder.encode("pass"),
                        0, "ROLE_USER"
                ),
                new User(
                        "User", "Two", "user2",
                        "0700000002", "user2@test.se",
                        passwordEncoder.encode("pass"),
                        0, "ROLE_USER"
                ),
                new User(
                        "User", "Three", "user3",
                        "0700000003", "user3@test.se",
                        passwordEncoder.encode("pass"),
                        0, "ROLE_USER"
                ),
                new User(
                        "User", "Four", "user4",
                        "0700000004", "user4@test.se",
                        passwordEncoder.encode("pass"),
                        0, "ROLE_USER"
                ),
                new User(
                        "Admin", "Main", "admin",
                        "0700000005", "admin@test.se",
                        passwordEncoder.encode("pass"),
                        0, "ROLE_ADMIN"
                )
        )
        );
    }
}
