package com.study.lastlayer.comment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.study.lastlayer.auth.CustomUserPrincipal;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/boards/{boardId}/comments")
public class CommentController {

    private final CommentService commentService;

    //댓글 조회
    @GetMapping
    public Page<CommentResponseDto> getComments(
            @PathVariable("boardId") Long boardId,
            @RequestParam(value = "page", defaultValue = "0") int page
    ) {

        Pageable pageable = PageRequest.of(
                page,
                10,
                Sort.by("createdAt").descending()
        );

        return commentService.getCommentsByBoard(boardId, pageable);
    }
    
    //댓글 작성
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public CommentResponseDto createComment(
            @PathVariable("boardId") Long boardId,
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestBody CommentCreateDto dto
    ) {

        return commentService.createComment(boardId, principal.getMemberId(), dto);
    }
    
    
    
}