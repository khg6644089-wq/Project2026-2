package com.study.lastlayer.member;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.study.lastlayer.auth.CustomUserPrincipal;
import com.study.lastlayer.file.File;

@RestController
public class MemberController {

    private static final Logger log = LoggerFactory.getLogger(MemberController.class);

    @Autowired
    private MemberService memberService;

    /**
     * 회원 정보 업데이트 API
     */
    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Member> update(@AuthenticationPrincipal CustomUserPrincipal principal,
                                         @RequestBody MemberUpdateDto dto) {
        Member updatedMember = memberService.updateMember(principal.getMemberId(), dto);
        return ResponseEntity.ok(updatedMember);
    }

    /**
     * 로그인한 사용자의 회원 정보 조회 API
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Member> getMember(@AuthenticationPrincipal CustomUserPrincipal principal) {
        Member member = memberService.getMember(principal.getMemberId());
        return ResponseEntity.ok(member);
    }

    /**
     * 프로필 이미지 정보 조회
     */
    @GetMapping("/me/profile-image")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<File> getProfileImage(@AuthenticationPrincipal CustomUserPrincipal principal) {
        File file = memberService.getProfileImage(principal.getMemberId());
        return ResponseEntity.ok(file);
    }

    @PatchMapping(value = "me/profile-image", consumes = "multipart/form-data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<File> updateProfileImage(@AuthenticationPrincipal CustomUserPrincipal principal,
                                                   @RequestPart("file") MultipartFile multipartFile) throws IOException {
        File fileEntity = memberService.updateProfileImage(principal.getMemberId(), multipartFile);
        return ResponseEntity.ok(fileEntity);
    }

    @DeleteMapping("/me/profile-image")
    @PreAuthorize("isAuthenticated()")
    public void deleteProfileImage(@AuthenticationPrincipal CustomUserPrincipal principal) {
        memberService.deleteProfileImage(principal.getMemberId());
    }

    /**
     * 로그인한 회원 포인트 조회
     */
    @GetMapping("/me/points")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyPoints(@AuthenticationPrincipal CustomUserPrincipal principal) {
        Member member = memberService.getMember(principal.getMemberId());
        return ResponseEntity.ok(Map.of(
            "memberId", member.getMember_id(),
            "point", member.getPoint()
        ));
    }

	/**
	 * 모든 회원 정보 조회 API
	 */
	@GetMapping("/members")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<List<Member>> getAllMembers() {
		List<Member> members = memberService.getAllMembers();
		return ResponseEntity.ok(members);
	}

    /**
     * 로그인한 회원 포인트 증감 (적립 + 차감 통합)
     * + amount → 적립
     * - amount → 차감
     * 트랜잭션 적용 + 서버 로그 포함
     */
    @PostMapping("/me/points/adjust")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<?> adjustPoints(@AuthenticationPrincipal CustomUserPrincipal principal,
                                          @RequestBody Map<String, Long> request) {
        Long amount = request.get("amount");
        if (amount == null) {
            log.warn("회원ID[{}] 요청 값이 없습니다.", principal.getMemberId());
            return ResponseEntity.badRequest().body(Map.of(
                "status", 400,
                "message", "amount 값이 필요합니다."
            ));
        }

        Member member = memberService.getMember(principal.getMemberId());
        log.info("회원ID[{}] 현재 포인트: {}", member.getMember_id(), member.getPoint());

        long newPoint = member.getPoint() + amount;
        if (newPoint < 0) {
            log.warn("회원ID[{}] 포인트 부족: 현재={}, 요청={}", member.getMember_id(), member.getPoint(), amount);
            return ResponseEntity.badRequest().body(Map.of(
                "status", 400,
                "message", "포인트가 부족합니다."
            ));
        }

        // Dirty Checking 적용
        member.setPoint(newPoint);

        log.info("회원ID[{}] 포인트 변경 완료: amount={}, 잔여포인트={}", member.getMember_id(), amount, member.getPoint());

        return ResponseEntity.ok(Map.of(
            "memberId", member.getMember_id(),
            "amount", amount,
            "remainingPoint", member.getPoint(),
            "message", amount > 0 ? "포인트 적립 완료" : "포인트 차감 완료"
        ));
    }
}