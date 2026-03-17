package com.study.lastlayer.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.study.lastlayer.auth.JwtAuthFilter;
import com.study.lastlayer.auth.JwtUtil;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // 메서드 단위 보안 활성화
public class SecurityConfig {
	private final JwtUtil jwtUtil;

	public SecurityConfig(JwtUtil jwtUtil) {
		this.jwtUtil = jwtUtil;
	}

	// 1. 필터를 빈으로 등록 (싱글톤 보장)
	@Bean
	JwtAuthFilter jwtAuthFilter() {
		return new JwtAuthFilter(jwtUtil);
	}

	@Bean
	SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

		http.csrf(config -> config.disable());
		http.cors(cors -> cors.configurationSource(corsConfigurationSource()));

		http.formLogin(config -> {
			config.loginPage("/auth/login");
			//			config.successHandler(new APILoginSuccessHandler());
			//			config.failureHandler(new APILoginFailHandler());
		});

		return http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll()).formLogin(form -> form.disable())
				.httpBasic(httpBasic -> httpBasic.disable())
				.addFilterBefore(jwtAuthFilter(), UsernamePasswordAuthenticationFilter.class)
				.sessionManagement(
						sessionConfig -> sessionConfig.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // 서버가 세션을 관리하지 않겠다
				.build();
	}

	CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();

//		"인증 정보(쿠키, 인증 헤더 등)를 허용할 때는, 신뢰할 수 있는 특정 도메인만 허용해야 한다."
//		config.setAllowedOriginPatterns(List.of("*")); // 모든 Origin 허용

		config.setAllowedOrigins(
				List.of(
						"https://lastbalance.smartds.tv",
						"http://local.smartds.tv",
						"http://127.0.0.1:5173",
						"http://localhost:5173"));

		config.setAllowCredentials(true); // 반드시 false 쿠키인증이 필요시 true
		config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		config.setAllowedHeaders(List.of("*")); // 모든 헤더 허용 (CORS 프리플라이트 요청 처리)
		config.setExposedHeaders(List.of("Authorization")); // 클라이언트에서 접근 가능한 헤더
		config.setMaxAge(3600L); // 프리플라이트 요청 캐시 시간 (1시간)

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return source;
	}

	@Bean
	PasswordEncoder passwordEncoder() {
		// BCrypt는 암호화할 때마다 내부적으로 랜덤한 **Salt(소금)**를 생성하여 결과값이 매번 다르게 나옴.
		return new BCryptPasswordEncoder();
	}
}
