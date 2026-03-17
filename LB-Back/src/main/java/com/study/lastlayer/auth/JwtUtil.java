package com.study.lastlayer.auth;

import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.study.lastlayer.authuser.MemberRole;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
// 이제 Spring이 자동으로 이 클래스를 찾아서 Bean으로 등록합니다.
public class JwtUtil {

    private final SecretKey secretKey;
    private final long expirationTime;

    // 생성자에서 Spring 설정 파일 값을 받아 SecretKey 생성
    public JwtUtil(
            @Value("${lastlayer.jwt-secret}") String jwtSecret,
            @Value("${jwt.expiration}") long expirationTime
    ) {
        this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        this.expirationTime = expirationTime;
    }

    // =========================
    // JWT 검증
    // =========================
    public Claims validateToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // =========================
    // Claims에서 memberId 추출
    // =========================
    public Long extractMemberId(Claims claims) {
        return claims.get("memberId", Long.class);
    }

    // =========================
    // Claims에서 권한 추출
    // =========================
    @SuppressWarnings("unchecked")
    public List<MemberRole> extractRoles(Claims claims) {
        Object rolesObject = claims.get("roles");
        if (rolesObject == null) {
            return Collections.emptyList();
        }

        List<String> rolesList = (List<String>) rolesObject;
        return rolesList.stream()
                .map(MemberRole::fromString) // MemberRole enum 변환
                .collect(Collectors.toList());
    }

    // =========================
    // JWT 발행 (회원 정보 포함)
    // =========================
    public String createToken(String email, Long memberId, List<MemberRole> roles, String name) {
        Claims claims = Jwts.claims().setSubject(email);
        claims.put("memberId", memberId); // Long형 ID
        claims.put("roles", roles);       // 권한 정보
        claims.put("name", name);         // 이름 추가

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime * 60 * 1000L);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    // =========================
    // JWT 발행 (이메일 + 만료 시간)
    // =========================
    public String createToken(String email, Long expirationTimeMin) {
        Claims claims = Jwts.claims().setSubject(email);

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTimeMin * 60 * 1000L);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }
}