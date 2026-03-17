package com.study.lastlayer.auth;

import java.util.Map;

import org.hibernate.annotations.Comment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.study.lastlayer.authuser.AuthUserDto;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletResponse;

record LoginRequest(String email, String password) {
}

@RestController
@RequestMapping("auth")
public class AuthController {
	@Autowired
	private AuthService authService;

	@Autowired
	private JwtUtil jwtUtil;

	@PostMapping("/logout")
	public ResponseEntity<?> logout(HttpServletResponse response) {
		// 쿠키 삭제용 (maxAge 0)
		ResponseCookie cookie = AuthService.createRefreshTokenCookie(null, 0);

		response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
		SecurityContextHolder.clearContext();
		return ResponseEntity.ok().body("Logged out successfully");
	}

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletResponse response) {
		// AuthService에서 검증 후 토큰 발행
		AuthUserDto dto = authService.login(request.email(), request.password(), response);

		return ResponseEntity.ok(dto);
	}

	@PostMapping("/signup")
	public ResponseEntity<?> signUp(@RequestBody SignupRequest request, HttpServletResponse response) {
		authService.signup(request);

		AuthUserDto dto = authService.login(request.email(), request.password(), response);

		// 클라이언트가 사용하기 편하도록 Map이나 DTO에 담아서 반환
		return ResponseEntity.ok(dto);
	}

	record IsExistResponse(boolean isExist) {
	}

	@Comment("email 중복 검사")
	@GetMapping("/check")
	public IsExistResponse checkExistence(@RequestParam(name = "email", required = false) String email) {

		// 1. 요청 파라미터 검증 (두 값 모두 없거나, 두 값 모두 있을 때 예외 처리)
		if (email == null) {
			// 400 Bad Request
			throw new com.study.lastlayer.exception.BadRequestException("파라미터 'email'이 사용 되어야 합니다.");
		}

		return new IsExistResponse(authService.checkExistence(email));
	}

	@PostMapping("/refresh")
	public ResponseEntity<?> refreshToken(@CookieValue(value = "refreshToken", required = false) String refreshToken,
			HttpServletResponse response) {

		// 1) refreshToken 쿠키 확인
		if (refreshToken == null || refreshToken.isEmpty()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "refreshToken이 없습니다."));
		}

		// 2) refreshToken 검증
		Claims claims;
		try {
			claims = jwtUtil.validateToken(refreshToken);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "유효하지 않은 refreshToken입니다."));
		}
		String email = claims.getSubject();

		// email에 해당하는 Member를 새로 갱신
		AuthUserDto dto = authService.login(email, null, response);

		return ResponseEntity.ok(dto);
	}
}
