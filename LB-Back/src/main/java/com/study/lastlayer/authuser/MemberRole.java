package com.study.lastlayer.authuser;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.study.lastlayer.exception.BadRequestException;

public enum MemberRole {
	USER, CLUBMANAGER, ADMIN, SUSPENDED;

	@JsonCreator // JSON의 문자열 데이터를 이 메서드로 보냅니다.
	public static MemberRole fromString(String roleName) {
		for (MemberRole role : MemberRole.values()) {
			if (role.name().equalsIgnoreCase(roleName)) {
				return role;
			}
		}
		// 여기서 예외를 던지면 Jackson이 가로채서 에러 메시지를 생성합니다.
		throw new BadRequestException(
				String.format("잘못된 권한 요청: %s. (USER, CLUBMANAGER, ADMIN, SUSPENDED 중 하나여야 합니다.)", roleName));
	}
}
