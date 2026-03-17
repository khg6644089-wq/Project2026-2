package com.study.lastlayer.config;

// SecurityFilterChain filterChain() 이 있으면 WebMvcConfigurer은 무시된다.

//@Configuration
//public class WebCorsConfig implements WebMvcConfigurer {
//	@Override
//	public void addCorsMappings(CorsRegistry registry) {
//		registry.addMapping("/**") // 모든 경로 허용
//				.allowedOrigins("*") // 모든 Origin 허용
//				.allowedMethods("*") // 모든 HTTP 메서드 허용 (GET, POST, PUT, DELETE 등)
//				.allowedHeaders("*") // 모든 헤더 허용
//				.allowCredentials(false); // 인증정보(Cookie, Authorization 헤더 등) 미포함
//	}
//}
