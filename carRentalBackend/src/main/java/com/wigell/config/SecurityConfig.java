                        package com.wigell.config;

                        import com.wigell.dao.UserRepo;
                        import org.springframework.context.annotation.Bean;
                        import org.springframework.context.annotation.Configuration;
                        import org.springframework.http.HttpMethod;
                        import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
                        import org.springframework.security.config.annotation.web.builders.HttpSecurity;
                        import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
                        import org.springframework.security.core.userdetails.UserDetailsService;
                        import org.springframework.security.core.userdetails.UsernameNotFoundException;
                        import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
                        import org.springframework.security.crypto.password.PasswordEncoder;
                        import org.springframework.security.web.SecurityFilterChain;
                        import org.springframework.web.cors.CorsConfiguration;
                        import org.springframework.web.cors.CorsConfigurationSource;
                        import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

                        import java.util.Arrays;
                        import java.util.Collections;

                        @Configuration
                        @EnableWebSecurity
                        @EnableMethodSecurity
                        public class SecurityConfig {

                            @Bean
                            public PasswordEncoder passwordEncoder() {
                                return new BCryptPasswordEncoder();
                            }

                            @Bean
                            public UserDetailsService userDetailsService(UserRepo userRepo) {
                                return username -> userRepo.findByUsername(username)
                                        .orElseThrow(() -> new UsernameNotFoundException("Användare med namn " + username + " hittades inte."));
                            }

                            @Bean
                            public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                                http
                                        .csrf(csrf -> csrf.disable())
                                        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                        .authorizeHttpRequests(auth -> auth

                                                // static + login
                                                .requestMatchers(
                                                        "/login.html",
                                                        "/login",
                                                        "/error",
                                                        "/css/**",
                                                        "/js/**",
                                                        "/images/**",
                                                        "/favicon.ico"

                                                ).permitAll()

                                                // public APIs
                                                .requestMatchers(HttpMethod.GET, "/api/v1/").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/v1/cars").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/v1/bookings/**").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/v1/users").permitAll()

                                                // bookings
                                                .requestMatchers(HttpMethod.POST, "/api/v1/bookings").hasRole("USER")
                                                .requestMatchers(HttpMethod.PUT, "/api/v1/bookings/**").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.DELETE, "/api/v1/bookings/**").hasRole("ADMIN")

                                                // cars
                                                .requestMatchers(HttpMethod.POST, "/api/v1/cars").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.PUT, "/api/v1/cars/**").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.DELETE, "/api/v1/cars/**").hasRole("ADMIN")

                                                // users
                                                .requestMatchers(HttpMethod.GET, "/api/v1/users").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.PUT, "/api/v1/users/**").authenticated()
                                                .requestMatchers(HttpMethod.DELETE, "/api/v1/users/**").hasRole("ADMIN")

                                                .anyRequest().authenticated()
                                        )
                                        .formLogin(form -> form
                                                .loginPage("/login.html")
                                                .loginProcessingUrl("/login")
                                                .successHandler(new RoleBasedSuccessHandler())
                                                .failureUrl("/login.html?error")
                                                .permitAll()
                                        )
                                        .logout(logout -> logout
                                                .logoutUrl("/logout")
                                                .logoutSuccessUrl("/login.html?logout")
                                                .permitAll()
                                        );

                                return http.build();
                            }

                            @Bean
                            public CorsConfigurationSource corsConfigurationSource() {
                                CorsConfiguration configuration = new CorsConfiguration();
                                configuration.setAllowCredentials(true);
                                configuration.setAllowedOrigins(Collections.singletonList("http://127.0.0.1:5500"));
                                configuration.setAllowedHeaders(Arrays.asList("Origin", "Content-Type", "Accept", "Authorization"));
                                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

                                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                                source.registerCorsConfiguration("/**", configuration);

                                return source;
                            }
                        }