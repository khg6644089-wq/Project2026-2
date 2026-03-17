package com.study.lastlayer.auth;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.study.lastlayer.authuser.AuthUser;
import com.study.lastlayer.authuser.AuthUserDto;
import com.study.lastlayer.authuser.AuthUserRepository;
import com.study.lastlayer.authuser.MemberRole;
import com.study.lastlayer.exception.BadRequestException;
import com.study.lastlayer.member.Member;
import com.study.lastlayer.member.MemberRepository;

import jakarta.servlet.http.HttpServletResponse;

record SignupRequest(
		// AuthUser 정보
		String email, String password,

		// Member 정보
		String name, String phone, String gender, String birthday, // "yyyy-MM-dd"
		Float height, Float weight, Integer target_date, String goal, Float goal_weight, String allergies,
		String special_notes) {
}

@Service
public class AuthService {
	private final AuthUserRepository authUserRepository;
	private final MemberRepository memberRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;

	@Value("${jwt.refresh.expiration}")
	private long refreshExpirationMinutes;

	// 명시적 생성자 주입
	public AuthService(AuthUserRepository authUserRepository, MemberRepository memberRepository,
			PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
		this.authUserRepository = authUserRepository;
		this.memberRepository = memberRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtUtil = jwtUtil;
	}

	@Transactional(readOnly = true)
	public String createToken(String email) {
		AuthUserDto user = authUserRepository.findUserAuthByEmail(email)
				.orElseThrow(() -> new BadRequestException("이메일을 찾을 수 없습니다."));
		return jwtUtil.createToken(user.getEmail(), user.getId(), user.getRoles(), user.getName());
	}

	@Transactional(readOnly = true)
	public AuthUserDto login(String email, String password, HttpServletResponse response) {
		// 1. DTO 프로젝션으로 사용자 정보 조회 (Member 정보 포함)
		AuthUserDto userDto = authUserRepository.findUserAuthByEmail(email)
				.orElseThrow(() -> new BadRequestException("이메일을 찾을 수 없습니다."));

		// 2. 비밀번호 일치 여부 확인
		if (password != null && !passwordEncoder.matches(password, userDto.getPassword())) {
			throw new BadRequestException("비밀번호가 일치하지 않습니다.");
		}

		// 3. 별도로 Roles(권한) 정보를 조회하여 DTO에 세팅
		// (JPQL new 연산자의 한계를 극복하기 위한 필수 단계)
		List<MemberRole> roles = authUserRepository.findRolesByAuthUserId(userDto.getId());
		userDto.setRoles(roles);

		// 4. 토큰 생성 및 반환
		userDto.setAccessToken(
				jwtUtil.createToken(userDto.getEmail(), userDto.getId(), userDto.getRoles(), userDto.getName()));

		setRefreshToken(email, response);
		return userDto;
	}

	// static으로 선언하여 어디서든 공통으로 사용
	public static ResponseCookie createRefreshTokenCookie(String token, long maxAge) {
		return ResponseCookie.from("refreshToken", token)
				.path("/api/lastlayer/auth") // /api/lastlayer/auth
				.httpOnly(true)
				.secure(true) // 실무 환경(HTTPS) 필수
				.sameSite("Lax")
				.maxAge(maxAge)
				.build();
	}

	void setRefreshToken(String email, HttpServletResponse response) {
		String refreshToken = jwtUtil.createToken(email, refreshExpirationMinutes);

		// 쿠키 생성 (24시간 = 24 * 60 * 60)
		ResponseCookie cookie = createRefreshTokenCookie(refreshToken, 24 * 60 * 60);

		response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
	}

	@Transactional
	public void signup(SignupRequest request) {
		// 1. 중복 체크
		if (authUserRepository.existsByEmail(request.email())) {
			throw new BadRequestException("이미 존재하는 이메일입니다.");
		}

		// 2. AuthUser 저장 (계정 생성)
		AuthUser authUser = AuthUser.builder().email(request.email())
				.password(passwordEncoder.encode(request.password())).roles(Arrays.asList(MemberRole.USER)).build();

		AuthUser savedAuthUser = authUserRepository.save(authUser);


		Member member = Member.builder().authUser(savedAuthUser) // @MapsId에 의해 ID 공유
				.name(request.name()).phone(request.phone()).gender(request.gender())
				.birthday(LocalDate.parse(request.birthday())).height(request.height()).weight(request.weight())
				.target_date(request.target_date()).goal(request.goal()).goal_weight(request.goal_weight())
				.allergies(request.allergies()).special_notes(request.special_notes())

				.notificationCount(0).point(0L).build();

		member.updateDailyCalories();
		memberRepository.save(member);

		// 4. 가입 후 즉시 로그인을 위해 DTO 반환
		String token = jwtUtil.createToken(savedAuthUser.getEmail(), savedAuthUser.getId(), savedAuthUser.getRoles(),
				request.name());
	}

	public boolean checkExistence(String email) {

		boolean isExist = true;

		if (email != null) {
			// Service 레이어에서 해당 이메일이 이미 존재하는지 확인
			isExist = authUserRepository.existsByEmail(email);
		}
		return isExist;
	}
}
