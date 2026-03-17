package com.study.lastlayer.application;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.study.lastlayer.auth.CustomUserPrincipal;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    //가입 신청
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApplicationResponseDto> apply(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestBody ApplicationCreateDto dto) {

        ApplicationResponseDto response =
                applicationService.apply(principal.getMemberId(), dto);

        return ResponseEntity.ok(response);
    }
    
 // 특정 클럽의 PENDING 신청 목록 조회 (매니저만 가능)
    @GetMapping("/club/{clubId}/pending")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ApplicationListDto>> getPendingApplications(
    		@PathVariable("clubId") Long clubId,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        List<ApplicationListDto> list =
                applicationService.getPendingApplications(principal.getMemberId(), clubId);

        return ResponseEntity.ok(list);
    }
    
    //승인
    @PutMapping("/{applicationId}/approve")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> approve(
            @PathVariable("applicationId") Long applicationId,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        applicationService.approve(applicationId);
        return ResponseEntity.ok("가입 승인 완료");
    }

    //거절
    @PutMapping("/{applicationId}/reject")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> reject(
            @PathVariable("applicationId") Long applicationId,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        applicationService.reject(applicationId);
        return ResponseEntity.ok("가입 거절 완료");
    }
    
    //로그인한 유저의 현재 가입 신청 상태 조회
    @GetMapping("/status/{clubId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> getMyStatus(
            @PathVariable("clubId") Long clubId,
            @AuthenticationPrincipal CustomUserPrincipal principal
    ) {

        Long memberId = principal.getMemberId();

        String status = applicationService.getMyStatus(clubId, memberId);

        return ResponseEntity.ok(Map.of("status", status));
    }
}