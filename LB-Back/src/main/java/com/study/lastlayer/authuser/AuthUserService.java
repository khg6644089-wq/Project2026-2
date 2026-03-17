package com.study.lastlayer.authuser;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.study.lastlayer.exception.BadRequestException;

import jakarta.validation.constraints.NotBlank;

record PasswordChangeRequest(
		@NotBlank(message = "현재 비밀번호는 필수입니다.") String currentPassword,

		@NotBlank(message = "새 비밀번호는 필수입니다.") String newPassword) {
}

@Service
public class AuthUserService {
	@Autowired
	private AuthUserRepository authUserRepository;

	@Autowired
	private PasswordEncoder passwordEncoder; // Security Config에 빈 등록 필요

	@Transactional
	public void changePassword(Long memberId, PasswordChangeRequest request) {
		AuthUser user = authUserRepository.findById(memberId)
				.orElseThrow(() -> new BadRequestException(String.format("memberId[%d] 없음", memberId)));

		// 1. 현재 비밀번호 일치 확인
		if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
			throw new BadRequestException("현재 비밀번호가 일치하지 않습니다.");
		}

		// 2. 새 비밀번호 암호화 및 저장
		// AuthUser.java에 이미 public void setPassword(String password)가 선언되어 있음
		user.setPassword(passwordEncoder.encode(request.newPassword()));

		// @Transactional에 의해 메서드 종료 시 변경 감지(Dirty Checking)로 DB에 반영됨
	}

	@Transactional
	public List<MemberRole> addRole(Long memberId, MemberRole newRole) {
		AuthUser user = authUserRepository.findById(memberId)
				.orElseThrow(() -> new BadRequestException(String.format("memberId[%d] 없음", memberId)));
		// 중복 체크
		if (user.getRoles().contains(newRole)) {
			// 이미 권한이 있다면 예외 발생 (400 또는 409)
			throw new BadRequestException(String.format("MemberID[%d], 이미 '%s' 권한을 가지고 있습니다.", memberId, newRole));
		}

		// 별도의 Repo 없이 리스트에 추가만 하면 DB에 반영됨
		user.getRoles().add(newRole);
		return user.getRoles(); // 최신화된 전체 리스트 반환
	}
}
