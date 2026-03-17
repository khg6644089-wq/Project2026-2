package com.study.lastlayer.authuser;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.Comment;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "auth_user", uniqueConstraints = {
		@UniqueConstraint(name = "UK_auth_user__email", columnNames = { "email" } // DB 컬럼 이름
		) })
@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class AuthUser {
	public void setPassword(String password) {
		this.password = password;
	}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String email;

	@ToString.Exclude // Lombok, 사용한다면 toString() 호출 시 비밀번호가 로그에 찍히지 않도록 반드시 제외
	@JsonIgnore
	@Column(nullable = false)
	@Comment("BCrypt 암호화 비밀번호")
	private String password;

	@ElementCollection(fetch = FetchType.LAZY) // 엔티티(Entity)가 아닌 단순한 값들을 리스트나 셋으로 관리하고 싶을 때
	@CollectionTable(name = "member_roles", // 여기서 테이블 이름을 소문자로 지정
			joinColumns = @JoinColumn(name = "member_id"), // 외래키 컬럼명도 지정 가능
			indexes = {
					// member_id와 role_name을 묶어서 복합 인덱스 생성 (조회 성능 향상)
					@jakarta.persistence.Index(name = "IDX_member_roles_id_role", columnList = "member_id, role", unique = true) })
	@Column(name = "role") // 권한 값이 저장되는 컬럼명도 소문자로 지정 가능
	@Builder.Default
	@ToString.Exclude
	private List<MemberRole> roles = new ArrayList<>();

	@Column(nullable = false)
	private LocalDateTime createdAt;

	@PrePersist
	public void onCreated() {
		this.createdAt = LocalDateTime.now();
	}
}
