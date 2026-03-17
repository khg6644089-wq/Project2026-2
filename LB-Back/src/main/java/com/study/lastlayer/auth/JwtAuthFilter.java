package com.study.lastlayer.auth;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtAuthFilter extends OncePerRequestFilter {
	private final JwtUtil jwtUtil;

	public JwtAuthFilter(JwtUtil jwtUtil) {
		this.jwtUtil = jwtUtil;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		String authHeader = request.getHeader("Authorization");
		if (authHeader != null && authHeader.startsWith("Bearer ")) {
			String token = authHeader.substring(7);
			try {
				var claims = jwtUtil.validateToken(token);

				CustomUserPrincipal principal = new CustomUserPrincipal(claims.getSubject(),
						jwtUtil.extractMemberId(claims), jwtUtil.extractRoles(claims));
				UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null,
						principal.getAuthorities());
				SecurityContextHolder.getContext().setAuthentication(auth);
			} catch (io.jsonwebtoken.ExpiredJwtException e) {
				// 1. 토큰 만료 시 401 응답 명시
				// 여기서 처리 하지 않으면 403 에러 발생.
				response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
				response.setContentType("application/json;charset=UTF-8");
				response.getWriter().write("{\"message\": \"AccessToken Expired\"}");
				return; // 중요: 다음 필터로 넘기지 않고 여기서 응답 종료
			} catch (Exception e) {
				// 토큰 검증 실패 시 처리
				e.printStackTrace();
			}
		}
		filterChain.doFilter(request, response);
	}
}
