package com.study.lastlayer.authuser;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthUserRepository extends JpaRepository<AuthUser, Long> {
	Optional<AuthUser> findByEmail(String email);

	Boolean existsByEmail(String email);

	// JPQL 프로젝션 쿼리 (roles는 1:N 관계라 여기서 한 번에 담을 수 없음)
	@Query("SELECT new com.study.lastlayer.authuser.AuthUserDto(a.id, a.email, a.password, m.name) " + "FROM Member m "
			+ "JOIN m.authUser a " + "WHERE a.email = :email")
	Optional<AuthUserDto> findUserAuthByEmail(@Param("email") String email);

	// 해당 유저의 권한(Roles)만 따로 조회하는 메서드
	@Query("SELECT a.roles FROM AuthUser a WHERE a.id = :id")
	List<MemberRole> findRolesByAuthUserId(@Param("id") Long id);
}
