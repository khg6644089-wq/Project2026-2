package com.study.lastlayer.authuser;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class AuthUserDto {
	private Long id;
	private String email;

	@JsonIgnore // 클라이언트에게 JSON으로 나갈 때는 비밀번호 제외
	private String password;

	private List<MemberRole> roles;
	private String name;

	private String accessToken;

	// JPQL 프로젝션용 생성자. roles 제외
	public AuthUserDto(Long id, String email, String password, String name) {
		this.id = id;
		this.email = email;
		this.password = password;
		this.name = name;
	}
}