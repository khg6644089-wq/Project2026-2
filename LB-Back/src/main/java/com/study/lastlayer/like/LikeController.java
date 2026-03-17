package com.study.lastlayer.like;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.study.lastlayer.auth.CustomUserPrincipal;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/likes")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    // 좋아요 누르기
    @PostMapping("/{boardId}")
    public ResponseEntity<LikeDto> likeBoard(
            @PathVariable("boardId") Long boardId,
            @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        Long memberId = principal.getMemberId();
        LikeDto result = likeService.likeBoard(boardId, memberId);
        return ResponseEntity.ok(result);
    }

    // 좋아요 취소
    @DeleteMapping("/{boardId}")
    public ResponseEntity<LikeDto> unlikeBoard(
            @PathVariable("boardId") Long boardId,
            @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        Long memberId = principal.getMemberId();
        LikeDto result = likeService.unlikeBoard(boardId, memberId);
        return ResponseEntity.ok(result);
    }

    // 게시글 좋아요 수 조회
    @GetMapping("/{boardId}")
    public ResponseEntity<Long> getLikeCount(@PathVariable("boardId") Long boardId) {
        Long totalLikes = likeService.getLikeCount(boardId);
        return ResponseEntity.ok(totalLikes);
    }
    
 // 게시글에 대해 특정 회원이 좋아요했는지 조회
    @GetMapping("/{boardId}/status")
    public ResponseEntity<LikeDto> getLikeStatus(
            @PathVariable("boardId") Long boardId,
            @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        Long memberId = principal.getMemberId();
        LikeDto result = likeService.getLikeStatus(boardId, memberId);
        return ResponseEntity.ok(result);
    }
}