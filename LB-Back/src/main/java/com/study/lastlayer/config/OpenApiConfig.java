package com.study.lastlayer.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@OpenAPIDefinition(info = @Info(title = "lastlayer 프로젝트 API", description = "AI융합 식단추천 서비스", version = "v0.1"))
@Configuration
public class OpenApiConfig {
	// 추가적인 Security Scheme 설정 등을 여기에 할 수 있습니다.

	@Bean
	OpenAPI openAPI() {
		String jwtSchemeName = "jwtAuth"; // 보안 스키마 이름 설정

		// 1. API 요청에 보안 요구사항 추가
		SecurityRequirement securityRequirement = new SecurityRequirement().addList(jwtSchemeName);

		// 2. JWT 보안 스키마 정의 (Header 방식)
		SecurityScheme securityScheme = new SecurityScheme().name(jwtSchemeName).type(SecurityScheme.Type.HTTP) // HTTP 방식
				.scheme("bearer") // Bearer 토큰 지정
				.bearerFormat("JWT"); // 형식이 JWT임을 명시

		return new OpenAPI()
				.info(new io.swagger.v3.oas.models.info.Info().title("Travly API Document")
						.description("JWT 기반 인증이 적용된 API 문서").version("v1.0.0"))
				.addSecurityItem(securityRequirement) // 전역 인증 적용
				.components(new Components().addSecuritySchemes(jwtSchemeName, securityScheme));
	}
}