package com.study.lastlayer.auth;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.study.lastlayer.authuser.MemberRole;

public class CustomUserPrincipal implements UserDetails {
	private static final long serialVersionUID = 1L; // ✅ 추가

	private final String email;
	private final Long memberId;

	public CustomUserPrincipal(String email, Long memberId, List<MemberRole> roles) {
		this.memberId = memberId;
		this.email = email;
		this.roles = roles;
	}

	public boolean hasRole(MemberRole role) {
		return this.roles.contains(role);
	}

	public Long getMemberId() {
		return memberId;
	}

	@Override
	public String getUsername() {
		return email;
	}

	private List<MemberRole> roles;

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		// 1. MemberRole(Enum)을 "ROLE_USER" 형태의 문자열로 변환하여 리스트 생성
		List<SimpleGrantedAuthority> authorities = this.roles.stream()
				.map(role -> new SimpleGrantedAuthority("ROLE_" + role.name())).collect(Collectors.toList());

		// 2. 만약 권한 리스트가 비어있다면 기본값 추가
//		if (authorities.isEmpty()) {
//			authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
//		}

		return authorities;
	}

	@Override
	public String getPassword() {
		return null;
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return true;
	}
}
